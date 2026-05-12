class ExperimentApp {
    constructor() {
        this.currentExperiment = null;
        this.currentExperimentKey = null;
        this.lastTime = 0;
        this.canvas = document.getElementById('experiment-canvas');
        
        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.experimentContainer = document.getElementById('experiment-canvas-container');
        this.experimentTitle = document.getElementById('experiment-title');
        this.controlsContainer = document.getElementById('controls-container');
        this.dataContainer = document.getElementById('data-container');
        this.formulaDisplay = document.getElementById('formula-display');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.backBtn = document.getElementById('back-btn');
    }

    initEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const experimentKey = e.target.dataset.experiment;
                this.loadExperiment(experimentKey);
            });
        });

        this.startBtn.addEventListener('click', () => this.startExperiment());
        this.resetBtn.addEventListener('click', () => this.resetExperiment());
        this.pauseBtn.addEventListener('click', () => this.pauseExperiment());
        this.backBtn.addEventListener('click', () => this.goBack());

        window.addEventListener('resize', () => {
            if (this.currentExperiment) {
                this.currentExperiment.resizeCanvas();
                this.currentExperiment.draw();
            }
        });
    }

    loadExperiment(experimentKey) {
        const ExperimentClass = experiments[experimentKey];
        if (!ExperimentClass) return;

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-experiment="${experimentKey}"]`).classList.add('active');

        this.currentExperimentKey = experimentKey;
        this.currentExperiment = new ExperimentClass(this.canvas);
        
        this.welcomeScreen.style.display = 'none';
        this.experimentContainer.style.display = 'flex';
        
        this.experimentTitle.textContent = this.currentExperiment.getTitle();
        this.formulaDisplay.textContent = this.currentExperiment.getFormula();
        
        this.createControls();
        this.currentExperiment.setup();
        this.updateData();
        
        this.startBtn.style.display = 'block';
        this.pauseBtn.style.display = 'none';
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    createControls() {
        this.controlsContainer.innerHTML = '';
        const controls = this.currentExperiment.getControls();

        controls.forEach(control => {
            const controlGroup = document.createElement('div');
            controlGroup.className = 'control-group';

            const label = document.createElement('label');
            label.textContent = `${control.name} (${control.unit})`;
            controlGroup.appendChild(label);

            if (control.type === 'range') {
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = control.min;
                slider.max = control.max;
                slider.step = control.step;
                slider.value = control.value;
                slider.className = 'control-slider';
                slider.dataset.key = control.key;

                const valueDisplay = document.createElement('div');
                valueDisplay.className = 'value-display';
                valueDisplay.textContent = control.value;

                slider.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    valueDisplay.textContent = value;
                    this.currentExperiment.updateControl(control.key, value);
                    this.currentExperiment.draw();
                    this.updateData();
                });

                controlGroup.appendChild(slider);
                controlGroup.appendChild(valueDisplay);
            }

            this.controlsContainer.appendChild(controlGroup);
        });
    }

    startExperiment() {
        if (!this.currentExperiment) return;
        this.currentExperiment.start();
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'block';
    }

    pauseExperiment() {
        if (!this.currentExperiment) return;
        this.currentExperiment.pause();
        if (this.currentExperiment.isPaused) {
            this.pauseBtn.textContent = '继续';
        } else {
            this.pauseBtn.textContent = '暂停';
        }
    }

    resetExperiment() {
        if (!this.currentExperiment) return;
        this.currentExperiment.reset();
        this.startBtn.style.display = 'block';
        this.pauseBtn.style.display = 'none';
        this.pauseBtn.textContent = '暂停';
        this.updateData();
    }

    goBack() {
        if (this.currentExperiment) {
            this.currentExperiment.reset();
        }
        this.currentExperiment = null;
        this.currentExperimentKey = null;
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        this.welcomeScreen.style.display = 'flex';
        this.experimentContainer.style.display = 'none';
    }

    updateData() {
        if (!this.currentExperiment) return;
        
        const data = this.currentExperiment.getData();
        this.dataContainer.innerHTML = '';

        Object.entries(data).forEach(([key, value]) => {
            const dataItem = document.createElement('div');
            dataItem.className = 'data-item';
            dataItem.innerHTML = `
                <div class="data-item-label">${key}</div>
                <div class="data-item-value">${value.value}</div>
                <div class="data-item-unit">${value.unit}</div>
            `;
            this.dataContainer.appendChild(dataItem);
        });
    }

    gameLoop(time) {
        if (!this.currentExperiment) return;

        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;

        if (this.currentExperiment.isRunning && !this.currentExperiment.isPaused) {
            this.currentExperiment.update(deltaTime);
            this.updateData();

            if (!this.currentExperiment.isRunning) {
                this.startBtn.style.display = 'block';
                this.pauseBtn.style.display = 'none';
                this.pauseBtn.textContent = '暂停';
            }
        }

        this.currentExperiment.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ExperimentApp();
});