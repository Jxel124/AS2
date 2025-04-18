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

// Populates the maze in the HTML
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
        break;
      default:
        block.classList.add('point');
        block.style.height = '1vh';
        block.style.width = '1vh';
    }

    main.appendChild(block);
  }
}

// Handles what happens when the Start button is clicked
const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');

startBtn.addEventListener('click', () => {
  gameStarted = true;
  startScreen.style.display = 'none';
});

//Player movement
function keyUp(event) {
  if (event.key === 'ArrowUp') upPressed = false;
  else if (event.key === 'ArrowDown') downPressed = false;
  else if (event.key === 'ArrowLeft') leftPressed = false;
  else if (event.key === 'ArrowRight') rightPressed = false;
}

function keyDown(event) {
  if (!gameStarted) return;

  if (event.key === 'ArrowUp') upPressed = true;
  else if (event.key === 'ArrowDown') downPressed = true;
  else if (event.key === 'ArrowLeft') leftPressed = true;
  else if (event.key === 'ArrowRight') rightPressed = true;
}

// Player reference and initial position
const player = document.querySelector('#player');
const playerMouth = player.querySelector('.mouth');
let playerTop = 0;
let playerLeft = 0;
let score = 0;
let lives = 3;
let canMove = true;

// Constant loop to check for movement and interactions
setInterval(() => {
  if (!gameStarted || !canMove) return;

  let position = player.getBoundingClientRect();

  // Point collection
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

  // Win condition
  if (document.querySelectorAll('.point').length === 0) {
    alert("You collected all the points! Game Over!");
    location.reload();
  }

  // Enemy collision
  document.querySelectorAll('.enemy').forEach(enemy => {
    const enemyPos = enemy.getBoundingClientRect();
    const isTouchingEnemy =
      position.right > enemyPos.left &&
      position.left < enemyPos.right &&
      position.bottom > enemyPos.top &&
      position.top < enemyPos.bottom;

    if (isTouchingEnemy) {
      handleEnemyCollision();
    }
  });

  // Movement logic
  if (downPressed) {
    let newBottom = position.bottom + 1;
    let leftCheck = document.elementFromPoint(position.left, newBottom);
    let rightCheck = document.elementFromPoint(position.right, newBottom);
    if (!leftCheck?.classList.contains('wall') && !rightCheck?.classList.contains('wall')) {
      playerTop++;
      player.style.top = playerTop + 'px';
    }
    playerMouth.className = 'down';
  } else if (upPressed) {
    let newTop = position.top - 1;
    let leftCheck = document.elementFromPoint(position.left, newTop);
    let rightCheck = document.elementFromPoint(position.right, newTop);
    if (!leftCheck?.classList.contains('wall') && !rightCheck?.classList.contains('wall')) {
      playerTop--;
      player.style.top = playerTop + 'px';
    }
    playerMouth.className = 'up';
  } else if (leftPressed) {
    let newLeft = position.left - 1;
    let topCheck = document.elementFromPoint(newLeft, position.top);
    let bottomCheck = document.elementFromPoint(newLeft, position.bottom);
    if (!topCheck?.classList.contains('wall') && !bottomCheck?.classList.contains('wall')) {
      playerLeft--;
      player.style.left = playerLeft + 'px';
    }
    playerMouth.className = 'left';
  } else if (rightPressed) {
    let newRight = position.right + 1;
    let topCheck = document.elementFromPoint(newRight, position.top);
    let bottomCheck = document.elementFromPoint(newRight, position.bottom);
    if (!topCheck?.classList.contains('wall') && !bottomCheck?.classList.contains('wall')) {
      playerLeft++;
      player.style.left = playerLeft + 'px';
    }
    playerMouth.className = 'right';
  }
}, 10);

// These listeners check if a key is being held or released
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

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
      const restart = confirm("Game Over! Restart?");
      if (restart) location.reload();
    }
  }, 1500);
}

