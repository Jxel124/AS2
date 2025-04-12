// This variable tells us whether the game has started yet
let gameStarted = false;

let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');

//Player = 2, Wall = 1, Enemy = 3, Point = 0
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

//Populates the maze in the HTML
for (let y of maze) {
    for (let x of y) {
        let block = document.createElement('div');
        block.classList.add('block');

        switch (x) {
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
    gameStarted = true; // Allow game actions
    startScreen.style.display = 'none'; // Hide the start screen
});

//Player movement
function keyUp(event) {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
}

function keyDown(event) {
    // Prevents movement keys from working if game hasn't started
    if (!gameStarted) return;

    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
}

const player = document.querySelector('#player');
const playerMouth = player.querySelector('.mouth');
let playerTop = 0;
let playerLeft = 0;
let score = 0; // Tracks how many points have been collected

setInterval(function () {
    // If the game hasn't started, don't move the player at all
    if (!gameStarted) return;

    // Get the current position of the player
    let position = player.getBoundingClientRect();

    // Go through every point and check if it overlaps with the player
    const allPoints = document.querySelectorAll('.point');
    allPoints.forEach(point => {
        const pointPos = point.getBoundingClientRect();

        // Basic rectangle overlap logic — checks if two elements touch
        const isColliding =
            position.right > pointPos.left &&
            position.left < pointPos.right &&
            position.bottom > pointPos.top &&
            position.top < pointPos.bottom;

        if (isColliding) {
            point.remove(); // Remove the collected point
            score++; // Increase the score
            document.querySelector('.score p').textContent = score; // Update the UI
        }
    });

    // If all the points are gone, end the game
    if (document.querySelectorAll('.point').length === 0) {
        alert("You collected all the points! Game Over!");
        location.reload(); // Just restart for now
    }

    // Check collision when moving down
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

    // Check collision when moving up
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

    // Check collision when moving left
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

    // Check collision when moving right
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

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
