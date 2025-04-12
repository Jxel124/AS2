// This variable tells us whether the game has started yet
let gameStarted = false;

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

// This loop builds the maze using CSS Grid so blocks are placed correctly
for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
        let cell = maze[row][col];
        let block = document.createElement('div');
        block.classList.add('block');

        // Set position in the grid layout
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

// References to the start button and screen
const startBtn = document.querySelector('#startBtn');
const startScreen = document.querySelector('#startScreen');

// Start the game when the button is clicked
startBtn.addEventListener('click', () => {
    gameStarted = true;
    startScreen.style.display = 'none';
});

// Keep track of arrow key presses
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

// This loop constantly checks for movement and point collection
setInterval(function () {
    if (!gameStarted) return;

    let position = player.getBoundingClientRect();

    // Loop through each point and check if player is touching it
    const allPoints = document.querySelectorAll('.point');
    allPoints.forEach(point => {
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

    // Show game over alert when all points are eaten
    if (document.querySelectorAll('.point').length === 0) {
        alert("You collected all the points! Game Over!");
        location.reload();
    }

    // Player movement and collision with walls
    if (downPressed) {
        let newBottom = position.bottom + 1;
        let leftCheck = document.elementFromPoint(position.left, newBottom);
        let rightCheck = document.elementFromPoint(position.right, newBottom);

        if (!leftCheck.classList.contains('wall') && !rightCheck.classList.contains('wall')) {
            playerTop++;
            player.style.top = playerTop + 'px';
        }

        playerMouth.classList = 'down';
    }
    else if (upPressed) {
        let newTop = position.top - 1;
        let leftCheck = document.elementFromPoint(position.left, newTop);
        let rightCheck = document.elementFromPoint(position.right, newTop);

        if (!leftCheck.classList.contains('wall') && !rightCheck.classList.contains('wall')) {
            playerTop--;
            player.style.top = playerTop + 'px';
        }

        playerMouth.classList = 'up';
    }
    else if (leftPressed) {
        let newLeft = position.left - 1;
        let topCheck = document.elementFromPoint(newLeft, position.top);
        let bottomCheck = document.elementFromPoint(newLeft, position.bottom);

        if (!topCheck.classList.contains('wall') && !bottomCheck.classList.contains('wall')) {
            playerLeft--;
            player.style.left = playerLeft + 'px';
        }

        playerMouth.classList = 'left';
    }
    else if (rightPressed) {
        let newRight = position.right + 1;
        let topCheck = document.elementFromPoint(newRight, position.top);
        let bottomCheck = document.elementFromPoint(newRight, position.bottom);

        if (!topCheck.classList.contains('wall') && !bottomCheck.classList.contains('wall')) {
            playerLeft++;
            player.style.left = playerLeft + 'px';
        }

        playerMouth.classList = 'right';
    }
}, 10);

// Handle key press and release events
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
