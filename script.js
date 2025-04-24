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
let playerTop = 0;
let playerLeft = 0;

let playerName = "";

const main = document.querySelector('main');
const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');
const nameInput = document.querySelector('#playerNameInput');
const scoreDisplay = document.querySelector('.score p');

// Handles the start of the game when the player enters their name
startBtn.addEventListener('click', () => {
  if (nameInput.value.trim() === "") {
    alert("Please enter your name!");
    return;
  }
  playerName = nameInput.value.trim();
  gameStarted = true;
  startScreen.style.display = 'none';
});

// Maze layout: Player = 2, Wall = 1, Enemy = 3, Point = 0
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

    if (cell === 1) {
      block.classList.add('wall');
    } else if (cell === 2) {
      block.id = 'player';
      const mouth = document.createElement('div');
      mouth.classList.add('mouth');
      block.appendChild(mouth);
      playerTop = row;
      playerLeft = col;
    } else if (cell === 3) {
      block.classList.add('enemy');
    } else {
      block.classList.add('point');
    }

    main.appendChild(block);
  }
}

const player = document.getElementById('player');
const playerMouth = player.querySelector('.mouth');

// Handles key presses
document.addEventListener('keydown', (e) => {
  if (!gameStarted) return;
  if (e.key === 'ArrowUp') { upPressed = true; downPressed = leftPressed = rightPressed = false; }
  if (e.key === 'ArrowDown') { downPressed = true; upPressed = leftPressed = rightPressed = false; }
  if (e.key === 'ArrowLeft') { leftPressed = true; upPressed = downPressed = rightPressed = false; }
  if (e.key === 'ArrowRight') { rightPressed = true; upPressed = downPressed = leftPressed = false; }
});

// Game loop: manages movement, collision, scoring
setInterval(() => {
  if (!gameStarted || !canMove) return;

  let nextRow = playerTop;
  let nextCol = playerLeft;

  // Movement: making sure movement is smooth and sliding
  if (downPressed) {
    nextRow++;
    playerMouth.className = 'mouth down';
  } else if (upPressed) {
    nextRow--;
    playerMouth.className = 'mouth up';
  } else if (leftPressed) {
    nextCol--;
    playerMouth.className = 'mouth left';
  } else if (rightPressed) {
    nextCol++;
    playerMouth.className = 'mouth right';
  }

  // Check for wall collision
  if (maze[nextRow][nextCol] !== 1) {
    playerTop = nextRow;
    playerLeft = nextCol;
    player.style.gridRowStart = playerTop + 1;
    player.style.gridColumnStart = playerLeft + 1;
  }

  const playerBox = player.getBoundingClientRect();

  // Point collection logic
  document.querySelectorAll('.point').forEach(point => {
    const pointBox = point.getBoundingClientRect();
    const isColliding = (
      playerBox.right > pointBox.left &&
      playerBox.left < pointBox.right &&
      playerBox.bottom > pointBox.top &&
      playerBox.top < pointBox.bottom
    );
    if (isColliding) {
      point.remove();
      score++;
      scoreDisplay.textContent = score;
    }
  });

  // Check win condition (when all points are collected)
  if (document.querySelectorAll('.point').length === 0) {
    saveHighScore();
    alert("You collected all the points! Game Over!");
    location.reload();
  }

  // Check if player touches an enemy
  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyBox = enemy.getBoundingClientRect();
    const isTouchingEnemy = (
      playerBox.right > enemyBox.left &&
      playerBox.left < enemyBox.right &&
      playerBox.bottom > enemyBox.top &&
      playerBox.top < enemyBox.bottom
    );
    if (isTouchingEnemy) {
      handleEnemyCollision();
    }
  });
}, 180); // Slightly slower movement speed

// AI movement: enemies chase the player every 0.5s
setInterval(() => {
  if (!gameStarted) return;

  const playerPos = { y: playerTop, x: playerLeft };

  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyPos = {
      y: parseInt(enemy.style.gridRowStart) - 1,
      x: parseInt(enemy.style.gridColumnStart) - 1
    };

    const dy = playerPos.y - enemyPos.y;
    const dx = playerPos.x - enemyPos.x;

    const direction = Math.abs(dy) > Math.abs(dx)
      ? { y: dy > 0 ? 1 : -1, x: 0 }
      : { y: 0, x: dx > 0 ? 1 : -1 };

    const newY = enemyPos.y + direction.y;
    const newX = enemyPos.x + direction.x;

    if (maze[newY][newX] !== 1) {
      enemy.style.gridRowStart = newY + 1;
      enemy.style.gridColumnStart = newX + 1;
    }
  });
}, 500); // AI moves every 0.5s

// Runs when the player touches an enemy
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
  }, 1000); // Animation time for hit effect
}

// Save leaderboard to localStorage
function saveHighScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score: score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

// Load the scores on startup
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
