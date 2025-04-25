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

// Places player visually based on row and column in grid
function movePlayerToGrid() {
  const tileSize = main.offsetWidth / 10; // Calculate tile size based on the grid size
  player.style.left = playerLeft * tileSize + 'px';
  player.style.top = playerTop * tileSize + 'px';
}

// Animation loop for smooth direction tracking
function animatePlayer() {
  // Check and attempt to move the player in the correct direction
  if (upPressed)    attemptMove(-0.1, 0, 'up');
  if (downPressed)  attemptMove(0.1, 0, 'down');
  if (leftPressed)  attemptMove(0, -0.1, 'left');
  if (rightPressed) attemptMove(0, 0.1, 'right');

  requestAnimationFrame(animatePlayer); // Keep the animation loop going for smooth movement
}

// Attempts to move in the given direction
function attemptMove(rowOffset, colOffset, direction) {
  if (!canMove) return; // If the player can't move, skip the function

  const nextRow = playerTop + rowOffset;
  const nextCol = playerLeft + colOffset;
  const nextTile = maze[nextRow]?.[nextCol];

  if (nextTile !== undefined && nextTile !== 1) { // If the next tile is not a wall
    playerTop = nextRow;
    playerLeft = nextCol;
    movePlayerToGrid(); // Move the player on the grid
    playerMouth.className = `mouth ${direction}`; // Change the mouth direction based on movement
    checkPointCollision(); // Check if the player collects any points
    checkEnemyCollision(); // Check if the player collides with an enemy
  }
}

// Keyboard input for player movement
document.addEventListener('keydown', e => {
  if (!gameStarted) return; // If the game hasn't started, do nothing

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
    if (row === playerTop && col === playerLeft) { // If the player overlaps a point
      point.remove(); // Remove the point from the grid
      score++; // Increase the score
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
  const playerBox = player.getBoundingClientRect(); // Get the player's bounding box
  document.querySelectorAll('.enemy').forEach(enemy => {
    const box = enemy.getBoundingClientRect(); // Get the enemy's bounding box
    const colliding = (
      playerBox.right > box.left &&
      playerBox.left < box.right &&
      playerBox.bottom > box.top &&
      playerBox.top < box.bottom
    );
    if (colliding) {
      handleEnemyCollision(); // Handle the collision if the player hits an enemy
    }
  });
}

// Handles what happens when the player hits an enemy
function handleEnemyCollision() {
  lives--; // Decrease the player's lives
  canMove = false; // Disable movement during the hit animation
  player.classList.add('hit'); // Add hit animation

  const lifeIcons = document.querySelectorAll('.lives li');
  if (lifeIcons[lives]) {
    lifeIcons[lives].style.backgroundColor = 'transparent'; // Remove a life icon
  }

  // Delay to allow the player to recover from the hit
  setTimeout(() => {
    player.classList.remove('hit'); // Remove the hit animation
    canMove = true; // Re-enable movement

    // If the player runs out of lives, end the game
    if (lives <= 0) {
      saveHighScore();
      const restart = confirm("Game Over! Restart?");
      if (restart) location.reload(); // Reload the game if the player chooses to restart
    }
  }, 1000); // Wait for 1 second before allowing movement again
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
  scores.sort((a, b) => b.score - a.score); // Sort scores in descending order
  scores = scores.slice(0, 5); // Keep only the top 5 scores
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
    li.textContent = `${entry.name}........${entry.score}`; // Display player name and score
    list.appendChild(li);
  });
}

loadLeaderboard();