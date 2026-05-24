'use strict';

// ── BG CANVAS ──────────────────────────────────────────────
function initBg() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, t = 0;
  const COLS=30, ROWS=20, AMP=6, FREQ=0.16, SPEED=0.016;

  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  resize();
  window.addEventListener("resize", resize);

  (function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = document.body.classList.contains("dark")
      ? "rgba(120,140,255,0.18)" : "rgba(91,69,214,0.10)";
    const cw = W/COLS, ch = H/ROWS;
    for (let r=0; r<=ROWS; r++) for (let c=0; c<=COLS; c++) {
      const w = Math.sin(c*FREQ + r*FREQ*0.7 + t)*AMP + Math.sin(c*FREQ*0.5 - r*FREQ*1.2 + t*0.8)*AMP*0.5;
      ctx.beginPath();
      ctx.arc(c*cw + w, r*ch + w*0.6, document.body.classList.contains("dark") ? 1.3 : 1.0, 0, Math.PI*2);
      ctx.fill();
    }
    t += SPEED;
    requestAnimationFrame(draw);
  })();
}

// ── DARK MODE ──────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById("theme-btn");
  const apply = dark => {
    document.body.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("dark", dark);
    btn.textContent = dark ? "☀️" : "🌙";
  };
  try { apply(localStorage.getItem("kr_theme") === "dark"); } catch(e) {}
  btn.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    apply(dark);
    try { localStorage.setItem("kr_theme", dark ? "dark" : "light"); } catch(e) {}
  });
}

// ── TAG COLORS ─────────────────────────────────────────────
const TAG_COLORS = { jeu: "purple", bot: "teal", tcg: "coral", quizz: "blue" };

const STATUS_CLASSES = {
  "fonctionnel": "status-ok",
  "en travaux":  "status-wip",
  "test":        "status-test",
  "abandonné":   "status-dead"
};

// ── RENDER ─────────────────────────────────────────────────
function renderCards(projects) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  projects.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.color = p.color;
    card.style.animationDelay = (i * 0.04) + "s";

    const tagsHtml = p.tags.map(t =>
      `<span class="tag tag-${TAG_COLORS[t] || 'gray'}">${t}</span>`
    ).join("");

    card.innerHTML = `
      <div class="card-top">
        <div class="card-emoji">${p.emoji}</div>
        <div class="card-title-wrap">
          <div class="card-title">${p.title}</div>
          <div class="card-tags-inline">${tagsHtml}</div>
        </div>
      </div>
      <p class="card-desc">${p.desc}</p>
      <div class="card-footer">
        <span class="card-status ${STATUS_CLASSES[p.status] || ''}">
          ${p.status}
        </span>
        <div class="card-links">
          <a href="${p.github}" target="_blank" class="btn">⌥ GitHub</a>
          ${p.site ? `<a href="${p.site}" target="_blank" class="btn primary">🌐 Site</a>` : ""}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  document.getElementById("count").textContent = projects.length;
}

// ── FILTRES + SEARCH ───────────────────────────────────────
let activeFilter = "all", searchQuery = "";

function applyFilters() {
  renderCards(PROJECTS.filter(p =>
    (activeFilter === "all" || p.tags.includes(activeFilter)) &&
    (!searchQuery || p.title.toLowerCase().includes(searchQuery) || p.desc.toLowerCase().includes(searchQuery))
  ));
}

function initFilters() {
  document.querySelectorAll(".filt").forEach(btn =>
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filt").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      activeFilter = btn.dataset.f;
      applyFilters();
    })
  );
}

function initSearch() {
  document.getElementById("search").addEventListener("input", ev => {
    searchQuery = ev.target.value.toLowerCase().trim();
    applyFilters();
  });
}

// ── BOOT ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initBg(); initTheme(); initFilters(); initSearch(); renderCards(PROJECTS);
  document.addEventListener("contextmenu", ev => ev.preventDefault());
});
