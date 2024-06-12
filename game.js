import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, limit } from 'firebase/firestore';

// Game variables and initialization
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mainScreen = document.getElementById('mainScreen');
const playButton = document.getElementById('playButton');
const totalScoreDisplay = document.getElementById('totalScore');
const timerDisplay = document.getElementById('timer');
const timeLeftDisplay = document.getElementById('timeLeft');

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
const ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
let bricks = [];
const brickRowCount = 5;
const brickColumnCount = 3;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
let score = 0;
let totalScore = 0;
let balls = [{ x, y, dx, dy }];
let bonuses = [];
let timer;
const gameDuration = 30;
let timeLeft = gameDuration;
let scoreMultiplier = 1;

// Touch control variables
let touchStartX = 0;
let touchEndX = 0;

// Functions for game logic
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawTimer() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Time: " + timeLeft + "s", canvas.width - 80, 20);
}

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

// Add touch event listeners
canvas.addEventListener("touchstart", touchStartHandler, false);
canvas.addEventListener("touchmove", touchMoveHandler, false);
canvas.addEventListener("touchend", touchEndHandler, false);

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function touchStartHandler(e) {
    touchStartX = e.touches[0].clientX;
}

function touchMoveHandler(e) {
    touchEndX = e.touches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    paddleX += deltaX;
    if (paddleX < 0) {
        paddleX = 0;
    } else if (paddleX + paddleWidth > canvas.width) {
        paddleX = canvas.width - paddleWidth;
    }
    touchStartX = touchEndX; // Update start position for next move
}

function touchEndHandler(e) {
    touchStartX = 0;
    touchEndX = 0;
}

function collisionDetection(ball) {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status == 1) {
                if (
                    ball.x > b.x &&
                    ball.x < b.x + brickWidth &&
                    ball.y > b.y &&
                    ball.y < b.y + brickHeight
                ) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 1 * scoreMultiplier;
                    // Add bonus with 20% probability
                    if (Math.random() < 0.2) {
                        bonuses.push({ x: b.x + brickWidth / 2, y: b.y + brickHeight / 2, dy: 2, type: 'multiplier' });
                    }
                    if (score % 5 === 0) {
                        balls.push({
                            x: canvas.width / 2,
                            y: canvas.height - 30,
                            dx: 2,
                            dy: -2,
                        });
                    }
                }
            }
        }
    }
}

function updateTimer() {
    timeLeft--;
    timeLeftDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

function startGame() {
    mainScreen.style.display = 'none';
    canvas.style.display = 'block';
    timerDisplay.style.display = 'block';
    score = 0;
    timeLeft = gameDuration;
    timeLeftDisplay.textContent = timeLeft;
    scoreMultiplier = 1;
    balls = [{ x: canvas.width / 2, y: canvas.height - 30, dx: 2, dy: -2 }];
    initBricks();
    draw();
    timer = setInterval(updateTimer, 1000);
}

function endGame() {
    clearInterval(timer);
    totalScore += score;
    totalScoreDisplay.textContent = totalScore;
    mainScreen.style.display = 'block';
    canvas.style.display = 'none';
    timerDisplay.style.display = 'none';

    // Save score to Firebase
    const user = auth.currentUser;
    if (user) {
        addDoc(collection(db, 'scores'), {
            userId: user.uid,
            score: totalScore,
            timestamp: serverTimestamp()
        }).then(() => {
            console.log("Score saved successfully!");
        }).catch((error) => {
            console.error("Error saving score:", error);
        });
    }
}

function drawBonus(bonus) {
    ctx.beginPath();
    ctx.arc(bonus.x, bonus.y, ballRadius / 2, 0, Math.PI * 2);
    ctx.fillStyle = bonus.type === 'multiplier' ? 'orange' : 'red';
    ctx.fill();
    ctx.closePath();
}

function handleBonuses() {
    bonuses.forEach((bonus, index) => {
        bonus.y += bonus.dy;
        drawBonus(bonus);

        // Check if bonus hits the paddle
        if (bonus.y + ballRadius / 2 > canvas.height - paddleHeight && bonus.x > paddleX && bonus.x < paddleX + paddleWidth) {
            if (bonus.type === 'multiplier') {
                scoreMultiplier = 2;
            }
            bonuses.splice(index, 1);
        }

        // Remove bonus if it goes out of bounds
        if (bonus.y + ballRadius / 2 > canvas.height) {
            bonuses.splice(index, 1);
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawScore();
    drawTimer();
    handleBonuses();
    balls.forEach((ball, index) => {
        drawBall(ball);
        collisionDetection(ball);

        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            } else {
                balls.splice(index, 1);
                if (balls.length === 0) {
                    endGame();
                }
            }
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
    });

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    if (timeLeft > 0) {
        requestAnimationFrame(draw);
    }
}

// Load user scores on page load
document.addEventListener('DOMContentLoaded', function() {
    const user = auth.currentUser;
    if (user) {
        loadUserScores(user.uid);
    } else {
        auth.onAuthStateChanged(function(user) {
            if (user) {
                loadUserScores(user.uid);
            }
        });
    }
});

function loadUserScores(userId) {
    const q = query(collection(db, 'scores'), where('userId', '==', userId), orderBy('timestamp', 'desc'), limit(1));
    getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
            const highestScore = querySnapshot.docs[0].data().score;
            totalScore = highestScore;
            totalScoreDisplay.textContent = totalScore;
        }
    }).catch((error) => {
        console.error("Error getting scores:", error);
    });
}

playButton.addEventListener('click', startGame);
