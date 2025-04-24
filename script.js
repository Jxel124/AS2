// Tracks whether the game has started or not
let gameStarted = false;

// These flags monitor which direction keys are being held
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');

// Maze layout: Player = 2, Wall = 1, Enemy = 3, Point = 0
let maze = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,2,0,1,0,0,0,0,3,1],
  [1,0,0,0,0,0,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,1],
  [1,0,0,1,0,3,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,3,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1]
];

// Score & lives setup
let score = 0;
let lives = 3;
let canMove = true;
let playerTop = 0;
let playerLeft = 0;
let playerName = "";

const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');
const nameInput = document.querySelector('#playerNameInput');
const scoreDisplay = document.querySelector('.score p');

// Builds the maze in HTML
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
      block.style.height = '1vh';
      block.style.width = '1vh';
    }

    main.appendChild(block);
  }
}

const player = document.querySelector('#player');
const playerMouth = player.querySelector('.mouth');

// Game start logic
startBtn.addEventListener('click', () => {
  if (nameInput.value.trim() === "") {
    alert("Please enter your name!");
    return;
  }
  playerName = nameInput.value.trim();
  gameStarted = true;
  startScreen.style.display = 'none';
});

function keyDown(event) {
  if (!gameStarted) return;
  if (event.key === 'ArrowUp') upPressed = true;
  else if (event.key === 'ArrowDown') downPressed = true;
  else if (event.key === 'ArrowLeft') leftPressed = true;
  else if (event.key === 'ArrowRight') rightPressed = true;
}

function keyUp(event) {
  if (event.key === 'ArrowUp') upPressed = false;
  else if (event.key === 'ArrowDown') downPressed = false;
  else if (event.key === 'ArrowLeft') leftPressed = false;
  else if (event.key === 'ArrowRight') rightPressed = false;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// Player glide-based movement loop
setInterval(() => {
  if (!gameStarted || !canMove) return;

  const position = player.getBoundingClientRect();

  if (downPressed) {
    let newBottom = position.bottom + 1;
    let leftCheck = document.elementFromPoint(position.left, newBottom);
    let rightCheck = document.elementFromPoint(position.right, newBottom);
    if (!leftCheck?.classList.contains('wall') && !rightCheck?.classList.contains('wall')) {
      playerTop++;
      player.style.top = playerTop + 'px';
    }
    playerMouth.className = 'mouth down';
  } else if (upPressed) {
    let newTop = position.top - 1;
    let leftCheck = document.elementFromPoint(position.left, newTop);
    let rightCheck = document.elementFromPoint(position.right, newTop);
    if (!leftCheck?.classList.contains('wall') && !rightCheck?.classList.contains('wall')) {
      playerTop--;
      player.style.top = playerTop + 'px';
    }
    playerMouth.className = 'mouth up';
  } else if (leftPressed) {
    let newLeft = position.left - 1;
    let topCheck = document.elementFromPoint(newLeft, position.top);
    let bottomCheck = document.elementFromPoint(newLeft, position.bottom);
    if (!topCheck?.classList.contains('wall') && !bottomCheck?.classList.contains('wall')) {
      playerLeft--;
      player.style.left = playerLeft + 'px';
    }
    playerMouth.className = 'mouth left';
  } else if (rightPressed) {
    let newRight = position.right + 1;
    let topCheck = document.elementFromPoint(newRight, position.top);
    let bottomCheck = document.elementFromPoint(newRight, position.bottom);
    if (!topCheck?.classList.contains('wall') && !bottomCheck?.classList.contains('wall')) {
      playerLeft++;
      player.style.left = playerLeft + 'px';
    }
    playerMouth.className = 'mouth right';
  }

  const playerBox = player.getBoundingClientRect();

  document.querySelectorAll('.point').forEach(point => {
    const pointBox = point.getBoundingClientRect();
    if (
      playerBox.right > pointBox.left &&
      playerBox.left < pointBox.right &&
      playerBox.bottom > pointBox.top &&
      playerBox.top < pointBox.bottom
    ) {
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

  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyBox = enemy.getBoundingClientRect();
    if (
      playerBox.right > enemyBox.left &&
      playerBox.left < enemyBox.right &&
      playerBox.bottom > enemyBox.top &&
      playerBox.top < enemyBox.bottom
    ) {
      handleEnemyCollision();
    }
  });
}, 10);

// Enemy chase logic
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

// Helper functions
function getPlayerGridPos() {
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === 2) return { y, x };
    }
  }
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
