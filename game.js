const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Ball
let ball = {
  x: 400,
  y: 230,
  radius: 10,
  dx: 4,
  dy: 4
};

// Paddles
let paddleBottom = {
  width: 120,
  height: 12,
  x: 340,
  y: canvas.height - 40,
  speed: 7,
  movingLeft: false,
  movingRight: false,
  color: "cyan"
};

let paddleTop = {
  width: 120,
  height: 12,
  x: 340,
  y: 30,
  speed: 7,
  movingLeft: false,
  movingRight: false,
  color: "magenta"
};

// Game state
let level = 1;
let levelDuration = 20; // seconds
let timeRemaining = levelDuration;
let lastTimestamp = performance.now();
let levelMessage = "";
let messageTimer = 0;
let isMultiplayer = false;
let gameStarted = false;

function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * (4 + (level - 1) * 0.5);
  ball.dy = -Math.abs(4 + (level - 1) * 0.5);
  paddleBottom.x = (canvas.width - paddleBottom.width) / 2;
  paddleTop.x = (canvas.width - paddleTop.width) / 2;
}

function setLevelMessage(text) {
  levelMessage = text;
  messageTimer = 1.5; // seconds
}

function startNextLevel() {
  level += 1;
  levelDuration = Math.max(5, 20 - (level - 1) * 2);
  timeRemaining = levelDuration;
  paddleBottom.speed = 7 + (level - 1) * 0.5;
  paddleTop.speed = 7 + (level - 1) * 0.5;
  setLevelMessage("Level " + level + " - Go!");
  resetBallAndPaddle();
}

function checkLevelComplete() {
  if (timeRemaining <= 0) {
    startNextLevel();
  }
}

function startGame(multiplayer) {
  isMultiplayer = multiplayer;
  gameStarted = true;
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  if (!isMultiplayer) {
    paddleTop.y = -100;  // move top paddle out of view in single-player
  } else {
    paddleTop.y = 30;
  }

  resetBallAndPaddle();
  setLevelMessage("Level " + level + " - Start!");
  requestAnimationFrame(update);
}

// Initialize play
resetBallAndPaddle();
setLevelMessage("Level " + level + " - Start!");

// Draw ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

// Draw paddle
function drawPaddle(p) {
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

function checkPaddleCollision(p) {
  const collideVertical = p === paddleBottom
    ? (ball.y + ball.radius >= p.y && ball.y - ball.radius <= p.y + p.height)
    : (ball.y - ball.radius <= p.y + p.height && ball.y + ball.radius >= p.y);

  if (
    ball.x >= p.x &&
    ball.x <= p.x + p.width &&
    collideVertical
  ) {
    ball.dx = (ball.x - (p.x + p.width / 2)) / (p.width / 2) * 5;
    ball.dy = p === paddleBottom ? -Math.abs(ball.dy) : Math.abs(ball.dy);
  }
}

// Update game
function update() {
  if (!gameStarted) {
    requestAnimationFrame(update);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision
  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }

  // (Old single-paddle block removed; using checkPaddleCollision for both paddles.)

  // Paddle movement
  if (paddleBottom.movingLeft && paddleBottom.x > 0) {
    paddleBottom.x -= paddleBottom.speed;
  }
  if (paddleBottom.movingRight && paddleBottom.x + paddleBottom.width < canvas.width) {
    paddleBottom.x += paddleBottom.speed;
  }

  if (paddleTop.movingLeft && paddleTop.x > 0) {
    paddleTop.x -= paddleTop.speed;
  }
  if (paddleTop.movingRight && paddleTop.x + paddleTop.width < canvas.width) {
    paddleTop.x += paddleTop.speed;
  }

  // Level timer update
  let now = performance.now();
  let delta = (now - lastTimestamp) / 1000;
  lastTimestamp = now;
  messageTimer = Math.max(0, messageTimer - delta);
  timeRemaining = Math.max(0, timeRemaining - delta);
  checkLevelComplete();

  drawBall();
  drawPaddle(paddleBottom);
  drawPaddle(paddleTop);

  // Paddle collision
  checkPaddleCollision(paddleBottom);
  checkPaddleCollision(paddleTop);

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "18px Segoe UI, sans-serif";
  ctx.fillText("Level: " + level, 16, 24);
  ctx.fillText("Time: " + Math.max(0, Math.ceil(timeRemaining)), 16, 48);

  if (messageTimer > 0) {
    ctx.font = "26px Segoe UI, sans-serif";
    ctx.fillStyle = "#00ffff";
    ctx.fillText(levelMessage, canvas.width / 2 - 110, 80);
  }

  // Reset if ball falls below canvas (repeat attempt the same level)
  if (ball.y - ball.radius > canvas.height) {
    setLevelMessage("Ouch! Try again");
    timeRemaining = levelDuration;
    resetBallAndPaddle();
  }

  requestAnimationFrame(update);
}

// Keyboard controls
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    paddleBottom.movingLeft = true;
  }
  if (event.key === "ArrowRight") {
    paddleBottom.movingRight = true;
  }
  if (event.key === "a") {
    paddleTop.movingLeft = true;
  }
  if (event.key === "d") {
    paddleTop.movingRight = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft") {
    paddleBottom.movingLeft = false;
  }
  if (event.key === "ArrowRight") {
    paddleBottom.movingRight = false;
  }
  if (event.key === "a") {
    paddleTop.movingLeft = false;
  }
  if (event.key === "d") {
    paddleTop.movingRight = false;
  }
});

// Mouse control (bottom paddle)
canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  paddleBottom.x = mouseX - paddleBottom.width / 2;
  if (paddleBottom.x < 0) paddleBottom.x = 0;
  if (paddleBottom.x + paddleBottom.width > canvas.width) paddleBottom.x = canvas.width - paddleBottom.width;
});

canvas.addEventListener("mouseleave", () => {
  paddleBottom.movingLeft = false;
  paddleBottom.movingRight = false;
  paddleTop.movingLeft = false;
  paddleTop.movingRight = false;
});

// Menu buttons
const btnSingle = document.getElementById("btnSingle");
const btnMulti = document.getElementById("btnMulti");
btnSingle.addEventListener("click", () => startGame(false));
btnMulti.addEventListener("click", () => startGame(true));