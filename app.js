'use strict';
/* 汉字 Practice — HSK 1 study app. Vanilla JS, no build step. */

// ---------- helpers ----------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const sample = (a, n) => shuffle(a).slice(0, n);
const uniq = a => [...new Set(a)];
const isHan = c => /\p{Script=Han}/u.test(c);
const hanChars = s => [...s].filter(isHan);
const D = window.DRILLS;

const store = {
  get(k, d) { try { const v = localStorage.getItem('hz.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('hz.' + k, JSON.stringify(v)); } catch (e) { } },
};

// ---------- pinyin ----------
const MARKS = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', 'ü': 'ǖǘǚǜ' };
function markSyl(syl, tone) {
  if (!tone || tone === 5) return syl;
  const low = syl.toLowerCase();
  let idx = low.indexOf('a');
  if (idx < 0) idx = low.indexOf('e');
  if (idx < 0 && low.includes('ou')) idx = low.indexOf('o');
  if (idx < 0) { for (let i = low.length - 1; i >= 0; i--) if ('aeiouü'.includes(low[i])) { idx = i; break; } }
  if (idx < 0) return syl;
  let m = MARKS[low[idx]][tone - 1];
  if (syl[idx] !== low[idx]) m = m.toUpperCase();
  return syl.slice(0, idx) + m + syl.slice(idx + 1);
}
function numToMarks(s) {
  return s.replace(/([a-zA-ZüÜ:]+)([0-5])/g, (_, syl, t) =>
    markSyl(syl.replace(/u:/g, 'ü').replace(/v/g, 'ü').replace(/V/g, 'Ü'), +t));
}
const TONE_OF = {}; Object.entries(MARKS).forEach(([b, s]) => [...s].forEach((c, i) => TONE_OF[c] = [b, i + 1]));
function stripTone(s) { return [...s].map(c => TONE_OF[c.toLowerCase()] ? TONE_OF[c.toLowerCase()][0] : c).join(''); }
function withTone(syl, t) { return markSyl(stripTone(syl), t); }

// ---------- speech ----------
let zhVoice = null;
function loadVoices() { try { const vs = speechSynthesis.getVoices(); zhVoice = vs.find(v => /zh[-_]CN/i.test(v.lang)) || vs.find(v => /^zh/i.test(v.lang)) || null; } catch (e) { } }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function speak(text) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'zh-CN'; if (zhVoice) u.voice = zhVoice; u.rate = 0.8; speechSynthesis.speak(u); } catch (e) { }
}
const audioBtn = text => `<button class="icon-btn say" data-say="${esc(text)}" aria-label="Play pronunciation">🔊</button>`;
document.addEventListener('click', e => { const b = e.target.closest('[data-say]'); if (b) { e.stopPropagation(); speak(b.dataset.say); } });

// ---------- character data (stroke order) ----------
const DATA_URL = c => `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/${encodeURIComponent(c)}.json`;
const charCache = {};
function loadChar(c) {
  if (!charCache[c]) charCache[c] = fetch(DATA_URL(c)).then(r => { if (!r.ok) throw new Error('no data'); return r.json(); })
    .catch(e => { delete charCache[c]; throw e; });
  return charCache[c];
}
const charDataLoader = (c, ok, fail) => { loadChar(c).then(ok, fail); };
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

function strokeSvg(data, upTo, highlight, cls = 'strokes') {
  const paths = data.strokes.map((d, i) => {
    let col = 'var(--stroke-faint)';
    if (i < upTo) col = i === highlight ? 'var(--accent)' : 'var(--ink)';
    return `<path d="${d}" fill="${col}"/>`;
  }).join('');
  return `<svg class="${cls}" viewBox="0 0 1024 1024"><g transform="translate(0,900) scale(1,-1)">${paths}</g></svg>`;
}
const STROKE_NAMES = {
  heng: ['一', 'héng', 'horizontal'], shu: ['丨', 'shù', 'vertical'], pie: ['丿', 'piě', 'left-falling'],
  dian: ['丶', 'diǎn', 'dot'], na: ['㇏', 'nà', 'right-falling'],
};
function strokeType(med) {
  const [x0, y0] = med[0], [x1, y1] = med[med.length - 1];
  const dx = x1 - x0, dy = -(y1 - y0), len = Math.hypot(dx, dy);
  if (len < 40) return null;
  let maxd = 0, path = 0;
  for (let i = 0; i < med.length; i++) {
    const px = med[i][0] - x0, py = -(med[i][1] - y0);
    maxd = Math.max(maxd, Math.abs(px * dy - py * dx) / len);
    if (i) path += Math.hypot(med[i][0] - med[i - 1][0], med[i][1] - med[i - 1][1]);
  }
  if (maxd / len > 0.16 || path / len > 1.2) return null;
  const ang = Math.atan2(dy, dx) * 180 / Math.PI;
  // conservative: anything ambiguous returns null and is never asked
  if (ang >= -14 && ang <= 12) return 'heng';
  if (ang >= 80 && ang <= 100 && len > 180) return 'shu';
  if (len < 170 && ang > 25 && ang < 155) return 'dian';
  if (len >= 260 && ang >= 100 && ang <= 172) return 'pie';
  return null;
}
// strokes the heuristic gets wrong (提 rising strokes, slanted 竖, 竖撇): char + stroke number — never asked
const TI_STROKES = new Set(['好3', '她3', '妈3', '块3', '地3', '我4', '汉3', '没3', '五2', '朋1', '有3']);

// ---------- vocabulary ----------
const state = { lessons: [], words: [], sel: null };
function parseWords(txt) {
  const lessons = []; let cur = null;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('//')) continue;
    if (line.startsWith('#')) {
      const [key, title = ''] = line.slice(1).split('|').map(s => s.trim());
      cur = { key, title, words: [] }; lessons.push(cur); continue;
    }
    if (!cur) continue;
    const [h, p = '', m = ''] = line.split('|').map(s => s.trim());
    if (h) cur.words.push(mkWord(h, p, m, cur.key, false));
  }
  return lessons;
}
function mkWord(h, p, m, lesson, custom, idx) {
  const py = /\d/.test(p) ? numToMarks(p) : p;
  return { h, p: py, m, lesson: String(lesson), id: h + '|' + py, custom, idx };
}
function customWords() { return store.get('custom', []); }
function buildWords(base) {
  const lessons = base.map(l => ({ ...l, words: [...l.words] }));
  customWords().forEach((w, i) => {
    const key = String(w.lesson || 'My words');
    let l = lessons.find(x => x.key === key);
    if (!l) { l = { key, title: '', words: [] }; lessons.push(l); }
    if (!l.words.some(x => x.h === w.h && x.p === w.p)) l.words.push(mkWord(w.h, w.p, w.m, key, true, i));
  });
  state.lessons = lessons;
  state.words = lessons.flatMap(l => l.words);
  const saved = store.get('sel', null);
  state.sel = new Set(saved ? saved.filter(k => lessons.some(l => l.key === k)) : lessons.map(l => l.key));
  if (!state.sel.size) state.sel = new Set(lessons.map(l => l.key));
}
let baseLessons = [];
const active = () => { const w = state.words.filter(w => state.sel.has(w.lesson)); return w.length ? w : state.words; };
const activeChars = () => uniq(active().flatMap(w => hanChars(w.h)));
const lessonLabel = k => /^\d+$/.test(k) ? 'L' + k : k;

// ---------- SRS (flashcards) ----------
const DAY = 864e5, INTERVALS = [0, 10 * 6e4, DAY, 3 * DAY, 7 * DAY, 21 * DAY, 60 * DAY];
let srs = store.get('srs', {});
function grade(id, g) {
  const c = srs[id] || { b: 0 };
  c.b = g === 0 ? 0 : Math.min(6, c.b + g);
  c.due = Date.now() + (g === 0 ? 60e3 : INTERVALS[c.b]);
  srs[id] = c; store.set('srs', srs);
}
const known = w => (srs[w.id]?.b || 0) >= 2;
let charStats = store.get('charStats', {}); // char -> {n, miss}
function noteChar(c, mistakes) { const s = charStats[c] || { n: 0, miss: 0 }; s.n++; s.miss += mistakes; charStats[c] = s; store.set('charStats', charStats); }

// ---------- routing ----------
const view = () => $('#view');
const routes = {};
function go(h) { if (location.hash === h) render(); else location.hash = h; }
window.addEventListener('hashchange', render);
function render() {
  cleanupWriters();
  const [, name = 'home', ...rest] = (location.hash || '#/home').split('/');
  $$('.nav a').forEach(a => a.classList.toggle('on', a.dataset.r === name || (name === 'notes' && a.dataset.r === 'words')));
  (routes[name] || routes.home)(...rest.map(decodeURIComponent));
  window.scrollTo(0, 0);
}
let writers = [];
function cleanupWriters() { writers.forEach(w => { try { w.cancelQuiz(); } catch (e) { } }); writers = []; }

// ---------- HOME ----------
routes.home = () => {
  const days = Math.ceil((new Date(D.exam.date + 'T08:00:00') - Date.now()) / DAY);
  const act = active(); const k = act.filter(known).length;
  const due = act.filter(w => srs[w.id] && srs[w.id].due <= Date.now()).length;
  view().innerHTML = `
  <section class="hero">
    <div>
      <p class="eyebrow">${esc(D.exam.name)}</p>
      <h1>${days > 1 ? `${days} days to go` : days === 1 ? 'Exam tomorrow — 加油!' : days === 0 ? 'Exam day — 加油!' : 'Keep practicing'}</h1>
      <p class="muted">${k} of ${act.length} words learned · ${due} cards due</p>
      <div class="bar"><span style="width:${act.length ? k / act.length * 100 : 0}%"></span></div>
    </div>
  </section>
  <div class="tiles">
    <a class="tile" href="#/cards"><b>🃏 Flashcards</b><span>Learn words with spaced repetition</span></a>
    <a class="tile" href="#/write"><b>✍️ Write hanzi</b><span>Stroke-by-stroke with your finger or Pencil</span></a>
    <a class="tile accent" href="#/quiz/mock"><b>📝 Mock exam</b><span>All 7 exam parts, scored</span></a>
    <a class="tile" href="#/quiz"><b>🎯 Drills</b><span>Radicals, tones, strokes, sentences…</span></a>
  </div>
  <h2>Lessons to practice</h2>
  <p class="muted small">Everything in the app uses the lessons you select here.</p>
  <div class="chips" id="lessonChips">
    ${state.lessons.map(l => `<button class="chip ${state.sel.has(l.key) ? 'on' : ''}" data-k="${esc(l.key)}" title="${esc(l.title)}">${esc(lessonLabel(l.key))}</button>`).join('')}
    <button class="chip ghost" data-all="1">All</button>
  </div>
  <details class="install">
    <summary>📲 Put this app on your home screen</summary>
    <p><b>iPhone / iPad (Safari):</b> tap the Share button, then <i>Add to Home Screen</i>.</p>
    <p><b>Android (Chrome):</b> tap the ⋮ menu, then <i>Install app</i> or <i>Add to Home screen</i>.</p>
    <p class="muted small">After opening it once online, it also works offline.</p>
  </details>`;
  $('#lessonChips').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.all) state.sel = new Set(state.lessons.map(l => l.key));
    else { state.sel.has(b.dataset.k) ? state.sel.delete(b.dataset.k) : state.sel.add(b.dataset.k); if (!state.sel.size) state.sel.add(b.dataset.k); }
    store.set('sel', [...state.sel]); routes.home();
  };
};

// ---------- FLASHCARDS ----------
let cardMode = store.get('cardMode', 'h2m');
routes.cards = () => {
  const act = active(), now = Date.now();
  const due = shuffle(act.filter(w => srs[w.id] && srs[w.id].due <= now));
  const fresh = shuffle(act.filter(w => !srs[w.id])).slice(0, 15);
  view().innerHTML = `
  <h1>Flashcards</h1>
  <div class="seg" id="modes">
    ${[['h2m', 'Hanzi → meaning'], ['m2h', 'Meaning → hanzi'], ['a2h', 'Listen → hanzi']].map(([k, t]) => `<button class="${cardMode === k ? 'on' : ''}" data-m="${k}">${t}</button>`).join('')}
  </div>
  <p class="muted">${due.length} due · ${fresh.length} new</p>
  <div class="row">
    <button class="btn primary" id="startDue" ${due.length + fresh.length ? '' : 'disabled'}>Study due + new (${due.length + fresh.length})</button>
    <button class="btn" id="startAll">Cram all ${act.length} words</button>
    <button class="btn" id="startWeak">Weakest words</button>
  </div>`;
  $('#modes').onclick = e => { const b = e.target.closest('button'); if (b) { cardMode = b.dataset.m; store.set('cardMode', cardMode); routes.cards(); } };
  $('#startDue').onclick = () => cardSession([...due, ...fresh]);
  $('#startAll').onclick = () => cardSession(shuffle(act));
  $('#startWeak').onclick = () => cardSession(shuffle(act).sort((a, b) => (srs[a.id]?.b ?? -1) - (srs[b.id]?.b ?? -1)).slice(0, 20));
};
function cardSession(queue) {
  queue = [...queue]; let done = 0;
  const show = () => {
    if (!queue.length) {
      view().innerHTML = `<div class="done"><h1>🎉 Done!</h1><p>${done} cards reviewed.</p><a class="btn primary" href="#/cards">Back</a> <a class="btn" href="#/write">Practice writing</a></div>`; return;
    }
    const w = queue[0];
    const front = cardMode === 'h2m' ? `<div class="big-h">${esc(w.h)}</div>`
      : cardMode === 'm2h' ? `<div class="big-m">${esc(w.m)}</div>`
        : `<div class="big-m">🔊</div><p class="muted">Tap to listen again</p>`;
    view().innerHTML = `
    <div class="topline"><a href="#/cards" class="back">✕</a><span class="muted">${queue.length} left</span></div>
    <div class="card" id="card" tabindex="0">
      <div class="front">${front}<p class="muted small">Tap to reveal</p></div>
    </div>
    <div class="grades hidden" id="grades">
      <button class="btn bad" data-g="0">Again</button><button class="btn" data-g="1">Good</button><button class="btn good" data-g="2">Easy</button>
    </div>`;
    if (cardMode === 'a2h') speak(w.h);
    const card = $('#card');
    let flipped = false;
    card.onclick = () => {
      if (flipped) { if (cardMode === 'a2h') speak(w.h); return; }
      flipped = true;
      card.innerHTML = `<div class="back"><div class="big-h">${esc(w.h)}</div><div class="py">${esc(w.p)} ${audioBtn(w.h)}</div><div class="mean">${esc(w.m)}</div>
        <div class="row center"><button class="btn small" id="cardDetail">Stroke order</button></div></div>`;
      $('#cardDetail').onclick = e => { e.stopPropagation(); openDetail(w); };
      speak(w.h);
      $('#grades').classList.remove('hidden');
    };
    $('#grades').onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      const g = +b.dataset.g; grade(w.id, g); done++;
      queue.shift();
      if (g === 0) queue.splice(Math.min(3, queue.length), 0, w);
      show();
    };
  };
  show();
}

// ---------- WORD DETAIL (stroke order) ----------
function openDetail(w) {
  const chars = hanChars(w.h);
  const sheet = document.createElement('div');
  sheet.className = 'sheet-wrap';
  sheet.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">
    <button class="icon-btn close" aria-label="Close">✕</button>
    <div class="big-h">${esc(w.h)}</div>
    <div class="py">${esc(w.p)} ${audioBtn(w.h)}</div>
    <div class="mean">${esc(w.m)}</div>
    <p class="muted small">${esc(lessonLabel(w.lesson))}</p>
    <div class="anim-row">${chars.map((c, i) => `<div class="grid-box small-box"><div id="anim${i}"></div></div>`).join('')}</div>
    <div class="row center"><button class="btn small" id="replay">▶ Replay</button><a class="btn small primary" href="#/write/${encodeURIComponent(w.id)}">✍️ Write it</a></div>
    <div id="steps"></div>
  </div>`;
  document.body.appendChild(sheet);
  const close = () => { sheet.remove(); };
  sheet.onclick = e => { if (e.target === sheet || e.target.closest('.close') || e.target.closest('a')) close(); };
  const anims = chars.map((c, i) => HanziWriter.create($('#anim' + i, sheet), c, {
    width: 110, height: 110, padding: 6, showOutline: true, strokeAnimationSpeed: 1.2, delayBetweenStrokes: 250,
    strokeColor: cssVar('--ink'), outlineColor: cssVar('--stroke-faint'), radicalColor: cssVar('--accent'), charDataLoader,
  }));
  const play = async () => { for (const a of anims) await a.animateCharacter(); };
  play();
  $('#replay', sheet).onclick = play;
  Promise.all(chars.map(c => loadChar(c).then(d => [c, d]).catch(() => [c, null]))).then(list => {
    $('#steps', sheet).innerHTML = list.map(([c, d]) => d ? `
      <h3>${esc(c)} · ${d.strokes.length} strokes</h3>
      <div class="steps">${d.strokes.map((_, i) => `<div class="step">${strokeSvg(d, i + 1, i)}<span>${i + 1}</span></div>`).join('')}</div>`
      : `<p class="muted">Stroke data for ${esc(c)} needs an internet connection.</p>`).join('');
  });
}

// ---------- WRITE ----------
let writeMode = store.get('writeMode', 'trace');
routes.write = (id) => {
  let queue;
  const fixed = id && state.words.find(w => w.id === id);
  if (fixed) queue = [fixed];
  const pool = () => {
    const src = active().filter(w => hanChars(w.h).length);
    // weight towards characters with more mistakes
    return shuffle(src).sort((a, b) => weak(b) - weak(a) + (Math.random() - 0.5) * 2);
  };
  const weak = w => hanChars(w.h).reduce((s, c) => s + ((charStats[c]?.miss || 0) / (charStats[c]?.n || 1)), 0);
  queue = queue || pool();
  let i = 0;
  const show = () => {
    cleanupWriters();
    const w = queue[i % queue.length];
    const chars = hanChars(w.h);
    view().innerHTML = `
    <h1>Write</h1>
    <div class="seg" id="wmodes">
      <button data-m="trace" class="${writeMode === 'trace' ? 'on' : ''}">Trace (outline)</button>
      <button data-m="recall" class="${writeMode === 'recall' ? 'on' : ''}">From memory</button>
    </div>
    <div class="prompt">
      ${writeMode === 'trace' ? `<div class="target">${esc(w.h)}</div>` : ''}
      <div class="py">${esc(w.p)} ${audioBtn(w.h)}</div>
      <div class="mean">${esc(w.m)}</div>
    </div>
    <div class="progress-chars" id="pc">${chars.map((c, k) => `<span class="${k === 0 ? 'cur' : ''}">${writeMode === 'trace' ? esc(c) : '？'}</span>`).join('')}</div>
    <div class="row center tight">
      <button class="btn small" id="hint">💡 Show</button>
      <button class="btn small" id="redo">↺ Again</button>
      <button class="btn small primary" id="next">Next →</button>
    </div>
    <div class="grid-box write-box" id="wbox"><svg class="grid" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 0L100 100M100 0L0 100M50 0V100M0 50H100"/></svg><div id="wtarget"><p class="muted pad">Loading strokes…</p></div></div>
    <p class="feedback" id="fb" aria-live="polite"></p>`;
    $('#wmodes').onclick = e => { const b = e.target.closest('button'); if (b) { writeMode = b.dataset.m; store.set('writeMode', writeMode); show(); } };
    $('#next').onclick = () => { i++; show(); };
    $('#redo').onclick = show;
    writeWord($('#wtarget'), $('#wbox'), w, {
      outline: writeMode === 'trace',
      onChar: (k, c, mistakes) => {
        const spans = $$('#pc span'); spans[k].textContent = c; spans[k].className = mistakes ? 'ok-ish' : 'ok';
        if (spans[k + 1]) spans[k + 1].classList.add('cur');
      },
      onDone: (total) => {
        $('#fb').innerHTML = total === 0 ? '✨ Perfect!' : `Done — ${total} mistake${total > 1 ? 's' : ''}.`;
        speak(w.h);
      },
      hintBtn: $('#hint'),
    });
  };
  show();
};
// Writes all characters of a word one after another in one box.
function writeWord(target, box, w, { outline, onChar, onDone, hintBtn }) {
  const chars = hanChars(w.h);
  const size = Math.max(220, Math.min(box.clientWidth || 300, 360, window.innerHeight - 330));
  box.style.width = box.style.height = size + 'px';
  let k = 0, total = 0, revealed = false, writer;
  const start = () => {
    target.innerHTML = `<p class="muted pad loading">Loading strokes…</p>`;
    writer = HanziWriter.create(target, chars[k], {
      onLoadCharDataSuccess: () => { $('.loading', target)?.remove(); },
      width: size, height: size, padding: 12, showCharacter: false, showOutline: outline,
      strokeColor: cssVar('--ink'), outlineColor: cssVar('--stroke-faint'), drawingColor: cssVar('--draw'),
      highlightColor: cssVar('--accent'), drawingWidth: 28, charDataLoader,
      onLoadCharDataError: () => { target.innerHTML = `<p class="muted pad">Couldn't load stroke data for ${esc(chars[k])}. Check your internet connection.</p>`; },
    });
    writers.push(writer);
    quiz();
  };
  const quiz = () => writer.quiz({
    showHintAfterMisses: 3, highlightOnComplete: true, leniency: 1.1,
    onComplete: ({ totalMistakes }) => {
      total += totalMistakes; noteChar(chars[k], totalMistakes);
      onChar && onChar(k, chars[k], totalMistakes);
      k++;
      if (k < chars.length) setTimeout(start, 650);
      else onDone && onDone(total, revealed);
    },
  });
  if (hintBtn) hintBtn.onclick = async () => {
    if (!writer || k >= chars.length) return;
    revealed = true; total += 1;
    try { writer.cancelQuiz(); await writer.hideCharacter(); await writer.animateCharacter(); await writer.hideCharacter(); } catch (e) { }
    quiz();
  };
  start();
}

// ---------- QUESTION GENERATORS ----------
const optionSet = (correct, wrongs) => shuffle([{ html: correct, correct: true }, ...wrongs.map(x => ({ html: x, correct: false }))]);
const G = {
  pictureTF() {
    const words = new Set(active().map(w => w.h));
    let keys = Object.keys(D.emoji).filter(k => words.has(k)); if (keys.length < 4) keys = Object.keys(D.emoji);
    const k = pick(keys), match = Math.random() < 0.5;
    const shown = match ? k : pick(keys.filter(x => x !== k));
    const w = state.words.find(x => x.h === shown);
    return {
      type: 'mcq', section: 'I · Picture & word', prompt: `<p class="q">Do the picture and the word match?</p><div class="pic">${D.emoji[k]}</div><div class="big-h">${esc(shown)}</div>`,
      options: [{ html: '√ true', correct: match }, { html: '× false', correct: !match }], cols: 2,
      explain: `${esc(shown)} ${w ? esc(w.p) + ' = ' + esc(w.m) : ''} ${match ? '' : `· The picture shows ${esc(k)}.`}`, say: shown,
    };
  },
  write() {
    const w = pick(active().filter(x => hanChars(x.h).length >= 1 && hanChars(x.h).length <= 3));
    return { type: 'write', section: 'II · Write hanzi from pinyin', word: w };
  },
  radical() {
    const keys = Object.keys(D.radicals).filter(r => D.radicals[r].chars.length >= 2);
    const r = pick(keys); const g = D.radicals[r];
    const correct = sample([...g.chars], Math.min(g.chars.length, 3));
    const black = new Set([...g.chars, ...(D.radicalBlacklist[r] || '')]);
    const pool = uniq(Object.values(D.radicals).flatMap(x => [...x.chars])).filter(c => !black.has(c));
    const items = shuffle([...correct.map(c => ({ h: c, correct: true })), ...sample(pool, 8 - correct.length).map(c => ({ h: c, correct: false }))]);
    return {
      type: 'multi', section: 'III · Radicals', prompt: `<p class="q">Select <b>all</b> characters with the radical</p><div class="big-h">${r}</div><p class="muted">${esc(g.name)}</p>`,
      items, explain: `${r} (${esc(g.name)}): ${[...g.chars].join(' ')}`,
    };
  },
  structure() {
    const S = D.structures, keys = Object.keys(S).filter(k => S[k].chars.length >= 2);
    if (Math.random() < 0.5) {
      const all = Object.keys(S).flatMap(k => [...S[k].chars].map(c => [c, k]));
      const actSet = new Set(activeChars());
      const cand = all.filter(([c]) => actSet.has(c));
      const [c, k] = pick(cand.length ? cand : all);
      const wrong = sample(Object.keys(S).filter(x => x !== k), 3).map(x => S[x].name);
      return { type: 'mcq', section: 'III · Character structure', prompt: `<p class="q">What is the structure of</p><div class="big-h">${c}</div>`, options: optionSet(S[k].name, wrong), explain: `${c}: ${S[k].name}` };
    }
    const k = pick(keys);
    const correct = sample([...S[k].chars], 3);
    const others = Object.keys(S).filter(x => x !== k).flatMap(x => [...S[x].chars]);
    const items = shuffle([...correct.map(h => ({ h, correct: true })), ...sample(others, 5).map(h => ({ h, correct: false }))]);
    return { type: 'multi', section: 'III · Character structure', prompt: `<p class="q">Select <b>all</b> characters with this structure:</p><p class="big-m">${S[k].name}</p>`, items, explain: `${S[k].name}: e.g. ${[...S[k].chars].slice(0, 8).join(' ')}` };
  },
  fill() {
    const words = new Set(active().map(w => w.h));
    let pool = D.fill.filter(f => words.has(f[1])); if (pool.length < 3) pool = D.fill;
    const [s, a, ...wr] = pick(pool);
    return { type: 'mcq', section: 'IV · Fill in the blank', prompt: `<p class="q">Choose the word that fits:</p><p class="sent">${esc(s)}</p>`, options: optionSet(a, wr), explain: esc(s.replace('＿＿', a)), say: s.replace('＿＿', a) };
  },
  sandhi() {
    const [ph, c, ans, rule] = pick(D.sandhi);
    const base = stripTone(ans);
    const opts = [1, 2, 3, 4].map(t => ({ html: withTone(base, t), correct: withTone(base, t) === ans }));
    return { type: 'mcq', section: 'V · Tone changes', prompt: `<p class="q">How is <b>${c}</b> pronounced in</p><div class="big-h">${ph}</div>`, options: opts, cols: 4, explain: rule, say: ph };
  },
  measure() {
    const [s, a, ...wr] = pick(D.measure);
    return { type: 'mcq', section: 'V · Measure words', prompt: `<p class="q">Choose the measure word:</p><p class="sent">${esc(s)}</p>`, options: optionSet(a, wr), cols: 4, explain: esc(s.replace('＿＿', a)), say: s.replace('＿＿', a) };
  },
  meaning() {
    const act = active(), w = pick(act);
    const others = sample(state.words.filter(x => x.m !== w.m && x.h !== w.h), 3);
    if (Math.random() < 0.5) return { type: 'mcq', section: 'V · Meaning', prompt: `<p class="q">Which ${hanChars(w.h).length > 1 ? 'word' : 'character'} means</p><p class="big-m">“${esc(w.m)}”</p>`, options: optionSet(`<span class="opt-h">${esc(w.h)}</span>`, others.map(o => `<span class="opt-h">${esc(o.h)}</span>`)), cols: 2, explain: `${esc(w.h)} ${esc(w.p)}`, say: w.h };
    return { type: 'mcq', section: 'V · Meaning', prompt: `<p class="q">What does this mean?</p><div class="big-h">${esc(w.h)}</div>`, options: optionSet(esc(w.m), others.map(o => esc(o.m))), explain: `${esc(w.h)} ${esc(w.p)} = ${esc(w.m)}`, say: w.h };
  },
  pinyin() {
    const act = active(), w = pick(act);
    if (Math.random() < 0.5) {
      // same syllables, wrong tones + another word
      const sy = w.p.split(/\s+/);
      const wrongs = new Set();
      for (let t = 0; t < 12 && wrongs.size < 3; t++) {
        const j = Math.random() * sy.length | 0, tone = 1 + (Math.random() * 4 | 0);
        const alt = sy.map((s, i) => i === j ? withTone(s, tone) : s).join(' ');
        if (alt !== w.p) wrongs.add(alt);
      }
      while (wrongs.size < 3) wrongs.add(pick(state.words.filter(x => x.p !== w.p)).p);
      return { type: 'mcq', section: 'V · Pinyin', prompt: `<p class="q">Choose the correct pinyin:</p><div class="big-h">${esc(w.h)}</div>`, options: optionSet(esc(w.p), [...wrongs].map(esc)), cols: 2, explain: `${esc(w.h)} = ${esc(w.m)}`, say: w.h };
    }
    const others = sample(state.words.filter(x => x.h !== w.h && hanChars(x.h).length === hanChars(w.h).length), 3);
    return { type: 'mcq', section: 'V · Pinyin', prompt: `<p class="q">Which characters are</p><p class="big-m">${esc(w.p)} ${audioBtn(w.h)}</p>`, options: optionSet(`<span class="opt-h">${esc(w.h)}</span>`, others.map(o => `<span class="opt-h">${esc(o.h)}</span>`)), cols: 2, explain: `${esc(w.h)} = ${esc(w.m)}`, say: w.h };
  },
  listen() {
    const w = pick(active());
    const others = sample(state.words.filter(x => x.h !== w.h), 3);
    return { type: 'mcq', section: 'Listening', prompt: `<p class="q">Listen and choose</p><p class="big-m">${audioBtn(w.h)}</p>`, autoSay: w.h, options: optionSet(`<span class="opt-h">${esc(w.h)}</span>`, others.map(o => `<span class="opt-h">${esc(o.h)}</span>`)), cols: 2, explain: `${esc(w.h)} ${esc(w.p)} = ${esc(w.m)}` };
  },
  async strokeCount() {
    for (let t = 0; t < 6; t++) {
      const c = pick(activeChars());
      try {
        const d = await loadChar(c); const n = d.strokes.length;
        const set = new Set([n]);
        for (const x of shuffle([n - 2, n - 1, n + 1, n + 2, n + 3].filter(x => x > 0))) { if (set.size >= 4) break; set.add(x); }
        const options = [...set].sort((a, b) => a - b).map(x => ({ html: String(x), correct: x === n }));
        return { type: 'mcq', section: 'V · Strokes', prompt: `<p class="q">How many strokes does this character have?</p><div class="big-h">${c}</div>`, options, cols: 4, explain: `${c} has ${n} strokes.`, after: strokeSvgSteps(d) };
      } catch (e) { }
    }
    return null;
  },
  async nthStroke() {
    for (let t = 0; t < 10; t++) {
      const c = pick(activeChars());
      try {
        const d = await loadChar(c);
        const tries = shuffle([2, 2, 1, 3]).filter(n => n <= d.strokes.length);
        for (const n of tries) {
          const type = TI_STROKES.has(c + n) ? null : strokeType(d.medians[n - 1]);
          if (!type) continue;
          const keys = ['heng', 'shu', 'pie', 'dian'];
          const ord = ['', 'first', 'second', 'third'][n];
          return {
            type: 'mcq', section: 'V · Strokes', prompt: `<p class="q">What is the <b>${ord}</b> stroke of</p><div class="big-h">${c}</div>`,
            options: keys.map(k => ({ html: `<span class="opt-h">${STROKE_NAMES[k][0]}</span> ${STROKE_NAMES[k][1]}`, correct: k === type })), cols: 2,
            explain: `Stroke ${n} of ${c} is ${STROKE_NAMES[type][0]} ${STROKE_NAMES[type][1]} (${STROKE_NAMES[type][2]}).`, after: strokeSvgSteps(d, n),
          };
        }
      } catch (e) { }
    }
    return null;
  },
  sentenceType() {
    const T = { nominal: 'nominal predicate sentence (名词谓语句)', adjective: 'adjective predicate sentence (形容词谓语句)' };
    const k = pick(Object.keys(T));
    const right = pick(D.sentences[k]);
    const wrong = sample(Object.keys(D.sentences).filter(x => x !== k).flatMap(x => D.sentences[x]), 3);
    return { type: 'mcq', section: 'V · Sentence types', prompt: `<p class="q">Which sentence is a <b>${T[k]}</b>?</p>`, options: optionSet(esc(right), wrong.map(esc)), explain: k === 'nominal' ? 'Nominal predicate: date / age / price directly as predicate, no 是.' : 'Adjective predicate: subject + 很 + adjective, no 是.' };
  },
  pictureSentence() {
    const [s, e] = pick(D.pictureSentences);
    const wrong = sample(D.pictureSentences.filter(x => x[1] !== e), 3).map(x => x[1]);
    return { type: 'mcq', section: 'VI · Sentence & picture', prompt: `<p class="q">Which picture matches?</p><p class="sent">${esc(s)} ${audioBtn(s)}</p>`, options: optionSet(`<span class="pic sm">${e}</span>`, wrong.map(x => `<span class="pic sm">${x}</span>`)), cols: 2, explain: esc(s) };
  },
  dialogue() {
    const pairs = sample(D.dialogues.filter((p, i, a) => a.findIndex(q => q[1] === p[1]) === i), 5);
    return { type: 'match', section: 'VII · Dialogues', prompt: `<p class="q">Match each line with its reply.</p>`, pairs };
  },
  pinyinRule() {
    const [disp, num] = pick(D.pinyinRules);
    const ans = numToMarks(num); const tone = +num.slice(-1);
    const parts = disp.split('+').map(s => s.trim()).join('');
    const naive = markSyl(parts.replace(/\s/g, ''), tone);
    const wrongs = uniq([naive, ...[1, 2, 3, 4].filter(t => t !== tone).map(t => withTone(ans, t))]).filter(x => x !== ans).slice(0, 3);
    const tn = ['', '1st', '2nd', '3rd', '4th'][tone];
    return { type: 'mcq', section: 'Pinyin rules', prompt: `<p class="q">Write the syllable:</p><p class="big-m">${esc(disp)} + ${tn} tone</p>`, options: optionSet(ans, wrongs), cols: 2, explain: `${esc(disp)} → ${ans}` };
  },
};
function strokeSvgSteps(d, hi) {
  return `<div class="steps">${d.strokes.map((_, i) => `<div class="step ${hi === i + 1 ? 'hi' : ''}">${strokeSvg(d, i + 1, i)}<span>${i + 1}</span></div>`).join('')}</div>`;
}

const DRILL_LIST = [
  ['mock', '📝 Mock exam', 'All 7 parts like the real midterm, scored'],
  ['pictureTF', '🖼️ Picture & word (I)', 'True or false: does the word match the picture?'],
  ['write', '✍️ Write from pinyin (II)', 'See pinyin + meaning, write the hanzi'],
  ['radical', '🧩 Radicals (III)', '讠 氵 口 亻 女 木 …'],
  ['structure', '🏗️ Character structure (III)', 'Left–right, top–bottom, enclosure…'],
  ['fill', '🔤 Fill in the blank (IV)', 'Choose the word that fits the sentence'],
  ['sandhi', '🎵 Tone changes (V)', '不 · 一 · 3rd + 3rd tone'],
  ['strokes', '🖌️ Strokes (V)', 'Stroke count and “what is the 2nd stroke?”'],
  ['grammar', '📐 Measure words & sentence types (V)', '个 口 岁 块 · nominal / adjective predicate'],
  ['meaning', '💬 Meaning & pinyin (V)', 'Which character means …?'],
  ['pictureSentence', '🖼️ Sentence & picture (VI)', 'Match a sentence to a picture'],
  ['dialogue', '💭 Dialogues (VII)', 'Match lines with their replies'],
  ['listen', '👂 Listening', 'Hear a word, pick the hanzi'],
  ['pinyinRule', '🔡 Pinyin spelling rules', 'i+a → ya, j+ü → ju, uei → ui …'],
];
const DRILL_GENS = {
  strokes: [G.strokeCount, G.nthStroke], grammar: [G.measure, G.sentenceType], meaning: [G.meaning, G.pinyin],
};
function mockSequence() {
  const s = [];
  const add = (g, n) => { for (let i = 0; i < n; i++) s.push(g); };
  add(G.pictureTF, 5); add(G.write, 3); add(G.radical, 2); add(G.structure, 2); add(G.fill, 5);
  add(G.sandhi, 2); add(G.measure, 1); add(G.meaning, 2); add(G.nthStroke, 1); add(G.strokeCount, 1); add(G.sentenceType, 1);
  add(G.pictureSentence, 3); add(G.dialogue, 1);
  return s;
}

// ---------- QUIZ ----------
routes.quiz = (id) => {
  if (id) {
    const meta = DRILL_LIST.find(d => d[0] === id);
    if (id === 'mock') return runQuiz('Mock exam', mockSequence(), true);
    const gens = DRILL_GENS[id] || [G[id]];
    if (!meta || !gens[0]) return go('#/quiz');
    const n = id === 'dialogue' ? 4 : id === 'write' ? 6 : 10;
    return runQuiz(meta[1].replace(/^\S+\s/, ''), Array.from({ length: n }, () => pick(gens)));
  }
  view().innerHTML = `<h1>Drills</h1><p class="muted">Roman numerals = parts of your midterm.</p>
  <div class="list">${DRILL_LIST.map(([k, t, d]) => `<a class="list-item ${k === 'mock' ? 'accent' : ''}" href="#/quiz/${k}"><b>${t}</b><span>${d}</span></a>`).join('')}</div>`;
};

async function runQuiz(title, seq, isMock) {
  const token = {}; runQuiz.token = token;
  let qi = 0; const results = [], seen = new Set(); // results: {section, ok, pts, max}
  const next = async () => {
    if (runQuiz.token !== token) return;
    if (qi >= seq.length) return summary();
    cleanupWriters();
    view().innerHTML = `<div class="topline"><a href="#/quiz" class="back">✕</a><span class="muted">${esc(title)} · ${qi + 1}/${seq.length}</span></div><div class="pbar"><span style="width:${qi / seq.length * 100}%"></span></div><div id="qbody"><p class="muted pad">Loading…</p></div>`;
    let q = null;
    for (let t = 0; t < 6 && !q; t++) {
      try { q = await seq[qi](); } catch (e) { q = null; }
      const key = q && (q.prompt + (q.word ? q.word.id : ''));
      if (q && seen.has(key) && t < 5) q = null; else if (q) seen.add(key);
    }
    if (runQuiz.token !== token) return;
    qi++;
    if (!q) return next();
    renderQ(q, (ok, pts = ok ? 1 : 0, max = 1) => { results.push({ section: q.section, ok, pts, max }); });
  };
  const renderQ = (q, record) => {
    const body = $('#qbody');
    const nextBtn = `<button class="btn primary wide" id="qnext">${qi >= seq.length ? 'See results' : 'Next →'}</button>`;
    const finish = (html) => {
      const fb = document.createElement('div'); fb.className = 'explain'; fb.innerHTML = (html || '') + nextBtn;
      body.appendChild(fb); $('#qnext').onclick = next; $('#qnext').focus({ preventScroll: true });
      fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    const sec = isMock && q.section ? `<p class="eyebrow">${esc(q.section)}</p>` : '';
    if (q.type === 'mcq') {
      body.innerHTML = `${sec}<div class="prompt">${q.prompt}</div><div class="opts ${q.cols === 2 ? 'c2' : q.cols === 4 ? 'c4' : ''}">${q.options.map((o, i) => `<button class="opt" data-i="${i}">${o.html}</button>`).join('')}</div>`;
      if (q.autoSay) setTimeout(() => speak(q.autoSay), 250);
      $('.opts', body).onclick = e => {
        const b = e.target.closest('.opt'); if (!b || body.dataset.done) return; body.dataset.done = 1;
        const o = q.options[+b.dataset.i];
        $$('.opt', body).forEach((x, i) => { x.disabled = true; if (q.options[i].correct) x.classList.add('right'); });
        if (!o.correct) b.classList.add('wrong');
        record(o.correct);
        if (q.say) speak(q.say);
        finish(`<p>${o.correct ? '✅ Correct!' : '❌ Not quite.'} ${q.explain || ''}</p>${q.after || ''}`);
      };
    } else if (q.type === 'multi') {
      body.innerHTML = `${sec}<div class="prompt">${q.prompt}</div><div class="opts c4 multi">${q.items.map((o, i) => `<button class="opt opt-h" data-i="${i}" aria-pressed="false">${o.h}</button>`).join('')}</div><button class="btn primary wide" id="check">Check</button>`;
      $('.opts', body).onclick = e => { const b = e.target.closest('.opt'); if (!b || body.dataset.done) return; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.classList.toggle('sel', on); };
      $('#check').onclick = () => {
        if (body.dataset.done) return; body.dataset.done = 1; $('#check').remove();
        let ok = true;
        $$('.opt', body).forEach((b, i) => { const sel = b.classList.contains('sel'), c = q.items[i].correct; b.disabled = true; if (c) b.classList.add(sel ? 'right' : 'missed'); else if (sel) { b.classList.add('wrong'); } if (sel !== c) ok = false; });
        record(ok);
        finish(`<p>${ok ? '✅ Correct!' : '❌ Not quite.'} ${q.explain || ''}</p>`);
      };
    } else if (q.type === 'match') {
      const L = q.pairs.map((p, i) => ({ t: p[0], i })), R = shuffle(q.pairs.map((p, i) => ({ t: p[1], i })));
      body.innerHTML = `${sec}<div class="prompt">${q.prompt}</div><div class="match"><div class="col">${L.map(x => `<button class="opt m" data-side="L" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div><div class="col">${R.map(x => `<button class="opt m" data-side="R" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div></div>`;
      let selL = null, firstTry = 0, matched = 0; const tried = new Set();
      $('.match', body).onclick = e => {
        const b = e.target.closest('.opt'); if (!b || b.disabled) return;
        if (b.dataset.side === 'L') { $$('.opt[data-side=L]', body).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); selL = b; speak(b.textContent); return; }
        if (!selL) { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
        if (b.dataset.i === selL.dataset.i) {
          if (!tried.has(selL.dataset.i)) firstTry++;
          [b, selL].forEach(x => { x.disabled = true; x.classList.remove('sel'); x.classList.add('right'); });
          speak(b.textContent); selL = null; matched++;
          if (matched === q.pairs.length) { const pts = firstTry; record(pts === q.pairs.length, pts, q.pairs.length); finish(`<p>${firstTry}/${q.pairs.length} matched on the first try.</p>`); }
        } else { tried.add(selL.dataset.i); b.classList.add('wrong'); setTimeout(() => b.classList.remove('wrong'), 500); }
      };
    } else if (q.type === 'write') {
      const w = q.word, n = hanChars(w.h).length;
      body.innerHTML = `${sec}<div class="prompt"><p class="q">Write the hanzi:</p><p class="big-m">${esc(w.p)} ${audioBtn(w.h)}</p><p class="muted">${esc(w.m)}</p></div>
        <div class="progress-chars" id="pc">${hanChars(w.h).map((c, k) => `<span class="${k ? '' : 'cur'}">？</span>`).join('')}</div>
        <div class="row center tight"><button class="btn small" id="hint">💡 Show strokes</button><button class="btn small" id="giveup">I don't know</button></div>
        <div class="grid-box write-box" id="wbox"><svg class="grid" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 0L100 100M100 0L0 100M50 0V100M0 50H100"/></svg><div id="wtarget"></div></div>`;
      let over = false;
      const end = (ok, msg) => { if (over) return; over = true; $('.row.center', body)?.remove(); record(ok); finish(`<p>${ok ? '✅' : '❌'} ${msg} <b class="opt-h">${esc(w.h)}</b> ${esc(w.p)}</p>`); };
      writeWord($('#wtarget'), $('#wbox'), w, {
        outline: false,
        onChar: (k, c, m) => { const s = $$('#pc span'); s[k].textContent = c; s[k].className = m ? 'ok-ish' : 'ok'; s[k + 1]?.classList.add('cur'); },
        onDone: (total, revealed) => end(!revealed && total <= 2 * n, revealed ? 'You used a hint.' : total ? `${total} mistake${total > 1 ? 's' : ''}.` : 'Perfect!'),
        hintBtn: $('#hint'),
      });
      $('#giveup').onclick = () => { cleanupWriters(); $('#wtarget').innerHTML = `<div class="answer-h">${esc(w.h)}</div>`; end(false, 'Answer:'); };
    }
  };
  const summary = () => {
    const pts = results.reduce((s, r) => s + r.pts, 0), max = results.reduce((s, r) => s + r.max, 0);
    const pct = max ? Math.round(pts / max * 100) : 0;
    const bySec = {};
    results.forEach(r => { const k = r.section || 'Other'; bySec[k] = bySec[k] || { pts: 0, max: 0 }; bySec[k].pts += r.pts; bySec[k].max += r.max; });
    const hist = store.get('history', []); hist.push({ t: Date.now(), title, pct }); store.set('history', hist.slice(-50));
    view().innerHTML = `<div class="done"><h1>${pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : '💪'} ${pct}%</h1><p>${pts} / ${max} points</p>
      ${isMock ? `<table class="secs">${Object.entries(bySec).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v.pts}/${v.max}</td></tr>`).join('')}</table>` : ''}
      <div class="row center"><button class="btn primary" id="again">Try again</button><a class="btn" href="#/quiz">All drills</a></div></div>`;
    $('#again').onclick = () => render();
  };
  next();
}

// ---------- WORDS ----------
let wordFilter = '';
routes.words = () => {
  view().innerHTML = `
  <div class="seg"><button class="on">Words</button><button onclick="location.hash='#/notes'">Grammar notes</button></div>
  <div class="row"><input type="search" id="q" placeholder="Search hanzi, pinyin or meaning" value="${esc(wordFilter)}" autocomplete="off"><a class="btn primary" href="#/add">＋ Add</a></div>
  <div id="wl"></div>
  <div class="share-box">
    <h3>My own words</h3>
    <p class="muted small">Words you add are saved on this device. Share them with friends as a link, or back them up.</p>
    <div class="row"><button class="btn" id="shareMine">🔗 Share my words</button><button class="btn" id="exportMine">⬇️ Export file</button><label class="btn">⬆️ Import file<input type="file" accept=".json,application/json" id="importFile" hidden></label></div>
  </div>`;
  const draw = () => {
    const q = wordFilter.toLowerCase().trim();
    const qs = stripTone(q);
    const html = state.lessons.map(l => {
      const ws = l.words.filter(w => !q || w.h.includes(q) || stripTone(w.p.toLowerCase()).replace(/\s/g, '').includes(qs.replace(/\s/g, '')) || w.m.toLowerCase().includes(q));
      if (!ws.length) return '';
      return `<h3 class="lesson-h">${esc(lessonLabel(l.key))} <span class="muted">${esc(l.title)}</span></h3><ul class="words">${ws.map(w => `
        <li data-id="${esc(w.id)}"><span class="wh">${esc(w.h)}</span><span class="wp">${esc(w.p)}</span><span class="wm">${esc(w.m)}</span>
        ${known(w) ? '<span class="dot" title="learned">●</span>' : ''}${audioBtn(w.h)}${w.custom ? `<a class="icon-btn" href="#/add/${w.idx}" aria-label="Edit">✎</a>` : ''}</li>`).join('')}</ul>`;
    }).join('');
    $('#wl').innerHTML = html || '<p class="muted">No matches.</p>';
  };
  draw();
  $('#q').oninput = e => { wordFilter = e.target.value; draw(); };
  $('#wl').onclick = e => { if (e.target.closest('button,a')) return; const li = e.target.closest('li'); if (li) openDetail(state.words.find(w => w.id === li.dataset.id)); };
  $('#shareMine').onclick = shareCustom;
  $('#exportMine').onclick = () => {
    const blob = new Blob([JSON.stringify(customWords(), null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-chinese-words.json'; a.click();
  };
  $('#importFile').onchange = async e => { const f = e.target.files[0]; if (!f) return; try { importWords(JSON.parse(await f.text())); } catch (err) { toast('That file could not be read.'); } };
};
routes.notes = () => {
  view().innerHTML = `<div class="seg"><button onclick="location.hash='#/words'">Words</button><button class="on">Grammar notes</button></div>
  ${window.NOTES.map((n, i) => `<details class="note" ${i === 0 ? 'open' : ''}><summary>${esc(n.title)}</summary><div>${n.html}</div></details>`).join('')}`;
};
routes.add = (idx) => {
  const list = customWords(); const editing = idx != null && list[+idx];
  const w = editing || { h: '', p: '', m: '', lesson: store.get('lastLesson', state.lessons.at(-1)?.key || 'My words') };
  const keys = uniq([...state.lessons.map(l => l.key), 'My words']);
  view().innerHTML = `<div class="topline"><a href="#/words" class="back">✕</a></div>
  <h1>${editing ? 'Edit word' : 'Add a word'}</h1>
  <form id="addf" class="form">
    <label>Hanzi<input name="h" required value="${esc(w.h)}" placeholder="e.g. 电脑" lang="zh"></label>
    <label>Pinyin<input name="p" required value="${esc(w.p)}" placeholder="diàn nǎo  or  dian4 nao3" autocapitalize="off" autocomplete="off"><small id="pyprev" class="muted"></small></label>
    <label>Meaning<input name="m" required value="${esc(w.m)}" placeholder="computer"></label>
    <label>Lesson<input name="lesson" list="lessonList" value="${esc(w.lesson)}"><datalist id="lessonList">${keys.map(k => `<option value="${esc(k)}">`).join('')}</datalist>
      <small class="muted">Use a number (e.g. 10) for a book lesson, or any name like “Class notes”.</small></label>
    <div class="row"><button class="btn primary" type="submit">${editing ? 'Save' : 'Add word'}</button>${editing ? '<button class="btn bad" type="button" id="del">Delete</button>' : ''}</div>
  </form>
  <p class="muted small">Tip: type pinyin with tone numbers (ni3 hao3, lv4) and it becomes nǐ hǎo, lǜ.</p>`;
  const f = $('#addf');
  f.p.oninput = () => { $('#pyprev').textContent = /\d/.test(f.p.value) ? '→ ' + numToMarks(f.p.value) : ''; };
  f.onsubmit = e => {
    e.preventDefault();
    const nw = { h: f.h.value.trim(), p: numToMarks(f.p.value.trim()), m: f.m.value.trim(), lesson: f.lesson.value.trim() || 'My words' };
    if (!hanChars(nw.h).length) { toast('Please enter at least one Chinese character.'); return; }
    const l = customWords(); if (editing) l[+idx] = nw; else l.push(nw);
    store.set('custom', l); store.set('lastLesson', nw.lesson);
    buildWords(baseLessons); state.sel.add(nw.lesson); store.set('sel', [...state.sel]);
    toast(editing ? 'Saved' : `Added ${nw.h}`);
    if (editing) go('#/words'); else routes.add();
  };
  if (editing) $('#del').onclick = () => { if (!confirm(`Delete ${w.h}?`)) return; const l = customWords(); l.splice(+idx, 1); store.set('custom', l); buildWords(baseLessons); go('#/words'); };
};

// ---------- share / import ----------
const b64e = s => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
async function shareCustom() {
  const l = customWords(); if (!l.length) { toast('You haven\'t added any words yet.'); return; }
  const url = location.origin + location.pathname + '#import=' + b64e(JSON.stringify(l.map(w => [w.h, w.p, w.m, w.lesson])));
  try { if (navigator.share) { await navigator.share({ title: 'My Chinese words', text: `${l.length} Chinese words for 汉字 Practice`, url }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(url); toast('Link copied — send it to your friends!'); } catch (e) { prompt('Copy this link:', url); }
}
function importWords(arr) {
  const incoming = arr.map(x => Array.isArray(x) ? { h: x[0], p: x[1], m: x[2], lesson: x[3] || 'Shared' } : x).filter(x => x && x.h);
  const l = customWords(); let n = 0;
  incoming.forEach(w => { if (!l.some(x => x.h === w.h && x.p === w.p) && !baseLessons.some(b => b.words.some(x => x.h === w.h))) { l.push({ h: String(w.h), p: String(w.p || ''), m: String(w.m || ''), lesson: String(w.lesson || 'Shared') }); n++; } });
  store.set('custom', l); buildWords(baseLessons);
  incoming.forEach(w => state.sel.add(String(w.lesson || 'Shared'))); store.set('sel', [...state.sel]);
  toast(n ? `Imported ${n} new word${n > 1 ? 's' : ''}` : 'You already have all these words');
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
}

// ---------- boot ----------
async function boot() {
  let txt = '';
  try { txt = await (await fetch('data/words.txt', { cache: 'no-cache' })).text(); } catch (e) { }
  baseLessons = parseWords(txt);
  buildWords(baseLessons);
  if (location.hash.startsWith('#import=')) {
    try {
      const arr = JSON.parse(b64d(location.hash.slice(8)));
      if (confirm(`Import ${arr.length} shared word${arr.length > 1 ? 's' : ''} into your word list?`)) importWords(arr);
    } catch (e) { toast('That share link is broken.'); }
    history.replaceState(null, '', location.pathname + '#/words');
  }
  render();
}
boot();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
