setInterval(function () {
    // If the game hasn't started, don't move the player at all
    if (!gameStarted) return;

    // Check collision when moving down
    if (downPressed) {
        let position = player.getBoundingClientRect();
        let newBottom = position.bottom + 1;

        // Check both bottom-left and bottom-right points for walls
        let leftCheck = document.elementFromPoint(position.left, newBottom);
        let rightCheck = document.elementFromPoint(position.right, newBottom);

        // Only move down if both spots are not walls
        if (!leftCheck.classList.contains('wall') && !rightCheck.classList.contains('wall')) {
            playerTop++;
            player.style.top = playerTop + 'px';
        }

        playerMouth.classList = 'down';
    }

    // Check collision when moving up
    else if (upPressed) {
        let position = player.getBoundingClientRect();
        let newTop = position.top - 1;

        // Check both top-left and top-right for walls
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
        let position = player.getBoundingClientRect();
        let newLeft = position.left - 1;

        // Check both top-left and bottom-left for walls
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
        let position = player.getBoundingClientRect();
        let newRight = position.right + 1;

        // Check both top-right and bottom-right for walls
        let topCheck = document.elementFromPoint(newRight, position.top);
        let bottomCheck = document.elementFromPoint(newRight, position.bottom);

        if (!topCheck.classList.contains('wall') && !bottomCheck.classList.contains('wall')) {
            playerLeft++;
            player.style.left = playerLeft + 'px';
        }

        playerMouth.classList = 'right';
    }
}, 10);
