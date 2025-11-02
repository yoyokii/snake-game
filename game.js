// 游戏主逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');

// 游戏常量
const GRID_SIZE = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const INITIAL_SPEED = 150; // 初始速度（毫秒）
const MAX_SPEED = 50; // 最大速度
const SPEED_INCREASE = 2; // 每次增加的速度

// 游戏变量
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval;
let gameSpeed = INITIAL_SPEED;
let isGameRunning = false;
let isPaused = false;

// 初始化游戏
function initGame() {
    // 重置游戏状态
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    isGameRunning = false;
    isPaused = false;
    
    // 更新UI
    updateScore();
    highScoreElement.textContent = highScore;
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    
    // 生成食物
    generateFood();
    
    // 绘制初始游戏画面
    drawGame();
}

// 生成食物
function generateFood() {
    // 确保食物不会生成在蛇身上
    let overlapping;
    do {
        overlapping = false;
        food = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
        };
        
        // 检查是否与蛇重叠
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                overlapping = true;
                break;
            }
        }
    } while (overlapping);
}

// 移动蛇
function moveSnake() {
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新头添加到蛇的头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 吃到食物，增加分数
        score++;
        updateScore();
        
        // 生成新食物
        generateFood();
        
        // 增加游戏速度
        if (gameSpeed > MAX_SPEED) {
            gameSpeed = Math.max(MAX_SPEED, INITIAL_SPEED - (score * SPEED_INCREASE));
            restartGameLoop();
        }
    } else {
        // 没吃到食物，移除尾部
        snake.pop();
    }
    
    // 检查碰撞
    checkCollisions();
}

// 检查碰撞
function checkCollisions() {
    const head = snake[0];
    
    // 边界碰撞
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
        gameOver();
        return;
    }
    
    // 自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制网格背景
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
        
        // 绘制蛇眼睛（只在头部绘制）
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = GRID_SIZE / 5;
            const eyeOffset = GRID_SIZE / 3;
            
            // 根据方向调整眼睛位置
            switch (direction) {
                case 'right':
                    ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                    break;
                case 'left':
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                    break;
                case 'up':
                    ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + eyeOffset, eyeSize, eyeSize);
                    break;
                case 'down':
                    ctx.fillRect(segment.x * GRID_SIZE + eyeOffset, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                    ctx.fillRect(segment.x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, segment.y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize, eyeSize, eyeSize);
                    break;
            }
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
}

// 游戏主循环
function gameLoop() {
    if (!isPaused) {
        moveSnake();
        drawGame();
    }
}

// 重新启动游戏循环
function restartGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 更新分数
function updateScore() {
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
}

// 游戏结束
function gameOver() {
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // 显示游戏结束画面
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
    
    // 更新按钮状态
    startBtn.disabled = true;
    pauseBtn.disabled = true;
    resetBtn.disabled = false;
}

// 开始游戏
function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        isPaused = false;
        restartGameLoop();
        
        // 更新按钮状态
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        resetBtn.disabled = false;
    }
}

// 暂停/继续游戏
function togglePause() {
    if (isGameRunning) {
        isPaused = !isPaused;
        pauseBtn.textContent = isPaused ? '继续游戏' : '暂停游戏';
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    initGame();
}

// 处理键盘输入
function handleKeyDown(e) {
    // 方向控制
    if (e.key === 'ArrowUp' && direction !== 'down') {
        nextDirection = 'up';
    } else if (e.key === 'ArrowDown' && direction !== 'up') {
        nextDirection = 'down';
    } else if (e.key === 'ArrowLeft' && direction !== 'right') {
        nextDirection = 'left';
    } else if (e.key === 'ArrowRight' && direction !== 'left') {
        nextDirection = 'right';
    } 
    // 空格键暂停/继续
    else if (e.key === ' ') {
        e.preventDefault(); // 防止页面滚动
        if (isGameRunning) {
            togglePause();
        } else {
            startGame();
        }
    }
    // R键重置
    else if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
}

// 添加事件监听器
function addEventListeners() {
    // 按钮点击事件
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);
    
    // 触摸控制（移动端）
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // 防止页面滚动
    });
    
    canvas.addEventListener('touchend', (e) => {
        if (!isGameRunning) {
            startGame();
            return;
        }
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // 判断滑动方向
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
    });
}

// 初始化游戏
initGame();
addEventListeners();