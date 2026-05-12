class PhysicsExperiment {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
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
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.data = {};
    }
    getControls() { return []; }
    getData() { return {}; }
    getFormula() { return ''; }
    getTitle() { return ''; }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
}

class FreeFallExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.gravity = 9.8;
        this.height = 100;
        this.ballY = 50;
        this.ballRadius = 15;
        this.velocity = 0;
        this.time = 0;
        this.trail = [];
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
        this.trail = [];
        this.draw();
    }

    getControls() {
        return [
            { name: '下落高度', type: 'range', min: 50, max: 200, value: this.height, step: 10, key: 'height', unit: 'm' },
            { name: '重力加速度', type: 'range', min: 1, max: 20, value: this.gravity, step: 0.1, key: 'gravity', unit: 'm/s²' }
        ];
    }

    updateControl(key, value) {
        if (key === 'height') this.height = value;
        if (key === 'gravity') this.gravity = value;
    }

    update(deltaTime) {
        if (!this.isRunning || this.isPaused) return;

        this.time += deltaTime;
        this.velocity += this.gravity * deltaTime;
        this.ballY += this.velocity * deltaTime * 2;

        this.trail.push({ x: this.canvas.width / 2, y: this.ballY });
        if (this.trail.length > 50) this.trail.shift();

        const groundY = this.canvas.height - 80;
        if (this.ballY + this.ballRadius >= groundY) {
            this.ballY = groundY - this.ballRadius;
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

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 50);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height - 55);
        this.ctx.stroke();

        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
        for (let i = 0; i < this.trail.length; i++) {
            this.ctx.beginPath();
            this.ctx.arc(this.trail[i].x, this.trail[i].y, this.ballRadius * (i / this.trail.length), 0, Math.PI * 2);
            this.ctx.fill();
        }

        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2 - 5, this.ballY - 5, 0,
            this.canvas.width / 2, this.ballY, this.ballRadius
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.ballY, this.ballRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`h = ${this.height} m`, this.canvas.width / 2 + 30, 80);
    }

    getData() {
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '速度': { value: this.velocity.toFixed(2), unit: 'm/s' },
            '下落距离': { value: Math.max(0, this.ballY - 50).toFixed(2), unit: 'm' }
        };
    }

    getFormula() {
        return 'v = gt, h = ½gt²';
    }
}

class ProjectileExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.initialVelocity = 50;
        this.angle = 45;
        this.gravity = 9.8;
        this.ballX = 80;
        this.ballY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.time = 0;
        this.trail = [];
        this.ballRadius = 12;
    }

    getTitle() { return '平抛运动'; }

    setup() {
        this.resizeCanvas();
        this.reset();
    }

    reset() {
        super.reset();
        this.ballX = 80;
        this.ballY = this.canvas.height - 150;
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
            { name: '抛射角', type: 'range', min: 10, max: 80, value: this.angle, step: 5, key: 'angle', unit: '°' },
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

        this.trail.push({ x: this.ballX, y: this.ballY });
        if (this.trail.length > 100) this.trail.shift();

        const groundY = this.canvas.height - 80;
        if (this.ballY + this.ballRadius >= groundY || this.ballX > this.canvas.width) {
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
        this.ctx.fillRect(30, this.canvas.height - 150, 50, 100);

        if (this.trail.length > 1) {
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
            this.ctx.lineWidth = 2;
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

        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(80, this.canvas.height - 150);
        const rad = (this.angle * Math.PI) / 180;
        this.ctx.lineTo(80 + 60 * Math.cos(rad), this.canvas.height - 150 - 60 * Math.sin(rad));
        this.ctx.stroke();
    }

    getData() {
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '水平位移': { value: ((this.ballX - 80) / 3).toFixed(2), unit: 'm' },
            '竖直位移': { value: ((this.canvas.height - 150 - this.ballY) / 3).toFixed(2), unit: 'm' },
            '合速度': { value: Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2).toFixed(2), unit: 'm/s' }
        };
    }

    getFormula() {
        return 'x = v₀cosθ·t, y = v₀sinθ·t - ½gt²';
    }
}

class OhmExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.voltage = 12;
        this.resistance = 100;
        this.current = 0;
        this.flowPosition = 0;
    }

    getTitle() { return '欧姆定律'; }

    setup() {
        this.resizeCanvas();
        this.current = this.voltage / this.resistance;
        this.draw();
    }

    reset() {
        super.reset();
        this.flowPosition = 0;
        this.draw();
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
        this.flowPosition += this.current * deltaTime * 50;
        if (this.flowPosition > 1) this.flowPosition = 0;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const centerY = this.canvas.height / 2;
        const centerX = this.canvas.width / 2;

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(100, centerY);
        this.ctx.lineTo(this.canvas.width - 100, centerY);
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffc107';
        this.ctx.fillRect(80, centerY - 25, 20, 50);
        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`${this.voltage}V`, 75, centerY + 45);

        this.ctx.fillStyle = '#dc3545';
        this.ctx.fillRect(centerX - 30, centerY - 30, 60, 60);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('R', centerX, centerY + 5);
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`${this.resistance}Ω`, centerX, centerY + 50);
        this.ctx.textAlign = 'left';

        if (this.isRunning) {
            this.ctx.fillStyle = '#00ff00';
            for (let i = 0; i < 5; i++) {
                const pos = 100 + ((this.flowPosition + i * 0.2) % 1) * (this.canvas.width - 200);
                this.ctx.beginPath();
                this.ctx.arc(pos, centerY, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.fillStyle = '#333';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`电流 I = ${(this.current * 1000).toFixed(2)} mA`, centerX, 80);
        this.ctx.textAlign = 'left';

        this.ctx.font = '14px Arial';
        this.ctx.fillText('+', 60, centerY - 35);
        this.ctx.fillText('-', 60, centerY + 45);
    }

    getData() {
        return {
            '电压': { value: this.voltage.toFixed(1), unit: 'V' },
            '电阻': { value: this.resistance.toFixed(1), unit: 'Ω' },
            '电流': { value: (this.current * 1000).toFixed(2), unit: 'mA' }
        };
    }

    getFormula() {
        return 'I = U / R';
    }
}

class LensExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.objectDistance = 200;
        this.focalLength = 100;
        this.objectHeight = 60;
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
            { name: '物距', type: 'range', min: 50, max: 350, value: this.objectDistance, step: 10, key: 'objectDistance', unit: '' },
            { name: '焦距', type: 'range', min: 50, max: 150, value: this.focalLength, step: 10, key: 'focalLength', unit: '' }
        ];
    }

    updateControl(key, value) {
        if (key === 'objectDistance') this.objectDistance = value;
        if (key === 'focalLength') this.focalLength = value;
    }

    update(deltaTime) {
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

        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('F', lensX - this.focalLength - 5, centerY + 25);
        this.ctx.fillText("F'", lensX + this.focalLength - 5, centerY + 25);

        const objX = lensX - this.objectDistance;
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(objX, centerY);
        this.ctx.lineTo(objX, centerY - this.objectHeight);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(objX - 8, centerY - this.objectHeight + 15);
        this.ctx.lineTo(objX, centerY - this.objectHeight);
        this.ctx.lineTo(objX + 8, centerY - this.objectHeight + 15);
        this.ctx.stroke();

        const imageDistance = (this.objectDistance * this.focalLength) / (this.objectDistance - this.focalLength);
        const magnification = -imageDistance / this.objectDistance;
        const imageHeight = this.objectHeight * magnification;

        if (imageDistance > 0 && Math.abs(imageDistance) < 300) {
            const imgX = lensX + imageDistance;
            
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([3, 3]);
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

            this.ctx.strokeStyle = '#4ecdc4';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(imgX, centerY);
            this.ctx.lineTo(imgX, centerY - imageHeight);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#333';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`物距 u = ${this.objectDistance}`, 50, 50);
        this.ctx.fillText(`焦距 f = ${this.focalLength}`, 50, 75);
        if (imageDistance > 0 && isFinite(imageDistance)) {
            this.ctx.fillText(`像距 v = ${imageDistance.toFixed(1)}`, 50, 100);
            this.ctx.fillText(`放大率 = ${magnification.toFixed(2)}`, 50, 125);
        }
    }

    getData() {
        const imageDistance = (this.objectDistance * this.focalLength) / (this.objectDistance - this.focalLength);
        const magnification = -imageDistance / this.objectDistance;
        return {
            '物距': { value: this.objectDistance.toFixed(1), unit: '' },
            '像距': { value: isFinite(imageDistance) ? imageDistance.toFixed(1) : '∞', unit: '' },
            '焦距': { value: this.focalLength.toFixed(1), unit: '' },
            '放大率': { value: isFinite(magnification) ? magnification.toFixed(2) : '∞', unit: 'x' }
        };
    }

    getFormula() {
        return '1/f = 1/u + 1/v, m = v/u';
    }
}

class PendulumExperiment extends PhysicsExperiment {
    constructor(canvas) {
        super(canvas);
        this.length = 200;
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
        const angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle) * 100;
        this.angularVelocity += angularAcceleration * deltaTime;
        this.angle += this.angularVelocity * deltaTime;

        const pivotX = this.canvas.width / 2;
        const pivotY = 100;
        const bobX = pivotX + this.length * Math.sin(this.angle);
        const bobY = pivotY + this.length * Math.cos(this.angle);
        
        this.trail.push({ x: bobX, y: bobY });
        if (this.trail.length > 50) this.trail.shift();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const pivotX = this.canvas.width / 2;
        const pivotY = 100;
        const bobX = pivotX + this.length * Math.sin(this.angle);
        const bobY = pivotY + this.length * Math.cos(this.angle);

        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(pivotX - 50, pivotY - 20, 100, 20);

        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(pivotX, pivotY, this.length, Math.PI / 2 - 1, Math.PI / 2 + 1);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(pivotX, pivotY);
        this.ctx.lineTo(bobX, bobY);
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
        this.ctx.lineWidth = 2;
        for (let i = 1; i < this.trail.length; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
            this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            this.ctx.stroke();
        }

        const gradient = this.ctx.createRadialGradient(bobX - 5, bobY - 5, 0, bobX, bobY, 20);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#c92a2a');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#999';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(pivotX, pivotY);
        this.ctx.lineTo(pivotX, pivotY + this.length);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    getData() {
        const period = 2 * Math.PI * Math.sqrt(this.length / (this.gravity * 100));
        return {
            '时间': { value: this.time.toFixed(2), unit: 's' },
            '摆角': { value: (this.angle * 180 / Math.PI).toFixed(2), unit: '°' },
            '周期': { value: period.toFixed(2), unit: 's' }
        };
    }

    getFormula() {
        return 'T = 2π√(L/g)';
    }
}

const experiments = {
    freefall: FreeFallExperiment,
    projectile: ProjectileExperiment,
    ohm: OhmExperiment,
    lens: LensExperiment,
    pendulum: PendulumExperiment
};