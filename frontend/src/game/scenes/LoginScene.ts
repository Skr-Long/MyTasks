import Phaser from 'phaser';
import { AuthService } from '../../network/http/AuthService';

export class LoginScene extends Phaser.Scene {
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private loginButton!: Phaser.GameObjects.Rectangle;
  private registerButton!: Phaser.GameObjects.Rectangle;
  private statusText!: Phaser.GameObjects.Text;
  private isLoading: boolean = false;

  constructor() {
    super('LoginScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.createBackground();
    this.createTitle(centerX, centerY);
    this.createInputFields(centerX, centerY);
    this.createButtons(centerX, centerY);
    this.createStatusText(centerX, centerY);
    this.createHintText(centerX, centerY);
    
    this.time.delayedCall(300, () => this.checkExistingSession());
  }

  private createBackground() {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x1a0a2e, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    for (let y = 0; y < this.cameras.main.height; y += 30) {
      const alpha = 0.15 * (1 - Math.abs(y - this.cameras.main.height / 2) / (this.cameras.main.height / 2));
      graphics.fillStyle(0x3d2070, alpha);
      graphics.fillRect(0, y, this.cameras.main.width, 30);
    }

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * this.cameras.main.height;
      const size = Math.random() * 2.5 + 1;
      graphics.fillStyle(0xffd700, Math.random() * 0.5 + 0.2);
      graphics.fillCircle(x, y, size);
    }

    for (let i = 0; i < 5; i++) {
      const startX = Math.random() * this.cameras.main.width;
      this.add.line(0, startX, -50, startX + 100, this.cameras.main.height + 50, 0xffd700)
        .setAlpha(0.3)
        .setOrigin(0);
    }
  }

  private createTitle(centerX: number, centerY: number) {
    const mainTitle = this.add.text(centerX, centerY - 220, '大乱水浒', {
      fontSize: '72px',
      fontFamily: 'serif',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#8b0000',
      strokeThickness: 5
    }).setOrigin(0.5);

    mainTitle.setShadow(4, 4, '#000000', 8);

    this.tweens.add({
      targets: mainTitle,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const subTitle = this.add.text(centerX, centerY - 150, '天罡地煞 · 纵横江湖', {
      fontSize: '28px',
      fontFamily: 'serif',
      color: '#c49df0',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    subTitle.setShadow(2, 2, '#000000', 4);
  }

  private createInputFields(centerX: number, centerY: number) {
    const panelX = centerX;
    const panelY = centerY - 20;
    
    const panel = this.add.rectangle(panelX, panelY, 480, 220, 0x1a1a2e, 0.95)
      .setStrokeStyle(4, 0x4a3a7a);

    this.add.rectangle(panelX, panelY, 480, 220)
      .setStrokeStyle(1, 0x6a5a9a, 0.5);

    this.add.text(panelX - 200, panelY - 70, '用户名', {
      fontSize: '18px',
      color: '#e0d0f0',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.add.text(panelX - 200, panelY + 10, '密码', {
      fontSize: '18px',
      color: '#e0d0f0',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    const container = document.getElementById('game-container') || document.body;
    
    const inputContainer = document.createElement('div');
    inputContainer.style.position = 'absolute';
    inputContainer.style.left = `${panelX - 200}px`;
    inputContainer.style.top = `${panelY - 45}px`;
    inputContainer.style.width = '400px';
    container.appendChild(inputContainer);

    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = '请输入用户名 (演示: demo)';
    this.usernameInput.style.width = '380px';
    this.usernameInput.style.height = '44px';
    this.usernameInput.style.padding = '0 15px';
    this.usernameInput.style.fontSize = '16px';
    this.usernameInput.style.borderRadius = '8px';
    this.usernameInput.style.border = '2px solid #5a4a8a';
    this.usernameInput.style.backgroundColor = '#2a1a4a';
    this.usernameInput.style.color = '#ffffff';
    this.usernameInput.style.outline = 'none';
    this.usernameInput.style.transition = 'all 0.3s';
    this.usernameInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    this.usernameInput.style.marginBottom = '20px';
    inputContainer.appendChild(this.usernameInput);

    this.usernameInput.addEventListener('focus', () => {
      this.usernameInput.style.border = '2px solid #9d7cd8';
      this.usernameInput.style.boxShadow = '0 0 20px rgba(157, 124, 216, 0.4)';
    });
    this.usernameInput.addEventListener('blur', () => {
      this.usernameInput.style.border = '2px solid #5a4a8a';
      this.usernameInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });

    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.placeholder = '请输入密码 (演示: demo123)';
    this.passwordInput.style.width = '380px';
    this.passwordInput.style.height = '44px';
    this.passwordInput.style.padding = '0 15px';
    this.passwordInput.style.fontSize = '16px';
    this.passwordInput.style.borderRadius = '8px';
    this.passwordInput.style.border = '2px solid #5a4a8a';
    this.passwordInput.style.backgroundColor = '#2a1a4a';
    this.passwordInput.style.color = '#ffffff';
    this.passwordInput.style.outline = 'none';
    this.passwordInput.style.transition = 'all 0.3s';
    this.passwordInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    inputContainer.appendChild(this.passwordInput);

    this.passwordInput.addEventListener('focus', () => {
      this.passwordInput.style.border = '2px solid #9d7cd8';
      this.passwordInput.style.boxShadow = '0 0 20px rgba(157, 124, 216, 0.4)';
    });
    this.passwordInput.addEventListener('blur', () => {
      this.passwordInput.style.border = '2px solid #5a4a8a';
      this.passwordInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });

    this.usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });
    this.passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleLogin();
      }
    });
  }

  private createButtons(centerX: number, centerY: number) {
    this.loginButton = this.add.rectangle(centerX - 100, centerY + 130, 170, 55, 0x6b4c9a)
      .setStrokeStyle(3, 0x9d7cd8)
      .setInteractive({ useHandCursor: true });

    const loginText = this.add.text(centerX - 100, centerY + 130, '登录', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.registerButton = this.add.rectangle(centerX + 100, centerY + 130, 170, 55, 0x4a7c59)
      .setStrokeStyle(3, 0x6bc47f)
      .setInteractive({ useHandCursor: true });

    const registerText = this.add.text(centerX + 100, centerY + 130, '注册', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.loginButton.on('pointerdown', () => this.handleLogin());
    this.loginButton.on('pointerover', () => {
      this.loginButton.setFillStyle(0x7b5caa);
      this.loginButton.setScale(1.05);
    });
    this.loginButton.on('pointerout', () => {
      this.loginButton.setFillStyle(0x6b4c9a);
      this.loginButton.setScale(1);
    });

    this.registerButton.on('pointerdown', () => this.handleRegister());
    this.registerButton.on('pointerover', () => {
      this.registerButton.setFillStyle(0x5a8c69);
      this.registerButton.setScale(1.05);
    });
    this.registerButton.on('pointerout', () => {
      this.registerButton.setFillStyle(0x4a7c59);
      this.registerButton.setScale(1);
    });
  }

  private createStatusText(centerX: number, centerY: number) {
    this.statusText = this.add.text(centerX, centerY + 190, '', {
      fontSize: '18px',
      color: '#ff6b6b',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createHintText(centerX: number, centerY: number) {
    this.add.text(centerX, centerY + 230, 'WASD移动 | J普攻 | K技能 | L跳跃', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
    if (loading) {
      this.loginButton.disableInteractive();
      this.registerButton.disableInteractive();
      this.loginButton.setAlpha(0.6);
      this.registerButton.setAlpha(0.6);
    } else {
      this.loginButton.setInteractive({ useHandCursor: true });
      this.registerButton.setInteractive({ useHandCursor: true });
      this.loginButton.setAlpha(1);
      this.registerButton.setAlpha(1);
    }
  }

  private async handleLogin() {
    if (this.isLoading) return;
    
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showStatus('请输入用户名和密码', '#ff6b6b');
      this.shakeElement(this.usernameInput);
      return;
    }

    this.setLoading(true);
    this.showStatus('登录中...', '#ffd700');

    try {
      const response = await AuthService.login(username, password);
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_id', response.user.id);
        this.showStatus('登录成功!', '#4ade80');
        
        this.cameras.main.fade(800);
        this.time.delayedCall(800, () => {
          this.removeInputElements();
          this.scene.start('CharacterSelectScene', { user: response.user });
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.showStatus(error.message || '登录失败', '#ff6b6b');
      this.shakeElement(this.usernameInput);
    } finally {
      this.setLoading(false);
    }
  }

  private async handleRegister() {
    if (this.isLoading) return;
    
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showStatus('请输入用户名和密码', '#ff6b6b');
      this.shakeElement(this.usernameInput);
      return;
    }

    if (password.length < 6) {
      this.showStatus('密码长度至少6位', '#ff6b6b');
      this.shakeElement(this.passwordInput);
      return;
    }

    this.setLoading(true);
    this.showStatus('注册中...', '#ffd700');

    try {
      const response = await AuthService.register(username, password);
      this.showStatus(response.message || '注册成功! 请登录', '#4ade80');
      
      this.tweens.add({
        targets: this.registerButton,
        scale: 1.1,
        duration: 200,
        yoyo: true
      });
    } catch (error: any) {
      console.error('Register error:', error);
      this.showStatus(error.message || '注册失败', '#ff6b6b');
      this.shakeElement(this.usernameInput);
    } finally {
      this.setLoading(false);
    }
  }

  private shakeElement(element: HTMLElement) {
    const originalLeft = element.style.left;
    const originalX = parseInt(originalLeft) || 0;
    
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 300,
      onUpdate: (tween) => {
        const progress = tween.getValue();
        const offset = Math.sin(progress * Math.PI * 6) * 5 * (1 - progress);
        element.style.transform = `translateX(${offset}px)`;
      },
      onComplete: () => {
        element.style.transform = '';
      }
    });
  }

  private async checkExistingSession() {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (token && userId) {
      this.showStatus('正在验证会话...', '#ffd700');
      try {
        const response = await AuthService.getCurrentUser();
        if (response.user) {
          this.showStatus('自动登录成功!', '#4ade80');
          this.time.delayedCall(500, () => {
            this.removeInputElements();
            this.scene.start('CharacterSelectScene', { user: response.user });
          });
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        this.showStatus('', '#ff6b6b');
      }
    }
  }

  private showStatus(message: string, color: string) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
    
    if (message) {
      this.statusText.setAlpha(0);
      this.tweens.add({
        targets: this.statusText,
        alpha: 1,
        duration: 300
      });
    }
  }

  private removeInputElements() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    });
    const containers = document.querySelectorAll('div');
    containers.forEach(div => {
      if (div.children.length === 0 && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    });
  }
}
