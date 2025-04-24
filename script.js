// Tracks whether the game has started or not
let gameStarted = false;

// These flags monitor which direction keys are being held
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

let score = 0;
let lives = 3;
let canMove = true;
let playerTop = 1;
let playerLeft = 1;

let playerName = "";

const main = document.querySelector('main');
const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');
const nameInput = document.querySelector('#playerNameInput');
const scoreDisplay = document.querySelector('.score p');

// Handles what happens when the Start button is clicked
startBtn.addEventListener('click', () => {
  if (nameInput.value.trim() === "") {
    alert("Please enter your name!");
    return;
  }
  playerName = nameInput.value.trim();
  gameStarted = true;
  startScreen.style.display = 'none';
});

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

// Populates the maze in the HTML
for (let row = 0; row < maze.length; row++) {
  for (let col = 0; col < maze[row].length; col++) {
    const cell = maze[row][col];
    const block = document.createElement('div');
    block.classList.add('block');
    block.style.gridRowStart = row + 1;
    block.style.gridColumnStart = col + 1;

    if (cell === 1) block.classList.add('wall');
    else if (cell === 2) {
      block.id = 'player';
      const mouth = document.createElement('div');
      mouth.classList.add('mouth');
      block.appendChild(mouth);
    } else if (cell === 3) block.classList.add('enemy');
    else block.classList.add('point');

    main.appendChild(block);
  }
}

const player = document.getElementById('player');
const playerMouth = player.querySelector('.mouth');

// Keyboard listeners for movement
document.addEventListener('keydown', (e) => {
  if (!gameStarted || !canMove) return;

  let nextRow = playerTop;
  let nextCol = playerLeft;

  if (e.key === 'ArrowUp') {
    nextRow--;
    playerMouth.className = 'mouth up';
  } else if (e.key === 'ArrowDown') {
    nextRow++;
    playerMouth.className = 'mouth down';
  } else if (e.key === 'ArrowLeft') {
    nextCol--;
    playerMouth.className = 'mouth left';
  } else if (e.key === 'ArrowRight') {
    nextCol++;
    playerMouth.className = 'mouth right';
  }

  if (maze[nextRow][nextCol] !== 1) {
    playerTop = nextRow;
    playerLeft = nextCol;
    player.style.gridRowStart = playerTop + 1;
    player.style.gridColumnStart = playerLeft + 1;

    checkPointCollection();
    checkEnemyCollision();
  }
});

// Check if player is touching a point
function checkPointCollection() {
  const playerBox = player.getBoundingClientRect();

  document.querySelectorAll('.point').forEach(point => {
    const pointBox = point.getBoundingClientRect();
    const touching =
      playerBox.right > pointBox.left &&
      playerBox.left < pointBox.right &&
      playerBox.bottom > pointBox.top &&
      playerBox.top < pointBox.bottom;

    if (touching) {
      point.remove();
      score++;
      scoreDisplay.textContent = score;
    }
  });

  if (document.querySelectorAll('.point').length === 0) {
    saveHighScore();
    alert("You collected all the points! Game Over!");
    location.reload();
  }
}

// Check if the player is hit by an enemy
function checkEnemyCollision() {
  const playerBox = player.getBoundingClientRect();

  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyBox = enemy.getBoundingClientRect();
    const touching =
      playerBox.right > enemyBox.left &&
      playerBox.left < enemyBox.right &&
      playerBox.bottom > enemyBox.top &&
      playerBox.top < enemyBox.bottom;

    if (touching) handleEnemyCollision();
  });
}

// Enemy movement logic
setInterval(() => {
  if (!gameStarted) return;

  const playerPos = { y: playerTop, x: playerLeft };

  document.querySelectorAll('.enemy').forEach(enemy => {
    const y = parseInt(enemy.style.gridRowStart) - 1;
    const x = parseInt(enemy.style.gridColumnStart) - 1;

    const dy = playerPos.y - y;
    const dx = playerPos.x - x;
    let direction;

    if (Math.abs(dy) > Math.abs(dx)) {
      direction = { y: dy > 0 ? 1 : -1, x: 0 };
    } else {
      direction = { y: 0, x: dx > 0 ? 1 : -1 };
    }

    const newY = y + direction.y;
    const newX = x + direction.x;

    if (maze[newY][newX] !== 1) {
      enemy.style.gridRowStart = newY + 1;
      enemy.style.gridColumnStart = newX + 1;
    }

    const playerBox = player.getBoundingClientRect();
    const enemyBox = enemy.getBoundingClientRect();
    const touching =
      playerBox.right > enemyBox.left &&
      playerBox.left < enemyBox.right &&
      playerBox.bottom > enemyBox.top &&
      playerBox.top < enemyBox.bottom;

    if (touching) handleEnemyCollision();
  });
}, 1000);

// Handles what happens when the player touches an enemy
function handleEnemyCollision() {
  lives--;
  canMove = false;
  player.classList.add('hit');

  const lifeIcons = document.querySelectorAll('.lives li');
  if (lifeIcons[lives]) {
    lifeIcons[lives].style.backgroundColor = 'transparent';
  }

  setTimeout(() => {
    player.classList.remove('hit');
    canMove = true;

    if (lives <= 0) {
      saveHighScore();
      const restart = confirm("Game Over! Restart?");
      if (restart) location.reload();
    }
  }, 1000);
}

// Save high score to localStorage
function saveHighScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score: score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

// Load top scores from localStorage
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

loadLeaderboard();
