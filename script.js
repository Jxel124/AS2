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

let playerName = "";
let playerTop = 1;
let playerLeft = 1;
let score = 0;
let lives = 3;
let canMove = true;

// Populates the maze grid with elements based on maze array values
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
        playerTop = row;
        playerLeft = col;
        break;
      case 3:
        block.classList.add('enemy');
        break;
      default:
        block.classList.add('point');
        block.style.height = '1vh';
        block.style.width = '1vh';
    }

    main.appendChild(block);
  }
}

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

// Releases direction keys
function keyUp(event) {
  if (event.key === 'ArrowUp') upPressed = false;
  else if (event.key === 'ArrowDown') downPressed = false;
  else if (event.key === 'ArrowLeft') leftPressed = false;
  else if (event.key === 'ArrowRight') rightPressed = false;
}

// Detects when a direction key is pressed
function keyDown(event) {
  if (!gameStarted) return;

  if (event.key === 'ArrowUp') upPressed = true;
  else if (event.key === 'ArrowDown') downPressed = true;
  else if (event.key === 'ArrowLeft') leftPressed = true;
  else if (event.key === 'ArrowRight') rightPressed = true;
}

// Handles player movement and interaction checks
setInterval(() => {
  if (!gameStarted || !canMove) return;

  const player = document.getElementById('player');
  const position = player.getBoundingClientRect();

  // Point collection logic
  document.querySelectorAll('.point').forEach(point => {
    const pointPos = point.getBoundingClientRect();
    const isColliding =
      position.right > pointPos.left &&
      position.left < pointPos.right &&
      position.bottom > pointPos.top &&
      position.top < pointPos.bottom;

    if (isColliding) {
      point.remove();
      score++;
      document.querySelector('.score p').textContent = score;
    }
  });

  // Win condition when all points are collected
  if (document.querySelectorAll('.point').length === 0) {
    saveHighScore();
    alert("You collected all the points! Game Over!");
    location.reload();
  }

  // Enemy collision logic (grid-based, more reliable)
  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyY = parseInt(enemy.style.gridRowStart) - 1;
    const enemyX = parseInt(enemy.style.gridColumnStart) - 1;

    if (enemyY === playerTop && enemyX === playerLeft) {
      handleEnemyCollision();
    }
  });

  // Handles direction movement and prevents wall clipping
  let nextRow = playerTop;
  let nextCol = playerLeft;

  if (downPressed) nextRow++;
  else if (upPressed) nextRow--;
  else if (leftPressed) nextCol--;
  else if (rightPressed) nextCol++;

  if (maze[nextRow][nextCol] !== 1) {
    playerTop = nextRow;
    playerLeft = nextCol;
    player.style.gridRowStart = playerTop + 1;
    player.style.gridColumnStart = playerLeft + 1;
  }
}, 100);

// Moves the enemies toward the player every 1.5 seconds
setInterval(() => {
  if (!gameStarted) return;

  const playerPos = getPlayerGridPos();

  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyPos = getGridPos(enemy);
    const direction = getNextStepTowardPlayer(enemyPos, playerPos);
    const newY = enemyPos.y + direction.y;
    const newX = enemyPos.x + direction.x;

    if (maze[newY][newX] !== 1) {
      enemy.style.gridRowStart = newY + 1;
      enemy.style.gridColumnStart = newX + 1;
    }
  });
}, 1500);

function getPlayerGridPos() {
  return { y: playerTop, x: playerLeft };
}

function getGridPos(enemy) {
  return {
    y: parseInt(enemy.style.gridRowStart) - 1,
    x: parseInt(enemy.style.gridColumnStart) - 1
  };
}

function getNextStepTowardPlayer(from, to) {
  const dy = to.y - from.y;
  const dx = to.x - from.x;

  if (Math.abs(dy) > Math.abs(dx)) {
    return { y: dy > 0 ? 1 : -1, x: 0 };
  } else if (dx !== 0) {
    return { y: 0, x: dx > 0 ? 1 : -1 };
  } else {
    return { y: 0, x: 0 };
  }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

function handleEnemyCollision() {
  lives--;
  canMove = false;
  const player = document.getElementById('player');
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
  }, 1500);
}

function saveHighScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score: score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

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
