'use strict';

const categories = {
  Fruits: ['Apple', 'Banana', 'Orange', 'Pear', 'Grapes', 'Watermelon', 'Pineapple', 'Strawberry', 'Cherry', 'Kiwi', 'Peach', 'Lemon', 'Mango', 'Coconut', 'Blueberry', 'Pomegranate'],
  Animals: ['Cat', 'Dog', 'Elephant', 'Giraffe', 'Snake', 'Rabbit', 'Turtle', 'Penguin', 'Octopus', 'Butterfly', 'Shark', 'Kangaroo', 'Owl', 'Crocodile', 'Lion', 'Crab'],
  'Around the House': ['Lamp', 'Chair', 'Clock', 'Toothbrush', 'Pillow', 'Mug', 'Scissors', 'Broom', 'Umbrella', 'Shoe', 'Mirror', 'Fan', 'Hanger', 'Spoon', 'Key', 'Basket'],
  'Food and Drinks': ['Pizza', 'Burger', 'Taco', 'Hot dog', 'Ice cream', 'Popcorn', 'Carrot', 'Cookie', 'Donut', 'Fries', 'Egg', 'Soda', 'Sandwich', 'Pancake', 'Pretzel', 'Cupcake']
};

const game = document.querySelector('#game');
const status = document.querySelector('#status');
const inviteRoom = new URL(location.href).searchParams.get('room');
const id = crypto.randomUUID();
const validRoom = /^[a-f0-9-]{36}$/i;
const players = new Map();
const sketches = new Map();
const scores = new Map();
const answers = new Map();
let channel, room, name, hostId, round, connected, isHost, pendingAnswer;
let screen = '';
let clockOffset = 0;

function shuffle(values) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function show(key, markup) {
  if (screen === key) return false;
  screen = key;
  game.innerHTML = markup;
  return true;
}

function send(type, payload = {}) {
  if (connected) channel.send({ type: 'broadcast', event: 'game', payload: { type, id, ...payload } });
}

function sync() {
  send('state', { round, now: Date.now(), players: [...players], scores: [...scores], answered: [...answers.keys()] });
}

function lookup(list, key) {
  return list.find(([item]) => item === key)?.[1];
}

function join(asHost, playerName) {
  if (!window.supabase) {
    status.textContent = 'The game connection did not load. Refresh to try again.';
    return;
  }
  isHost = asHost;
  name = playerName;
  room = asHost ? crypto.randomUUID() : inviteRoom;
  if (asHost) {
    hostId = id;
    players.set(id, name);
    round = { phase: 'lobby', number: 0 };
  }
  show('connecting', '<h2>Connecting to the room…</h2>');
  const db = supabase.createClient('https://jjzjqjvdnaeuftptvmyw.supabase.co', 'sb_publishable_QPQY6u-wJBKULuaEgsG4lA_KiWCwhN4');
  channel = db.channel('twelve-things-' + room);
  channel.on('broadcast', { event: 'game' }, ({ payload }) => receive(payload));
  channel.subscribe(state => {
    connected = state === 'SUBSCRIBED';
    if (!connected) {
      status.textContent = 'Connection interrupted. Trying to reconnect…';
      return;
    }
    status.textContent = '';
    if (isHost) sync();
    else send('join', { name });
    render();
  });
  setInterval(() => {
    if (isHost) sync();
    else if (!players.has(id)) send('join', { name });
    if (pendingAnswer) send('answer', pendingAnswer);
  }, 1000);
}

function receive(message) {
  if (isHost) {
    if (message.type === 'join' && !players.has(message.id)) {
      players.set(message.id, String(message.name).slice(0, 24));
      sync();
      render();
    }
    if (message.type === 'answer') acceptAnswer(message.id, message);
    return;
  }
  if (message.type !== 'state' || (hostId && hostId !== message.id)) return;
  if (!round || round.phase === 'lobby' || round.phase === 'results') {
    clockOffset = message.now - Date.now();
  }
  hostId = message.id;
  round = message.round;
  if (pendingAnswer && (pendingAnswer.number !== round.number ||
      pendingAnswer.position !== round.position || message.answered.includes(id))) {
    pendingAnswer = null;
  }
  for (const [key, value] of message.players) players.set(key, value);
  scores.clear();
  for (const [key, value] of message.scores) scores.set(key, value);
  render();
}

function startRound() {
  const category = document.querySelector('#category').value;
  const duration = Number(document.querySelector('#difficulty').value) * 1000;
  round = {
    phase: 'draw', number: round.number + 1, category, duration,
    items: shuffle(categories[category]).slice(0, 12),
    order: shuffle(Array.from({ length: 12 }, (_, index) => index)),
    starts: Date.now() + 3000, roster: [...players]
  };
  scores.clear();
  answers.clear();
  for (const [key] of players) scores.set(key, 0);
  sync();
  render();
}

function startRecall() {
  round = { phase: 'recall', number: round.number, roster: round.roster, position: 0 };
  sync();
}

function normalize(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
}

function matches(value, expected) {
  const singular = word => word.endsWith('rries') ? word.slice(0, -3) + 'y' :
    word.endsWith('oes') ? word.slice(0, -2) : word.endsWith('s') ? word.slice(0, -1) : word;
  return singular(normalize(value)) === singular(normalize(expected));
}

let recallItems, recallOrder;
function acceptAnswer(player, answer) {
  if (round.phase !== 'recall' || answer.number !== round.number || answer.position !== round.position ||
      answers.has(player) || !scores.has(player)) return;
  answers.set(player, String(answer.value).slice(0, 80));
  sync();
  render();
}

function reveal() {
  const expected = recallItems[recallOrder[round.position]];
  for (const [player, value] of answers) {
    if (matches(value, expected)) scores.set(player, scores.get(player) + 1);
  }
  round = { ...round, phase: 'reveal', expected };
  sync();
  render();
}

function nextQuestion() {
  answers.clear();
  if (round.position === 11) round = { ...round, phase: 'results' };
  else round = { phase: 'recall', roster: round.roster, number: round.number, position: round.position + 1 };
  sync();
  render();
}

function rosterList(selector, entries) {
  const list = game.querySelector(selector);
  list.replaceChildren(...entries.map(label => {
    const item = document.createElement('li');
    item.textContent = label;
    return item;
  }));
}

function lobby() {
  if (show(round.phase + round.number, round.phase === 'results'
    ? '<h2>Round results</h2><ul id="scores"></ul><div id="settings"></div>'
    : '<h2>Game lobby</h2><ul id="players"></ul><div id="settings"></div>')) {
    const settings = game.querySelector('#settings');
    if (isHost) {
      settings.innerHTML = `<label>Invite link<input readonly id="invite"></label>
        <button id="copy">Copy invite link</button>
        <label>Category<select id="category">${Object.keys(categories).map(category => `<option>${category}</option>`).join('')}</select></label>
        <label>Difficulty<select id="difficulty"><option value="7">Easy · 7 seconds</option><option value="5">Intermediate · 5 seconds</option><option value="3">Hard · 3 seconds</option></select></label>
        <button id="start">Start round</button>`;
      const invite = new URL(location.href);
      invite.searchParams.set('room', room);
      const field = game.querySelector('#invite');
      field.value = invite.href;
      game.querySelector('#copy').onclick = async () => {
        field.select();
        try {
          await navigator.clipboard.writeText(field.value);
          status.textContent = 'Invite link copied.';
        } catch {
          status.textContent = 'Select and copy the invite link above.';
        }
      };
      game.querySelector('#start').onclick = startRound;
    } else settings.textContent = 'Waiting for the host to start the next round.';
  }
  if (round.phase === 'results') {
    const ranked = [...scores].sort((a, b) => b[1] - a[1]);
    rosterList('#scores', ranked.map(([player, score]) => `${players.get(player)} · ${score}/12`));
  } else rosterList('#players', [...players.values()]);
}

function paint(canvas, strokes) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const plot = ([x, y]) => [x * canvas.width, y * canvas.height];
  for (const stroke of strokes) {
    ctx.beginPath();
    ctx.moveTo(...plot(stroke[0]));
    ctx.lineTo(stroke[0][0] * canvas.width + 0.01, stroke[0][1] * canvas.height);
    for (const point of stroke.slice(1)) ctx.lineTo(...plot(point));
    ctx.stroke();
  }
}

function draw(index, ends) {
  if (!show('draw' + round.number + ':' + index, '<div class="prompt"><h2 id="item"></h2><span id="clock"></span></div><p id="progress"></p><canvas width="640" height="480" aria-label="Drawing canvas"></canvas><div class="row"><button id="clear">Clear sketch</button></div>')) return;
  game.querySelector('#item').textContent = round.items[index];
  game.querySelector('#progress').textContent = `${round.category} · ${index + 1} of 12`;
  const canvas = game.querySelector('canvas');
  const strokes = [];
  sketches.set(index, strokes);
  let pointer, stroke;
  function add(event) {
    const bounds = canvas.getBoundingClientRect();
    stroke.push([(event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height]);
    paint(canvas, strokes);
  }
  canvas.onpointerdown = event => {
    if (pointer !== undefined || Date.now() + clockOffset >= ends) return;
    pointer = event.pointerId;
    canvas.setPointerCapture(pointer);
    stroke = [];
    strokes.push(stroke);
    add(event);
  };
  canvas.onpointermove = event => {
    if (event.pointerId === pointer && Date.now() + clockOffset < ends) add(event);
  };
  canvas.onlostpointercapture = () => { pointer = undefined; };
  game.querySelector('#clear').onclick = () => {
    if (Date.now() + clockOffset >= ends) return;
    if (pointer !== undefined) canvas.releasePointerCapture(pointer);
    strokes.length = 0;
    paint(canvas, strokes);
  };
}

function recall() {
  const index = recallOrder?.[round.position];
  if (index === undefined) {
    show('waiting-round', '<h2>The round is in progress</h2><p>You can draw in the next round.</p>');
    return;
  }
  if (show(round.phase + round.number + ':' + round.position, `
    <h2>What was #${index + 1}?</h2><p>Recall ${round.position + 1} of 12</p>
    <canvas width="640" height="480" aria-label="Your sketch"></canvas>
    <div id="response"></div><div class="row" id="host-controls"></div>`)) {
    paint(game.querySelector('canvas'), sketches.get(index) || []);
    const response = game.querySelector('#response');
    if (round.phase === 'reveal') response.textContent = 'Answer: ' + round.expected;
    else {
      response.innerHTML = '<form><label>Your answer<input name="answer" maxlength="80" autocomplete="off" spellcheck="false" required></label><button>Submit answer</button></form>';
      response.querySelector('form').onsubmit = event => {
        event.preventDefault();
        const value = new FormData(event.target).get('answer').trim();
        if (!value) return;
        const answer = { number: round.number, position: round.position, value };
        response.textContent = 'Answer submitted. Waiting for the reveal.';
        if (isHost) acceptAnswer(id, answer);
        else {
          pendingAnswer = answer;
          send('answer', answer);
        }
      };
    }
  }
  if (!isHost) return;
  const controls = game.querySelector('#host-controls');
  if (round.phase === 'recall') {
    const count = answers.size;
    controls.innerHTML = `<span>${count}/${round.roster.length} answered</span><button id="reveal">${count === round.roster.length ? 'Reveal answer' : 'Reveal for everyone'}</button>`;
    controls.querySelector('button').onclick = reveal;
  } else if (!controls.firstChild) {
    controls.innerHTML = `<button>${round.position === 11 ? 'Show scores' : 'Next question'}</button>`;
    controls.querySelector('button').onclick = nextQuestion;
  }
}

let drawingRound;
function render() {
  if (!round) return;
  if (round.phase === 'lobby' || round.phase === 'results') {
    lobby();
    return;
  }
  if (!lookup(round.roster, id)) {
    show('waiting-round', '<h2>The round is in progress</h2><p>You can draw in the next round.</p>');
    return;
  }
  if (round.phase !== 'draw') {
    recall();
    return;
  }
  if (drawingRound !== round.number) {
    drawingRound = round.number;
    sketches.clear();
    recallOrder = round.order;
    if (isHost) recallItems = round.items;
  }
  const now = Date.now() + clockOffset;
  const elapsed = now - round.starts;
  const index = Math.floor(elapsed / round.duration);
  if (index >= 12) {
    if (isHost) startRecall();
    else show('waiting-recall', '<h2>Pencils down</h2><p>Waiting for the recall round…</p>');
    return;
  }
  if (index < 0) show('countdown' + round.number, '<h2>Get ready to draw</h2><p id="clock"></p>');
  else draw(index, round.starts + (index + 1) * round.duration);
  const remaining = index < 0 ? -elapsed : round.duration - elapsed % round.duration;
  game.querySelector('#clock').textContent = Math.ceil(remaining / 1000) + ' s';
}

show('entry', `<form><label>Your name<input name="name" maxlength="24" autocomplete="nickname" required></label>
  <button>${validRoom.test(inviteRoom) ? 'Join room' : 'Host a game'}</button></form>`);
game.querySelector('form').onsubmit = event => {
  event.preventDefault();
  const name = new FormData(event.target).get('name').trim();
  if (name) join(!validRoom.test(inviteRoom), name);
};

setInterval(() => { if (round?.phase === 'draw') render(); }, 50);
