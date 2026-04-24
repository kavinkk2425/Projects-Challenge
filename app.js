/**
 * ══════════════════════════════════════════════════════════════
 * MILESTONE-by-KK - APPLICATION LOGIC
 * SQLite-powered milestone tracking with user authentication
 * ══════════════════════════════════════════════════════════════
 */

// ── GLOBAL STATE ──
let db = null;           // SQLite database instance
let cu = null;           // Current user object
let af = 'all';          // Active filter

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// ── SQL.JS CONFIGURATION ──
const SQCFG = {
  locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`
};


/* ══════════════════════════════════════════════════════════════
   DATABASE FUNCTIONS
   ══════════════════════════════════════════════════════════════ */

/**
 * Execute SQL query and return results as array of objects
 */
function q(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  
  const { columns, values } = result[0];
  return values.map(row => 
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

/**
 * Save database to localStorage
 */
function sv() {
  try {
    const data = db.export();
    const base64 = btoa(String.fromCharCode(...data));
    localStorage.setItem('msOS4', base64);
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

/**
 * HTML escape for security
 */
function h(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Check if milestone is overdue
 */
function isOv(milestone) {
  if (!milestone.due_date || milestone.status === 'done') {
    return false;
  }
  const today = new Date().toISOString().split('T')[0];
  return milestone.due_date < today;
}


/* ══════════════════════════════════════════════════════════════
   INITIALIZATION
   ══════════════════════════════════════════════════════════════ */

/**
 * Initialize database and create tables
 */
async function init() {
  const SQL = await initSqlJs(SQCFG);
  
  // Try to load existing database from localStorage
  const saved = localStorage.getItem('msOS4');
  if (saved) {
    try {
      const buffer = Uint8Array.from(atob(saved), c => c.charCodeAt(0));
      db = new SQL.Database(buffer);
    } catch (e) {
      console.error('Failed to load saved database:', e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }
  
  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      created_at TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      description TEXT DEFAULT '',
      category TEXT DEFAULT '',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'not-started',
      progress INTEGER DEFAULT 0,
      due_date TEXT DEFAULT '',
      created_at TEXT DEFAULT ''
    )
  `);
  
  sv();
  
  // Add enter key handler for login
  document.getElementById('lp').addEventListener('keydown', e => {
    if (e.key === 'Enter') doL();
  });
  
  // Spawn background particles
  spawnParticles();
}

/**
 * Create animated background particles
 */
function spawnParticles() {
  const bg = document.getElementById('bg');
  const colors = ['#6c63ff', '#38bdf8', '#a78bfa', '#34d399', '#fbbf24'];
  
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement('div');
    particle.className = 'ptcl';
    const size = Math.random() * 3.5 + 1;
    
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${colors[i % 5]};
      left: ${Math.random() * 100}%;
      bottom: -6px;
      animation-duration: ${5 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 12}s;
    `;
    
    bg.appendChild(particle);
  }
}


/* ══════════════════════════════════════════════════════════════
   NAVIGATION & SCREEN MANAGEMENT
   ══════════════════════════════════════════════════════════════ */

/**
 * Show specific screen (login, register, or app)
 */
function show(id) {
  const screens = ['sl', 'sr', 'sa'];
  screens.forEach(screenId => {
    const el = document.getElementById(screenId);
    el.classList.add('hidden');
    el.style.display = '';
  });
  
  const target = document.getElementById(id);
  target.classList.remove('hidden');
  if (id === 'sa') {
    target.style.display = 'flex';
  }
}

function goL() { show('sl'); }
function goReg() { show('sr'); }


/* ══════════════════════════════════════════════════════════════
   AUTHENTICATION
   ══════════════════════════════════════════════════════════════ */

/**
 * Switch between User and Admin login tabs
 */
function swTab(type) {
  document.getElementById('tu').classList.toggle('on', type === 'user');
  document.getElementById('ta').classList.toggle('on', type === 'admin');
  
  const subtitle = type === 'admin' 
    ? 'Administrator access' 
    : 'Sign in to your workspace';
  document.getElementById('asb').textContent = subtitle;
  
  const placeholder = type === 'admin' 
    ? 'Admin username' 
    : 'Your username';
  document.getElementById('lu').placeholder = placeholder;
  document.getElementById('lu').dataset.tab = type;
  
  document.getElementById('le').classList.remove('on');
}

// Set default tab
document.getElementById('lu').dataset.tab = 'user';

/**
 * Handle login submission
 */
function doL() {
  const username = document.getElementById('lu').value.trim();
  const password = document.getElementById('lp').value;
  const tabType = document.getElementById('lu').dataset.tab || 'user';
  const errEl = document.getElementById('le');
  
  errEl.classList.remove('on');
  
  // Validation
  if (!username || !password) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.add('on');
    return;
  }
  
  // Admin login
  if (tabType === 'admin') {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      cu = {
        id: -1,
        name: 'Administrator',
        username: 'admin',
        role: 'admin'
      };
      enter();
    } else {
      errEl.textContent = 'Invalid admin credentials.';
      errEl.classList.add('on');
    }
    return;
  }
  
  // User login
  const users = q(
    'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?',
    [username, username, password]
  );
  
  if (!users.length) {
    errEl.textContent = 'Incorrect username or password.';
    errEl.classList.add('on');
    return;
  }
  
  cu = { ...users[0], role: 'user' };
  enter();
}

/**
 * Handle registration submission
 */
function doR() {
  const name = document.getElementById('rn').value.trim();
  const username = document.getElementById('ru').value.trim();
  const email = document.getElementById('rmail').value.trim();
  const password = document.getElementById('rp').value;
  
  const errEl = document.getElementById('re2');
  const okEl = document.getElementById('ro');
  
  errEl.classList.remove('on');
  okEl.classList.remove('on');
  
  // Validation
  if (!name || !username || !email || !password) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.add('on');
    return;
  }
  
  if (password.length < 4) {
    errEl.textContent = 'Password must be at least 4 characters.';
    errEl.classList.add('on');
    return;
  }
  
  // Check if username or email already exists
  const existing = q(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );
  
  if (existing.length) {
    errEl.textContent = 'Username or email already taken.';
    errEl.classList.add('on');
    return;
  }
  
  // Create user
  const today = new Date().toISOString().split('T')[0];
  db.run(
    'INSERT INTO users (name, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, username, email, password, today]
  );
  sv();
  
  // Success message
  okEl.textContent = 'Account created! You can now sign in.';
  okEl.classList.add('on');
  
  setTimeout(() => {
    okEl.classList.remove('on');
    goL();
  }, 1500);
}

/**
 * Enter the app after successful login
 */
function enter() {
  show('sa');
  
  // Set user avatar initials
  const initials = (cu.name || '')
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
  
  const avatar = document.getElementById('chav');
  avatar.textContent = initials;
  avatar.className = 'chav ' + (cu.role === 'admin' ? 'aav' : 'uav');
  
  // Set user name
  document.getElementById('chn').textContent = cu.name;
  
  // Set role pill
  const rolePill = document.getElementById('rpl');
  rolePill.textContent = cu.role === 'admin' ? 'Admin' : 'User';
  rolePill.className = 'rpill ' + (cu.role === 'admin' ? 'rpa' : 'rpu');
  
  // Show appropriate panel
  if (cu.role === 'admin') {
    document.getElementById('ap').classList.remove('hidden');
    document.getElementById('up').classList.add('hidden');
    rAdmin();
  } else {
    document.getElementById('up').classList.remove('hidden');
    document.getElementById('ap').classList.add('hidden');
    rUser();
  }
}

/**
 * Sign out and return to login screen
 */
function doOut() {
  cu = null;
  af = 'all';
  
  // Clear login form
  document.getElementById('lu').value = '';
  document.getElementById('lp').value = '';
  document.getElementById('le').classList.remove('on');
  
  // Reset filters
  document.querySelectorAll('.fbtn').forEach(btn => btn.classList.remove('on'));
  document.querySelector('.fbtn').classList.add('on');
  
  show('sl');
}


/* ══════════════════════════════════════════════════════════════
   USER PANEL - MILESTONE MANAGEMENT
   ══════════════════════════════════════════════════════════════ */

/**
 * Set active filter
 */
function setF(filter, btn) {
  af = filter;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  rUser();
}

/**
 * Add new milestone
 */
function addM() {
  const title = document.getElementById('ft').value.trim();
  
  if (!title) {
    document.getElementById('ft').focus();
    return;
  }
  
  const description = document.getElementById('fd').value.trim();
  const category = document.getElementById('fc').value.trim();
  const dueDate = document.getElementById('fdu').value;
  const priority = document.getElementById('fp').value;
  const today = new Date().toISOString().split('T')[0];
  
  db.run(
    `INSERT INTO milestones 
    (user_id, title, description, category, priority, status, progress, due_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [cu.id, title, description, category, priority, 'not-started', 0, dueDate, today]
  );
  
  sv();
  
  // Clear form
  ['ft', 'fd', 'fc', 'fdu'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('fp').value = 'medium';
  
  rUser();
}

/**
 * Delete milestone
 */
function delM(id) {
  if (!confirm('Delete this milestone?')) return;
  
  db.run('DELETE FROM milestones WHERE id = ?', [id]);
  sv();
  
  cu.role === 'admin' ? rAdmin() : rUser();
}

/**
 * Toggle milestone done status
 */
function togD(id, currentStatus) {
  const newStatus = currentStatus === 'done' ? 'not-started' : 'done';
  const progress = newStatus === 'done' ? 100 : 0;
  
  db.run(
    'UPDATE milestones SET status = ?, progress = ? WHERE id = ?',
    [newStatus, progress, id]
  );
  sv();
  
  cu.role === 'admin' ? rAdmin() : rUser();
}

/**
 * Update milestone progress
 */
function upP(id, value) {
  const progress = parseInt(value);
  let status = 'not-started';
  
  if (progress > 0 && progress < 100) {
    status = 'in-progress';
  } else if (progress === 100) {
    status = 'done';
  }
  
  db.run(
    'UPDATE milestones SET progress = ?, status = ? WHERE id = ?',
    [progress, status, id]
  );
  sv();
  
  // Update UI
  const pctEl = document.getElementById('pct' + id);
  if (pctEl) pctEl.textContent = progress + '%';
  
  const fillEl = document.getElementById('pf' + id);
  if (fillEl) {
    fillEl.style.width = progress + '%';
    fillEl.className = 'pfill' + (progress === 100 ? ' fd' : '');
  }
  
  // Update stats
  cu.role === 'admin' ? uAS() : uUS();
}

/**
 * Generate milestone card HTML
 */
function mcH(milestone, showOwner, index) {
  const progress = milestone.progress || 0;
  const overdue = isOv(milestone);
  
  // Status badge
  let statusBadge = '<span class="bdg bdn">Not started</span>';
  if (milestone.status === 'done') {
    statusBadge = '<span class="bdg bds">Done</span>';
  } else if (milestone.status === 'in-progress') {
    statusBadge = '<span class="bdg bdp">In progress</span>';
  }
  
  // Priority badge
  let priorityBadge = '<span class="bdg bdm">Medium</span>';
  if (milestone.priority === 'high') {
    priorityBadge = '<span class="bdg bdh">High</span>';
  } else if (milestone.priority === 'low') {
    priorityBadge = '<span class="bdg bdl">Low</span>';
  }
  
  return `
    <div class="mc${milestone.status === 'done' ? ' done' : ''}" 
         style="animation-delay: ${(index || 0) * 0.06}s">
      <div class="mt2">
        <div class="mtl">
          <div class="mttl${milestone.status === 'done' ? ' sd' : ''}">
            ${h(milestone.title)}
          </div>
          <div class="bdgs">
            ${statusBadge}
            ${priorityBadge}
            ${milestone.category ? `<span class="bdg bdc">${h(milestone.category)}</span>` : ''}
          </div>
          ${milestone.description ? `<div class="mcdesc">${h(milestone.description)}</div>` : ''}
          <div class="mmeta">
            ${milestone.due_date ? `
              <span class="mi${overdue ? ' ov' : ''}">
                ${overdue ? '⚠ ' : ''}${milestone.due_date}
              </span>
            ` : ''}
            ${showOwner && milestone.username ? `
              <span class="mi">@${h(milestone.username)}</span>
            ` : ''}
            <span class="mi">${milestone.created_at}</span>
          </div>
        </div>
        <div class="mact">
          <button class="xb g" onclick="togD(${milestone.id}, '${milestone.status}')">
            ${milestone.status === 'done' ? 'Undo' : 'Done'}
          </button>
          <button class="xb r" onclick="delM(${milestone.id})">Del</button>
        </div>
      </div>
      <div class="prog">
        <div class="ptrack">
          <div id="pf${milestone.id}" 
               class="pfill${progress === 100 ? ' fd' : ''}" 
               style="width: ${progress}%"></div>
        </div>
        <div class="prow">
          <input type="range" min="0" max="100" step="5" value="${progress}" 
                 oninput="upP(${milestone.id}, this.value)">
          <span id="pct${milestone.id}" class="ppct">${progress}%</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Empty state HTML
 */
function emp() {
  return `
    <div class="empty">
      <div class="eico">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M8 12h8M8 8h5M8 16h3"/>
        </svg>
      </div>
      <p>No milestones here yet.</p>
    </div>
  `;
}

/**
 * Render user milestones
 */
function rUser() {
  let milestones = q(
    `SELECT * FROM milestones 
     WHERE user_id = ? 
     ORDER BY 
       CASE priority 
         WHEN 'high' THEN 0 
         WHEN 'medium' THEN 1 
         ELSE 2 
       END,
       created_at DESC`,
    [cu.id]
  );
  
  // Apply filter
  if (af === 'done') {
    milestones = milestones.filter(m => m.status === 'done');
  } else if (af === 'in-progress') {
    milestones = milestones.filter(m => m.status === 'in-progress');
  } else if (af === 'not-started') {
    milestones = milestones.filter(m => m.status === 'not-started');
  } else if (af === 'overdue') {
    milestones = milestones.filter(isOv);
  }
  
  // Render
  const html = milestones.length
    ? milestones.map((m, i) => mcH(m, false, i)).join('')
    : emp();
  
  document.getElementById('um').innerHTML = html;
  uUS();
}

/**
 * Update user stats
 */
function uUS() {
  const all = q('SELECT * FROM milestones WHERE user_id = ?', [cu.id]);
  
  document.getElementById('ut').textContent = all.length;
  document.getElementById('ud').textContent = 
    all.filter(m => m.status === 'done').length;
  document.getElementById('uip').textContent = 
    all.filter(m => m.status === 'in-progress').length;
  document.getElementById('uo').textContent = 
    all.filter(isOv).length;
}


/* ══════════════════════════════════════════════════════════════
   ADMIN PANEL - USER & SYSTEM MANAGEMENT
   ══════════════════════════════════════════════════════════════ */

/**
 * Render admin panel
 */
function rAdmin() {
  // Render user list
  const users = q('SELECT * FROM users ORDER BY created_at DESC');
  document.getElementById('uc').textContent = users.length + ' users';
  
  const userHtml = users.length ? users.map(user => {
    const milestoneCount = q(
      'SELECT COUNT(*) as c FROM milestones WHERE user_id = ?',
      [user.id]
    )[0]?.c || 0;
    
    return `
      <div class="urow">
        <div class="uinfo">
          <div class="uav2">${(user.name || '?').charAt(0).toUpperCase()}</div>
          <div style="min-width: 0">
            <div class="uname">
              ${h(user.name)} 
              <span class="bdg bdc" style="font-size: 9px">${h(user.username)}</span>
            </div>
            <div class="usub">
              ${h(user.email)} · ${milestoneCount} milestone${milestoneCount !== 1 ? 's' : ''} · ${user.created_at}
            </div>
          </div>
        </div>
        <button class="xb r" onclick="delU(${user.id})">Remove</button>
      </div>
    `;
  }).join('') : '<p style="font-size: 12px; color: var(--tx3); padding: 4px 0">No registered users yet.</p>';
  
  document.getElementById('ul').innerHTML = userHtml;
  
  // Render all milestones
  const allMilestones = q(
    `SELECT m.*, u.username 
     FROM milestones m 
     LEFT JOIN users u ON m.user_id = u.id 
     ORDER BY m.created_at DESC`
  );
  
  const milestoneHtml = allMilestones.length
    ? allMilestones.map((m, i) => mcH(m, true, i)).join('')
    : emp();
  
  document.getElementById('am').innerHTML = milestoneHtml;
  
  uAS();
}

/**
 * Update admin stats
 */
function uAS() {
  const all = q('SELECT * FROM milestones');
  
  document.getElementById('at').textContent = all.length;
  document.getElementById('ad').textContent = 
    all.filter(m => m.status === 'done').length;
  document.getElementById('aip').textContent = 
    all.filter(m => m.status === 'in-progress').length;
  document.getElementById('ao').textContent = 
    all.filter(isOv).length;
}

/**
 * Delete user and all their milestones
 */
function delU(userId) {
  if (!confirm('Remove this user and all their milestones?')) return;
  
  db.run('DELETE FROM milestones WHERE user_id = ?', [userId]);
  db.run('DELETE FROM users WHERE id = ?', [userId]);
  sv();
  
  rAdmin();
}


/* ══════════════════════════════════════════════════════════════
   START APPLICATION
   ══════════════════════════════════════════════════════════════ */

init().catch(error => {
  document.body.innerHTML = `
    <p style="color: #f87171; padding: 2rem; font-family: monospace">
      Failed to load database. Please check your connection and refresh.
    </p>
  `;
  console.error(error);
});
