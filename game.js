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

let score = 0;
let lives = 3;
let level = 1;

function drawPlayer() {
    ctx.fillStyle = '#0095DD';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
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

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Проверка столкновения с боковыми стенами
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    // Проверка столкновения с верхней стеной
    if (ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Проверка столкновения с игроком
    if (ball.y + ball.radius > player.y &&
        ball.y - ball.radius < player.y + player.height &&
        ball.x + ball.radius > player.x &&
        ball.x - ball.radius < player.x + player.width) {

        ball.dy *= -1;
        ball.y = player.y - ball.radius; // Установите шарик над игроком
        score++;
        if (score % 5 === 0) {
            level++;
            ball.speed += 1;
            ball.dx = ball.speed * (ball.dx > 0 ? 1 : -1);
            ball.dy = ball.speed * (ball.dy > 0 ? 1 : -1);
        }
    }

    // Проверка выхода за нижнюю границу
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives === 0) {
            alert('Game Over');
            document.location.reload();
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -ball.speed;
            player.x = canvas.width / 2 - player.width / 2;
        }
    }
}

function update() {
    movePlayer();
    moveBall();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBall();
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

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

update();
