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

const main = document.querySelector('main');
const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');
const nameInput = document.querySelector('#playerNameInput');

let playerName = "";

startBtn.addEventListener('click', () => {
  if (nameInput.value.trim() === "") {
    alert("Please enter your name!");
    return;
  }
  playerName = nameInput.value.trim();
  gameStarted = true;
  startScreen.style.display = 'none';
});

// Populates the maze in the HTML
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

for (let row = 0; row < maze.length; row++) {
  for (let col = 0; col < maze[row].length; col++) {
    let cell = maze[row][col];
    let block = document.createElement('div');
    block.classList.add('block');
    block.style.gridRowStart = row + 1;
    block.style.gridColumnStart = col + 1;

    if (cell === 1) block.classList.add('wall');
    else if (cell === 2) {
      block.id = 'player';
      let mouth = document.createElement('div');
      mouth.classList.add('mouth');
      block.appendChild(mouth);
    }
    else if (cell === 3) block.classList.add('enemy');
    else {
      block.classList.add('point');
      block.style.height = '1vh';
      block.style.width = '1vh';
    }

    main.appendChild(block);
  }
}

const player = document.getElementById('player');
const playerMouth = player.querySelector('.mouth');

function keyDown(e) {
  if (!gameStarted) return;
  if (e.key === 'ArrowUp') upPressed = true;
  if (e.key === 'ArrowDown') downPressed = true;
  if (e.key === 'ArrowLeft') leftPressed = true;
  if (e.key === 'ArrowRight') rightPressed = true;
}

function keyUp(e) {
  if (e.key === 'ArrowUp') upPressed = false;
  if (e.key === 'ArrowDown') downPressed = false;
  if (e.key === 'ArrowLeft') leftPressed = false;
  if (e.key === 'ArrowRight') rightPressed = false;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

setInterval(() => {
  if (!gameStarted || !canMove) return;

  const step = 2;
  const pos = player.getBoundingClientRect();

  if (downPressed) {
    playerTop += step;
    player.style.top = playerTop + 'px';
    playerMouth.className = 'down';
  }
  if (upPressed) {
    playerTop -= step;
    player.style.top = playerTop + 'px';
    playerMouth.className = 'up';
  }
  if (leftPressed) {
    playerLeft -= step;
    player.style.left = playerLeft + 'px';
    playerMouth.className = 'left';
  }
  if (rightPressed) {
    playerLeft += step;
    player.style.left = playerLeft + 'px';
    playerMouth.className = 'right';
  }

  // Point collection
  document.querySelectorAll('.point').forEach(point => {
    const pointBox = point.getBoundingClientRect();
    const isColliding = (
      pos.right > pointBox.left &&
      pos.left < pointBox.right &&
      pos.bottom > pointBox.top &&
      pos.top < pointBox.bottom
    );
    if (isColliding) {
      point.remove();
      score++;
      document.querySelector('.score p').textContent = score;
    }
  });
}, 20);
