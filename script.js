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

// These store the player's position in rows and columns (used to calculate initial spawn)
let playerTop = 0;
let playerLeft = 0;

// Stores the player's name from input
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

// Set player position in pixels inside the game area
player.style.position = 'absolute';
player.style.left = player.offsetLeft + 'px';
player.style.top = player.offsetTop + 'px';

// Handles key presses
document.addEventListener('keydown', (e) => {
  if (!gameStarted) return;
  if (e.key === 'ArrowUp')    { upPressed = true; downPressed = leftPressed = rightPressed = false; }
  if (e.key === 'ArrowDown')  { downPressed = true; upPressed = leftPressed = rightPressed = false; }
  if (e.key === 'ArrowLeft')  { leftPressed = true; upPressed = downPressed = rightPressed = false; }
  if (e.key === 'ArrowRight') { rightPressed = true; upPressed = downPressed = leftPressed = false; }
});

// Moves the player every animation frame based on current direction
function glideMove() {
  if (!gameStarted || !canMove) {
    requestAnimationFrame(glideMove);
    return;
  }

  let speed = 2.5;
  let moveX = 0;
  let moveY = 0;

  if (upPressed)    moveY = -speed;
  if (downPressed)  moveY = speed;
  if (leftPressed)  moveX = -speed;
  if (rightPressed) moveX = speed;

  const nextX = player.offsetLeft + moveX + player.offsetWidth / 2;
  const nextY = player.offsetTop + moveY + player.offsetHeight / 2;

  const gameArea = document.querySelector('.gameArea').getBoundingClientRect();
  const playerW = player.offsetWidth;
  const playerH = player.offsetHeight;

  // Make sure player stays inside the maze area
  const insideBounds =
    nextX - playerW / 2 >= 0 &&
    nextX + playerW / 2 <= gameArea.width &&
    nextY - playerH / 2 >= 0 &&
    nextY + playerH / 2 <= gameArea.height;

  if (insideBounds) {
    const el = document.elementFromPoint(nextX, nextY);
    const isBlocked = el && el.classList.contains('wall');

    if (!isBlocked) {
      player.style.left = player.offsetLeft + moveX + 'px';
      player.style.top = player.offsetTop + moveY + 'px';
    }
  }

  // Updates the mouth direction to match movement
  if (moveX > 0)      playerMouth.className = 'mouth right';
  else if (moveX < 0) playerMouth.className = 'mouth left';
  else if (moveY < 0) playerMouth.className = 'mouth up';
  else if (moveY > 0) playerMouth.className = 'mouth down';

  checkPointCollision();
  checkEnemyCollision();
  requestAnimationFrame(glideMove);
}

requestAnimationFrame(glideMove); // Starts the movement loop

// Checks if player touches a point and increases score
function checkPointCollision() {
  const playerBox = player.getBoundingClientRect();

  document.querySelectorAll('.point').forEach(point => {
    const box = point.getBoundingClientRect();
    const touching = (
      playerBox.right > box.left &&
      playerBox.left < box.right &&
      playerBox.bottom > box.top &&
      playerBox.top < box.bottom
    );
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

// Checks if the player touches an enemy and handles collision
function checkEnemyCollision() {
  const playerBox = player.getBoundingClientRect();
  document.querySelectorAll('.enemy').forEach(enemy => {
    const box = enemy.getBoundingClientRect();
    const colliding = (
      playerBox.right > box.left &&
      playerBox.left < box.right &&
      playerBox.bottom > box.top &&
      playerBox.top < box.bottom
    );
    if (colliding) {
      handleEnemyCollision();
    }
  });
}

// Handles what happens when the player hits an enemy
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

// Moves enemies in a random direction every 0.5 seconds
setInterval(() => {
  if (!gameStarted) return;

  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];

  document.querySelectorAll('.enemy').forEach(enemy => {
    const row = parseInt(enemy.style.gridRowStart) - 1;
    const col = parseInt(enemy.style.gridColumnStart) - 1;

    const options = directions.filter(d => {
      const r = row + d.row;
      const c = col + d.col;
      return maze[r] && maze[r][c] !== 1;
    });

    if (options.length > 0) {
      const move = options[Math.floor(Math.random() * options.length)];
      enemy.style.gridRowStart = row + move.row + 1;
      enemy.style.gridColumnStart = col + move.col + 1;
    }
  });
}, 500);

// Saves score and name to local storage leaderboard
function saveHighScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

// Loads and displays saved leaderboard scores
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
