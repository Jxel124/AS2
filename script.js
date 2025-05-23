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
  createLives(); // Dynamically add 3 lives
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

// Places player visually based on row and column in grid
function movePlayerToGrid() {
  const tileSize = main.offsetWidth / 10;
  player.style.left = playerLeft * tileSize + 'px';
  player.style.top = playerTop * tileSize + 'px';
}

// Movement tick every 300ms (grid step)
setInterval(() => {
  if (!gameStarted || !canMove) return;

  let nextRow = playerTop;
  let nextCol = playerLeft;

  if (upPressed) {
    nextRow--;
    playerMouth.className = "mouth up";
  } else if (downPressed) {
    nextRow++;
    playerMouth.className = "mouth down";
  } else if (leftPressed) {
    nextCol--;
    playerMouth.className = "mouth left";
  } else if (rightPressed) {
    nextCol++;
    playerMouth.className = "mouth right";
  } else {
    return;
  }

  // Prevent moving into walls or out of bounds
  if (
    nextRow >= 0 &&
    nextRow < maze.length &&
    nextCol >= 0 &&
    nextCol < maze[0].length &&
    maze[nextRow][nextCol] !== 1
  ) {
    playerTop = nextRow;
    playerLeft = nextCol;
    movePlayerToGrid(); // Update visual position
    checkPointCollision();
    checkEnemyCollision();
  }
}, 300); // 300ms = ~3.3 tiles per second

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
  document.querySelectorAll('.point').forEach(point => {
    const row = parseInt(point.style.gridRowStart) - 1;
    const col = parseInt(point.style.gridColumnStart) - 1;
    if (row === playerTop && col === playerLeft) {
      point.remove(); // Remove the point from the grid
      score++;
      scoreDisplay.textContent = score; // Update the score display
    }
  });

  // If there are no points left, end the game
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

  // Update the life icons dynamically
  const lifeIcons = document.querySelectorAll('#lifeList li');
  if (lifeIcons[lives]) {
    lifeIcons[lives].style.backgroundColor = 'transparent';
  }

  // Freeze movement and show hit animation for 1.5s
  setTimeout(() => {
    player.classList.remove('hit');
    canMove = true;

    if (lives <= 0) {
      player.classList.add('dead'); // Trigger death animation
      setTimeout(() => {
        saveHighScore();
        const restart = confirm("Game Over! Restart?");
        if (restart) location.reload();
      }, 1500); // Wait for death animation to finish
    }
  }, 1500);
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

// Creates 3 lives dynamically so we don’t rely on static HTML
function createLives() {
  const lifeList = document.getElementById("lifeList");
  lifeList.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    const li = document.createElement("li");
    lifeList.appendChild(li);
  }
}

// Arrow buttons on-screen (mobile support or extra controls)
document.getElementById('ubttn').addEventListener('click', () => {
  upPressed = true;
  downPressed = leftPressed = rightPressed = false;
});
document.getElementById('dbttn').addEventListener('click', () => {
  downPressed = true;
  upPressed = leftPressed = rightPressed = false;
});
document.getElementById('lbttn').addEventListener('click', () => {
  leftPressed = true;
  upPressed = downPressed = rightPressed = false;
});
document.getElementById('rbttn').addEventListener('click', () => {
  rightPressed = true;
  upPressed = downPressed = leftPressed = false;
});
