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

// Gliding-style movement happens repeatedly as long as a key is held
setInterval(() => {
  if (!gameStarted || !canMove) return;

  let nextRow = playerTop;
  let nextCol = playerLeft;

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

  if (maze[nextRow][nextCol] !== 1) {
    playerTop = nextRow;
    playerLeft = nextCol;
    player.style.gridRowStart = playerTop + 1;
    player.style.gridColumnStart = playerLeft + 1;
  }

  const playerBox = player.getBoundingClientRect();

  // Check for collision with point
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

  // End game if all points collected
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
}, 150); // Runs faster for smoother movement

// AI movement — each enemy chooses a random direction that avoids walls
setInterval(() => {
  if (!gameStarted) return;

  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 },  // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }   // right
  ];

  document.querySelectorAll('.enemy').forEach(enemy => {
    const currentRow = parseInt(enemy.style.gridRowStart) - 1;
    const currentCol = parseInt(enemy.style.gridColumnStart) - 1;

    const options = directions.filter(d => {
      const r = currentRow + d.row;
      const c = currentCol + d.col;
      return maze[r][c] !== 1;
    });

    if (options.length > 0) {
      const move = options[Math.floor(Math.random() * options.length)];
      enemy.style.gridRowStart = currentRow + move.row + 1;
      enemy.style.gridColumnStart = currentCol + move.col + 1;
    }
  });
}, 500); // Enemies move every half second

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
  }, 1000); // Pause briefly after hit
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
