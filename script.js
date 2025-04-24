// Tracks whether the game has started or not
let gameStarted = false;

// These flags monitor which direction keys are being held
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');

// Player = 2, Wall = 1, Enemy = 3, Point = 0
let maze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 1, 0, 0, 0, 0, 3, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 0, 0, 1, 0, 3, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 3, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let playerName = ""; // Stores the player's name
let playerTop = 0;
let playerLeft = 0;
let score = 0;
let lives = 3;
let canMove = true;

const player = document.querySelector('#player');
const playerMouth = document.querySelector('.mouth');

// Populates the maze visually in the grid layout
for (let row = 0; row < maze.length; row++) {
  for (let col = 0; col < maze[row].length; col++) {
    let cell = maze[row][col];
    let block = document.createElement('div');
    block.classList.add('block');
    block.style.gridRowStart = row + 1;
    block.style.gridColumnStart = col + 1;

    switch (cell) {
      case 1:
        block.classList.add('wall');
        break;
      case 2:
        block.id = 'player';
        let mouth = document.createElement('div');
        mouth.classList.add('mouth');
        block.appendChild(mouth);
        break;
      case 3:
        block.classList.add('enemy');
        block.style.gridRowStart = row + 1;
        block.style.gridColumnStart = col + 1;
        break;
      default:
        block.classList.add('point');
        block.style.height = '1vh';
        block.style.width = '1vh';
    }

    main.appendChild(block);
  }
}

// Start game only after player enters name and clicks button
const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');
const nameInput = document.querySelector('#playerNameInput');

startBtn.addEventListener('click', () => {
  if (nameInput.value.trim() === "") {
    alert("Please enter your name!");
    return;
  }
  playerName = nameInput.value.trim();
  gameStarted = true;
  startScreen.style.display = 'none';
});

// Movement keys
function keyUp(e) {
  if (e.key === 'ArrowUp') upPressed = false;
  else if (e.key === 'ArrowDown') downPressed = false;
  else if (e.key === 'ArrowLeft') leftPressed = false;
  else if (e.key === 'ArrowRight') rightPressed = false;
}

function keyDown(e) {
  if (!gameStarted) return;
  if (e.key === 'ArrowUp') upPressed = true;
  else if (e.key === 'ArrowDown') downPressed = true;
  else if (e.key === 'ArrowLeft') leftPressed = true;
  else if (e.key === 'ArrowRight') rightPressed = true;
}

// Game loop — checks for movement, points, collisions
setInterval(() => {
  if (!gameStarted || !canMove) return;

  const position = player.getBoundingClientRect();

  // Eat points
  document.querySelectorAll('.point').forEach(point => {
    const rect = point.getBoundingClientRect();
    const touching =
      position.right > rect.left &&
      position.left < rect.right &&
      position.bottom > rect.top &&
      position.top < rect.bottom;
    if (touching) {
      point.remove();
      score++;
      document.querySelector('.score p').textContent = score;
    }
  });

  // Win condition
  if (document.querySelectorAll('.point').length === 0) {
    saveHighScore(); // Save score before game resets
    alert("You collected all the points! Game Over!");
    location.reload();
  }

  // Collide with enemies
  document.querySelectorAll('.enemy').forEach(enemy => {
    const rect = enemy.getBoundingClientRect();
    const touching =
      position.right > rect.left &&
      position.left < rect.right &&
      position.bottom > rect.top &&
      position.top < rect.bottom;
    if (touching) handleEnemyCollision();
  });

  // Movement handling
  if (downPressed) playerTop++;
  else if (upPressed) playerTop--;
  else if (leftPressed) playerLeft--;
  else if (rightPressed) playerLeft++;

  player.style.top = playerTop + 'px';
  player.style.left = playerLeft + 'px';
}, 10);

// Slower chasing AI
setInterval(() => {
  if (!gameStarted) return;

  const playerPos = getPlayerGridPos();
  document.querySelectorAll('.enemy').forEach(enemy => {
    const pos = getGridPos(enemy);
    const dir = getNextStepTowardPlayer(pos, playerPos);
    const newY = pos.y + dir.y;
    const newX = pos.x + dir.x;
    if (maze[newY][newX] !== 1) {
      enemy.style.gridRowStart = newY + 1;
      enemy.style.gridColumnStart = newX + 1;
    }
  });
}, 1500);

// Track grid positions
function getGridPos(el) {
  return {
    y: parseInt(el.style.gridRowStart) - 1,
    x: parseInt(el.style.gridColumnStart) - 1
  };
}

function getPlayerGridPos() {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 2) return { y, x };
    }
  }
}

function getNextStepTowardPlayer(from, to) {
  const dy = to.y - from.y;
  const dx = to.x - from.x;
  if (Math.abs(dy) > Math.abs(dx)) return { y: dy > 0 ? 1 : -1, x: 0 };
  else if (dx !== 0) return { y: 0, x: dx > 0 ? 1 : -1 };
  return { y: 0, x: 0 };
}

// Lose a life if enemy touches player
function handleEnemyCollision() {
  lives--;
  canMove = false;
  player.classList.add('hit');

  const hearts = document.querySelectorAll('.lives li');
  if (hearts[lives]) hearts[lives].style.backgroundColor = 'transparent';

  setTimeout(() => {
    player.classList.remove('hit');
    canMove = true;
    if (lives <= 0) {
      saveHighScore(); // Save before game over
      const restart = confirm("Game Over! Restart?");
      if (restart) location.reload();
    }
  }, 1500);
}

// Save score to localStorage leaderboard
function saveHighScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score: score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

// Load leaderboard from localStorage
function loadLeaderboard() {
  const scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const list = document.getElementById("leaderboardList");
  if (!list) return;
  list.innerHTML = "";
  scores.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}........${entry.score}`;
    list.appendChild(li);
  });
}

loadLeaderboard(); // Load leaderboard on page load

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

