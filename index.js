const screen = document.getElementById("screen");
const context = screen.getContext('2d');

screen.width = 800;
screen.height = 600;

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_MARGIN_BOTTOM = 50;
const paddle = {
    x: screen.width/2 - PADDLE_WIDTH/2,
    y: screen.height - PADDLE_HEIGHT - PADDLE_MARGIN_BOTTOM,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 5
}

const BALL_RADIUS = 8;
const ball = {
    x: screen.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    speed: 4,
    dx: 3 * ( Math.random() * 2 - 1),
    dy: -3
}

let LIFE = 3;
let LEVEL = 1;
const MAX_LEVEL = 3;
let SCORE = 0;
const SCORE_UNIT = 10;
let GAME_OVER = false;

let ArrowLeft = false;
let ArrowRight = false;

const brick = {
    rows: 3,
    columns: 8,
    offsetLeft: 20,
    offsetTop: 10,
    marginTop: 70,
    width: 77.5,
    height: 30
}

let bricks = [];

/* Texts */

function showGameStatus(text,textX,textY){
    context.fillStyle = "#ccc";
    context.font = "25px Arial";
    context.fillText(text,textX,textY);
}

function gameOver(){
    if(LIFE <= 0){
        finalGame("Game Over", "#b71c1c");
        GAME_OVER = true;
    }
}

function levelUp(){
    let isLevelDone = true;
    for(let r = 0;r < brick.rows; r++){
        for(let c = 0;c < brick.columns; c++){
            isLevelDone = isLevelDone && ! bricks[r][c].status;
        }
    }

    if(isLevelDone){
        if(LEVEL >= MAX_LEVEL){
            finalGame("You Win", "#1e88e5");
            GAME_OVER = true;
            return;
        }

        brick.rows++;
        createBricks();
        ball.speed += 1;
        resetBall();
        LEVEL++;
    }
}


/* Bricks */

function createBricks(){
    let color = ["#f44336","#0277bd","#ef6c00","#ff9100","#ffeb3b","#33691e"];
    for(let r = 0;r < brick.rows;r++){

        bricks[r] = [];

        for(let c = 0; c < brick.columns; c++){
            bricks[r][c] = {
                x: c * (brick.width + brick.offsetLeft) + brick.offsetLeft,
                y: r * (brick.height + brick.offsetTop) + brick.offsetTop + brick.marginTop,
                status: true ,
                fillColor: color[r]
            }
        }
    }
}

createBricks();

function drawBricks(){
    for(let r = 0; r < brick.rows; r++){
        for(let c = 0; c < brick.columns; c++){
            let b = bricks[r][c];

            if(b.status){
                context.fillStyle = b.fillColor;
                context.fillRect(b.x, b.y, brick.width, brick.height);

                context.strokeStyle = "#fff";
                context.lineWidth = 2;
                context.strokeRect(b.x, b.y, brick.width, brick.height);
            }
        }
    }
}


/* Ball */


function drawBall(){
    context.beginPath();

    context.arc(ball.x,ball.y,ball.radius,0, Math.PI*2);
    context.fillStyle = "#f44336";
    context.fill();

    context.closePath();
}

function moveBall(){
    ball.x += ball.dx;
    ball.y += ball.dy;
}

function ballWallCollision(){
    if(ball.x + ball.radius > screen.width || ball.x - ball.radius < 0){
        ball.dx = - ball.dx;
    }
    if(ball.y - ball.radius < 0){
        ball.dy = - ball.dy;
    }
    if(ball.y + ball.radius > screen.height){
        LIFE--;
        resetBall();
    }
}

function resetBall(){
    ball.x = screen.width/2;
    ball.y = paddle.y - ball.radius;
    ball.dx = 3 * ( Math.random() * 2 - 1);
    ball.dy = -3;
}

function ballPaddleCollision(){
    if(ball.y > paddle.y && ball.y < paddle.y + paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width ){
        let collidePoint = ball.x - (paddle.x + paddle.width/2);
        collidePoint = collidePoint / (paddle.width/2);
        let angle = collidePoint * (Math.PI / 3);
        ball.dx = ball.speed * Math.sin(angle);
        ball.dy = - ball.speed * Math.cos(angle);
    }
}

function ballBrickCollision(){
    for(let r = 0; r < brick.rows; r++){
        for(let c = 0; c < brick.columns; c++){
            let b = bricks[r][c];
            if(b.status){
                if(ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brick.width && ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brick.height){
                    ball.dy = - ball.dy;
                    b.status = false;
                    SCORE += SCORE_UNIT;
                }
            }
        }
    }
}



/* Paddle */

function drawPaddle(){
    context.fillStyle = "#f44336";
    context.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);

    context.strokeStyle = "#fff";
    context.lineWidth = 2;
    context.strokeRect(paddle.x,paddle.y,paddle.width,paddle.height);
}

function movePaddle(){
    if(ArrowRight && paddle.x + paddle.width < screen.width){
        paddle.x += paddle.dx;
    } else if(ArrowLeft && paddle.x > 0){
        paddle.x -= paddle.dx;
    }
}

/* Controller */

document.addEventListener("keydown", function(evt) {
    if(evt.keyCode === 37){
        ArrowLeft = true;
    } else if(evt.keyCode === 39){
        ArrowRight = true;
    }
});

document.addEventListener("keyup", function(evt){
    console.log(evt);
    if(evt.keyCode === 37){
        ArrowLeft = false;
    } else if(evt.keyCode === 39){
        ArrowRight = false;
    }
});

/* LOOP */

function loop(){
    context.fillStyle = "rgb(20,20,20)";
    context.fillRect(0,0,screen.width,screen.height);
    draw();
    update();

    if(!GAME_OVER){
        requestAnimationFrame(loop);
    }
}

loop();

function draw(){
    drawPaddle();
    drawBall();
    drawBricks();
    showGameStatus(SCORE, 15, 30);
    showGameStatus(LIFE, screen.width - 25, 30);
    showGameStatus(LEVEL, screen.width/2 - 12,30);
}

function update(){
    movePaddle();
    moveBall();
    ballWallCollision();
    ballPaddleCollision();
    ballBrickCollision();
    gameOver();
    levelUp();
}


/* Game Over */

const gameover = document.getElementById("game-over");
const win_or_lose = document.getElementById("win-or-lose");
const restart = document.getElementById("restart");

restart.addEventListener("click", function(){
    location.reload();
});

function finalGame(text,color){
    gameover.style.display = "block";
    win_or_lose.innerText = text;
    win_or_lose.style.color = color;
}
