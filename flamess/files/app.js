/* =============================================
   FLAMES — Cosmic Connection Reader
   app.js
   ============================================= */

// ============ STATE ============
let currentResult = null;

const FLAMES_META = {
  F: { word: 'Friends',   emoji: '👫', desc: 'A beautiful friendship forged in the stars — loyal, warm, and unshakeable across every season of life.',              compat: [88, 72, 65, 90], positive: true  },
  L: { word: 'Love',      emoji: '❤️', desc: 'A passionate and soul-deep romantic connection. The universe has written your names in the same constellation.',      compat: [97, 85, 88, 79], positive: true  },
  A: { word: 'Affection', emoji: '🥰', desc: 'A tender, caring bond filled with gentle moments and sincere fondness. Your energies align in the softest ways.',     compat: [82, 88, 70, 76], positive: true  },
  M: { word: 'Marriage',  emoji: '💍', desc: 'A destined lifelong union. The cosmic scales tipped decisively — trust, devotion, and a shared horizon await you.',   compat: [95, 92, 97, 89], positive: true  },
  E: { word: 'Enemies',   emoji: '⚡', desc: 'Sparks fly — fiercely. A charged rivalry that keeps both of you on your toes. Sometimes the greatest tension precedes transformation.', compat: [30, 25, 60, 15], positive: false },
  S: { word: 'Siblings',  emoji: '🤝', desc: 'An unbreakable sibling-like bond — playful, protective, and real. The kind of connection that lasts a lifetime.',     compat: [78, 65, 82, 93], positive: true  }
};

const COMPAT_LABELS = ['Emotional Bond', 'Intellectual Sync', 'Physical Chemistry', 'Long-term Potential'];

const LOADING_MSGS = [
  'Aligning celestial coordinates…',
  'Cross-referencing soul frequencies…',
  'Consulting the ancient FLAMES oracle…',
  'Weaving your names through the cosmos…',
  'Predicting your connection…',
  'The answer is crystallizing…'
];

// ============ CUSTOM CURSOR ============
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function animCursor() {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  cursor.style.left     = mx + 'px';
  cursor.style.top      = my + 'px';
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('button, a, input').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width = '18px'; cursor.style.height = '18px'; cursor.style.background = 'var(--fire3)'; });
  el.addEventListener('mouseleave', () => { cursor.style.width = '10px'; cursor.style.height = '10px'; cursor.style.background = 'var(--fire2)'; });
});

// ============ STARFIELD ============
(function () {
  const c   = document.getElementById('starfield');
  const ctx = c.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      speed: Math.random() * 0.003 + 0.001
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      s.a += s.speed;
      const alpha = (Math.sin(s.a) + 1) / 2 * 0.7 + 0.1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,240,220,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

// ============ NEBULA PARTICLES ============
(function () {
  const c   = document.getElementById('nebula');
  const ctx = c.getContext('2d');
  let W, H, ps = [];

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
  }

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = H + 15;
      this.vx   = (Math.random() - 0.5) * 0.5;
      this.vy   = -(Math.random() * 0.9 + 0.3);
      this.r    = Math.random() * 2.5 + 0.5;
      this.life = 1;
      this.d    = Math.random() * 0.004 + 0.002;
      this.hue  = Math.random() * 50 + 10;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.vx += (Math.random() - 0.5) * 0.04;
      this.life -= this.d;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life * 0.3;
      ctx.fillStyle   = `hsl(${this.hue},100%,60%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 40; i++) {
    const p = new P();
    p.y    = Math.random() * H;
    p.life = Math.random();
    ps.push(p);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    if (Math.random() < 0.25) ps.push(new P());
    ps = ps.filter(p => p.life > 0);
    if (ps.length > 80) ps.shift();
    ps.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  loop();
})();

// ============ SCREEN NAVIGATION ============
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  setTimeout(() => {
    document.getElementById('screen-' + id).classList.add('active');
  }, 10);
}

// ============ FLAMES ALGORITHM ============
function calcFlames(n1, n2) {
  let a1 = n1.toLowerCase().replace(/\s/g, '').split('');
  let a2 = n2.toLowerCase().replace(/\s/g, '').split('');
  let removed = 0;

  for (let i = a1.length - 1; i >= 0; i--) {
    const j = a2.indexOf(a1[i]);
    if (j !== -1) { a1.splice(i, 1); a2.splice(j, 1); removed++; }
  }

  const count = a1.length + a2.length;
  let flames   = ['F', 'L', 'A', 'M', 'E', 'S'];
  const steps  = [];
  let idx      = 0;

  while (flames.length > 1) {
    idx = (idx + count - 1) % flames.length;
    const el = flames[idx];
    flames.splice(idx, 1);
    steps.push({ removed: el, remaining: [...flames] });
    if (idx >= flames.length) idx = 0;
  }

  return { result: flames[0], count, removed, steps };
}

// ============ CALCULATE ============
function calculate() {
  const n1  = document.getElementById('name1').value.trim();
  const n2  = document.getElementById('name2').value.trim();
  const err = document.getElementById('errStrip');

  if (!n1 || !n2) {
    err.classList.add('show');
    setTimeout(() => err.classList.remove('show'), 2500);
    return;
  }

  err.classList.remove('show');
  currentResult = { ...calcFlames(n1, n2), n1, n2 };
  goTo('loading');
  runLoadingSequence(currentResult.result);
}

// ============ LOADING SEQUENCE ============
function runLoadingSequence(resultLetter) {
  const msgs     = document.getElementById('loadingMsg');
  const sub      = document.getElementById('loadingSub');
  const orbLabel = document.getElementById('orbLabel');
  const letters  = ['F', 'L', 'A', 'M', 'E', 'S'];
  let msgIdx     = 0;
  let starIdx    = 0;

  // Reset constellation stars
  for (let i = 0; i < 6; i++) {
    const s = document.getElementById('cst' + i);
    const l = document.getElementById('cln' + i);
    if (s) s.classList.remove('lit');
    if (l) l.classList.remove('lit');
  }

  // Reset scan letters
  document.querySelectorAll('.scan-letter').forEach(el => {
    el.classList.remove('scanning');
    el.style.color      = '';
    el.style.borderColor = '';
    el.style.boxShadow  = '';
  });

  // Reset orb
  orbLabel.textContent = 'FLAMES';

  // Message rotation
  const msgTimer = setInterval(() => {
    msgs.style.opacity = '0';
    setTimeout(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
      msgs.textContent   = LOADING_MSGS[msgIdx];
      msgs.style.opacity = '1';
    }, 400);
  }, 900);

  // Constellation lighting
  const starTimer = setInterval(() => {
    if (starIdx < 6) {
      const s = document.getElementById('cst' + starIdx);
      if (s) s.classList.add('lit');
      if (starIdx > 0) {
        const l = document.getElementById('cln' + (starIdx - 1));
        if (l) l.classList.add('lit');
      }
      starIdx++;
    }
  }, 350);

  // FLAMES letter scanning
  let scanLetterIdx = 0;
  const scanTimer = setInterval(() => {
    document.querySelectorAll('.scan-letter').forEach(el => el.classList.remove('scanning'));
    if (scanLetterIdx < 6) {
      const tiles = document.querySelectorAll('.scan-letter');
      tiles[scanLetterIdx].classList.add('scanning');
      orbLabel.textContent = letters[scanLetterIdx];
    }
    scanLetterIdx = (scanLetterIdx + 1) % 7;
  }, 280);

  // After 3.5s reveal result
  setTimeout(() => {
    clearInterval(msgTimer);
    clearInterval(starTimer);
    clearInterval(scanTimer);

    msgs.textContent = 'Connection identified!';
    sub.textContent  = FLAMES_META[resultLetter].word.toUpperCase();
    orbLabel.textContent = resultLetter;

    document.querySelectorAll('.scan-letter').forEach(el => {
      el.classList.remove('scanning');
      if (el.dataset.l === resultLetter) {
        el.classList.add('scanning');
        el.style.color       = 'var(--fire3)';
        el.style.borderColor = 'var(--fire3)';
        el.style.boxShadow   = '0 0 30px rgba(255,180,0,0.5)';
      }
    });

    setTimeout(() => {
      buildResultScreen(currentResult);
      goTo('result');
      sub.textContent  = 'Predicting your connection';
      msgs.textContent = LOADING_MSGS[0];
    }, 700);
  }, 3500);
}

// ============ BUILD RESULT SCREEN ============
function buildResultScreen(data) {
  const meta = FLAMES_META[data.result];

  // Names
  document.getElementById('resultNames').innerHTML =
    `<strong>${data.n1}</strong> &nbsp;✦&nbsp; <strong>${data.n2}</strong>`;

  // Hero
  document.getElementById('resEmoji').textContent = meta.emoji;
  document.getElementById('resWord').textContent  = meta.word;
  document.getElementById('resDesc').textContent  = meta.desc;

  // Compatibility bars
  const bars = document.getElementById('compatBars');
  bars.innerHTML = '';
  COMPAT_LABELS.forEach((label, i) => {
    const pct = meta.compat[i];
    bars.innerHTML += `
      <div class="compat-bar-wrap">
        <div class="compat-label-row">
          <span class="compat-label">${label}</span>
          <span class="compat-pct" id="cpct${i}">0%</span>
        </div>
        <div class="compat-track">
          <div class="compat-fill" id="cfill${i}" style="width:0%"></div>
        </div>
      </div>`;
  });

  // Animate bars
  setTimeout(() => {
    meta.compat.forEach((pct, i) => {
      setTimeout(() => {
        document.getElementById('cfill' + i).style.width = pct + '%';
        let n = 0;
        const ticker = setInterval(() => {
          n = Math.min(n + Math.ceil(pct / 30), pct);
          document.getElementById('cpct' + i).textContent = n + '%';
          if (n >= pct) clearInterval(ticker);
        }, 35);
      }, i * 180);
    });
  }, 500);

  // FLAMES breakdown grid
  const grid     = document.getElementById('flamesGrid');
  grid.innerHTML = '';
  const eliminated = data.steps.map(s => s.removed);

  ['F', 'L', 'A', 'M', 'E', 'S'].forEach(l => {
    const isOut = eliminated.includes(l);
    const isWin = l === data.result;
    grid.innerHTML += `
      <div class="fr-tile ${isOut ? 'out' : ''} ${isWin ? 'winner' : ''}">
        <span class="fr-letter">${l}</span>
        <span class="fr-word">${FLAMES_META[l].word}</span>
      </div>`;
  });

  // Calculation steps
  const calcBody = document.getElementById('calcBody');
  let html = `
    <div class="calc-row"><span class="cr-step">Step 0</span><span>Common letters cancelled: <span class="cr-val">${data.removed}</span></span></div>
    <div class="calc-row"><span class="cr-step">Count</span><span>Remaining characters: <span class="cr-val">${data.count}</span></span></div>`;

  data.steps.forEach((s, i) => {
    html += `<div class="calc-row"><span class="cr-step">Step ${i + 1}</span><span>Eliminated <span class="cr-val">${s.removed}</span> → [${s.remaining.join(' ')}]</span></div>`;
  });

  html += `<div class="calc-row"><span class="cr-step">Result</span><span>Winner: <span class="cr-val">${data.result} — ${meta.word}</span></span></div>`;
  calcBody.innerHTML = html;
}

// ============ TOGGLE CALCULATION PANEL ============
let calcOpen = false;
function toggleCalc() {
  calcOpen = !calcOpen;
  document.getElementById('calcBody').classList.toggle('open', calcOpen);
  document.getElementById('calcIcon').classList.toggle('open', calcOpen);
}

// ============ SHARE ============
function shareResult() {
  if (!currentResult) return;
  const meta = FLAMES_META[currentResult.result];
  const text = `🔥 FLAMES Result: ${currentResult.n1} & ${currentResult.n2} = ${meta.word} ${meta.emoji}\n"${meta.desc}"\n\nTry it yourself!`;

  if (navigator.share) {
    navigator.share({ title: 'FLAMES Result', text });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => toast('Result copied to clipboard!'));
  } else {
    toast('Result: ' + meta.word);
  }
}

// ============ TOAST NOTIFICATION ============
function toast(msg) {
  const t = document.getElementById('toaster');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const active = document.querySelector('.screen.active');
    if (active && active.id === 'screen-result') goTo('input');
    else if (active && active.id === 'screen-input') goTo('intro');
  }
});

// ============ CURSOR — DYNAMIC ELEMENTS ============
const observer = new MutationObserver(() => {
  document.querySelectorAll('button:not([data-cursor]), a:not([data-cursor])').forEach(el => {
    el.setAttribute('data-cursor', '1');
    el.addEventListener('mouseenter', () => { cursor.style.width = '18px'; cursor.style.height = '18px'; cursor.style.background = 'var(--fire3)'; });
    el.addEventListener('mouseleave', () => { cursor.style.width = '10px'; cursor.style.height = '10px'; cursor.style.background = 'var(--fire2)'; });
  });
});
observer.observe(document.body, { childList: true, subtree: true });
