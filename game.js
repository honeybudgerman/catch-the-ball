const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2 - 50,
    y: canvas.height - 30,
    width: 100,
    height: 20,
    speed: 10,
    dx: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 4,
    dx: 4,
    dy: -4
};

let balls = [Object.assign({}, ball)];
let score = 0;
let lives = 3;
let level = 1;
const blockRowCount = 5;
const blockColumnCount = 10;
const blockWidth = 75;
const blockHeight = 20;
const blockPadding = 10;
const blockOffsetTop = 30;
const blockOffsetLeft = 30;
const blocks = [];
const blackBlocks = [];

for (let c = 0; c < blockColumnCount; c++) {
    blocks[c] = [];
    for (let r = 0; r < blockRowCount; r++) {
        blocks[c][r] = { x: 0, y: 0, status: 1, color: getRandomColor() };
    }
}

for (let i = 0; i < 5; i++) {
    blackBlocks.push({
        x: Math.random() * (canvas.width - blockWidth),
        y: Math.random() * (canvas.height / 2),
        width: blockWidth,
        height: blockHeight
    });
}

function getRandomColor() {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawPlayer() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBlocks() {
    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            if (blocks[c][r].status == 1) {
                const blockX = (c * (blockWidth + blockPadding)) + blockOffsetLeft;
                const blockY = (r * (blockHeight + blockPadding)) + blockOffsetTop;
                blocks[c][r].x = blockX;
                blocks[c][r].y = blockY;
                ctx.beginPath();
                ctx.rect(blockX, blockY, blockWidth, blockHeight);
                ctx.fillStyle = blocks[c][r].color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawBlackBlocks() {
    ctx.fillStyle = 'black';
    blackBlocks.forEach(block => {
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 75, 20);
}

function drawLevel() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#0095DD';
    ctx.fillText(`Level: ${level}`, canvas.width / 2 - 30, 20);
}

function movePlayer() {
    player.x += player.dx;

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function moveBall(ball) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (ball.y + ball.radius > player.y &&
        ball.y - ball.radius < player.y + player.height &&
        ball.x + ball.radius > player.x &&
        ball.x - ball.radius < player.x + player.width) {

        ball.dy *= -1;
        ball.y = player.y - ball.radius;
    }

    if (ball.y + ball.radius > canvas.height) {
        return false;
    }

    for (let c = 0; c < blockColumnCount; c++) {
        for (let r = 0; r < blockRowCount; r++) {
            const b = blocks[c][r];
            if (b.status == 1) {
                if (ball.x > b.x && ball.x < b.x + blockWidth && ball.y > b.y && ball.y < b.y + blockHeight) {
                    ball.dy *= -1;
                    b.status = 0;
                    score++;
                    if (score % 5 === 0) {
                        balls.push(Object.assign({}, ball));
                    }
                }
            }
        }
    }

    blackBlocks.forEach(block => {
        if (ball.x + ball.radius > block.x &&
            ball.x - ball.radius < block.x + block.width &&
            ball.y + ball.radius > block.y &&
            ball.y - ball.radius < block.y + block.height) {

            ball.dx *= -1;
            ball.dy *= -1;
        }
    });

    return true;
}

function update() {
    movePlayer();

    balls = balls.filter(ball => moveBall(ball));

    if (balls.length === 0) {
        lives--;
        if (lives === 0) {
            alert('Game Over');
            document.location.reload();
        } else {
            balls.push(Object.assign({}, ball));
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    balls.forEach(drawBall);
    drawBlocks();
    drawBlackBlocks();
    drawScore();
    drawLives();
    drawLevel();

    requestAnimationFrame(update);
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        player.dx = 0;
    }
}

function touchStart(e) {
    const touchX = e.touches[0].clientX;
    if (touchX > canvas.width / 2) {
        player.dx = player.speed;
    } else {
        player.dx = -player.speed;
    }
}

function touchEnd() {
    player.dx = 0;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
document.addEventListener('touchstart', touchStart);
document.addEventListener('touchend', touchEnd);

update();
