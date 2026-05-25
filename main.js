'use strict';

// ── STATUS ──────────────────────────────────────────────────
const STATUS_MAP = {
  "fonctionnel":          { cls: "s-ok",    label: "✓ OK" },
  "beta":                 { cls: "s-beta",  label: "β Beta" },
  "alpha":                { cls: "s-alpha", label: "α Alpha" },
  "en travaux":           { cls: "s-wip",   label: "⚒ WIP" },
  "test":                 { cls: "s-wip",   label: "Test" },
  "proof of concept":     { cls: "s-poc",   label: "PoC" },
  "minimum vital product":{ cls: "s-mvp",   label: "MVP" },
  "abandonné":            { cls: "s-dead",  label: "✕ Abandonné" },
};

// ── THUMB CANVAS ────────────────────────────────────────────
// Draw a coloured thumbnail on a <canvas> using the project palette
function drawThumb(canvas, p) {
  const W = canvas.width  = 600;
  const H = canvas.height = 280;
  const ctx = canvas.getContext('2d');
  const [c1, c2, c3] = p.palette;

  // background gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // decorative blobs
  ctx.globalAlpha = .18;
  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(W * .8, H * .25, H * .65, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W * .15, H * .85, H * .4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ── RENDER ──────────────────────────────────────────────────
function renderCards(projects) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  if (!projects.length) {
    grid.innerHTML = `<div class="empty">
      <div class="empty-emoji">🔍</div>
      <p>Aucun projet trouvé.</p>
    </div>`;
    document.getElementById('count').textContent = '0';
    return;
  }

  projects.forEach((p, i) => {
    const st = STATUS_MAP[p.status] || { cls: 's-poc', label: p.status };
    const hasLink = !!p.site;

    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = (i * 0.035) + 's';

    // Thumb
    const thumb = document.createElement('div');
    thumb.className = 'card-thumb';
    thumb.style.background = p.palette[0];

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    drawThumb(canvas, p);

    thumb.appendChild(canvas);

    if (p.img) {
      const imgEl = document.createElement('img');
      imgEl.className = 'thumb-img';
      imgEl.src = p.img;
      imgEl.alt = p.title;
      imgEl.loading = 'lazy';
      thumb.appendChild(imgEl);
    } else {
      const inner = document.createElement('div');
      inner.className = 'thumb-inner';
      inner.innerHTML = `
        <div class="thumb-emoji">${p.emoji}</div>
        <div class="thumb-title" style="color:${p.palette[2] || '#fff'}">${p.title}</div>
      `;
      thumb.appendChild(inner);
    }

    // Body
    const body = document.createElement('div');
    body.className = 'card-body';

    body.innerHTML = `
      <div class="card-meta">
        <div class="card-name">${p.title}</div>
      </div>
      <div class="card-desc">${p.desc}</div>
      <div class="card-footer">
        <span class="status ${st.cls}">${st.label}</span>
        <div class="card-links">
          <a href="${p.github}" target="_blank" rel="noopener" class="btn-sm" onclick="event.stopPropagation()">GitHub</a>
          ${hasLink ? `<a href="${p.site}" target="_blank" rel="noopener" class="btn-sm primary" onclick="event.stopPropagation()">↗ Site</a>` : ''}
        </div>
      </div>
    `;

    card.appendChild(thumb);
    card.appendChild(body);

    // Click card → open site or github
    card.addEventListener('click', () => {
      window.open(p.site || p.github, '_blank', 'noopener');
    });

    grid.appendChild(card);
  });

  document.getElementById('count').textContent = projects.length;
}

// ── FILTERS + SEARCH ────────────────────────────────────────
let activeFilter = 'all';
let searchQuery  = '';

function applyFilters() {
  const q = searchQuery;
  renderCards(PROJECTS.filter(p => {
    const matchTag  = activeFilter === 'all' || p.tags.includes(activeFilter);
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || (p.subtitle || '').toLowerCase().includes(q);
    return matchTag && matchSearch;
  }));
}

function initFilters() {
  document.querySelectorAll('.filt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filt').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      activeFilter = btn.dataset.f;
      applyFilters();
    });
  });
}

function initSearch() {
  document.getElementById('search').addEventListener('input', ev => {
    searchQuery = ev.target.value.toLowerCase().trim();
    applyFilters();
  });
}

// ── THEME ───────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('theme-btn');
  const apply = dark => {
    document.body.classList.toggle('dark', dark);
    btn.textContent = dark ? '☀️' : '🌙';
  };
  try { apply(localStorage.getItem('kr_theme') === 'dark'); } catch(e) {}
  btn.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    apply(dark);
    try { localStorage.setItem('kr_theme', dark ? 'dark' : 'light'); } catch(e) {}
  });
}

// ── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFilters();
  initSearch();
  applyFilters();
  document.addEventListener('contextmenu', ev => ev.preventDefault());
});
