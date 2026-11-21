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
  let timerInterval;
  let displayDeadline;
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

  function updateTimer() {
    $("round-timer").textContent = Math.max(0, Math.ceil((displayDeadline - performance.now()) / 1000)) + "s";
  }

  const tileBoard = $("letters");
  let chosenTile;
  let drag;
  let skipClick = false;
  let queuedGuess;
  let lastTileGuess;
  let stateTileWinner = false;

  function clearTileSelection() {
    chosenTile?.setAttribute("aria-pressed", "false");
    chosenTile = null;
  }

  function showTiles(word) {
    clearTileSelection();
    tileBoard.replaceChildren(...Array.from(word, letter => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.textContent = letter;
      tile.setAttribute("aria-pressed", "false");
      return tile;
    }));
  }

  function tileAt(element) {
    const tile = element?.closest("button");
    return tile?.parentElement === tileBoard && !tile.disabled ? tile : null;
  }

  function checkTiles() {
    const guess = Array.from(tileBoard.children, tile => tile.textContent).join("");
    if (guess === lastTileGuess) return;
    if (working) {
      queuedGuess = { round: state.round, guess };
      return;
    }
    lastTileGuess = guess;
    void submitGuess(guess, true);
  }

  tileBoard.addEventListener("pointerdown", event => {
    skipClick = false;
    const tile = tileAt(event.target);
    if (!tile || drag || !event.isPrimary || event.button !== 0) return;
    drag = { tile, id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, target: null };
    tile.setPointerCapture(event.pointerId);
  });
  tileBoard.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6) return;
    drag.moved = true;
    drag.tile.classList.add("dragging");
    drag.tile.style.transform = "translate(" + (event.clientX - drag.x) + "px," + (event.clientY - drag.y) + "px)";
    drag.target?.classList.remove("drop-target");
    drag.target = tileAt(document.elementFromPoint(event.clientX, event.clientY));
    if (drag.target !== drag.tile) drag.target?.classList.add("drop-target");
  });
  function endDrag(event) {
    if (drag?.id !== event.pointerId) return;
    const { tile, target, moved } = drag;
    drag = null;
    tile.classList.remove("dragging");
    tile.style.transform = "";
    target?.classList.remove("drop-target");
    skipClick = moved;
    if (event.type !== "pointerup" || !moved || !target || target === tile || tile.disabled || target.disabled) return;
    clearTileSelection();
    const tiles = [...tileBoard.children];
    const from = tiles.indexOf(tile), to = tiles.indexOf(target);
    tileBoard.insertBefore(tile, from < to ? target.nextSibling : target);
    checkTiles();
  }
  tileBoard.addEventListener("pointerup", endDrag);
  tileBoard.addEventListener("pointercancel", endDrag);
  tileBoard.addEventListener("lostpointercapture", endDrag);
  tileBoard.addEventListener("click", event => {
    if (skipClick && event.detail) return;
    const tile = tileAt(event.target);
    if (!tile) return;
    const first = chosenTile;
    clearTileSelection();
    if (first === tile) return;
    if (!first) {
      chosenTile = tile;
      tile.setAttribute("aria-pressed", "true");
      return;
    }
    [first.textContent, tile.textContent] = [tile.textContent, first.textContent];
    checkTiles();
  });

  function render(next) {
    const newRound = next.round !== state?.round;
    const active = next.round > 0 && !next.winner && !next.timedOut;
    if (active && next !== state && Number.isFinite(next.remainingMs)) {
      displayDeadline = performance.now() + next.remainingMs;
    }
    state = next;
    const timer = $("round-timer");
    timer.hidden = !active || !Number.isFinite(displayDeadline);
    clearInterval(timerInterval);
    if (!timer.hidden) {
      updateTimer();
      timerInterval = setInterval(updateTimer, 100);
    }
    $("room-title").textContent = solo ? "You vs. CPU" : "Room " + next.code;
    $("copy").hidden = Boolean(solo);
    $("players").textContent = "Players: " + next.players.join(", ");
    $("round-status").textContent = next.winner
      ? (solo && next.winner === "You" ? "You win!" : next.winner + " wins!") + " The word was " + next.answer + "."
      : next.timedOut ? "Time’s up! The word was " + next.answer + "."
      : active ? "Round " + next.round : "Waiting for the host to start.";
    if (newRound) {
      $("guess").value = "";
      $("feedback").textContent = "";
      lastTileGuess = next.scramble;
      queuedGuess = null;
      showTiles(next.scramble || "");
    }
    if (next.winner && !stateTileWinner) showTiles(next.answer);
    stateTileWinner = Boolean(next.winner);
    $("game-board").classList.toggle("solved", stateTileWinner);
    for (const tile of tileBoard.children) tile.disabled = !active;
    $("tile-help").hidden = !active;
    $("category").hidden = !next.category;
    $("category").textContent = next.category ? "Category: " + next.category : "";
    tileBoard.hidden = !next.scramble;
    $("guess-form").hidden = !active;
    $("start").hidden = !next.host || active;
    $("start").disabled = next.players.length < 2 || working;
    $("start").textContent = next.round > 0 ? "Next Round" : "Start Round";
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
      const pending = queuedGuess;
      queuedGuess = null;
      if (pending && state?.round === pending.round && !state.winner && !state.timedOut) {
        lastTileGuess = pending.guess;
        void submitGuess(pending.guess, true);
      }
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
    render({ ...state, winner, timedOut: !winner, answer: solo.answer });
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
    solo.deadline = performance.now() + 30000;
    solo.solvesAt = performance.now() + delay;
    render({ round: (state?.round || 0) + 1, host: true, players: ["You", "CPU"], category: categories[solo.answer], remainingMs: 30000, scramble });
    tileBoard.firstElementChild?.focus();
    cpuTimer = setTimeout(() => finishSolo(delay < 30000 ? "CPU" : null), Math.min(delay, 30000));
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
  async function submitGuess(value, fromTiles = false) {
    if (!state?.round || state.winner || state.timedOut) return;
    const input = $("guess");
    if (solo) {
      if (performance.now() >= Math.min(solo.deadline, solo.solvesAt)) return finishSolo(solo.solvesAt < solo.deadline ? "CPU" : null);
      if (value.trim().toUpperCase() === solo.answer) return finishSolo("You");
      if (!fromTiles) {
        $("feedback").textContent = "Try again.";
        input.select();
      }
      return;
    }
    await run(async () => {
      const next = await request("guess", { ...room, round_number: state.round, value });
      render(next);
      $("feedback").textContent = !fromTiles && next.outcome === "incorrect" ? "Try again." : "";
      if (!fromTiles && next.outcome === "incorrect") input.select();
    });
  }
  $("guess-form").onsubmit = event => {
    event.preventDefault();
    if (!working) void submitGuess($("guess").value);
  };
  $("leave").onclick = () => {
    if (working) return;
    const wasSolo = Boolean(solo);
    clearTimeout(cpuTimer);
    clearInterval(timerInterval);
    displayDeadline = undefined;
    solo = room = state = null;
    stateTileWinner = false;
    queuedGuess = null;
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
