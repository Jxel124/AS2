// Tracks whether the game has started or not
let gameStarted = false;

// These flags monitor which direction keys are being held
let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

let score = 0;
let lives = 3;
let canMove = true; // Controls if the player can move at all (this is used when colliding with enemies)

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
  startScreen.style.display = 'none'; // Hide the start screen
  movePlayerToGrid(); // Position player on the grid
  requestAnimationFrame(animatePlayer); // Start the animation loop
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

// Builds the maze and player position from the array
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

    main.appendChild(block); // Append the block to the main game area
  }
}

const player = document.getElementById('player');
const playerMouth = player.querySelector('.mouth');

// Places player visually based on exact pixel position
function movePlayerToGrid() {
  const tileSize = main.offsetWidth / 10;
  player.style.left = playerLeft * tileSize + 'px';
  player.style.top = playerTop * tileSize + 'px';
}

// Animation loop for smooth direction tracking
function animatePlayer() {
  if (!canMove) {
    requestAnimationFrame(animatePlayer);
    return;
  }

  const speed = 2;
  const tileSize = main.offsetWidth / 10;

  const currentTop = parseFloat(player.style.top || "0");
  const currentLeft = parseFloat(player.style.left || "0");

  let nextTop = currentTop;
  let nextLeft = currentLeft;

  if (upPressed) {
    nextTop -= speed;
    playerMouth.className = "mouth up";
  } else if (downPressed) {
    nextTop += speed;
    playerMouth.className = "mouth down";
  } else if (leftPressed) {
    nextLeft -= speed;
    playerMouth.className = "mouth left";
  } else if (rightPressed) {
    nextLeft += speed;
    playerMouth.className = "mouth right";
  } else {
    requestAnimationFrame(animatePlayer);
    return;
  }

  // Checks if player is about to go outside the game area
  if (
    nextTop < 0 || nextLeft < 0 ||
    nextTop + player.offsetHeight > main.offsetHeight ||
    nextLeft + player.offsetWidth > main.offsetWidth
  ) {
    requestAnimationFrame(animatePlayer);
    return;
  }

  // Checks if the center point of the player is about to enter a wall
  const centerX = nextLeft + player.offsetWidth / 2;
  const centerY = nextTop + player.offsetHeight / 2;
  const element = document.elementFromPoint(centerX, centerY);

  // If wall is detected, cancel movement
  if (!element || element.classList.contains('wall')) {
    requestAnimationFrame(animatePlayer);
    return;
  }

  player.style.top = `${nextTop}px`;
  player.style.left = `${nextLeft}px`;

  // Update player’s grid position estimate for logical collision checks
  playerTop = Math.floor(nextTop / tileSize);
  playerLeft = Math.floor(nextLeft / tileSize);

  checkPointCollision();
  checkEnemyCollision();

  requestAnimationFrame(animatePlayer);
}

// Keyboard input for player movement
document.addEventListener('keydown', e => {
  if (!gameStarted) return;

  if (e.key === 'ArrowUp')    { upPressed = true; downPressed = leftPressed = rightPressed = false; }
  if (e.key === 'ArrowDown')  { downPressed = true; upPressed = leftPressed = rightPressed = false; }
  if (e.key === 'ArrowLeft')  { leftPressed = true; upPressed = downPressed = rightPressed = false; }
  if (e.key === 'ArrowRight') { rightPressed = true; upPressed = downPressed = leftPressed = false; }
});

// Checks if the player overlaps a point
function checkPointCollision() {
  const playerBox = player.getBoundingClientRect();

  document.querySelectorAll('.point').forEach(point => {
    const pointBox = point.getBoundingClientRect();

    const touching = (
      playerBox.right > pointBox.left &&
      playerBox.left < pointBox.right &&
      playerBox.bottom > pointBox.top &&
      playerBox.top < pointBox.bottom
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

// Checks if the player collides with an enemy
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

// Moves enemies in a random valid direction every 0.5 seconds
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

// Saves score and player name to local storage
function saveHighScore() {
  let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
  scores.push({ name: playerName, score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(scores));
}

// Loads the top scores on page load
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
