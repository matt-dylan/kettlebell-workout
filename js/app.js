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

function asLimbs(v) { // accept both [[x,y,...]] (v2) and [x,y,...] (v3 bare flat) limb lists
  if (!v || !v.length) return [];
  return Array.isArray(v[0]) ? v : [v];
}

function limb(pts) { // pts: flat [x1,y1,x2,y2,(x3,y3)] joint coordinates
  let d = '';
  for (let i = 0; i + 1 < pts.length; i += 2) d += (d ? ' L ' : 'M ') + pts[i] + ' ' + pts[i + 1];
  return d;
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
    return `<path class="kb-arrow" d="${ar.d}" fill="none" stroke="${CYAN}" stroke-width="3" stroke-dasharray="6 7" opacity=".85"/>` +
      arrowHead(ex, ey, ar.headAngle != null ? ar.headAngle : -90);
  }
  const ang = (Math.atan2(ar.to[1] - ar.ctrl[1], ar.to[0] - ar.ctrl[0]) * 180) / Math.PI;
  return `<path class="kb-arrow" d="M ${ar.from[0]} ${ar.from[1]} Q ${ar.ctrl[0]} ${ar.ctrl[1]} ${ar.to[0]} ${ar.to[1]}" fill="none" stroke="${CYAN}" stroke-width="3" stroke-dasharray="6 7" opacity=".85"/>` +
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
  asLimbs(p.legsB).forEach((l) => g.push(`<path d="${limb(l)}" stroke="${INK}" stroke-opacity=".38" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  asLimbs(p.armsB).forEach((a) => g.push(`<path d="${limb(a)}" stroke="${INK}" stroke-opacity=".38" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  // spine + head
  const s = p.spine;
  g.push(`<line x1="${s[0][0]}" y1="${s[0][1]}" x2="${s[1][0]}" y2="${s[1][1]}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`);
  g.push(`<circle cx="${p.head[0]}" cy="${p.head[1]}" r="${HEAD_R}" fill="${INK}"/>`);
  // front limbs
  asLimbs(p.legsF).forEach((l) => g.push(`<path d="${limb(l)}" stroke="${INK}" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  asLimbs(p.armsF).forEach((a) => g.push(`<path d="${limb(a)}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`));
  return g.join('');
}
function renderPose(frame, ex, front) {
  const parts = [];
  parts.push(`<line x1="12" y1="${GROUND + 3}" x2="208" y2="${GROUND + 3}" stroke="#334155" stroke-width="3" stroke-linecap="round"/>`);
  if (ex && !front && ex.box) { // side-view box (step-up platform from the side)
    const b = ex.box;
    parts.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="5" fill="#263449" stroke="#3b4a68" stroke-width="2"/>`);
  } else if (ex && front && ex.boxFront) { // box as seen from the front
    const b = ex.boxFront;
    parts.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="5" fill="#263449" stroke="#3b4a68" stroke-width="2"/>`);
  }
  if (!front) ((ex && ex.arrows) || []).forEach((ar) => parts.push(arrowSvg(ar))); // arrows are drawn in side-view coordinates
  parts.push(personSvg(frame));
  if (frame.kb) parts.push(kbSvg(frame.kb[0], frame.kb[1]));
  return `<svg viewBox="0 0 220 180" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}

// Side + front views side by side (falls back to a single side figure when an
// exercise has no posesFront). Labels make it obvious which angle is which.
function renderPair(sideFrame, frontFrame, ex) {
  if (!frontFrame) return renderPose(sideFrame, ex);
  const col = (svg, label) => `<div class="art-col">${svg}<span class="art-label">${label}</span></div>`;
  return `<div class="art-pair">${col(renderPose(sideFrame, ex), 'side')}${col(renderPose(frontFrame, ex, true), 'front')}</div>`;
}

// ---------------- pose animation (keyframe morphing) ----------------
function lerpPose(A, B, u) {
  const L = (p1, p2) => [p1[0] + (p2[0] - p1[0]) * u, p1[1] + (p2[1] - p1[1]) * u];
  const limbL = (a, b) => { // flat joint coords, lerp by index; accepts nested or bare-flat lists
    const A = asLimbs(a), B = asLimbs(b);
    return A.map((limbPts, li) => {
      const src = B[li] || limbPts;
      const out = [];
      for (let i = 0; i < limbPts.length && i < src.length; i++) out.push(limbPts[i] + (src[i] - limbPts[i]) * u);
      return out;
    });
  };
  return {
    head: L(A.head, B.head),
    spine: [L(A.spine[0], B.spine[0]), L(A.spine[1], B.spine[1])],
    armsF: limbL(A.armsF, B.armsF), armsB: limbL(A.armsB, B.armsB),
    legsF: limbL(A.legsF, B.legsF), legsB: limbL(A.legsB, B.legsB),
    kb: (A.kb && B.kb) ? L(A.kb, B.kb) : null
  };
}
const smooth = (t) => t * t * (3 - 2 * t); // ease in/out at each keyframe
function frameAt(frames, now) {
  const n = frames.length;
  if (n < 2) return frames[0];
  const segDur = 850, seqLen = (n - 1) * 2; // ping-pong: A->B->(C->)...->A
  const t = ((now - anim.t0) % (seqLen * segDur));
  const seg = Math.floor(t / segDur);
  const w = smooth((t - seg * segDur) / segDur);
  const f = (s) => (s <= n - 1 ? s : 2 * (n - 1) - s);
  return lerpPose(frames[f(seg)], frames[f(seg + 1)], w);
}
const anim = { ex: null, t0: 0 };
function setAnimatedExercise(ex) {
  if (anim.ex !== ex) { anim.ex = ex; anim.t0 = performance.now(); }
}
let lastDraw = 0;
function animLoop(now) {
  requestAnimationFrame(animLoop);
  if (!W || W.paused || !document.body.dataset.screen) return;
  const ex = W.animEx;
  if (!ex || !ex.poses.length) return;
  if (now - lastDraw < 33) return; // ~30fps cap
  lastDraw = now;
  const sf = frameAt(ex.poses, now);
  $('#exercise-art').innerHTML = renderPair(sf, ex.posesFront ? frameAt(ex.posesFront, now) : null, ex);
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
    else if (kind === 'finish') bell(784, 0, 2.4, 0.6); // one long, clear "done" tone
    else if (kind === 'stop') bell(330, 0, 0.5, 0.35);
    else if (kind === 'count') bell(987.8, 0, 0.14, 0.42);   // final-3-seconds beep
  } catch (e) { /* audio unavailable */ }
  const dbg = window.__kb && window.__kb.log;
  if (dbg) dbg.push(kind);
}
function buzz(pattern) { if (settings.haptics && navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} } }

// ---------------- settings & history ----------------
const LS_SET = 'kb.settings.v1', LS_HIST = 'kb.history.v1';
function loadLS(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
let settings = Object.assign(
  { weightLb: 35, sound: true, haptics: true, group: 'full', durationMin: 30, workSec: 40, restSec: 20, level: 0, mode: 'interval' },
  loadLS(LS_SET) || {}
);
let history = Array.isArray(loadLS(LS_HIST)) ? loadLS(LS_HIST) : [];
function saveSettings() { try { localStorage.setItem(LS_SET, JSON.stringify(settings)); } catch (e) {} }
function saveHistory() { try { localStorage.setItem(LS_HIST, JSON.stringify(history.slice(0, 200))); } catch (e) {} }

// ---------------- workout generation ----------------
const READY_SECS = 5;
function poolFor(group, level) {
  // Full Body = a mix of EVERYTHING (all tagged full-body moves plus everything else)
  let p = group === 'full' ? EXERCISES.slice() : EXERCISES.filter((e) => e.groups.includes(group));
  if (level > 0) { const f = p.filter((e) => e.level <= level); if (f.length >= 3) p = f; }
  return p;
}
function roundCount(T, w, r) { return Math.max(1, Math.floor((T + r) / (w + r))); }

// Deal items from a shuffled deck. Unilateral moves come out as back-to-back
// L/R pairs so both sides get worked before moving on.
function dealItems(count, pool) {
  const items = [];
  let deck = shuffle(pool);
  while (items.length < count) {
    if (!deck.length) {
      const prev = items[items.length - 1];
      deck = shuffle(pool.filter((e) => !prev || e.id !== prev.ex.id));
      if (!deck.length) deck = pool.slice();
    }
    const ex = deck.pop();
    if (ex.unilateral && items.length + 2 <= count) {
      const first = rand() < 0.5 ? 'L' : 'R';
      items.push({ ex, side: first });
      items.push({ ex, side: first === 'L' ? 'R' : 'L' });
    } else {
      items.push({ ex, side: null });
    }
  }
  return items;
}

// EMOM plan: ONE fixed set of K moves runs every minute; whatever seconds are
// left in the minute after the set is your rest. workSec = active seconds/min.
function emomPlan(workSec) {
  const active = Math.min(50, Math.max(12, workSec));
  const K = Math.max(3, Math.min(6, Math.round(active / 10))); // moves in the set (an L/R pair counts as two)
  const slice = Math.max(6, Math.floor(active / K));           // seconds per move within a minute
  return { K, slice, restLeft: Math.max(5, 60 - K * slice) };  // leftover in the minute = your rest
}

function buildSequence() {
  const pool = poolFor(settings.group, settings.level);

  // --- EMOM: same set of moves every minute; leftover seconds in each minute are rest ---
  if (settings.mode === 'emom') {
    const M = Math.max(1, Math.round(settings.durationMin));
    const plan = emomPlan(settings.workSec);
    const set = dealItems(plan.K, pool); // dealt once — the same circuit repeats every minute
    const blocks = [];
    for (let m = 1; m <= M; m++) {
      let slot = 0;
      set.forEach((it) => { slot++; blocks.push({ type: 'work', emom: true, ex: it.ex, side: it.side, secs: plan.slice, minute: m, slot }); });
      if (m < M) blocks.push({ type: 'rest', emom: true, secs: plan.restLeft, minute: m }); // no trailing rest on the final minute
    }
    return { blocks, T: (M - 1) * 60 + plan.K * plan.slice, emom: { minutes: M, ...plan } };
  }

  // --- Interval mode: fit items (mirror pairs stay together) into the total time ---
  const T = settings.durationMin * 60, w = Math.max(5, settings.workSec), r = Math.max(1, settings.restSec);
  const targetN = roundCount(T, w, r);
  const cand = dealItems(targetN + Math.ceil(targetN / 2) + 2, pool);

  const items = [];
  let k = 0; // items taken so far
  for (let i = 0; i < cand.length && k < targetN * 2; i++) {
    const it = cand[i];
    const usedNow = k === 0 ? 0 : k * w + (k - 1) * r;
    const isPair = it.ex.unilateral && cand[i + 1] && cand[i + 1].ex.id === it.ex.id && cand[i + 1].side !== it.side;
    if (isPair) {
      const costPair = k === 0 ? 2 * w + r : 2 * (w + r);
      if (usedNow + costPair <= T) { items.push(it, cand[i + 1]); i++; k += 2; continue; }
      break; // don't split a pair — end the session here
    }
    const cost = k === 0 ? w : w + r;
    if (usedNow + cost <= T) { items.push(it); k++; } else break;
  }
  if (!items.length && cand.length) items.push(cand[0]); // at least one exercise, always

  const rem = Math.max(0, T - (k * w + Math.max(0, k - 1) * r));
  const blocks = [];
  for (let i = 0; i < items.length; i++) {
    let secs = w + (i === items.length - 1 ? rem : 0); // leftover becomes a finisher push
    blocks.push({ type: 'work', ex: items[i].ex, side: items[i].side, secs });
    if (i < items.length - 1) blocks.push({ type: 'rest', secs: r });
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
  const { blocks, T, emom } = buildSequence();
  W = {
    blocks: [{ type: 'ready', secs: READY_SECS }, ...blocks],
    T, idx: -1, paused: false, frozenRemain: 0, doneCount: 0, emomMeta: emom || null
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
  W.lastBeep = 0; W.lastTick = null;
  onPhaseStart(b);
}

function nextWorkBlock(fromIdx) {
  for (let i = fromIdx; i < W.blocks.length; i++) if (W.blocks[i].type === 'work') return W.blocks[i];
  return null;
}

function sideLabel(side) { return side === 'L' ? 'LEFT' : side === 'R' ? 'RIGHT' : ''; }
function setSideDisplay(side) {
  const badge = $('#ex-side');
  badge.textContent = sideLabel(side);
  badge.style.display = side ? '' : 'none';
  $('#side-letter').textContent = side || '';
}

function onPhaseStart(b) {
  const phaseEl = $('#phase-banner'), cd = $('#big-countdown');
  if (b.type === 'ready') {
    chime('ready'); buzz([60]);
    phaseEl.textContent = 'GET READY'; phaseEl.className = 'phase-banner rest';
    cd.classList.remove('rest-mode');
    const first = nextWorkBlock(1);
    $('#ex-name').textContent = first ? (first.ex.name + (first.side ? ' — ' + sideLabel(first.side) : '')) : '';
    $('#ex-cue').textContent = 'Grab your kettlebell and get into position…';
    setSideDisplay(first && first.side);
    W.animEx = first ? first.ex : null;
    if (W.animEx) setAnimatedExercise(W.animEx);
    $('#ex-index').textContent = '';
  } else if (b.type === 'work') {
    chime('work'); buzz([90]);
    phaseEl.textContent = b.emom ? 'EMOM' : 'WORK'; phaseEl.className = 'phase-banner work';
    cd.classList.remove('rest-mode');
    const totalWork = W.blocks.filter((x) => x.type === 'work').length;
    const num = W.doneCount + 1;
    $('#ex-index').textContent = (b.emom && W.emomMeta) ? `MIN ${b.minute}/${W.emomMeta.minutes} · MOVE ${b.slot}/${W.emomMeta.K}` : `${num} / ${totalWork}`;
    $('#ex-name').textContent = b.ex.name + (b.side ? ' — ' + sideLabel(b.side) : '');
    $('#ex-cue').textContent = b.ex.cue;
    setSideDisplay(b.side);
    W.animEx = b.ex;
    setAnimatedExercise(W.animEx);
    document.title = `${b.secs}s · ${b.ex.name}${b.side ? ' (' + b.side + ')' : ''} — Kettlebell`;
  } else { // rest → show the NEXT exercise big so you can get ready
    chime('rest'); buzz([45, 40, 45]);
    phaseEl.textContent = 'REST'; phaseEl.className = 'phase-banner rest';
    cd.classList.add('rest-mode');
    const nw = W.blocks[W.idx + 1]; // the next block is always an upcoming work block
    if (b.emom && W.emomMeta) {
      // EMOM rest inside a minute → preview the whole set that repeats next minute
      const coming = W.blocks.filter((x) => x.type === 'work' && x.minute === b.minute + 1);
      $('#ex-name').textContent = `NEXT MINUTE · ${W.emomMeta.K} MOVES`;
      $('#ex-cue').textContent = coming.map((x) => x.ex.name + (x.side ? ' (' + x.side + ')' : '')).join('  →  ');
      setSideDisplay(null);
      W.animEx = coming.length ? coming[0].ex : null;
    } else if (nw && nw.type === 'work') {
      $('#ex-name').textContent = 'UP NEXT: ' + nw.ex.name + (nw.side ? ' — ' + sideLabel(nw.side) : '');
      $('#ex-cue').textContent = nw.ex.cue;
      setSideDisplay(nw.side);
      W.animEx = nw.ex;
      setAnimatedExercise(W.animEx);
    } else {
      $('#ex-name').textContent = 'Rest';
      $('#ex-cue').textContent = 'Breathe. You’re almost done.';
      setSideDisplay(null);
      W.animEx = null;
    }
    $('#ex-index').textContent = '';
    document.title = `Rest — Kettlebell`;
  }
  // small next-up preview (hidden during rest, where the main card already shows it)
  const nw2 = b.type === 'rest' ? null : nextWorkBlock(W.idx + 1);
  if (nw2 && nw2.type === 'work') {
    $('#next-name').textContent = nw2.ex.name + (nw2.side ? ' (' + nw2.side + ')' : '');
    $('#next-art').innerHTML = renderPair(nw2.ex.poses[0], nw2.ex.posesFront ? nw2.ex.posesFront[0] : null, nw2.ex);
    $('#next-card').style.display = '';
  } else {
    if (b.type === 'ready') {
      const f = nextWorkBlock(1);
      $('#next-card').style.display = '';
      if (f) { $('#next-name').textContent = f.ex.name + (f.side ? ' (' + f.side + ')' : ''); $('#next-art').innerHTML = renderPair(f.ex.poses[0], f.ex.posesFront ? f.ex.posesFront[0] : null, f.ex); }
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

  // final-3-seconds beeps on every work block (each EMOM move slice too)
  if (b.type === 'work') {
    if (secs <= 3 && secs >= 1 && W.lastBeep !== secs) { W.lastBeep = secs; chime('count'); buzz([25]); }
  }
  // fallback draw when rAF is throttled (dimmed screen / background tab)
  if (!W.paused && Date.now() - lastDraw > 400) animLoop(performance.now());
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
    anim.t0 += Date.now() - (W.pauseAt || Date.now()); // resume pose animation in place
    W.paused = false;
    btn.textContent = 'Pause';
  } else {
    const b = W.blocks[W.idx];
    W.frozenRemain = Math.max(0, b.endsAt - Date.now());
    W.pauseAt = Date.now();
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
    ['#mode-chips', String(settings.mode)],
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

  // mode chips (Interval vs EMOM); extra listener keeps work/rest rows in sync
  buildChips('mode-chips', [{ label: 'Interval', value: 'interval' },  { label: 'EMOM', value: 'emom' }], 'mode', { small: true });
  qsa('#mode-chips .chip').forEach((c) => c.addEventListener('click', () => applyModeUI()));

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
  const pool = poolFor(settings.group, settings.level).length;
  const gl = (GROUPS.find((g) => g.id === settings.group) || {}).label;
  if (settings.mode === 'emom') {
    const M = Math.max(1, Math.round(settings.durationMin));
    const plan = emomPlan(settings.workSec);
    $('#workout-summary').innerHTML =
      `<b>${M}</b> minutes · one set of <b>${plan.K} moves</b> every minute (~<b>${plan.slice}s</b> each) — the leftover seconds in each minute are your rest`;
  } else {
    const T = settings.durationMin * 60, w = settings.workSec, r = settings.restSec;
    const n = roundCount(T, w, r);
    $('#workout-summary').innerHTML =
      `<b>${n}</b> exercises · <b>${w}s</b> on / <b>${r}s</b> rest · pool of <b>${pool}</b> ${gl} moves` +
      (settings.group === 'full' ? ' — mixes every group so nothing gets skipped' : '') +
      (n > pool ? ' — new random order each session, moves recycle after a full shuffle' : '');
  }
  updateWeightChip();
}

function applyModeUI() {
  // EMOM uses the WORK seconds as "active seconds per minute"; rest is automatic (leftover in each minute)
  const colRest = $('#col-rest');
  if (colRest) {
    const emom = settings.mode === 'emom';
    colRest.classList.toggle('dimmed', emom);
    colRest.querySelectorAll('.chip, input').forEach((el) => el.disabled = emom);
  }
  const wl = $('#work-label');
  if (wl) wl.textContent = settings.mode === 'emom' ? 'Active sec / minute' : 'Work (sec)';
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
  grid.innerHTML = EXERCISES.map((e) => `<div style="background:#1e293b;border-radius:14px;padding:8px;width:calc(50% - 6px);min-width:170px">${renderPair(e.poses[0], e.posesFront ? e.posesFront[0] : null, e)}<div style="font-size:14px;font-weight:700;margin-top:4px">${e.name} <span style="opacity:.6">L${e.level}${e.unilateral ? ' · L/R' : ''}</span></div><div style="font-size:12px;color:#94a3b8;margin-top:2px;line-height:1.35">${e.cue}</div></div>`).join('');
  wrap.appendChild(closeBtn);
  const h2 = document.createElement('h2');
  h2.textContent = 'All Exercises (' + EXERCISES.length + ')';
  h2.style.cssText = 'margin:8px 0 4px;font-size:18px';
  wrap.appendChild(h2);
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
  applyModeUI();
  requestAnimationFrame(animLoop); // pose animation driver (no-ops outside workouts)
  if (location.search.includes('poses')) renderPoseDebug();
  // debug hooks for automated testing
  window.__kb = {
    set: (o) => { Object.assign(settings, o); applyModeUI(); refreshSummary(); },
    start: () => startWorkout(),
    stop: () => W && finishWorkout(false),
    state: () => W ? { idx: W.idx, paused: W.paused } : null,
    log: []
  };
});
