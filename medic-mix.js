(() => {
  "use strict";
  const endpoint = "https://jjzjqjvdnaeuftptvmyw.supabase.co/rest/v1/rpc/medic_mix_game";
  const apiKey = "sb_publishable_QPQY6u-wJBKULuaEgsG4lA_KiWCwhN4";
  const $ = id => document.getElementById(id);
  const sessionKey = "medic-mix-room";
  const requestedRoom = new URL(location.href).searchParams.get("room");
  if (/^\d{6}$/.test(requestedRoom || "")) $("code").value = requestedRoom;

  const categories = {
    "APNEA": "Airway & Breathing",
    "CAPNOGRAPHY": "Airway & Breathing",
    "DYSPNEA": "Airway & Breathing",
    "HYPOXEMIA": "Airway & Breathing",
    "INTUBATION": "Airway & Breathing",
    "LARYNX": "Airway & Breathing",
    "NEBULIZER": "Airway & Breathing",
    "OXYGENATION": "Airway & Breathing",
    "PNEUMOTHORAX": "Airway & Breathing",
    "STRIDOR": "Airway & Breathing",
    "TRACHEA": "Airway & Breathing",
    "VENTILATION": "Airway & Breathing",
    "BRONCHOSPASM": "Airway & Breathing",
    "CYANOSIS": "Airway & Breathing",
    "HYPERCAPNIA": "Airway & Breathing",
    "LARYNGOSCOPY": "Airway & Breathing",
    "SUCTION": "Airway & Breathing",
    "BRADYCARDIA": "Cardiology & Circulation",
    "DEFIBRILLATION": "Cardiology & Circulation",
    "EMBOLISM": "Cardiology & Circulation",
    "FIBRILLATION": "Cardiology & Circulation",
    "ISCHEMIA": "Cardiology & Circulation",
    "PERFUSION": "Cardiology & Circulation",
    "PULSELESS": "Cardiology & Circulation",
    "RESUSCITATION": "Cardiology & Circulation",
    "SYNCOPE": "Cardiology & Circulation",
    "TACHYCARDIA": "Cardiology & Circulation",
    "DIASTOLE": "Cardiology & Circulation",
    "MYOCARDIUM": "Cardiology & Circulation",
    "OCCLUSION": "Cardiology & Circulation",
    "PERICARDIUM": "Cardiology & Circulation",
    "SYSTOLE": "Cardiology & Circulation",
    "HEMATOMA": "Trauma & Bleeding",
    "HEMORRHAGE": "Trauma & Bleeding",
    "TOURNIQUET": "Trauma & Bleeding",
    "EPINEPHRINE": "Medications",
    "NALOXONE": "Medications",
    "GLUCAGON": "Medications",
    "EDEMA": "Medical Emergencies",
    "HYPOGLYCEMIA": "Medical Emergencies",
    "SEPSIS": "Medical Emergencies",
    "MELENA": "Medical Emergencies",
    "URTICARIA": "Medical Emergencies",
    "PALPATION": "Patient Assessment",
    "RIGIDITY": "Patient Assessment"
  };
  const words = Object.keys(categories);
  let solo;
  let cpuTimer;
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
    $("room-title").textContent = solo ? "You vs. CPU" : "Room " + next.code;
    $("copy").hidden = Boolean(solo);
    $("players").textContent = "Players: " + next.players.join(", ");
    $("round-status").textContent = next.winner
      ? (solo && next.winner === "You" ? "You win!" : next.winner + " wins!") + " The word was " + next.answer + "."
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
    $("category").hidden = !next.category;
    $("category").textContent = next.category ? "Category: " + next.category : "";
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

  function finishSolo(winner) {
    clearTimeout(cpuTimer);
    $("feedback").textContent = "";
    render({ ...state, winner, answer: solo.answer });
  }

  function startSoloRound() {
    clearTimeout(cpuTimer);
    const previous = solo.answer;
    const available = words.filter(word => word !== previous);
    solo.answer = available[Math.floor(Math.random() * available.length)];
    let scramble;
    do {
      const letters = [...solo.answer];
      for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
      }
      scramble = letters.join("");
    } while (scramble === solo.answer);
    const delay = 9000 + 850 * solo.answer.length + 6000 * Math.random();
    solo.deadline = performance.now() + delay;
    render({ round: (state?.round || 0) + 1, host: true, players: ["You", "CPU"], category: categories[solo.answer], scramble });
    $("guess").focus();
    cpuTimer = setTimeout(() => finishSolo("CPU"), delay);
  }

  $("cpu").onclick = () => {
    if (working) return;
    solo = {};
    state = null;
    $("message").textContent = "";
    $("welcome").hidden = true;
    $("room").hidden = false;
    startSoloRound();
  };
  $("host").onclick = () => join("create");
  $("entry").onsubmit = event => { event.preventDefault(); join("join"); };
  $("start").onclick = () => {
    if (solo) return startSoloRound();
    return run(async () => render(await request("start", room)));
  };
  $("guess-form").onsubmit = event => {
    event.preventDefault();
    const input = $("guess");
    if (solo) {
      if (state.winner) return;
      if (performance.now() >= solo.deadline) return finishSolo("CPU");
      if (input.value.trim().toUpperCase() === solo.answer) return finishSolo("You");
      $("feedback").textContent = "Try again.";
      input.select();
      return;
    }
    run(async () => {
      const next = await request("guess", { ...room, round_number: state.round, value: input.value });
      render(next);
      $("feedback").textContent = next.outcome === "incorrect" ? "Try again." : "";
      if (next.outcome === "incorrect") input.select();
    });
  };
  $("leave").onclick = () => {
    if (working) return;
    const wasSolo = Boolean(solo);
    clearTimeout(cpuTimer);
    solo = room = state = null;
    clearTimeout(pollTimer);
    if (!wasSolo) sessionStorage.removeItem(sessionKey);
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
