// 奖池数据
let prizePool = [];
let drawnPrizes = [];
let historyCount = 0;

// 从配置文件加载奖品
async function loadPrizesFromConfig() {
    try {
        const response = await fetch('prizes-config.json');
        if (!response.ok) {
            throw new Error('无法加载配置文件');
        }
        const config = await response.json();
        
        // 将配置文件中的奖品加载到奖池
        prizePool = config.prizes.map((prizeName, index) => ({
            id: Date.now() + index,
            name: prizeName,
            drawn: false
        }));
        
        updateDrawButton();
    } catch (error) {
        console.error('加载奖品配置失败:', error);
        showAlert('加载配置失败');
    }
}

// 初始化
function init() {
    loadPrizesFromConfig();
}

// 防止快速重复点击
let isDrawing = false;

// 抽奖
function drawPrize() {
    if (isDrawing) return;
    
    const availablePrizes = prizePool.filter(prize => !prize.drawn);
    
    if (availablePrizes.length === 0) {
        showAlert('奖池已空');
        return;
    }
    
    isDrawing = true;
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.disabled = true;
    drawBtn.textContent = '抽奖中...';
    
    // 随机抽取
    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    const selectedPrize = availablePrizes[randomIndex];
    
    // 滚动动画
    let rollCount = 0;
    const maxRolls = 15;
    const rollInterval = setInterval(() => {
        const randomTemp = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
        displayCurrentPrize(randomTemp.name, true);
        rollCount++;
        
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            finishDraw(selectedPrize);
        }
    }, 80);
}

function finishDraw(selectedPrize) {
    // 标记为已抽取
    selectedPrize.drawn = true;
    
    // 添加到历史
    historyCount++;
    drawnPrizes.unshift({
        number: historyCount,
        name: selectedPrize.name,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    
    // 显示结果
    displayCurrentPrize(selectedPrize.name, false);
    updateHistory();
    
    // 延迟显示弹窗
    setTimeout(() => {
        showWinModal(selectedPrize.name);
    }, 300);
    
    // 恢复按钮
    setTimeout(() => {
        isDrawing = false;
        updateDrawButton();
    }, 500);
}

// 显示中奖弹窗
function showWinModal(prizeName) {
    const modal = document.getElementById('winModal');
    const prizeNameEl = document.getElementById('modalPrizeName');
    
    prizeNameEl.textContent = prizeName;
    modal.classList.remove('hidden');
    
    // 播放烟花效果
    triggerConfetti();
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('winModal');
    modal.classList.add('hidden');
}

// 烟花效果
function triggerConfetti() {
    const count = 200;
    const defaults = {
        origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
        confetti(Object.assign({}, defaults, opts, {
            particleCount: Math.floor(count * particleRatio)
        }));
    }

    fire(0.25, {
        spread: 26,
        startVelocity: 55,
    });

    fire(0.2, {
        spread: 60,
    });

    fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
    });

    fire(0.1, {
        spread: 120,
        startVelocity: 45,
    });
}

// 显示当前奖品
function displayCurrentPrize(prizeName, isRolling = false) {
    const currentPrizeDiv = document.getElementById('currentPrize');
    currentPrizeDiv.textContent = prizeName;
    
    if (!isRolling) {
        // 简单的强调效果
        currentPrizeDiv.style.transform = 'scale(1.1)';
        currentPrizeDiv.style.color = 'var(--accent-color)';
        setTimeout(() => {
            currentPrizeDiv.style.transform = 'scale(1)';
        }, 200);
    } else {
        currentPrizeDiv.style.color = 'var(--text-secondary)';
    }
}

// 自定义提示框
function showAlert(message) {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();

    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    // 强制重绘以触发过渡
    alertDiv.offsetHeight;
    
    alertDiv.classList.add('show');
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 2000);
}

// 更新历史记录
function updateHistory() {
    const historyDiv = document.getElementById('history');
    const countSpan = document.getElementById('historyCount');
    
    countSpan.textContent = drawnPrizes.length;
    
    if (drawnPrizes.length === 0) {
        historyDiv.innerHTML = '<div class="empty-state">暂无记录</div>';
        return;
    }
    
    historyDiv.innerHTML = drawnPrizes.map(item => `
        <div class="history-item">
            <span class="time">${item.time}</span>
            <span class="name">${item.name}</span>
        </div>
    `).join('');
}

// 更新按钮状态
function updateDrawButton() {
    const drawBtn = document.getElementById('drawBtn');
    const availablePrizes = prizePool.filter(prize => !prize.drawn);
    
    if (availablePrizes.length === 0) {
        drawBtn.disabled = true;
        drawBtn.textContent = '奖池已空';
    } else {
        drawBtn.disabled = false;
        drawBtn.textContent = '开始抽奖';
    }
}

// 重置
function resetPrizes() {
    if (drawnPrizes.length === 0 && prizePool.every(p => !p.drawn)) {
        return;
    }
    
    if (!confirm('确定要重置所有记录吗？')) {
        return;
    }
    
    prizePool.forEach(prize => prize.drawn = false);
    drawnPrizes = [];
    historyCount = 0;
    
    document.getElementById('currentPrize').textContent = '准备就绪';
    document.getElementById('currentPrize').style.color = 'var(--accent-color)';
    
    updateDrawButton();
    updateHistory();
    showAlert('已重置');
}

document.addEventListener('DOMContentLoaded', init);
