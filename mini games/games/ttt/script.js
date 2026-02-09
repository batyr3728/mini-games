// VARIABLES
const cells = document.querySelectorAll(".cell");
const boardEl = document.getElementById("board");
const indX = document.getElementById("indX");
const indO = document.getElementById("indO");
const avatarO = document.getElementById("avatarO");
const resetBtn = document.getElementById("resetBtn");
const difficultyBtn = document.getElementById("difficultyBtn");
const modeBot = document.getElementById("modeBot");
const modePvp = document.getElementById("modePvp");
const themeBtn = document.getElementById("themeBtn");
const langBtn = document.getElementById("langBtn");
const backBtn = document.getElementById("backBtn");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");

let board = Array(9).fill(null);
let current = "X";
let gameOver = false;
let waitingBot = false;
let winLine = [];

let mode = localStorage.getItem("mode") || "bot";
let difficulty = localStorage.getItem("difficulty") || "easy";
let lang = localStorage.getItem("lang") || "ru";
let theme = localStorage.getItem("theme") || "light";

let scores = JSON.parse(localStorage.getItem("scores")) || {
  bot: { X: 0, O: 0 },
  pvp: { X: 0, O: 0 }
};

let totalBotWinsX = parseInt(localStorage.getItem("totalBotWinsX") || "0");

const dict = {
  ru: { vsBot: "VS BOT", pvp: "2 ИГРОКА", easy: "ЛЕГКО", hard: "СЛОЖНО", reset: "СБРОС" },
  en: { vsBot: "VS BOT", pvp: "2 PLAYERS", easy: "EASY", hard: "HARD", reset: "RESET" }
};

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Звуки обычной победы
const victorySounds = [
  "sound/victory/among-us-victory.mp3",
  "sound/victory/flawless-victory.mp3",
  "sound/victory/mario-sssb-victory.mp3",
  "sound/victory/plants-vs-zombies-victory.mp3",
  "sound/victory/rayman-victory.mp3",
  "sound/victory/tyan-victory.mp3",
  "sound/victory/ura-pobeda.mp3",
  "sound/victory/victory-1.mp3",
  "sound/victory/victory-2.mp3",
  "sound/victory/victory-3.mp3",
  "sound/victory/victory-4.mp3"
];

// Юбилейные (эпичные) звуки победы над ботом
const epicVictorySounds = [
  "sound/victory/epic-victory/ff-victory.mp3",
  "sound/victory/epic-victory/pvz-final-victory.mp3",
  "sound/victory/epic-victory/rayman-victory.mp3",
  "sound/victory/epic-victory/ura-pobeda.mp3"
];

// Звуки поражения (бот побеждает)
const defeatSounds = [
  "sound/defeat/fail-1.mp3",
  "sound/defeat/fail-2.mp3",
  "sound/defeat/fail-3.mp3",
  "sound/defeat/half-life-death-sound.mp3",
  "sound/defeat/mario-fail-sound.mp3",
  "sound/defeat/mission-failed.mp3",
  "sound/defeat/roblox-death-sound.mp3",
  "sound/defeat/sound-fail-fallo.mp3",
  "sound/defeat/spongebob-fail.mp3",
  "sound/defeat/watch-dogs-failed-mission.mp3"
];

const gameSound = document.getElementById("gameSound");

// ────────────────────────────────────────────────
// ЗВУК
function playRandomVictory() {
  if (victorySounds.length === 0) return;
  const idx = Math.floor(Math.random() * victorySounds.length);
  gameSound.src = victorySounds[idx];
  gameSound.volume = 0.7;
  gameSound.currentTime = 0;
  gameSound.play().catch(e => console.log("Victory sound error:", e));
}

function playRandomDefeat() {
  if (defeatSounds.length === 0) return;
  const idx = Math.floor(Math.random() * defeatSounds.length);
  gameSound.src = defeatSounds[idx];
  gameSound.volume = 0.7;
  gameSound.currentTime = 0;
  gameSound.play().catch(e => console.log("Defeat sound error:", e));
}

function playRandomEpicVictory() {
  if (epicVictorySounds.length === 0) return;
  const idx = Math.floor(Math.random() * epicVictorySounds.length);
  gameSound.src = epicVictorySounds[idx];
  gameSound.volume = 0.85;
  gameSound.currentTime = 0;
  gameSound.play().catch(e => console.log("Epic victory sound error:", e));
}

function fadeOutSound() {
  if (gameSound.paused) return;

  let vol = gameSound.volume;
  const interval = setInterval(() => {
    vol -= 0.04;
    if (vol <= 0.02) {
      clearInterval(interval);
      gameSound.pause();
      gameSound.currentTime = 0;
      gameSound.volume = 0.7;
    } else {
      gameSound.volume = vol;
    }
  }, 40);
}

// Остановка при закрытии вкладки
window.addEventListener("beforeunload", () => {
  gameSound.pause();
  gameSound.currentTime = 0;
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) gameSound.pause();
});
window.addEventListener("pagehide", () => {
  gameSound.pause();
  gameSound.currentTime = 0;
});

// ────────────────────────────────────────────────
// BACK BUTTON
backBtn.onclick = () => { window.location.href = "../../index.html"; };

// ────────────────────────────────────────────────
// THEME
document.body.dataset.theme = theme;
themeBtn.textContent = theme === "dark" ? "🌓" : "🌗";
themeBtn.onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = theme;
  themeBtn.textContent = theme === "dark" ? "🌓" : "🌗";
  localStorage.setItem("theme", theme);
};

// ────────────────────────────────────────────────
// LANGUAGE
function applyLang() {
  modeBot.textContent = dict[lang].vsBot;
  modePvp.textContent = dict[lang].pvp;
  resetBtn.textContent = dict[lang].reset;
  difficultyBtn.textContent = dict[lang][difficulty];
}
applyLang();

langBtn.onclick = () => {
  lang = lang === "ru" ? "en" : "ru";
  localStorage.setItem("lang", lang);
  applyLang();
};

// ────────────────────────────────────────────────
// GAME FUNCTIONS
function resetBoard(fullReset = false) {
  fadeOutSound();

  board.fill(null);
  cells.forEach(c => {
    c.textContent = "";
    c.classList.remove("win");
  });
  boardEl.classList.remove("draw");
  current = "X";
  gameOver = false;
  waitingBot = false;
  winLine = [];
  updateIndicators();

  if (fullReset) {
    scores = { bot: { X: 0, O: 0 }, pvp: { X: 0, O: 0 } };
    localStorage.removeItem("scores");
    updateScore();
  }
}

function updateIndicators() {
  indX.classList.toggle("active", current === "X");
  indO.classList.toggle("active", current === "O");
}

function updateScore() {
  scoreXEl.textContent = scores[mode].X;
  scoreOEl.textContent = scores[mode].O;
  localStorage.setItem("scores", JSON.stringify(scores));
}

function checkWin(sym) {
  for (let combo of winningCombinations) {
    if (combo.every(i => board[i] === sym)) {
      winLine = combo;
      showWinLine();
      return true;
    }
  }
  return false;
}

function showWinLine() {
  winLine.forEach(i => cells[i].classList.add("win"));
}

function isDraw() {
  return !board.includes(null) && !checkWin("X") && !checkWin("O");
}

function updateTotalBotWinsX() {
  if (mode === "bot" && winner === "X") {
    totalBotWinsX++;
    localStorage.setItem("totalBotWinsX", totalBotWinsX);
  }
}

function endGame(winner = null) {
  gameOver = true;

  if (winner) {
    scores[mode][winner]++;
    updateScore();

    // Обычный звук
    if (winner === "X") {
      playRandomVictory();
    } else if (winner === "O" && mode === "bot") {
      playRandomDefeat();
    } else {
      playRandomVictory();
    }

    // Юбилейный звук только для X в режиме bot
    if (winner === "X" && mode === "bot") {
      updateTotalBotWinsX();

      const milestones = [5, 10, 25, 50, 100];
      if (milestones.includes(totalBotWinsX)) {
        playRandomEpicVictory();
      }
    }
  }
}

// ────────────────────────────────────────────────
// PLAYER MOVE — БЛОКИРОВКА ПОСЛЕ ПОБЕДЫ/НИЧЬЕЙ
cells.forEach(cell => {
  cell.onclick = () => {
    if (gameOver || waitingBot) return; // ← ключевой фикс: после победы/ничьей клики игнорируются
    const i = Number(cell.dataset.i);
    if (board[i] !== null) return;

    makeMove(i, current);

    if (gameOver) return;

    if (mode === "bot" && current === "O") {
      waitingBot = true;
      setTimeout(botMove, 400);
    }
  };
});

function makeMove(index, player) {
  board[index] = player;
  cells[index].textContent = player;

  if (checkWin(player)) {
    endGame(player);
    return;
  }

  if (isDraw()) {
    endGame(null);
    boardEl.classList.add("draw");
    return;
  }

  current = player === "X" ? "O" : "X";
  updateIndicators();
}

// ────────────────────────────────────────────────
// BOT MOVE
function botMove() {
  if (gameOver || !waitingBot) return;

  let move = null;

  if (difficulty === "hard") {
    move = findWinningMove("O") || findWinningMove("X") || getBestMove();
  } else {
    const free = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (Math.random() < 0.3) {
      move = free[Math.floor(Math.random() * free.length)];
    } else {
      move = findWinningMove("O") || findWinningMove("X") || free[Math.floor(Math.random() * free.length)];
    }
  }

  if (move === null || board[move] !== null) return;

  makeMove(move, "O");
  waitingBot = false;
}

function findWinningMove(sym) {
  for (let combo of winningCombinations) {
    const vals = combo.map(i => board[i]);
    if (vals.filter(v => v === sym).length === 2 && vals.includes(null)) {
      return combo[vals.indexOf(null)];
    }
  }
  return null;
}

function getBestMove() {
  if (board[4] === null) return 4;
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  const sides = [1, 3, 5, 7].filter(i => board[i] === null);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  return null;
}

// ────────────────────────────────────────────────
// MODE SWITCH
function applyMode() {
  if (mode === "bot") {
    avatarO.textContent = "🤖";
    difficultyBtn.style.display = "block";
    modeBot.classList.add("active");
    modePvp.classList.remove("active");
  } else {
    avatarO.textContent = "😺";
    difficultyBtn.style.display = "none";
    modePvp.classList.add("active");
    modeBot.classList.remove("active");
  }
  resetBoard();
  updateScore();
}
applyMode();

modeBot.onclick = () => {
  mode = "bot";
  localStorage.setItem("mode", mode);
  applyMode();
};

modePvp.onclick = () => {
  mode = "pvp";
  localStorage.setItem("mode", mode);
  applyMode();
};

// ────────────────────────────────────────────────
// DIFFICULTY
difficultyBtn.onclick = () => {
  difficulty = difficulty === "easy" ? "hard" : "easy";
  localStorage.setItem("difficulty", difficulty);
  applyLang();
};

// ────────────────────────────────────────────────
// RESET
resetBtn.onclick = () => {
  resetBoard();
};

resetBtn.oncontextmenu = (e) => {
  e.preventDefault();
  if (confirm("Сбросить счёт? (включая юбилейные победы)")) {
    resetBoard(true);
    totalBotWinsX = 0;
    localStorage.removeItem("totalBotWinsX");
  }
};

// ────────────────────────────────────────────────
// INITIAL
updateScore();
updateIndicators();