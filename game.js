const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let gameStarted = false;
let isMultiplayer = false;

// Ball
let ball = {
  x: 400,
  y: 250,
  radius: 10,
  dx: 4,
  dy: 4
};

// Scores
let playerScore = 0;
let aiScore = 0;

// Paddle
let paddleBottom = {
  x: 340,
  y: canvas.height - 30,
  width: 120,
  height: 10,
  speed: 8,
  movingLeft: false,
  movingRight: false
};

let paddleTop = {
  x: 340,
  y: 20,
  width: 120,
  height: 10,
  speed: 6
};

// ------------------ RESET BALL ------------------
function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = direction * 4;
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * 4;
}

// ------------------ DRAW ------------------
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(p) {
  ctx.fillStyle = "white";
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

// ------------------ AI ------------------
function moveAI() {
  let target = ball.x - paddleTop.width / 2;
  paddleTop.x += (target - paddleTop.x) * 0.1;

  if (paddleTop.x < 0) paddleTop.x = 0;
  if (paddleTop.x + paddleTop.width > canvas.width) {
    paddleTop.x = canvas.width - paddleTop.width;
  }
}

// ------------------ COLLISION ------------------
function checkCollision(p) {
  if (
    ball.x > p.x &&
    ball.x < p.x + p.width &&
    ball.y + ball.radius > p.y &&
    ball.y - ball.radius < p.y + p.height
  ) {
    ball.dy *= -1;
  }
}

// ------------------ UPDATE ------------------
function update() {
  if (!gameStarted) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Walls
  if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.dx *= -1;
  }

  // Score
  if (ball.y < 0) {
    playerScore++;
    resetBall(1);
  }

  if (ball.y > canvas.height) {
    aiScore++;
    resetBall(-1);
  }

  // Paddle movement
  if (paddleBottom.movingLeft) paddleBottom.x -= paddleBottom.speed;
  if (paddleBottom.movingRight) paddleBottom.x += paddleBottom.speed;

  if (!isMultiplayer) {
    moveAI();
  } else {
    if (paddleTop.movingLeft) paddleTop.x -= paddleTop.speed;
    if (paddleTop.movingRight) paddleTop.x += paddleTop.speed;
  }

  // Boundaries
  paddleBottom.x = Math.max(0, Math.min(canvas.width - paddleBottom.width, paddleBottom.x));
  paddleTop.x = Math.max(0, Math.min(canvas.width - paddleTop.width, paddleTop.x));

  // Collisions
  checkCollision(paddleBottom);
  checkCollision(paddleTop);

  // Draw
  drawBall();
  drawPaddle(paddleBottom);
  drawPaddle(paddleTop);

  // Scores
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Player: ${playerScore}`, 20, 30);
  ctx.fillText(`AI: ${aiScore}`, 650, 30);

  requestAnimationFrame(update);
}

// ------------------ INPUT ------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") paddleBottom.movingLeft = true;
  if (e.key === "ArrowRight") paddleBottom.movingRight = true;

  if (e.key === "a") paddleTop.movingLeft = true;
  if (e.key === "d") paddleTop.movingRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") paddleBottom.movingLeft = false;
  if (e.key === "ArrowRight") paddleBottom.movingRight = false;

  if (e.key === "a") paddleTop.movingLeft = false;
  if (e.key === "d") paddleTop.movingRight = false;
});

// ------------------ MENU ------------------
document.getElementById("single").onclick = () => {
  isMultiplayer = false;
  startGame();
};

document.getElementById("multi").onclick = () => {
  isMultiplayer = true;
  startGame();
};

function startGame() {
  document.getElementById("menu").style.display = "none";
  canvas.style.display = "block";

  gameStarted = true;
  playerScore = 0;
  aiScore = 0;

  resetBall();
  update();
}