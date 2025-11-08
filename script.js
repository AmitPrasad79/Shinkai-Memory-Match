// ==== ELEMENTS ====
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const backBtn = document.getElementById("backBtn");
const countdownEl = document.getElementById("countdown");
const gameArea = document.getElementById("gameArea");
const gameBoard = document.getElementById("gameBoard");
const timerDisplay = document.getElementById("timer");
const difficultySelect = document.getElementById("difficulty");

const popup = document.getElementById("popup");
const popupMessage = document.getElementById("popupMessage");
const popupClose = document.getElementById("popupClose");

let cards = [];
let flipped = [];
let matched = 0;
let gridSize = 4;
let timeLeft = 0;
let timer = null;
let lockBoard = false;
let gameStarted = false;

const images = Array.from({ length: 30 }, (_, i) => `images/img${i + 1}.png`);
const times = { 4: 120, 6: 180, 8: 240, 10: 300 };

startBtn.addEventListener("click", startCountdown);
restartBtn.addEventListener("click", () => startCountdown());
backBtn.addEventListener("click", goBack);
popupClose.addEventListener("click", () => {
  popup.classList.add("hidden");
  goBack();
});

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startCountdown() {
  document.querySelector(".menu").classList.add("hidden");
  countdownEl.classList.remove("hidden");
  gameArea.classList.add("hidden");
  countdownEl.textContent = "3";

  let count = 3;
  const interval = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else if (count === 0) countdownEl.textContent = "Go!";
    else {
      clearInterval(interval);
      countdownEl.classList.add("hidden");
      gameArea.classList.remove("hidden");
      startGame();
    }
  }, 800);
}

function startGame() {
  clearInterval(timer);
  gameBoard.innerHTML = "";
  flipped = [];
  matched = 0;
  lockBoard = false;
  gameStarted = false;

  gridSize = parseInt(difficultySelect.value) || 4;
  timeLeft = times[gridSize] || 120;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  restartBtn.classList.remove("hidden");
  backBtn.classList.remove("hidden");

  const total = gridSize * gridSize;
  const neededPairs = total / 2;

  let selectedImgs = [];
  while (selectedImgs.length < neededPairs) {
    const shuffled = shuffle(images);
    selectedImgs = selectedImgs.concat(shuffled);
  }
  selectedImgs = selectedImgs.slice(0, neededPairs);

  cards = shuffle([...selectedImgs, ...selectedImgs]);

  if (cards.length === 0) {
    showPopup("⚠️ No images found in /images folder!");
    return;
  }

  gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 70px)`;
  cards.forEach(src => {
    const card = document.createElement("div");
    card.className = "card";

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "card-front";

    const back = document.createElement("div");
    back.className = "card-back";
    const img = document.createElement("img");
    img.src = src;
    back.appendChild(img);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    card.addEventListener("click", () => flip(card));
    gameBoard.appendChild(card);
  });

  gameStarted = true;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      gameStarted = false;
      showPopup("⏰ Time’s up! You Lose.");
    }
  }, 1000);
}

function flip(card) {
  if (!gameStarted || lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  flipped.push(card);

  if (flipped.length === 2) {
    lockBoard = true;
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = flipped;
  if (!a || !b) {
    lockBoard = false;
    flipped = [];
    return;
  }

  const imgA = a.querySelector(".card-back img")?.src;
  const imgB = b.querySelector(".card-back img")?.src;

  if (!imgA || !imgB) {
    lockBoard = false;
    flipped = [];
    return;
  }

  setTimeout(() => {
    if (imgA === imgB) {
      a.classList.add("matched");
      b.classList.add("matched");
      setTimeout(() => {
        a.style.visibility = "hidden";
        b.style.visibility = "hidden";
      }, 400);

      matched += 2;
      flipped = [];
      lockBoard = false;

      if (matched === cards.length) {
        clearInterval(timer);
        gameStarted = false;
        setTimeout(() => showPopup("🎉 You Win! Sentient brain activated!"), 300);
      }
    } else {
      setTimeout(() => {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        flipped = [];
        lockBoard = false;
      }, 400);
    }
  }, 600);
}

function goBack() {
  clearInterval(timer);
  gameArea.classList.add("hidden");
  document.querySelector(".menu").classList.remove("hidden");
  restartBtn.classList.add("hidden");
  backBtn.classList.add("hidden");
  countdownEl.classList.add("hidden");
  gameBoard.innerHTML = "";
  flipped = [];
  matched = 0;
  timerDisplay.textContent = "";
  gameStarted = false;
}

function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.remove("hidden");
}
