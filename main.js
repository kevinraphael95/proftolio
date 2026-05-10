'use strict';

// ============================================================
// CANVAS BG ONDULANT
// ============================================================
function initBg() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  let W, H, t = 0;
  const COLS = 30, ROWS = 20, AMP = 6, FREQ = 0.16, SPEED = 0.016;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const dark = document.body.classList.contains("dark");
    ctx.fillStyle = dark ? "rgba(99,120,248,0.4)" : "rgba(91,69,214,0.18)";
    const cw = W / COLS, ch = H / ROWS;
    for (let r = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++) {
        const wave = Math.sin(c * FREQ + r * FREQ * 0.7 + t) * AMP
                   + Math.sin(c * FREQ * 0.5 - r * FREQ * 1.2 + t * 0.8) * AMP * 0.5;
        const x = c * cw + wave;
        const y = r * ch + wave * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, dark ? 1.3 : 1.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    t += SPEED;
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// DARK MODE
// ============================================================
function initTheme() {
  const btn = document.getElementById("theme-btn");
  try {
    if (localStorage.getItem("kr_theme") === "dark") {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
      btn.textContent = "☀️";
    }
  } catch(e) {}

  btn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    document.documentElement.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    btn.textContent = dark ? "☀️" : "🌙";
    try { localStorage.setItem("kr_theme", dark ? "dark" : "light"); } catch(e) {}
  });
}

// ============================================================
// RENDU CARTES
// ============================================================
function renderCards(projects) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  projects.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.color = p.color;
    card.dataset.tags  = p.tags.join(" ");
    card.style.animationDelay = (i * 0.04) + "s";

    const tagsHtml = p.tags.map(t => `<span class="tag">${t}</span>`).join("");

    const siteBtn = p.site
      ? `<a href="${p.site}" target="_blank" class="btn primary">🌐 Voir le site</a>`
      : "";

    card.innerHTML = `
      <div class="card-top">
        <div class="card-emoji">${p.emoji}</div>
        <div class="card-title-wrap">
          <div class="card-title">${p.title}</div>
          <span class="card-lang">${p.lang}</span>
        </div>
      </div>
      <p class="card-desc">${p.desc}</p>
      <div class="card-tags">${tagsHtml}</div>
      <div class="card-links">
        <a href="${p.github}" target="_blank" class="btn">⌥ GitHub</a>
        ${siteBtn}
      </div>
    `;

    grid.appendChild(card);
  });

  document.getElementById("count").textContent = projects.length;
}

// ============================================================
// FILTRES + SEARCH
// ============================================================
let activeFilter = "all";
let searchQuery  = "";

function applyFilters() {
  const filtered = PROJECTS.filter(p => {
    const matchFilter = activeFilter === "all" || p.tags.includes(activeFilter);
    const matchSearch = searchQuery === ""
      || p.title.toLowerCase().includes(searchQuery)
      || p.desc.toLowerCase().includes(searchQuery);
    return matchFilter && matchSearch;
  });
  renderCards(filtered);
}

function initFilters() {
  document.querySelectorAll(".filt").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filt").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      activeFilter = btn.dataset.f;
      applyFilters();
    });
  });
}

function initSearch() {
  document.getElementById("search").addEventListener("input", ev => {
    searchQuery = ev.target.value.toLowerCase().trim();
    applyFilters();
  });
}

// ============================================================
// BOOT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initBg();
  initTheme();
  initFilters();
  initSearch();
  renderCards(PROJECTS);
  document.addEventListener("contextmenu", ev => ev.preventDefault());
});
