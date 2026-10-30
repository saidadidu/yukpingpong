const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

let playerScore = 0;
let computerScore = 0;
let playing = false;
let gameOver = false;
let animation;

const paddle = {
  width: 12,
  height: 85,
  speed: 7
};

let player = {
  x: 20,
  y: H/2 - 42
};

let computer = {
  x: W - 32,
  y: H/2 - 42
};

let ball = {
  x: W/2,
  y: H/2,
  radius: 9,
  dx: 5,
  dy: 3
};

let keys = {};

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Garis tengah
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = "#557080";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W/2, 0);
  ctx.lineTo(W/2, H);
  ctx.stroke();
  ctx.setLineDash([]);

  // Lingkaran tengah
  ctx.beginPath();
  ctx.arc(W/2, H/2, 55, 0, Math.PI*2);
  ctx.strokeStyle = "#557080";
  ctx.stroke();

  // Paddle pemain
  ctx.fillStyle = "#38e8c5";
  ctx.fillRect(player.x, player.y, paddle.width, paddle.height);

  // Paddle komputer
  ctx.fillStyle = "#ffb347";
  ctx.fillRect(computer.x, computer.y, paddle.width, paddle.height);

  // Bola
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = "white";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "white";
  ctx.fill();
  ctx.shadowBlur = 0;

  if (!playing) {
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      gameOver ? "GAME OVER" : "PING PONG",
      W/2, H/2 - 90
    );

    ctx.font = "15px Arial";
    ctx.fillStyle = "#b8c5d5";
    ctx.fillText(
      gameOver ? "Tekan Restart untuk bermain lagi" :
      "Tekan tombol Mulai",
      W/2, H/2 - 65
    );
  }
}

function update() {
  if (!playing) return;

  // Kontrol keyboard
  if (keys["ArrowUp"] || keys["w"] || keys["W"])
    player.y -= paddle.speed;

  if (keys["ArrowDown"] || keys["s"] || keys["S"])
    player.y += paddle.speed;

  player.y = Math.max(0, Math.min(H-paddle.height, player.y));

  // AI komputer
  let target = ball.y - paddle.height/2;

  computer.y += (target - computer.y) * 0.065;
  computer.y = Math.max(0, Math.min(H-paddle.height, computer.y));

  // Gerakan bola
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Pantulan dinding
  if (ball.y - ball.radius <= 0 ||
      ball.y + ball.radius >= H) {
    ball.dy *= -1;
  }

  // Tabrakan paddle pemain
  if (
    ball.dx < 0 &&
    ball.x - ball.radius <= player.x + paddle.width &&
    ball.x + ball.radius >= player.x &&
    ball.y >= player.y &&
    ball.y <= player.y + paddle.height
  ) {
    ball.dx = Math.abs(ball.dx) + 0.25;
    ball.dy += (ball.y - (player.y + paddle.height/2)) * 0.09;
    ball.x = player.x + paddle.width + ball.radius;
  }

  // Tabrakan paddle komputer
  if (
    ball.dx > 0 &&
    ball.x + ball.radius >= computer.x &&
    ball.x - ball.radius <= computer.x + paddle.width &&
    ball.y >= computer.y &&
    ball.y <= computer.y + paddle.height
  ) {
    ball.dx = -(Math.abs(ball.dx) + 0.25);
    ball.dy += (ball.y - (computer.y + paddle.height/2)) * 0.09;
    ball.x = computer.x - ball.radius;
  }

  // Batas kecepatan vertikal
  ball.dy = Math.max(-9, Math.min(9, ball.dy));

  // Skor
  if (ball.x < 0) {
    computerScore++;
    updateScore();
    checkWinner();
    resetBall(-1);
  }

  if (ball.x > W) {
    playerScore++;
    updateScore();
    checkWinner();
    resetBall(1);
  }
}

function resetBall(direction) {
  ball.x = W/2;
  ball.y = H/2;
  ball.dx = 5 * direction;
  ball.dy = (Math.random() * 4) - 2;
}

function updateScore() {
  document.getElementById("playerScore").textContent = playerScore;
  document.getElementById("computerScore").textContent = computerScore;
}

function checkWinner() {
  if (playerScore >= 5 || computerScore >= 5) {
    playing = false;
    gameOver = true;

    setTimeout(() => {
      draw();
      ctx.fillStyle = "#38e8c5";
      ctx.font = "bold 22px Arial";
      ctx.fillText(
        playerScore >= 5 ? "KAMU MENANG! 🎉" : "KOMPUTER MENANG!",
        W/2, H/2 + 15
      );
    }, 100);
  }
}

function loop() {
  update();
  draw();
  animation = requestAnimationFrame(loop);
}

function startGame() {
  if (gameOver) return;
  playing = true;
}

function pauseGame() {
  playing = false;
  draw();
}

function restartGame() {
  playerScore = 0;
  computerScore = 0;
  gameOver = false;
  playing = true;

  player.y = H/2 - paddle.height/2;
  computer.y = H/2 - paddle.height/2;

  updateScore();
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

// Keyboard
document.addEventListener("keydown", e => {
  keys[e.key] = true;

  if (["ArrowUp", "ArrowDown", " "].includes(e.key))
    e.preventDefault();
});

document.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// Kontrol layar sentuh
function moveTouch(e) {
  const rect = canvas.getBoundingClientRect();
  const y = (e.clientY - rect.top) * H / rect.height;

  if (e.clientX < rect.left + rect.width * 0.55) {
    player.y = y - paddle.height/2;
    player.y = Math.max(0, Math.min(H-paddle.height, player.y));
  }
}

canvas.addEventListener("pointerdown", moveTouch);
canvas.addEventListener("pointermove", e => {
  if (e.buttons || e.pointerType === "touch") moveTouch(e);
});

draw();
loop();