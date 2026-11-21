(() => {
  "use strict";
  const endpoint = "https://jjzjqjvdnaeuftptvmyw.supabase.co/rest/v1/rpc/medic_mix_game";
  const apiKey = "sb_publishable_QPQY6u-wJBKULuaEgsG4lA_KiWCwhN4";
  const $ = id => document.getElementById(id);
  const sessionKey = "medic-mix-room";
  const requestedRoom = new URL(location.href).searchParams.get("room");
  if (/^\d{6}$/.test(requestedRoom || "")) $("code").value = requestedRoom;

  let room;
  let state;
  let pollTimer;
  let working = false;
  let version = 0;

  async function request(action, args) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...args }),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.code === "P0001" ? result.message : "The game service is unavailable. Try again.");
    return result;
  }

  function render(next) {
    const newRound = next.round !== state?.round;
    state = next;
    const active = next.round > 0 && !next.winner;
    $("room-title").textContent = "Room " + next.code;
    $("players").textContent = "Players: " + next.players.join(", ");
    $("round-status").textContent = next.winner
      ? next.winner + " wins! The word was " + next.answer + "."
      : active ? "Round " + next.round : "Waiting for the host to start.";
    const letters = $("letters");
    if (newRound) {
      $("guess").value = "";
      $("feedback").textContent = "";
      letters.replaceChildren(...Array.from(next.scramble || "", letter => {
        const tile = document.createElement("span");
        tile.textContent = letter;
        return tile;
      }));
      letters.setAttribute("aria-label", "Scrambled letters: " + (next.scramble || "").split("").join(" "));
    }
    letters.hidden = !next.scramble;
    $("guess-form").hidden = !active;
    $("start").hidden = !next.host || active;
    $("start").disabled = next.players.length < 2 || working;
    $("start").textContent = next.winner ? "Next Round" : "Start Round";
  }

  function poll() {
    clearTimeout(pollTimer);
    if (!room) return;
    pollTimer = setTimeout(async () => {
      if (working || !room) return poll();
      const current = room;
      const snapshot = version;
      try {
        const next = await request("state", current);
        if (room === current && version === snapshot) {
          render(next);
          $("message").textContent = "";
        }
      } catch {
        if (room === current) $("message").textContent = "Could not refresh the room. Retrying…";
      }
      if (room === current) poll();
    }, 650);
  }

  function enter(credentials, next) {
    room = credentials;
    sessionStorage.setItem(sessionKey, JSON.stringify(credentials));
    $("welcome").hidden = true;
    $("room").hidden = false;
    render(next);
    poll();
  }

  async function run(fn) {
    if (working) return;
    working = true;
    version++;
    $("message").textContent = "";
    try {
      await fn();
    } catch (error) {
      $("message").textContent = error.message;
    } finally {
      working = false;
      if (state) render(state);
    }
  }

  function join(action) {
    if (!$("name").reportValidity()) return;
    if (action === "join" && !/^\d{6}$/.test($("code").value.trim())) {
      $("message").textContent = "Enter the six-digit room code.";
      return;
    }
    run(async () => {
      const next = await request(action, { code: $("code").value.trim(), value: $("name").value });
      enter({ code: next.code, player_token: next.token }, next);
    });
  }

  $("host").onclick = () => join("create");
  $("entry").onsubmit = event => { event.preventDefault(); join("join"); };
  $("start").onclick = () => run(async () => render(await request("start", room)));
  $("guess-form").onsubmit = event => {
    event.preventDefault();
    run(async () => {
      const input = $("guess");
      const next = await request("guess", { ...room, round_number: state.round, value: input.value });
      render(next);
      $("feedback").textContent = next.outcome === "incorrect" ? "Try again." : "";
      if (next.outcome === "incorrect") input.select();
    });
  };
  $("leave").onclick = () => {
    if (working) return;
    room = state = null;
    clearTimeout(pollTimer);
    sessionStorage.removeItem(sessionKey);
    $("room").hidden = true;
    $("welcome").hidden = false;
    $("message").textContent = "";
  };
  $("copy").onclick = async () => {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set("room", room.code);
    try {
      await navigator.clipboard.writeText(url.href);
      $("message").textContent = "Invite link copied.";
    } catch {
      $("message").textContent = "Share room code " + room.code + ".";
    }
  };

  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey));
    if (saved && (!requestedRoom || requestedRoom === saved.code)) {
      run(async () => {
        try {
          enter(saved, await request("state", saved));
        } catch (error) {
          sessionStorage.removeItem(sessionKey);
          throw error;
        }
      });
    }
  } catch {
    sessionStorage.removeItem(sessionKey);
  }
})();
