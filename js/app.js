/* Kettlebell Workouts — renderer + engine + UI */
'use strict';

const $ = (s) => document.querySelector(s);
function qsa(s) { return Array.from(document.querySelectorAll(s)); }

// ---------------- RNG / shuffle ----------------
const rand = () => {
  try { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] / 4294967296; }
  catch (e) { return Math.random(); }
};
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------- SVG pose renderer ----------------
const GROUND = 164, HEAD_R = 9, KB_R = 13;
const INK = '#f8fafc', AMBER = '#fbbf24', CYAN = '#38bdf8';

function limb(pts) { // pts: [[x,y],[x,y],[x,y]]
  return 'M ' + pts.map((p) => p[0] + ' ' + p[1]).join(' L ');
}
function arrowHead(tipX, tipY, angleDeg) {
  const L = 9, sp = 0.42, a = (angleDeg * Math.PI) / 180;
  const x1 = tipX + L * Math.cos(a + Math.PI - sp), y1 = tipY + L * Math.sin(a + Math.PI - sp);
  const x2 = tipX + L * Math.cos(a + Math.PI + sp), y2 = tipY + L * Math.sin(a + Math.PI + sp);
  return `<polygon points="${tipX},${tipY} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="${CYAN}"/>`;
}
function arrowSvg(ar) {
  if (ar.d) { // raw path; endpoint = last two numbers in the string
    const m = ar.d.match(/(-?[0-9.]+)\s+(-?[0-9.]+)\s*$/);
    const ex = +m[1], ey = +m[2];
    return `<path d="${ar.d}" fill="none" stroke="${CYAN}" stroke-width="3" stroke-dasharray="6 7" opacity=".85"/>` +
      arrowHead(ex, ey, ar.headAngle != null ? ar.headAngle : -90);
  }
  const ang = (Math.atan2(ar.to[1] - ar.ctrl[1], ar.to[0] - ar.ctrl[0]) * 180) / Math.PI;
  return `<path d="M ${ar.from[0]} ${ar.from[1]} Q ${ar.ctrl[0]} ${ar.ctrl[1]} ${ar.to[0]} ${ar.to[1]}" fill="none" stroke="${CYAN}" stroke-width="3" stroke-dasharray="6 7" opacity=".85"/>` +
    arrowHead(ar.to[0], ar.to[1], ang);
}
function kbSvg(x, y) {
  const hy = y - KB_R;
  return `<rect x="${x - 7}" y="${hy - 11}" width="14" height="13" rx="5.5" fill="${AMBER}"/>` +
    `<circle cx="${x}" cy="${y}" r="${KB_R}" fill="${AMBER}"/>` +
    `<circle cx="${x - 4.5}" cy="${y - 4.5}" r="3.6" fill="#fde68a" opacity=".75"/>`;
}
function personSvg(p) {
  const g = [];
  // back limbs (lighter)
  (p.legsB || []).forEach((l) => g.push(`<path d="${limb(l)}" stroke="${INK}" stroke-opacity=".38" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  (p.armsB || []).forEach((a) => g.push(`<path d="${limb(a)}" stroke="${INK}" stroke-opacity=".38" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  // spine + head
  const s = p.spine;
  g.push(`<line x1="${s[0][0]}" y1="${s[0][1]}" x2="${s[1][0]}" y2="${s[1][1]}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`);
  g.push(`<circle cx="${p.head[0]}" cy="${p.head[1]}" r="${HEAD_R}" fill="${INK}"/>`);
  // front limbs
  (p.legsF || []).forEach((l) => g.push(`<path d="${limb(l)}" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  (p.armsF || []).forEach((a) => g.push(`<path d="${limb(a)}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  return g.join('');
}
function renderPose(p, sizeClass) {
  const parts = [];
  parts.push(`<line x1="12" y1="${GROUND + 3}" x2="208" y2="${GROUND + 3}" stroke="#334155" stroke-width="3" stroke-linecap="round"/>`);
  if (p.box) {
    const b = p.box;
    parts.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="5" fill="#263449" stroke="#3b4a68" stroke-width="2"/>`);
  }
  (p.arrows || []).forEach((ar) => parts.push(arrowSvg(ar)));
  parts.push(personSvg(p));
  if (p.kb) parts.push(kbSvg(p.kb[0], p.kb[1]));
  return `<svg viewBox="0 0 220 180" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}

// ---------------- audio (Web Audio bell) ----------------
let actx = null;
function audio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function bell(freq, when, dur, vol) {
  const ctx = audio(), t = ctx.currentTime + when;
  [[1, 1], [2.76, 0.38], [5.4, 0.16]].forEach(([m, g]) => {
    const o = ctx.createOscillator(), gn = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq * m;
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(Math.max(0.001, vol * g), t + 0.012);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(gn).connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  });
}
function chime(kind) {
  if (!settings.sound) return;
  try {
    if (kind === 'ready') bell(660, 0, 0.28, 0.3);
    else if (kind === 'work') { bell(880, 0, 0.7, 0.5); bell(1174.7, 0.13, 0.9, 0.45); }
    else if (kind === 'rest') bell(392, 0, 1.15, 0.5);
    else if (kind === 'finish') [523.3, 659.3, 784, 1046.5].forEach((f, i) => bell(f, i * 0.16, 0.8, 0.45));
    else if (kind === 'stop') bell(330, 0, 0.5, 0.35);
  } catch (e) { /* audio unavailable */ }
}
function buzz(pattern) { if (settings.haptics && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} } }

// ---------------- settings & history ----------------
const LS_SET = 'kb.settings.v1', LS_HIST = 'kb.history.v1';
function loadLS(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
let settings = Object.assign(
  { weightLb: 35, sound: true, haptics: true, group: 'full', durationMin: 30, workSec: 40, restSec: 20, level: 0 },
  loadLS(LS_SET) || {}
);
let history = Array.isArray(loadLS(LS_HIST)) ? loadLS(LS_HIST) : [];
function saveSettings() { try { localStorage.setItem(LS_SET, JSON.stringify(settings)); } catch (e) {} }
function saveHistory() { try { localStorage.setItem(LS_HIST, JSON.stringify(history.slice(0, 200))); } catch (e) {} }

// ---------------- workout generation ----------------
const READY_SECS = 5;
function poolFor(group, level) {
  let p = EXERCISES.filter((e) => e.groups.includes(group));
  if (level > 0) { const f = p.filter((e) => e.level <= level); if (f.length >= 3) p = f; }
  return p;
}
function roundCount(T, w, r) { return Math.max(1, Math.floor((T + r) / (w + r))); }
function buildSequence() {
  const T = settings.durationMin * 60, w = settings.workSec, r = settings.restSec;
  const n = roundCount(T, w, r);
  const pool = poolFor(settings.group, settings.level);
  let deck = shuffle(pool), seq = [];
  while (seq.length < n) {
    if (!deck.length) {
      const prev = seq[seq.length - 1];
      deck = shuffle(pool.filter((e) => !prev || e.id !== prev.id));
      if (!deck.length) deck = pool.slice();
    }
    seq.push(deck.pop());
  }
  const rem = T - (n * w + (n - 1) * r);
  const blocks = [];
  for (let i = 0; i < n; i++) {
    let secs = w + (i === n - 1 ? Math.max(0, rem) : 0);
    if (secs <= 0) secs = w;
    blocks.push({ type: 'work', ex: seq[i], secs });
    if (i < n - 1) blocks.push({ type: 'rest', secs: r });
  }
  return { blocks, T };
}

// ---------------- engine ----------------
let W = null; // active workout state
const tickTimer = setInterval(tick, 200);

function fmtClock(secs) {
  secs = Math.max(0, Math.round(secs));
  const m = Math.floor(secs / 60), s = secs % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function startWorkout() {
  if (W) return;
  audio(); // unlock on user gesture
  const { blocks, T } = buildSequence();
  W = {
    blocks: [{ type: 'ready', secs: READY_SECS }, ...blocks],
    T, idx: -1, paused: false, frozenRemain: 0, doneCount: 0
  };
  document.body.dataset.screen = 'workout';
  showScreen('screen-workout');
  acquireWake();
  advanceTo(0, Date.now());
}

function advanceTo(i, now) {
  W.idx = i;
  const b = W.blocks[i];
  b.endsAt = (now || Date.now()) + b.secs * 1000;
  onPhaseStart(b);
}

function nextWorkBlock(fromIdx) {
  for (let i = fromIdx; i < W.blocks.length; i++) if (W.blocks[i].type === 'work') return W.blocks[i];
  return null;
}

function onPhaseStart(b) {
  const phaseEl = $('#phase-banner'), cd = $('#big-countdown');
  if (b.type === 'ready') {
    chime('ready'); buzz([60]);
    phaseEl.textContent = 'GET READY'; phaseEl.className = 'phase-banner rest';
    cd.classList.remove('rest-mode');
    const first = nextWorkBlock(1);
    $('#ex-name').textContent = first ? first.ex.name : '';
    $('#ex-cue').textContent = 'Grab your kettlebell and get into position…';
    $('#exercise-art').innerHTML = first ? renderPose(first.ex.pose) : '';
    $('#ex-index').textContent = '';
  } else if (b.type === 'work') {
    chime('work'); buzz([90]);
    phaseEl.textContent = 'WORK'; phaseEl.className = 'phase-banner work';
    cd.classList.remove('rest-mode');
    const num = W.doneCount + 1;
    $('#ex-index').textContent = `${num} / ${W.blocks.filter((x) => x.type === 'work').length}`;
    $('#ex-name').textContent = b.ex.name;
    $('#ex-cue').textContent = b.ex.cue;
    $('#exercise-art').innerHTML = renderPose(b.ex.pose);
    document.title = `${b.secs}s · ${b.ex.name} — Kettlebell`;
  } else { // rest
    chime('rest'); buzz([45, 40, 45]);
    phaseEl.textContent = 'REST'; phaseEl.className = 'phase-banner rest';
    cd.classList.add('rest-mode');
    $('#ex-name').textContent = 'Rest';
    $('#ex-cue').textContent = 'Breathe. Next up is already loaded.';
    document.title = `Rest — Kettlebell`;
  }
  // next-up preview
  const nw = b.type === 'rest' ? W.blocks[W.idx + 1] : nextWorkBlock(W.idx + 1);
  if (nw && nw.type === 'work') {
    $('#next-name').textContent = nw.ex.name;
    $('#next-art').innerHTML = renderPose(nw.ex.pose, true);
    $('#next-card').style.display = '';
  } else {
    if (b.type === 'ready') {
      const f = nextWorkBlock(1);
      $('#next-card').style.display = '';
      if (f) { $('#next-name').textContent = f.ex.name; $('#next-art').innerHTML = renderPose(f.ex.pose, true); }
    } else {
      $('#next-card').style.display = 'none';
      $('#next-name').textContent = '';
      $('#next-art').innerHTML = '';
    }
  }
}

function tick() {
  if (!W || W.paused) return;
  const b = W.blocks[W.idx];
  const remainMs = b.endsAt - Date.now();
  // countdown display
  const secs = Math.max(0, Math.ceil(remainMs / 1000));
  $('#big-countdown').textContent = b.type === 'ready' ? String(secs) : (secs < 60 ? String(secs) : fmtClock(secs));
  // progress bar over full session incl. ready
  let pos = 0;
  for (let i = 0; i < W.idx; i++) pos += W.blocks[i].secs;
  pos += Math.min(b.secs, b.secs - remainMs / 1000);
  const total = W.blocks.reduce((s2, x) => s2 + x.secs, 0);
  $('#session-progress').style.width = Math.min(100, (pos / total) * 100).toFixed(2) + '%';
  $('#time-remaining').textContent = fmtClock(Math.max(0, (total - pos)));

  if (remainMs <= 0) {
    if (b.type === 'work') W.doneCount++;
    if (W.idx >= W.blocks.length - 1) return finishWorkout(true);
    advanceTo(W.idx + 1, Date.now());
  }
}

function pauseToggle() {
  if (!W) return;
  const btn = $('#btn-pause');
  if (W.paused) {
    const b = W.blocks[W.idx];
    b.endsAt = Date.now() + W.frozenRemain;
    W.paused = false;
    btn.textContent = 'Pause';
  } else {
    const b = W.blocks[W.idx];
    W.frozenRemain = Math.max(0, b.endsAt - Date.now());
    W.paused = true;
    btn.textContent = 'Resume';
  }
}

function finishWorkout(completed) {
  if (!W) return;
  const entry = {
    ts: Date.now(),
    group: (GROUPS.find((g) => g.id === settings.group) || {}).label,
    minutes: Math.round(W.T / 60),
    workSec: settings.workSec, restSec: settings.restSec,
    doneCount: W.doneCount,
    total: W.blocks.filter((x) => x.type === 'work').length,
    completed: !!completed
  };
  history.unshift(entry); saveHistory();
  chime(completed ? 'finish' : 'stop');
  W = null;
  document.title = 'Kettlebell Workouts';
  document.body.dataset.screen = '';
  showScreen('screen-setup');
  renderHistory();
}

// ---------------- wake lock ----------------
let wakeLock = null;
async function acquireWake() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (W && !document.hidden) acquireWake(); });

// ---------------- UI: screens & tabs ----------------
function showScreen(id) {
  qsa('.screen').forEach((s) => s.classList.remove('active'));
  $('#' + id).classList.add('active');
}
qsa('#tabbar button').forEach((btn) => btn.addEventListener('click', () => {
  if (W && btn.dataset.tab !== 'setup') return; // don't leave mid-workout by accident
  qsa('#tabbar button').forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  const map = { setup: 'screen-setup', history: 'screen-history', settings: 'screen-settings' };
  if (btn.dataset.tab === 'history') renderHistory();
  showScreen(map[btn.dataset.tab]);
}));

// ---------------- UI: chips ----------------
function buildChips(containerId, options, valueKey, opts) {
  const el = $('#' + containerId);
  el.innerHTML = '';
  const customState = {}; // per-container flag
  options.forEach((o) => {
    const c = document.createElement('button');
    c.className = 'chip' + (opts && opts.small ? ' small' : '');
    c.textContent = o.label;
    c.dataset.val = String(o.value);
    c.addEventListener('click', () => {
      if (customState.active) { customState.active = false; }
      settings[valueKey] = o.value; saveSettings(); syncChips(); refreshSummary();
    });
    el.appendChild(c);
  });
  if (opts && opts.custom) {
    const c = document.createElement('button');
    c.className = 'chip small'; c.textContent = '+ Custom';
    const inp = document.createElement('input');
    inp.type = 'number'; inp.min = opts.custom.min; inp.max = opts.custom.max;
    inp.placeholder = 'sec/min';
    inp.style.display = 'none';
    inp.addEventListener('change', () => {
      let v = parseInt(inp.value, 10);
      if (isNaN(v)) return;
      v = Math.min(opts.custom.max, Math.max(opts.custom.min, v));
      settings[valueKey] = v; customState.active = true; saveSettings(); syncChips(); refreshSummary();
    });
    c.addEventListener('click', () => {
      inp.style.display = inp.style.display === 'none' ? '' : 'none';
      if (inp.style.display !== 'none') inp.focus();
    });
    el.appendChild(c); el.appendChild(inp);
  }
}

// ---------------- UI: chips sync ----------------
function syncChips() {
  const groups = [
    ['#group-grid', settings.group],
    ['#duration-chips', String(settings.durationMin)],
    ['#work-chips', String(settings.workSec)],
    ['#rest-chips', String(settings.restSec)],
    ['#level-chips', String(settings.level)],
    ['#weight-chips', String(settings.weightLb)]
  ];
  groups.forEach(([sel, val]) => {
    qsa(sel + ' .chip').forEach((c) => c.classList.toggle('active', c.dataset.val === String(val)));
  });
}

// ---------------- UI: build setup screen ----------------
function buildSetup() {
  const gg = $('#group-grid');
  GROUPS.forEach((g) => {
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = g.label; b.dataset.val = g.id;
    b.addEventListener('click', () => { settings.group = g.id; saveSettings(); syncChips(); refreshSummary(); });
    gg.appendChild(b);
  });

  buildChips('duration-chips', [15, 20, 30, 40].map((v) => ({ label: v + ' min', value: v })), 'durationMin');
  // duration custom handled separately (minutes):
  const dc = $('#duration-chips');
  const dcBtn = document.createElement('button');
  dcBtn.className = 'chip'; dcBtn.textContent = '+ Custom';
  const dcInp = document.createElement('input');
  dcInp.type = 'number'; dcInp.min = 1; dcInp.max = 90; dcInp.placeholder = 'min'; dcInp.style.display = 'none';
  dcInp.addEventListener('change', () => {
    let v = parseInt(dcInp.value, 10); if (isNaN(v)) return;
    settings.durationMin = Math.min(90, Math.max(1, v)); saveSettings(); syncChips(); refreshSummary();
  });
  dcBtn.addEventListener('click', () => { dcInp.style.display = dcInp.style.display === 'none' ? '' : 'none'; if (dcInp.style.display !== 'none') dcInp.focus(); });
  dc.appendChild(dcBtn); dc.appendChild(dcInp);

  buildChips('work-chips', [20, 30, 40, 60].map((v) => ({ label: v + 's', value: v })), 'workSec', { custom: { min: 5, max: 300 }, small: true });
  buildChips('rest-chips', [10, 15, 20, 30, 45, 60].map((v) => ({ label: v + 's', value: v })), 'restSec', { custom: { min: 5, max: 300 }, small: true });
  buildChips('level-chips', LEVELS.map((l) => ({ label: l.label, value: l.id })), 'level', { small: true });

  // weight chips on settings screen
  const wc = $('#weight-chips');
  [26, 35, 44, 53, 70].forEach((v) => {
    const b = document.createElement('button');
    b.className = 'chip small'; b.textContent = v + ' lb'; b.dataset.val = String(v);
    b.addEventListener('click', () => { settings.weightLb = v; saveSettings(); syncChips(); updateWeightChip(); });
    wc.appendChild(b);
  });
  const wBtn = document.createElement('button');
  wBtn.className = 'chip small'; wBtn.textContent = '+ Custom';
  const wInp = document.createElement('input');
  wInp.type = 'number'; wInp.min = 10; wInp.max = 200; wInp.placeholder = 'lb'; wInp.style.display = 'none';
  wInp.addEventListener('change', () => {
    let v = parseInt(wInp.value, 10); if (isNaN(v)) return;
    settings.weightLb = Math.min(200, Math.max(10, v)); saveSettings(); syncChips(); updateWeightChip();
  });
  wBtn.addEventListener('click', () => { wInp.style.display = wInp.style.display === 'none' ? '' : 'none'; if (wInp.style.display !== 'none') wInp.focus(); });
  wc.appendChild(wBtn); wc.appendChild(wInp);

  $('#btn-start').addEventListener('click', () => startWorkout());
  $('#btn-pause').addEventListener('click', pauseToggle);
  $('#btn-stop').addEventListener('click', () => { if (W && confirm('Stop this workout?')) finishWorkout(false); });
  const muteBtn = $('#btn-mute-workout');
  muteBtn.addEventListener('click', () => { settings.sound = !settings.sound; saveSettings(); syncSoundUI(); });
  $('#btn-sound-toggle').addEventListener('click', () => { settings.sound = !settings.sound; saveSettings(); syncSoundUI(); });

  // toggles
  const os = $('#opt-sound'), oh = $('#opt-haptics');
  os.checked = !!settings.sound; oh.checked = !!settings.haptics;
  os.addEventListener('change', () => { settings.sound = os.checked; saveSettings(); syncSoundUI(); });
  oh.addEventListener('change', () => { settings.haptics = oh.checked; saveSettings(); });

  const libBtn = document.createElement('button');
  libBtn.textContent = '📖 View all exercises (' + EXERCISES.length + ')';
  libBtn.style.cssText = 'width:100%;margin-top:20px;padding:14px;border-radius:12px;background:#1e293b;color:#f8fafc;font-size:15px;font-weight:700;border:none;cursor:pointer';
  libBtn.addEventListener('click', () => renderPoseDebug());
  const fp = document.querySelector('#screen-settings .fine-print');
  if (fp) fp.parentNode.insertBefore(libBtn, fp);

  $('#btn-clear-history').addEventListener('click', () => {
    if (confirm('Delete all workout history?')) { history = []; saveHistory(); renderHistory(); }
  });
}

function updateWeightChip() {
  const chip = $('#kb-weight-chip');
  if (chip) chip.textContent = settings.weightLb + ' lb';
}
function syncSoundUI() {
  $('#btn-sound-toggle').textContent = settings.sound ? '🔔' : '🔕';
  $('#opt-sound').checked = !!settings.sound;
  const mb = $('#btn-mute-workout');
  if (mb) mb.textContent = settings.sound ? 'Mute' : 'Unmute';
}

function refreshSummary() {
  const T = settings.durationMin * 60, w = settings.workSec, r = settings.restSec;
  const n = roundCount(T, w, r);
  const pool = poolFor(settings.group, settings.level).length;
  const gl = (GROUPS.find((g) => g.id === settings.group) || {}).label;
  $('#workout-summary').innerHTML =
    `<b>${n}</b> exercises · <b>${w}s</b> on / <b>${r}s</b> rest · pool of <b>${pool}</b> ${gl} moves` +
    (n > pool ? ' — new random order each session, moves recycle after a full shuffle' : '');
  updateWeightChip();
}

// ---------------- history ----------------
function renderHistory() {
  const totalMin = history.reduce((s2, h) => s2 + (h.completed ? h.minutes : Math.round(h.minutes * h.doneCount / Math.max(1, h.total))), 0);
  const completed = history.filter((h) => h.completed).length;
  $('#history-stats').innerHTML = `
    <div class="stat-card"><div class="num">${history.length}</div><div class="lbl">Sessions</div></div>
    <div class="stat-card"><div class="num">${completed}</div><div class="lbl">Completed</div></div>
    <div class="stat-card"><div class="num">${totalMin}m</div><div class="lbl">Total time</div></div>`;
  const ul = $('#history-list');
  if (!history.length) { ul.innerHTML = '<li style="color:var(--muted)">No workouts yet — your completed sessions will show up here.</li>'; return; }
  ul.innerHTML = history.slice(0, 30).map((h) => {
    const d = new Date(h.ts);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' +
      d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `<li><div class="h-date">${dateStr}</div>
      <div class="h-main">${h.group} — ${h.completed ? h.minutes : Math.round(h.minutes * h.doneCount / Math.max(1, h.total)) + (h.completed ? '' : ' min (stopped)')}</div>
      ${h.workSec}s on / ${h.restSec}s rest · ${h.doneCount}/${h.total} exercises</li>`;
  }).join('');
}

// ---------------- exercise library overlay ----------------
function renderPoseDebug() {
  const old = document.getElementById('pose-overlay');
  if (old) { old.remove(); return; } // toggle off
  const wrap = document.createElement('div');
  wrap.id = 'pose-overlay';
  wrap.style.cssText = 'position:fixed;inset:0;z-index:99;background:#0f172a;padding:16px 16px calc(16px + env(safe-area-inset-bottom));overflow:auto;color:#fff;font-family:sans-serif';
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕ Close';
  closeBtn.style.cssText = 'position:sticky;top:0;float:right;z-index:2;background:#1e293b;border:none;color:#f8fafc;font-size:15px;font-weight:700;padding:10px 16px;border-radius:12px;margin-bottom:10px';
  closeBtn.addEventListener('click', () => wrap.remove());
  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px';
  grid.innerHTML = EXERCISES.map((e) => `<div style="background:#1e293b;border-radius:14px;padding:8px;width:calc(50% - 6px);min-width:170px"><svg viewBox="0 0 220 180" width="100%">${renderPose(e.pose).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg><div style="font-size:14px;font-weight:700;margin-top:4px">${e.name} <span style="opacity:.6">L${e.level}</span></div><div style="font-size:12px;color:#94a3b8;margin-top:2px;line-height:1.35">${e.cue}</div></div>`).join('');
  wrap.appendChild(closeBtn);
  const h2 = document.createElement('h2');
  h2.textContent = 'All Exercises (' + EXERCISES.length + ')';
  h2.style.cssText = 'margin:8px 0 4px;font-size:18px';
  wrap.insertBefore(h2, grid);
  wrap.appendChild(grid);
  document.body.appendChild(wrap);
}

// ---------------- boot ----------------
document.addEventListener('DOMContentLoaded', () => {
  buildSetup();
  syncChips();
  refreshSummary();
  renderHistory();
  syncSoundUI();
  updateWeightChip();
  if (location.search.includes('poses')) renderPoseDebug();
  // debug hooks for automated testing
  window.__kb = {
    set: (o) => Object.assign(settings, o),
    start: () => startWorkout(),
    state: () => W ? { idx: W.idx, paused: W.paused } : null
  };
});
