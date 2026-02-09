const body = document.body;
const themeBtn = document.getElementById("themeBtn");
const langBtn = document.getElementById("langBtn");
const viewBtn = document.getElementById("viewBtn");
const title = document.getElementById("title");

const rpsBtn = document.getElementById("rpsBtn");
const tttBtn = document.getElementById("tttBtn");

const soonBtns = document.querySelectorAll(".soon");
const gamesGrid = document.getElementById("gamesGrid");

let theme = localStorage.getItem("theme") || "light";
let lang = localStorage.getItem("lang") || "ru";
let view = localStorage.getItem("view") || "grid";

/* THEME */
function applyTheme() {
  body.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "light" ? "🌗" : "🌓";
  localStorage.setItem("theme", theme);
}

/* LANGUAGE */
function applyLang() {
  if (lang === "ru") {
    title.textContent = "Мини-игры";
    rpsBtn.innerHTML = "Камень<br>Ножницы<br>Бумага";
    tttBtn.innerHTML = "Крестики<br>Нолики";
    soonBtns.forEach(b => b.textContent = "Скоро");
  } else {
    title.textContent = "Mini Games";
    rpsBtn.innerHTML = "Rock<br>Paper<br>Scissors";
    tttBtn.innerHTML = "Tic<br>Tac<br>Toe";
    soonBtns.forEach(b => b.textContent = "Soon");
  }
  localStorage.setItem("lang", lang);
}

/* VIEW MODE */
function applyView() {
  gamesGrid.classList.remove("grid", "list");
  gamesGrid.classList.add(view);
  viewBtn.textContent = view === "grid" ? "🔳" : "📄";
  localStorage.setItem("view", view);
}

/* NAVIGATION */
rpsBtn.onclick = () => {
  window.location.href = "games/rps/index.html";
};

tttBtn.onclick = () => {
  window.location.href = "games/ttt/index.html";
};

/* EVENTS */
themeBtn.onclick = () => {
  theme = theme === "light" ? "dark" : "light";
  applyTheme();
};

langBtn.onclick = () => {
  lang = lang === "ru" ? "en" : "ru";
  applyLang();
};

viewBtn.onclick = () => {
  view = view === "grid" ? "list" : "grid";
  applyView();
};

/* INIT */
applyTheme();
applyLang();
applyView();