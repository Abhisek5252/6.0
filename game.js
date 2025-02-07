const game = {
    state: {
        coins: 0,
        tokens: 0,
        streak: 0,
        lastClaim: null,
        currentSection: 'daily',
        wheelSpinning: false
    },

    init() {
        this.loadState();
        this.updateUI();
        this.prizes = [
            { text: '100 Coins', value: 100, color: '#FF5733' },
            { text: '300 Coins', value: 300, color: '#33FF57' },
            { text: '500 Coins', value: 500, color: '#3357FF' },
            { text: '1 Token', value: -1, color: '#FFD700' }
        ];

        const splashScreen = document.getElementById('splash-screen');
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
            }, 1000);
        }, 2000);
    },

    loadState() {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    },

    saveState() {
        localStorage.setItem('gameState', JSON.stringify(this.state));
    },

    updateUI() {
        document.getElementById('coin-balance').textContent = this.state.coins;
        document.getElementById('token-balance').textContent = this.state.tokens;
        document.getElementById('streak-count').textContent = this.state.streak;
    },

    setupWheel() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.drawWheel();
    },

    drawWheel() {
        if (!this.ctx) return;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 140;
        const segments = this.prizes.length;
        const arc = (2 * Math.PI) / segments;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.prizes.forEach((prize, i) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = prize.color;
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, i * arc, (i + 1) * arc);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(i * arc + arc / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(prize.text, radius - 10, 0);
            this.ctx.restore();
        });
    },

    spinWheel() {
        if (this.state.wheelSpinning) return;
        this.state.wheelSpinning = true;
        
        const rotations = 5;
        const duration = 3000;
        const startTime = Date.now();
        const startAngle = 0;
        
        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.state.wheelSpinning = false;
                const winner = this.prizes[Math.floor(Math.random() * this.prizes.length)];
                if (winner.value === -1) {
                    this.state.tokens++;
                } else {
                    this.state.coins += winner.value;
                }
                this.updateUI();
                this.saveState();
                alert(`You won ${winner.text}! 🎉`);
                return;
            }

            const angle = startAngle + (rotations * 2 * Math.PI * progress);
            this.ctx.save();
            this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
            this.ctx.rotate(angle);
            this.ctx.translate(-this.canvas.width/2, -this.canvas.height/2);
            this.drawWheel();
            this.ctx.restore();
            
            requestAnimationFrame(animate);
        };

        animate();
    },

    showSection(section) {
        if (section === 'airdrop') {
            alert('Airdrop coming soon! 🪂');
            return;
        }
        
        const gameContent = document.querySelector('.game-content');
        const heading = '<h1 class="main-heading" onclick="game.showSection(\'daily\')">MetaVerse: A New Era</h1>';
        
        if (section === 'games') {
            gameContent.innerHTML = `
                ${heading}
                <div class="wheel-game text-center">
                    <h2 class="neon-text mb-4">Spin & Win</h2>
                    <canvas id="wheel" class="wheel" width="300" height="300"></canvas>
                    <button class="game-button accent mt-4" onclick="game.spinWheel()">Spin Wheel</button>
                </div>
            `;
            this.setupWheel();
            return;
        }

        this.state.currentSection = section;

        switch(section) {
            case 'wallet':
                gameContent.innerHTML = `
                    ${heading}
                    <div class="wallet-container">
                        <h2 class="neon-text mb-4">Wallet Balance</h2>
                        <div class="balance-card mb-4">
                            <div>🪙 MetaRush Coins: <span id="coin-balance">${this.state.coins}</span></div>
                            <div>💎 MetaVerse Tokens: <span id="token-balance">${this.state.tokens}</span></div>
                        </div>
                    </div>
                `;
                break;
            case 'leaderboard':
                alert('Leaderboard coming soon! 🏆');
                break;
            case 'tasks':
                alert('Daily tasks coming soon! 📋');
                break;
        }
    },

    claimDaily() {
        const today = new Date().toDateString();

        if (this.state.lastClaim === today) {
            alert('Already claimed today! Come back tomorrow! 🌟');
            return;
        }

        if (this.state.lastClaim === new Date(Date.now() - 86400000).toDateString()) {
            this.state.streak++;
        } else {
            this.state.streak = 1;
        }

        const reward = 100 * this.state.streak;
        this.state.coins += reward;
        this.state.lastClaim = today;

        alert(`Claimed ${reward} coins! 🎉\nStreak: ${this.state.streak} days`);
        this.updateUI();
        this.saveState();
    }
};

document.addEventListener('DOMContentLoaded', () => game.init());