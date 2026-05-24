'use strict';

let active = "all";
let search = "";

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const count = document.getElementById("count");

function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function render(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
  }

  list.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div class="title">${p.title}</div>
      <div class="desc">${p.desc}</div>
      <div class="tags">${p.tags.join(" · ")}</div>
      <div class="links">
        <a href="${p.github}" target="_blank">GitHub</a>
        ${p.site ? `<a href="${p.site}" target="_blank">Site</a>` : ""}
      </div>
    `;

    grid.appendChild(div);

    setTimeout(() => div.classList.add("show"), i * 40);
  });

  count.textContent = list.length;
}

function filter() {
  const result = PROJECTS.filter(p => {
    const matchTag = active === "all" || p.tags.includes(active);

    const matchSearch =
      p.title.toLowerCase().includes(search) ||
      p.desc.toLowerCase().includes(search) ||
      p.tags.join(" ").toLowerCase().includes(search);

    return matchTag && matchSearch;
  });

  render(result);
}

document.getElementById("search").addEventListener(
  "input",
  debounce(e => {
    search = e.target.value.toLowerCase().trim();
    filter();
  })
);

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    active = btn.dataset.filter;
    filter();
  });
});

document.getElementById("theme").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

filter();
