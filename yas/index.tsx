/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const gameContainer = document.getElementById('game-container')!;
const player = document.getElementById('player')!;
const scoreEl = document.getElementById('score')!;
const messageContainer = document.querySelector('.message-container') as HTMLDivElement;
const messageEl = document.querySelector('.message') as HTMLParagraphElement;
const finalScoreEl = document.querySelector('.final-score') as HTMLParagraphElement;
const jumpButton = document.getElementById('jump-button')!;
const startButton = document.getElementById('start-button')!;

// Game state
let isPlaying = false;
let isJumping = false;
let score = 0;
let gameSpeed = 5;
let gameLoopId: number;
let obstacleIntervalId: number;

const GAME_SPEED_INCREASE = 0.001;
const INITIAL_GAME_SPEED = 5;
const OBSTACLE_INTERVAL = 2000; // ms

function handleJump(e: Event) {
    // For keyboard controls, only react to the Space key.
    if (e.type === 'keydown' && (e as KeyboardEvent).code !== 'Space') {
        return;
    }

    if (!isPlaying) {
        return;
    }

    // Prevent default browser actions like scrolling with space or zooming on tap.
    e.preventDefault();

    jump();
}

function startGame() {
    isPlaying = true;
    score = 0;
    gameSpeed = INITIAL_GAME_SPEED;
    scoreEl.textContent = '0';
    
    messageContainer.classList.add('hidden');
    scoreEl.classList.remove('hidden');
    jumpButton.classList.remove('hidden');

    // Clear any existing obstacles
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    // Start generating obstacles
    obstacleIntervalId = window.setInterval(createObstacle, OBSTACLE_INTERVAL);
    
    // Start game loop
    gameLoopId = requestAnimationFrame(gameLoop);
}

function endGame() {
    isPlaying = false;
    clearInterval(obstacleIntervalId);
    cancelAnimationFrame(gameLoopId);
    
    messageContainer.classList.remove('hidden');
    scoreEl.classList.add('hidden');
    jumpButton.classList.add('hidden');

    messageEl.textContent = 'Game Over!';
    (startButton as HTMLButtonElement).textContent = 'Restart';
    finalScoreEl.textContent = `Final Score: ${Math.floor(score)}`;
}

function jump() {
    if (isJumping) return;
    isJumping = true;
    player.classList.add('jump');
    player.addEventListener('animationend', () => {
        player.classList.remove('jump');
        isJumping = false;
    }, { once: true });
}

function createObstacle() {
    if (!isPlaying) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    // Randomize height slightly
    const randomHeight = 30 + Math.random() * 40;
    obstacle.style.height = `${randomHeight}px`;

    gameContainer.appendChild(obstacle);
    
    // Obstacle movement is handled in the main game loop
}

function gameLoop() {
    if (!isPlaying) return;

    // Update score
    score += 0.1;
    scoreEl.textContent = Math.floor(score).toString();

    // Increase game speed
    gameSpeed += GAME_SPEED_INCREASE;

    // Move obstacles and check for collision
    document.querySelectorAll<HTMLDivElement>('.obstacle').forEach(obstacle => {
        let obstacleLeft = parseFloat(getComputedStyle(obstacle).left);
        obstacle.style.left = `${obstacleLeft - gameSpeed}px`;

        // Remove obstacle if it's off-screen
        if (obstacleLeft < -60) {
            obstacle.remove();
        }

        // Collision detection
        const playerRect = player.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        if (
            playerRect.right > obstacleRect.left &&
            playerRect.left < obstacleRect.right &&
            playerRect.bottom > obstacleRect.top &&
            playerRect.top < obstacleRect.bottom
        ) {
            endGame();
        }
    });

    gameLoopId = requestAnimationFrame(gameLoop);
}

// Event Listeners

// Start/Restart
startButton.addEventListener('click', startGame);

// Jump Controls
document.addEventListener('keydown', handleJump);
jumpButton.addEventListener('click', handleJump);
gameContainer.addEventListener('touchstart', (e: TouchEvent) => {
    // We check if the touch target is the button. If it is, we do nothing here
    // and let the 'click' event handler on the button take over. This prevents
    // the game from registering two events (touchstart and click) for a single tap on the button.
    if (e.target === jumpButton || jumpButton.contains(e.target as Node)) {
        return;
    }
    handleJump(e);
});


// Register Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}