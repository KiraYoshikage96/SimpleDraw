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
        alert('加载奖品配置失败，请检查 prizes-config.json 文件是否存在');
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
    // 防止快速连续点击
    if (isDrawing) {
        return;
    }
    
    // 获取未抽取的奖品
    const availablePrizes = prizePool.filter(prize => !prize.drawn);
    
    if (availablePrizes.length === 0) {
        showAlert('🎁 奖池已空！请重置后继续');
        return;
    }
    
    isDrawing = true;
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.disabled = true;
    
    // 随机抽取
    const randomIndex = Math.floor(Math.random() * availablePrizes.length);
    const selectedPrize = availablePrizes[randomIndex];
    
    // 抽奖滚动动画效果
    let rollCount = 0;
    const rollInterval = setInterval(() => {
        const randomTemp = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
        displayCurrentPrize(randomTemp.name, true);
        rollCount++;
        
        if (rollCount >= 10) {
            clearInterval(rollInterval);
            
            // 标记为已抽取
            selectedPrize.drawn = true;
            
            // 添加到抽奖历史
            historyCount++;
            drawnPrizes.unshift({
                number: historyCount,
                name: selectedPrize.name,
                time: new Date().toLocaleTimeString('zh-CN')
            });
            
            // 显示最终结果
            setTimeout(() => {
                displayCurrentPrize(selectedPrize.name, false);
                updateHistory();
                
                // 延迟后恢复按钮状态
                setTimeout(() => {
                    isDrawing = false;
                    updateDrawButton();
                }, 800);
            }, 200);
        }
    }, 100);
}

// 显示当前抽中的奖品
function displayCurrentPrize(prizeName, isRolling = false) {
    const currentPrizeDiv = document.getElementById('currentPrize');
    if (isRolling) {
        currentPrizeDiv.textContent = prizeName;
        currentPrizeDiv.style.animation = 'none';
    } else {
        currentPrizeDiv.textContent = `🎊 ${prizeName} 🎊`;
        currentPrizeDiv.style.animation = 'none';
        setTimeout(() => {
            currentPrizeDiv.style.animation = 'prizeReveal 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
    }
}

// 自定义提示框
function showAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(alertDiv);
        }, 300);
    }, 2000);
}

// 更新历史记录
function updateHistory() {
    const historyDiv = document.getElementById('history');
    
    if (drawnPrizes.length === 0) {
        historyDiv.innerHTML = '<div class="empty-message">还没有抽奖记录</div>';
        return;
    }
    
    historyDiv.innerHTML = drawnPrizes.map(item => `
        <div class="history-item">
            <span>第${item.number}次</span>
            <span>${item.time}</span>
            <strong>${item.name}</strong>
        </div>
    `).join('');
}

// 更新抽奖按钮状态
function updateDrawButton() {
    const drawBtn = document.getElementById('drawBtn');
    const availablePrizes = prizePool.filter(prize => !prize.drawn);
    drawBtn.disabled = availablePrizes.length === 0;
}

// 重置奖池
function resetPrizes() {
    if (drawnPrizes.length === 0 && prizePool.length === 0) {
        return;
    }
    
    if (!confirm('确定要重置奖池吗？这将清空所有抽奖记录。')) {
        return;
    }
    
    // 重置所有奖品状态
    prizePool.forEach(prize => {
        prize.drawn = false;
    });
    
    // 清空历史
    drawnPrizes = [];
    historyCount = 0;
    
    // 更新显示
    document.getElementById('currentPrize').textContent = '';
    updateDrawButton();
    updateHistory();
    
    // 显示提示
    showAlert('✨ 奖池已重置');
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
});

