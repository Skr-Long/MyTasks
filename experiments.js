class PhysicsExperiment {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.data = {};
    }

    setup() {}
    update() {}
    draw() {}
    start() {
        this.isRunning = true;
        this.isPaused = false;
    }
    pause() {
        this.isPaused = !this.isPaused;
    }
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.data = {};
    }
    getControls() { return []; }
    updateControl(key, value) {}
    getData() { return {}; }
    getFormula() { return ''; }
    getTitle() { return ''; }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}

// ==================== 自由落体运动 ====================
class FreeFallExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.gravity = 9.8;
        this.ballY = 50;
        this.ballRadius = 18;
        this.velocity = 0;
        this.time = 0;
        this.velocityMarkers = [];
    }

    getTitle() { return '自由落体运动'; }

    setup() {
        this.resizeCanvas();
        this.reset();
    }

    reset() {
        super.reset();
        this.ballY = 50;
        this.velocity = 0;
        this.time = 0;
        this.velocityMarkers = [];
        this.draw();
    }

    getControls() {
        return [
            { name: '重力加速度', type: 'range', min: 1, max: 20, value: this.gravity, step: 0.1, key: 'gravity', unit: 'm/s²' }
        ];
    }

    updateControl(key, value) {
        if (key === 'gravity') this.gravity = value;
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        const oldTime = this.time;
        this.time += deltaTime;
        this.velocity += this.gravity * deltaTime;
        this.ballY += this.velocity * deltaTime * 3;

        if (Math.floor(this.time) > Math.floor(oldTime)) {
            this.velocityMarkers.push({
                y: this.ballY,
                velocity: this.velocity,
                time: Math.floor(this.time)
            });
        }

        const groundY = this.canvas.height - 80;
        if (this.ballY + this.ballRadius >= groundY) {
            this.ballY = groundY - this.ballRadius;
            this.isRunning = false;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerX = this.canvas.width / 2;

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height - 55, this.canvas.width, 5);

        this.velocityMarkers.forEach((marker, idx) => {
            this.ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX - 60, marker.y);
            this.ctx.lineTo(centerX + 60, marker.y);
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffc107';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`t=${marker.time}s v=${marker.velocity.toFixed(1)}m/s`, centerX + 70, marker.y + 4);
        });

        const gradient = this.ctx.createRadialGradient(
            centerX - 5, this.ballY - 5, 0,
            centerX, this.ballY, this.ballRadius
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fill();

        if (this.velocity > 0) {
            const arrowLength = Math.min(this.velocity * 2, 50);
            this.ctx.strokeStyle = '#28a745';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + this.ballRadius + 10, this.ballY);
            this.ctx.lineTo(centerX + this.ballRadius + 10, this.ballY + arrowLength);
            this.ctx.lineTo(centerX + this.ballRadius + 5, this.ballY + arrowLength - 8);
            this.ctx.moveTo(centerX + this.ballRadius + 10, this.ballY + arrowLength);
            this.ctx.lineTo(centerX + this.ballRadius + 15, this.ballY + arrowLength - 8);
            this.ctx.stroke();

            this.ctx.fillStyle = '#28a745';
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`v=${this.velocity.toFixed(1)}m/s`, centerX + this.ballRadius + 20, this.ballY + arrowLength / 2);
        }
    }

    getData() {
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '速度': { value: this.velocity.toFixed(2), unit: 'm/s' },
            '下落距离': { value: Math.max(0, this.ballY - 50).toFixed(1), unit: '' }
        };
    }

    getFormula() { return 'v = gt, h = ½gt²'; }
}

// ==================== 平抛运动 ====================
class ProjectileExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.initialVelocity = 50;
        this.angle = 45;
        this.gravity = 9.8;
        this.ballX = 100;
        this.ballY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.time = 0;
        this.trail = [];
        this.ballRadius = 14;
    }

    getTitle() { return '抛体运动'; }

    setup() {
        this.resizeCanvas();
        this.reset();
    }

    reset() {
        super.reset();
        this.ballX = 100;
        this.ballY = this.canvas.height - 180;
        const rad = (this.angle * Math.PI) / 180;
        this.velocityX = this.initialVelocity * Math.cos(rad);
        this.velocityY = -this.initialVelocity * Math.sin(rad);
        this.time = 0;
        this.trail = [];
        this.draw();
    }

    getControls() {
        return [
            { name: '初速度', type: 'range', min: 20, max: 100, value: this.initialVelocity, step: 5, key: 'initialVelocity', unit: 'm/s' },
            { name: '抛射角', type: 'range', min: -90, max: 90, value: this.angle, step: 5, key: 'angle', unit: '°' },
            { name: '重力加速度', type: 'range', min: 1, max: 20, value: this.gravity, step: 0.1, key: 'gravity', unit: 'm/s²' }
        ];
    }

    updateControl(key, value) {
        if (key === 'initialVelocity') this.initialVelocity = value;
        if (key === 'angle') this.angle = value;
        if (key === 'gravity') this.gravity = value;
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        this.time += deltaTime;
        this.velocityY += this.gravity * deltaTime;
        this.ballX += this.velocityX * deltaTime * 3;
        this.ballY += this.velocityY * deltaTime * 3;

        if (this.trail.length === 0 || Math.abs(this.trail[this.trail.length - 1].x - this.ballX) > 3) {
            this.trail.push({ x: this.ballX, y: this.ballY });
        }

        const groundY = this.canvas.height - 80;
        if (this.ballY + this.ballRadius >= groundY || this.ballX > this.canvas.width - 50) {
            this.isRunning = false;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.canvas.height - 55, this.canvas.width, 5);

        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(50, this.canvas.height - 180, 70, 130);

        if (this.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            this.ctx.stroke();
        }

        const gradient = this.ctx.createRadialGradient(
            this.ballX - 4, this.ballY - 4, 0,
            this.ballX, this.ballY, this.ballRadius
        );
        gradient.addColorStop(0, '#4ecdc4');
        gradient.addColorStop(1, '#1a535c');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fill();

        if (this.isRunning || this.time > 0) {
            const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
            const arrowScale = 1.5;

            this.ctx.strokeStyle = '#28a745';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ballX, this.ballY);
            this.ctx.lineTo(this.ballX + this.velocityX * arrowScale, this.ballY);
            this.ctx.stroke();

            this.ctx.strokeStyle = '#dc3545';
            this.ctx.beginPath();
            this.ctx.moveTo(this.ballX, this.ballY);
            this.ctx.lineTo(this.ballX, this.ballY + this.velocityY * arrowScale);
            this.ctx.stroke();

            this.ctx.strokeStyle = '#ffc107';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(this.ballX, this.ballY);
            this.ctx.lineTo(this.ballX + this.velocityX * arrowScale, this.ballY + this.velocityY * arrowScale);
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffc107';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(`v合=${currentSpeed.toFixed(1)}m/s`, this.ballX + 25, this.ballY - 10);
        }

        const startX = 100;
        const startY = this.canvas.height - 180;
        const rad = (this.angle * Math.PI) / 180;
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + 70 * Math.cos(rad), startY + 70 * Math.sin(-rad));
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`θ = ${this.angle}°`, startX + 75, startY - 30);
    }

    getData() {
        const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '水平位移': { value: ((this.ballX - 100) / 3).toFixed(1), unit: 'm' },
            '竖直位移': { value: ((this.canvas.height - 180 - this.ballY) / 3).toFixed(1), unit: 'm' },
            '合速度': { value: currentSpeed.toFixed(1), unit: 'm/s' }
        };
    }

    getFormula() { return 'x = v₀cosθ·t, y = v₀sinθ·t - ½gt²'; }
}

// ==================== 弹簧振子 ====================
class SpringExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.springConstant = 50;
        this.mass = 2;
        this.position = 0;
        this.velocity = 0;
        this.time = 0;
        this.amplitude = 100;
        this.trail = [];
    }

    getTitle() { return '弹簧振子'; }

    setup() {
        this.resizeCanvas();
        this.reset();
    }

    reset() {
        super.reset();
        this.position = this.amplitude;
        this.velocity = 0;
        this.time = 0;
        this.trail = [];
        this.draw();
    }

    getControls() {
        return [
            { name: '劲度系数', type: 'range', min: 10, max: 200, value: this.springConstant, step: 5, key: 'springConstant', unit: 'N/m' },
            { name: '质量', type: 'range', min: 0.5, max: 10, value: this.mass, step: 0.5, key: 'mass', unit: 'kg' },
            { name: '振幅', type: 'range', min: 30, max: 150, value: this.amplitude, step: 10, key: 'amplitude', unit: '' }
        ];
    }

    updateControl(key, value) {
        if (key === 'springConstant') this.springConstant = value;
        if (key === 'mass') this.mass = value;
        if (key === 'amplitude') {
            this.amplitude = value;
            this.position = value;
        }
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        this.time += deltaTime;
        const omega = Math.sqrt(this.springConstant / this.mass);
        const acceleration = -(this.springConstant / this.mass) * this.position;
        this.velocity += acceleration * deltaTime * 20;
        this.position += this.velocity * deltaTime * 20;

        this.trail.push({ x: this.position, y: this.time });
        if (this.trail.length > 300) this.trail.shift();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerX = this.canvas.width / 2;
        const centerY = 150;
        const massY = centerY + 50 + this.position;

        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(centerX - 80, 20, 160, 20);

        const springTop = centerY;
        const springBottom = massY - 25;
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, springTop);
        const coils = 10;
        const coilWidth = 20;
        const springLength = springBottom - springTop;
        for (let i = 0; i <= coils; i++) {
            const y = springTop + (springLength / coils) * i;
            const xOffset = (i % 2 === 0 ? -coilWidth / 2 : coilWidth / 2);
            this.ctx.lineTo(centerX + xOffset, y);
        }
        this.ctx.stroke();

        const gradient = this.ctx.createRadialGradient(centerX - 5, massY - 5, 0, centerX, massY, 30);
        gradient.addColorStop(0, '#20c997');
        gradient.addColorStop(1, '#0f7d5e');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, massY, 28, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 100, centerY + 50);
        this.ctx.lineTo(centerX + 100, centerY + 50);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY + 50);
        this.ctx.lineTo(centerX, massY);
        this.ctx.stroke();

        this.ctx.fillStyle = '#667eea';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`x = ${this.position.toFixed(1)}`, centerX + 15, (centerY + 50 + massY) / 2);

        const restoringForce = -this.springConstant * this.position / 100;
        this.ctx.strokeStyle = '#dc3545';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, massY);
        this.ctx.lineTo(centerX + restoringForce * 2, massY);
        this.ctx.stroke();

        this.ctx.fillStyle = '#dc3545';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.fillText(`F = ${restoringForce.toFixed(2)}N`, centerX + restoringForce * 2 + 10, massY + 5);

        const graphTop = this.canvas.height - 200;
        const graphHeight = 150;
        const graphLeft = 50;
        const graphWidth = this.canvas.width - 100;

        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

        this.ctx.strokeStyle = '#999';
        this.ctx.beginPath();
        this.ctx.moveTo(graphLeft, graphTop + graphHeight / 2);
        this.ctx.lineTo(graphLeft + graphWidth, graphTop + graphHeight / 2);
        this.ctx.stroke();

        if (this.trail.length > 1) {
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            const scaleX = graphWidth / Math.max(this.trail.length, 100);
            const scaleY = graphHeight / (this.amplitude * 3);
            this.ctx.moveTo(graphLeft, graphTop + graphHeight / 2 - this.trail[0].x * scaleY);
            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(graphLeft + i * scaleX, graphTop + graphHeight / 2 - this.trail[i].x * scaleY);
            }
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('位移-时间图', graphLeft, graphTop - 10);
    }

    getData() {
        const omega = Math.sqrt(this.springConstant / this.mass);
        const period = 2 * Math.PI / omega;
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '位移': { value: this.position.toFixed(1), unit: '' },
            '速度': { value: this.velocity.toFixed(1), unit: '' },
            '周期': { value: period.toFixed(2), unit: 's' }
        };
    }

    getFormula() { return 'F = -kx, T = 2π√(m/k)'; }
}

// ==================== 单摆 ====================
class PendulumExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.length = 180;
        this.angle = Math.PI / 4;
        this.angularVelocity = 0;
        this.gravity = 9.8;
        this.time = 0;
        this.trail = [];
    }

    getTitle() { return '单摆'; }

    setup() {
        this.resizeCanvas();
        this.reset();
    }

    reset() {
        super.reset();
        this.angle = Math.PI / 4;
        this.angularVelocity = 0;
        this.time = 0;
        this.trail = [];
        this.draw();
    }

    getControls() {
        return [
            { name: '摆长', type: 'range', min: 100, max: 300, value: this.length, step: 10, key: 'length', unit: '' },
            { name: '重力加速度', type: 'range', min: 1, max: 20, value: this.gravity, step: 0.1, key: 'gravity', unit: 'm/s²' }
        ];
    }

    updateControl(key, value) {
        if (key === 'length') this.length = value;
        if (key === 'gravity') this.gravity = value;
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        this.time += deltaTime;
        const angularAcceleration = -(this.gravity / this.length * 100) * Math.sin(this.angle);
        this.angularVelocity += angularAcceleration * deltaTime;
        this.angle += this.angularVelocity * deltaTime;

        const pivotX = this.canvas.width / 2;
        const pivotY = 100;
        const bobX = pivotX + this.length * Math.sin(this.angle);
        const bobY = pivotY + this.length * Math.cos(this.angle);
        
        this.trail.push({ x: bobX, y: bobY });
        if (this.trail.length > 100) this.trail.shift();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const pivotX = this.canvas.width / 2;
        const pivotY = 100;
        const bobX = pivotX + this.length * Math.sin(this.angle);
        const bobY = pivotY + this.length * Math.cos(this.angle);

        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(pivotX - 60, pivotY - 20, 120, 20);

        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.25)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(pivotX, pivotY, this.length, Math.PI / 2 - 1, Math.PI / 2 + 1);
        this.ctx.stroke();

        if (this.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(255, 193, 7, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            this.ctx.stroke();
        }

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(pivotX, pivotY);
        this.ctx.lineTo(bobX, bobY);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(pivotX, pivotY);
        this.ctx.lineTo(pivotX, pivotY + this.length + 30);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        const gradient = this.ctx.createRadialGradient(bobX - 5, bobY - 5, 0, bobX, bobY, 22);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(bobX, bobY, 22, 0, Math.PI * 2);
        this.ctx.fill();

        const gForce = this.gravity * 0.5;
        this.ctx.strokeStyle = '#28a745';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(bobX, bobY);
        this.ctx.lineTo(bobX, bobY + gForce * 10);
        this.ctx.stroke();
        this.ctx.fillStyle = '#28a745';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.fillText('mg', bobX + 10, bobY + gForce * 5);

        const tensionForce = this.gravity * Math.cos(this.angle);
        const tensionX = -Math.sin(this.angle) * tensionForce * 10;
        const tensionY = -Math.cos(this.angle) * tensionForce * 10;
        this.ctx.strokeStyle = '#17a2b8';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(bobX, bobY);
        this.ctx.lineTo(bobX + tensionX, bobY + tensionY);
        this.ctx.stroke();
        this.ctx.fillStyle = '#17a2b8';
        this.ctx.fillText('T', bobX + tensionX - 20, bobY + tensionY);

        const restoringForce = -this.gravity * Math.sin(this.angle);
        this.ctx.strokeStyle = '#dc3545';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(bobX, bobY);
        this.ctx.lineTo(bobX + restoringForce * 15, bobY);
        this.ctx.stroke();
        this.ctx.fillStyle = '#dc3545';
        this.ctx.fillText('F回', bobX + restoringForce * 15 + 5, bobY - 5);

        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`θ = ${(this.angle * 180 / Math.PI).toFixed(1)}°`, pivotX + 30, pivotY + 50);
    }

    getData() {
        const period = 2 * Math.PI * Math.sqrt(this.length / (this.gravity * 100));
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '摆角': { value: (this.angle * 180 / Math.PI).toFixed(1), unit: '°' },
            '周期': { value: period.toFixed(2), unit: 's' },
            '角速度': { value: this.angularVelocity.toFixed(3), unit: 'rad/s' }
        };
    }

    getFormula() { return 'T = 2π√(L/g), F = -mgsinθ'; }
}

// ==================== 欧姆定律 ====================
class OhmExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.voltage = 12;
        this.resistance = 100;
        this.current = 0;
        this.electronPositions = [];
        for (let i = 0; i < 10; i++) {
            this.electronPositions.push(i / 10);
        }
    }

    getTitle() { return '欧姆定律'; }

    setup() {
        this.resizeCanvas();
        this.current = this.voltage / this.resistance;
        this.draw();
    }

    reset() {
        super.reset();
        this.draw();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
    }

    getControls() {
        return [
            { name: '电压', type: 'range', min: 1, max: 24, value: this.voltage, step: 1, key: 'voltage', unit: 'V' },
            { name: '电阻', type: 'range', min: 10, max: 500, value: this.resistance, step: 10, key: 'resistance', unit: 'Ω' }
        ];
    }

    updateControl(key, value) {
        if (key === 'voltage') this.voltage = value;
        if (key === 'resistance') this.resistance = value;
        this.current = this.voltage / this.resistance;
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;
        const speed = this.current * 3;
        for (let i = 0; i < this.electronPositions.length; i++) {
            this.electronPositions[i] += speed * deltaTime;
            if (this.electronPositions[i] > 1) this.electronPositions[i] -= 1;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerY = this.canvas.height / 2;
        const startX = 100;
        const endX = this.canvas.width - 100;
        const circuitWidth = endX - startX;

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, centerY - 80);
        this.ctx.lineTo(endX, centerY - 80);
        this.ctx.lineTo(endX, centerY + 80);
        this.ctx.lineTo(startX, centerY + 80);
        this.ctx.closePath();
        this.ctx.stroke();

        const batteryX = startX;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(batteryX - 5, centerY - 40, 10, 80);
        this.ctx.strokeStyle = '#dc3545';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(batteryX, centerY - 25);
        this.ctx.lineTo(batteryX, centerY - 10);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(batteryX - 8, centerY - 17);
        this.ctx.lineTo(batteryX + 8, centerY - 17);
        this.ctx.stroke();

        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.voltage}V`, batteryX, centerY + 55);
        this.ctx.fillText('+', batteryX - 25, centerY - 65);
        this.ctx.fillText('-', batteryX - 25, centerY + 65);

        const resistorX = (startX + endX) / 2;
        this.ctx.fillStyle = '#ffc107';
        this.ctx.fillRect(resistorX - 30, centerY - 90, 60, 20);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(resistorX - 25 + i * 12, centerY - 88);
            this.ctx.lineTo(resistorX - 25 + i * 12 + 6, centerY - 72);
            this.ctx.stroke();
        }
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText(`${this.resistance}Ω`, resistorX, centerY - 95);

        const ammeterX = endX - 40;
        this.ctx.strokeStyle = '#17a2b8';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(ammeterX, centerY, 25, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#17a2b8';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('A', ammeterX, centerY + 5);
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`${(this.current * 1000).toFixed(0)}mA`, ammeterX, centerY + 45);

        if (this.isRunning) {
            this.electronPositions.forEach(pos => {
                let ex, ey;
                if (pos < 0.33) {
                    const p = pos / 0.33;
                    ex = startX + p * (endX - startX);
                    ey = centerY - 80;
                } else if (pos < 0.66) {
                    const p = (pos - 0.33) / 0.33;
                    ex = endX;
                    ey = centerY - 80 + p * 160;
                } else {
                    const p = (pos - 0.66) / 0.34;
                    ex = endX - p * (endX - startX);
                    ey = centerY + 80;
                }
                
                this.ctx.fillStyle = '#007bff';
                this.ctx.beginPath();
                this.ctx.arc(ex, ey, 6, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 8px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('-', ex, ey + 3);
            });
        }

        this.ctx.fillStyle = '#28a745';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`电流 I = V / R = ${this.voltage}V / ${this.resistance}Ω = ${(this.current * 1000).toFixed(1)} mA`, this.canvas.width / 2, 60);

        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('电子流动方向', (startX + endX) / 2, centerY + 110);
    }

    getData() {
        return {
            '电压': { value: this.voltage.toFixed(1), unit: 'V' },
            '电阻': { value: this.resistance.toFixed(1), unit: 'Ω' },
            '电流': { value: (this.current * 1000).toFixed(1), unit: 'mA' }
        };
    }

    getFormula() { return 'I = U / R'; }
}

// ==================== 串并联电路 ====================
class CircuitExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.voltage = 12;
        this.circuitType = 0;
        this.resistor1 = 100;
        this.resistor2 = 200;
        this.electronPositions = [];
        for (let i = 0; i < 8; i++) {
            this.electronPositions.push(i / 8);
        }
    }

    getTitle() { return '串联与并联电路'; }

    setup() {
        this.resizeCanvas();
        this.draw();
    }

    reset() {
        super.reset();
        this.draw();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
    }

    getControls() {
        return [
            { name: '电路类型', type: 'radio', options: ['串联', '并联'], value: this.circuitType, key: 'circuitType', unit: '' },
            { name: '电压', type: 'range', min: 1, max: 24, value: this.voltage, step: 1, key: 'voltage', unit: 'V' },
            { name: '电阻R1', type: 'range', min: 50, max: 300, value: this.resistor1, step: 10, key: 'resistor1', unit: 'Ω' },
            { name: '电阻R2', type: 'range', min: 50, max: 300, value: this.resistor2, step: 10, key: 'resistor2', unit: 'Ω' }
        ];
    }

    updateControl(key, value) {
        if (key === 'voltage') this.voltage = value;
        if (key === 'circuitType') this.circuitType = value;
        if (key === 'resistor1') this.resistor1 = value;
        if (key === 'resistor2') this.resistor2 = value;
    }

    getTotalResistance() {
        if (this.circuitType === 0) {
            return this.resistor1 + this.resistor2;
        } else {
            return (this.resistor1 * this.resistor2) / (this.resistor1 + this.resistor2);
        }
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;
        const speed = (this.voltage / this.getTotalResistance()) * 5;
        for (let i = 0; i < this.electronPositions.length; i++) {
            this.electronPositions[i] += speed * deltaTime;
            if (this.electronPositions[i] > 1) this.electronPositions[i] -= 1;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const centerY = this.canvas.height / 2;
        const startX = 100;
        const endX = this.canvas.width - 100;

        if (this.circuitType === 0) {
            this.drawSeriesCircuit(startX, endX, centerY);
        } else {
            this.drawParallelCircuit(startX, endX, centerY);
        }

        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        const totalR = this.getTotalResistance();
        const totalI = this.voltage / totalR;
        this.ctx.fillText(`总电阻 R总 = ${totalR.toFixed(1)}Ω, 总电流 I总 = ${(totalI * 1000).toFixed(1)}mA`, this.canvas.width / 2, 50);
    }

    drawSeriesCircuit(startX, endX, centerY) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, centerY - 60);
        this.ctx.lineTo(endX, centerY - 60);
        this.ctx.lineTo(endX, centerY + 60);
        this.ctx.lineTo(startX, centerY + 60);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(startX - 5, centerY - 30, 10, 60);
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.voltage}V`, startX, centerY + 45);

        const r1X = startX + (endX - startX) / 3;
        this.drawResistor(r1X, centerY - 70, `R1=${this.resistor1}Ω`);

        const r2X = startX + 2 * (endX - startX) / 3;
        this.drawResistor(r2X, centerY - 70, `R2=${this.resistor2}Ω`);

        if (this.isRunning) {
            this.electronPositions.forEach(pos => {
                let ex, ey;
                const circuitLength = 2 * (endX - startX) + 240;
                const currentPos = pos * circuitLength;
                
                if (currentPos < endX - startX) {
                    ex = startX + currentPos;
                    ey = centerY - 60;
                } else if (currentPos < endX - startX + 120) {
                    ex = endX;
                    ey = centerY - 60 + (currentPos - (endX - startX));
                } else if (currentPos < 2 * (endX - startX) + 120) {
                    ex = endX - (currentPos - (endX - startX + 120));
                    ey = centerY + 60;
                } else {
                    ex = startX;
                    ey = centerY + 60 - (currentPos - 2 * (endX - startX) - 120);
                }
                
                this.drawElectron(ex, ey);
            });
        }
    }

    drawParallelCircuit(startX, endX, centerY) {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, centerY - 80);
        this.ctx.lineTo(startX + 80, centerY - 80);
        this.ctx.lineTo(startX + 80, centerY - 40);
        this.ctx.lineTo(endX - 80, centerY - 40);
        this.ctx.lineTo(endX - 80, centerY - 80);
        this.ctx.lineTo(endX, centerY - 80);
        this.ctx.lineTo(endX, centerY + 80);
        this.ctx.lineTo(endX - 80, centerY + 80);
        this.ctx.lineTo(endX - 80, centerY + 40);
        this.ctx.lineTo(startX + 80, centerY + 40);
        this.ctx.lineTo(startX + 80, centerY + 80);
        this.ctx.lineTo(startX, centerY + 80);
        this.ctx.closePath();
        this.ctx.stroke();

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(startX - 5, centerY - 25, 10, 50);
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.voltage}V`, startX, centerY + 45);

        this.drawResistor(startX + 200, centerY - 50, `R1=${this.resistor1}Ω`);
        this.drawResistor(startX + 200, centerY + 30, `R2=${this.resistor2}Ω`);

        if (this.isRunning) {
            this.electronPositions.forEach(pos => {
                let ex, ey;
                if (pos < 0.5) {
                    const p = pos * 2;
                    ex = startX + p * (endX - startX - 160) + 80;
                    ey = centerY - 40;
                } else {
                    const p = (pos - 0.5) * 2;
                    ex = endX - 80 - p * (endX - startX - 160);
                    ey = centerY + 40;
                }
                this.drawElectron(ex, ey);
            });
        }
    }

    drawResistor(x, y, label) {
        this.ctx.fillStyle = '#ffc107';
        this.ctx.fillRect(x - 25, y - 8, 50, 16);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - 20 + i * 13, y - 6);
            this.ctx.lineTo(x - 20 + i * 13 + 6, y + 6);
            this.ctx.stroke();
        }
        this.ctx.fillStyle = '#333';
        this.ctx.font = '11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, x, y - 15);
    }

    drawElectron(x, y) {
        this.ctx.fillStyle = '#007bff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }

    getData() {
        const totalR = this.getTotalResistance();
        const totalI = this.voltage / totalR;
        const i1 = this.circuitType === 0 ? totalI : this.voltage / this.resistor1;
        const i2 = this.circuitType === 0 ? totalI : this.voltage / this.resistor2;
        return {
            '总电压': { value: this.voltage.toFixed(1), unit: 'V' },
            '总电阻': { value: totalR.toFixed(1), unit: 'Ω' },
            '总电流': { value: (totalI * 1000).toFixed(1), unit: 'mA' },
            'R1电流': { value: (i1 * 1000).toFixed(1), unit: 'mA' },
            'R2电流': { value: (i2 * 1000).toFixed(1), unit: 'mA' }
        };
    }

    getFormula() { 
        return this.circuitType === 0 ? 
            '串联: R总 = R1 + R2, I相等' : 
            '并联: 1/R总 = 1/R1 + 1/R2, V相等'; 
    }
}

// ==================== 凸透镜成像 ====================
class LensExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.objectDistance = 200;
        this.focalLength = 80;
        this.objectHeight = 50;
    }

    getTitle() { return '凸透镜成像'; }

    setup() {
        this.resizeCanvas();
        this.draw();
    }

    reset() {
        super.reset();
        this.draw();
    }

    getControls() {
        return [
            { name: '物距', type: 'range', min: 40, max: 300, value: this.objectDistance, step: 10, key: 'objectDistance', unit: '' },
            { name: '焦距', type: 'range', min: 40, max: 120, value: this.focalLength, step: 10, key: 'focalLength', unit: '' }
        ];
    }

    updateControl(key, value) {
        if (key === 'objectDistance') this.objectDistance = value;
        if (key === 'focalLength') this.focalLength = value;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerY = this.canvas.height / 2;
        const lensX = this.canvas.width / 2;

        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(50, centerY);
        this.ctx.lineTo(this.canvas.width - 50, centerY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(lensX, centerY - 100);
        this.ctx.quadraticCurveTo(lensX + 15, centerY, lensX, centerY + 100);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(lensX, centerY - 100);
        this.ctx.quadraticCurveTo(lensX - 15, centerY, lensX, centerY + 100);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffc107';
        this.ctx.beginPath();
        this.ctx.arc(lensX - this.focalLength, centerY, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(lensX + this.focalLength, centerY, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(lensX + 2 * this.focalLength, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(lensX - 2 * this.focalLength, centerY, 5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#666';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('F', lensX - this.focalLength - 5, centerY + 25);
        this.ctx.fillText("F'", lensX + this.focalLength - 5, centerY + 25);
        this.ctx.fillText('2F', lensX - 2 * this.focalLength - 10, centerY + 25);
        this.ctx.fillText("2F'", lensX + 2 * this.focalLength - 12, centerY + 25);

        const objX = lensX - this.objectDistance;
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(objX, centerY);
        this.ctx.lineTo(objX, centerY - this.objectHeight);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(objX - 8, centerY - this.objectHeight + 15);
        this.ctx.lineTo(objX, centerY - this.objectHeight);
        this.ctx.lineTo(objX + 8, centerY - this.objectHeight + 15);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('物体', objX - 15, centerY + 25);

        const imageDistance = (this.objectDistance * this.focalLength) / (this.objectDistance - this.focalLength);
        const magnification = -imageDistance / this.objectDistance;
        const imageHeight = this.objectHeight * magnification;

        if (Math.abs(imageDistance) < 350 && isFinite(imageDistance)) {
            const imgX = lensX + imageDistance;
            
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(objX, centerY - this.objectHeight);
            this.ctx.lineTo(lensX, centerY - this.objectHeight);
            this.ctx.lineTo(imgX, centerY - imageHeight);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(objX, centerY - this.objectHeight);
            this.ctx.lineTo(lensX, centerY);
            this.ctx.lineTo(imgX, centerY - imageHeight);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            this.ctx.strokeStyle = imageHeight > 0 ? '#4ecdc4' : 'rgba(78, 205, 196, 0.5)';
            this.ctx.lineWidth = 4;
            if (imageHeight < 0) this.ctx.setLineDash([6, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(imgX, centerY);
            this.ctx.lineTo(imgX, centerY - imageHeight);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(imageHeight > 0 ? '实像' : '虚像', imgX + 5, centerY + 25);
        }

        this.ctx.fillStyle = '#333';
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'left';
        const u = this.objectDistance;
        const f = this.focalLength;
        let imgType = '';
        if (u > 2 * f) imgType = '倒立、缩小、实像 (照相机)';
        else if (Math.abs(u - 2 * f) < 5) imgType = '倒立、等大、实像';
        else if (u > f) imgType = '倒立、放大、实像 (投影仪)';
        else if (Math.abs(u - f) < 5) imgType = '不成像 (平行光)';
        else imgType = '正立、放大、虚像 (放大镜)';
        
        this.ctx.fillText(`物距 u = ${u} (${imgType})`, 50, 50);
    }

    getData() {
        const imageDistance = (this.objectDistance * this.focalLength) / (this.objectDistance - this.focalLength);
        const magnification = -imageDistance / this.objectDistance;
        return {
            '物距 u': { value: this.objectDistance.toFixed(0), unit: '' },
            '像距 v': { value: isFinite(imageDistance) ? imageDistance.toFixed(1) : '∞', unit: '' },
            '焦距 f': { value: this.focalLength.toFixed(0), unit: '' },
            '放大率': { value: isFinite(magnification) ? Math.abs(magnification).toFixed(2) : '∞', unit: 'x' }
        };
    }

    getFormula() { return '1/f = 1/u + 1/v, m = v/u'; }
}

// ==================== 光的反射 ====================
class ReflectionExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.incidentAngle = 45;
        this.showAnalysis = true;
        this.hasAnalysisToggle = true;
    }

    getTitle() { return '光的反射定律'; }

    setup() {
        this.resizeCanvas();
        this.draw();
    }

    reset() {
        super.reset();
        this.draw();
    }

    toggleAnalysis() {
        this.showAnalysis = !this.showAnalysis;
        return this.showAnalysis;
    }

    getControls() {
        return [
            { name: '入射角', type: 'range', min: 5, max: 85, value: this.incidentAngle, step: 5, key: 'incidentAngle', unit: '°' }
        ];
    }

    updateControl(key, value) {
        if (key === 'incidentAngle') this.incidentAngle = value;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 + 50;
        const rayLength = 250;
        const rad = (this.incidentAngle * Math.PI) / 180;

        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, centerY);

        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, centerY, this.canvas.width, this.canvas.height - centerY);
        for (let i = 0; i < this.canvas.width; i += 20) {
            this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(i, centerY);
            this.ctx.lineTo(i + 10, centerY + 15);
            this.ctx.stroke();
        }

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(50, centerY);
        this.ctx.lineTo(this.canvas.width - 50, centerY);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 180);
        this.ctx.lineTo(centerX, centerY + 50);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        const incidentEndX = centerX - rayLength * Math.sin(rad);
        const incidentEndY = centerY - rayLength * Math.cos(rad);
        const reflectedEndX = centerX + rayLength * Math.sin(rad);
        const reflectedEndY = centerY - rayLength * Math.cos(rad);

        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(incidentEndX, incidentEndY);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.stroke();

        const arrowSize = 15;
        const arrowPos = 0.7;
        const ax = incidentEndX + (centerX - incidentEndX) * arrowPos;
        const ay = incidentEndY + (centerY - incidentEndY) * arrowPos;
        this.ctx.beginPath();
        this.ctx.moveTo(ax, ay);
        this.ctx.lineTo(ax + Math.sin(rad - 0.3) * arrowSize, ay + Math.cos(rad - 0.3) * arrowSize);
        this.ctx.moveTo(ax, ay);
        this.ctx.lineTo(ax + Math.sin(rad + 0.3) * arrowSize, ay + Math.cos(rad + 0.3) * arrowSize);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#4ecdc4';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(reflectedEndX, reflectedEndY);
        this.ctx.stroke();

        const rx = centerX + (reflectedEndX - centerX) * 0.5;
        const ry = centerY + (reflectedEndY - centerY) * 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(rx, ry);
        this.ctx.lineTo(rx - Math.sin(rad - 0.3) * arrowSize, ry - Math.cos(rad - 0.3) * arrowSize);
        this.ctx.moveTo(rx, ry);
        this.ctx.lineTo(rx - Math.sin(rad + 0.3) * arrowSize, ry - Math.cos(rad + 0.3) * arrowSize);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('入射光线', incidentEndX + 40, incidentEndY - 10);
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.fillText('反射光线', reflectedEndX - 40, reflectedEndY - 10);
        this.ctx.fillStyle = '#999';
        this.ctx.fillText('法线', centerX + 30, centerY - 160);

        if (this.showAnalysis) {
            this.ctx.strokeStyle = '#ffc107';
            this.ctx.lineWidth = 2;
            const arcRadius = 60;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, arcRadius, -Math.PI / 2, -Math.PI / 2 + rad, false);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, arcRadius, -Math.PI / 2 - rad, -Math.PI / 2, true);
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffc107';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(`入射角 ${this.incidentAngle}°`, centerX - 80, centerY - arcRadius - 10);
            this.ctx.fillText(`反射角 ${this.incidentAngle}°`, centerX + 30, centerY - arcRadius - 10);
        }
    }

    getData() {
        return {
            '入射角': { value: this.incidentAngle.toFixed(0), unit: '°' },
            '反射角': { value: this.incidentAngle.toFixed(0), unit: '°' }
        };
    }

    getFormula() { return '入射角 = 反射角, 反射光线、入射光线和法线在同一平面'; }
}

// ==================== 理想气体状态方程 ====================
class GasExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.particles = [];
        this.pressure = 101;
        this.temperature = 300;
        this.volume = 1;
        this.animationTime = 0;
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const count = Math.floor(50 * this.volume);
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * 200 + 50,
                y: Math.random() * 200 + 50,
                vx: (Math.random() - 0.5) * this.temperature / 50,
                vy: (Math.random() - 0.5) * this.temperature / 50,
                radius: 5 + Math.random() * 3
            });
        }
    }

    getTitle() { return '理想气体状态方程'; }

    setup() {
        this.resizeCanvas();
        this.initParticles();
        this.draw();
    }

    reset() {
        super.reset();
        this.initParticles();
        this.draw();
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
    }

    getControls() {
        return [
            { name: '温度 T', type: 'range', min: 100, max: 500, value: this.temperature, step: 10, key: 'temperature', unit: 'K' },
            { name: '体积 V', type: 'range', min: 0.5, max: 2, value: this.volume, step: 0.1, key: 'volume', unit: 'm³' },
            { name: '压强 P', type: 'range', min: 50, max: 200, value: this.pressure, step: 5, key: 'pressure', unit: 'kPa' }
        ];
    }

    updateControl(key, value) {
        if (key === 'temperature') {
            this.temperature = value;
            this.pressure = (this.temperature * 1 * 8.314) / (this.volume * 0.0224) / 1000;
        }
        if (key === 'volume') {
            this.volume = value;
            this.pressure = (this.temperature * 1 * 8.314) / (this.volume * 0.0224) / 1000;
            this.initParticles();
        }
        if (key === 'pressure') {
            this.pressure = value;
            this.temperature = (this.pressure * this.volume * 0.0224 * 1000) / 8.314;
        }
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;
        this.animationTime += deltaTime;

        const speed = this.temperature / 300;
        this.particles.forEach(p => {
            p.x += p.vx * speed;
            p.y += p.vy * speed;

            if (p.x < 30 || p.x > this.canvas.width - 30) p.vx *= -1;
            if (p.y < 30 || p.y > this.canvas.height - 100) p.vy *= -1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const containerWidth = 300 * this.volume;
        const containerHeight = 300;
        const startX = (this.canvas.width - containerWidth) / 2;
        const startY = 80;

        this.ctx.fillStyle = '#e3f2fd';
        this.ctx.fillRect(startX, startY, containerWidth, containerHeight);

        this.ctx.strokeStyle = '#1976d2';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(startX, startY, containerWidth, containerHeight);

        const colorIntensity = Math.min(1, (this.temperature - 100) / 400);
        this.particles.forEach(p => {
            const gradient = this.ctx.createRadialGradient(p.x + startX - 100, p.y, 0, p.x + startX - 100, p.y, p.radius);
            gradient.addColorStop(0, `rgba(${Math.floor(255 * colorIntensity)}, ${Math.floor(100 + 155 * (1 - colorIntensity))}, 255, 0.8)`);
            gradient.addColorStop(1, `rgba(${Math.floor(200 * colorIntensity)}, ${Math.floor(50 + 150 * (1 - colorIntensity))}, 200, 0.4)`);
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x + startX - 100, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('气体分子运动模拟', this.canvas.width / 2, 50);
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`粒子数: ${this.particles.length}`, this.canvas.width / 2, startY + containerHeight + 30);

        if (this.temperature > 400) {
            this.ctx.fillStyle = '#ff5722';
            this.ctx.fillText('⚠ 高温状态', this.canvas.width / 2, startY + containerHeight + 55);
        } else if (this.temperature < 150) {
            this.ctx.fillStyle = '#2196f3';
            this.ctx.fillText('❄ 低温状态', this.canvas.width / 2, startY + containerHeight + 55);
        }
    }

    getData() {
        return {
            '压强 P': { value: this.pressure.toFixed(1), unit: 'kPa' },
            '体积 V': { value: this.volume.toFixed(2), unit: 'm³' },
            '温度 T': { value: this.temperature.toFixed(0), unit: 'K' },
            'PV/T': { value: ((this.pressure * this.volume / this.temperature) * 1000).toFixed(2), unit: '' }
        };
    }

    getFormula() { return 'PV = nRT, 理想气体状态方程 (玻意耳定律、查理定律、盖-吕萨克定律)'; }
}

const experiments = {
    freefall: FreeFallExperiment,
    projectile: ProjectileExperiment,
    spring: SpringExperiment,
    pendulum: PendulumExperiment,
    ohm: OhmExperiment,
    circuit: CircuitExperiment,
    lens: LensExperiment,
    reflection: ReflectionExperiment,
    gas: GasExperiment
};