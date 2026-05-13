import Phaser from 'phaser';
import { AuthService } from '../../network/http/AuthService';

export class LoginScene extends Phaser.Scene {
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private loginButton!: Phaser.GameObjects.Rectangle;
  private registerButton!: Phaser.GameObjects.Rectangle;
  private loginText!: Phaser.GameObjects.Text;
  private registerText!: Phaser.GameObjects.Text;
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
    
    this.time.delayedCall(500, () => this.checkExistingSession());
  }

  private createBackground() {
    const graphics = this.add.graphics();
    
    graphics.fillStyle(0x1a0a2e, 1);
    graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    
    for (let y = 0; y < this.cameras.main.height; y += 20) {
      const alpha = 0.3 * (1 - Math.abs(y - this.cameras.main.height / 2) / (this.cameras.main.height / 2));
      graphics.fillStyle(0x2d1b4e, alpha);
      graphics.fillRect(0, y, this.cameras.main.width, 20);
    }

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.cameras.main.width;
      const y = Math.random() * this.cameras.main.height;
      const size = Math.random() * 3 + 1;
      const alpha = Math.random() * 0.5 + 0.3;
      graphics.fillStyle(0xffd700, alpha);
      graphics.fillCircle(x, y, size);
    }

    for (let i = 0; i < 8; i++) {
      const startX = Math.random() * this.cameras.main.width;
      const startY = -50;
      const length = Math.random() * 100 + 50;
      
      this.tweens.add({
        targets: { x: startX, y: startY },
        y: this.cameras.main.height + 50,
        duration: 2000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 5000,
        onUpdate: (tween) => {
          const progress = tween.progress;
          const currentX = tween.targets[0].x;
          const currentY = tween.targets[0].y;
          graphics.lineStyle(2, 0xffd700, 0.3 * (1 - progress));
          graphics.lineBetween(currentX, currentY, currentX, currentY + length);
        }
      });
    }
  }

  private createTitle(centerX: number, centerY: number) {
    const mainTitle = this.add.text(centerX, centerY - 220, '大乱水浒', {
      fontSize: '72px',
      fontFamily: 'serif',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#8b0000',
      strokeThickness: 6
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
    const panel = this.add.rectangle(centerX, centerY - 20, 450, 280, 0x1a1a2e, 0.9)
      .setStrokeStyle(3, 0x4a3a7a);

    this.add.rectangle(centerX, centerY - 20, 450, 280)
      .setStrokeStyle(1, 0x6a5a9a, 0.5);

    this.add.text(centerX - 180, centerY - 100, '用户名', {
      fontSize: '18px',
      color: '#e0d0f0',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.add.text(centerX - 180, centerY - 20, '密码', {
      fontSize: '18px',
      color: '#e0d0f0',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = '请输入用户名';
    this.usernameInput.style.position = 'absolute';
    this.usernameInput.style.left = `${centerX - 180}px`;
    this.usernameInput.style.top = `${centerY - 75}px`;
    this.usernameInput.style.width = '330px';
    this.usernameInput.style.height = '40px';
    this.usernameInput.style.padding = '0 15px';
    this.usernameInput.style.fontSize = '16px';
    this.usernameInput.style.borderRadius = '8px';
    this.usernameInput.style.border = '2px solid #5a4a8a';
    this.usernameInput.style.backgroundColor = '#2a1a4a';
    this.usernameInput.style.color = '#ffffff';
    this.usernameInput.style.outline = 'none';
    this.usernameInput.style.transition = 'all 0.3s';
    this.usernameInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    document.body.appendChild(this.usernameInput);

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
    this.passwordInput.placeholder = '请输入密码';
    this.passwordInput.style.position = 'absolute';
    this.passwordInput.style.left = `${centerX - 180}px`;
    this.passwordInput.style.top = `${centerY + 5}px`;
    this.passwordInput.style.width = '330px';
    this.passwordInput.style.height = '40px';
    this.passwordInput.style.padding = '0 15px';
    this.passwordInput.style.fontSize = '16px';
    this.passwordInput.style.borderRadius = '8px';
    this.passwordInput.style.border = '2px solid #5a4a8a';
    this.passwordInput.style.backgroundColor = '#2a1a4a';
    this.passwordInput.style.color = '#ffffff';
    this.passwordInput.style.outline = 'none';
    this.passwordInput.style.transition = 'all 0.3s';
    this.passwordInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    document.body.appendChild(this.passwordInput);

    this.passwordInput.addEventListener('focus', () => {
      this.passwordInput.style.border = '2px solid #9d7cd8';
      this.passwordInput.style.boxShadow = '0 0 20px rgba(157, 124, 216, 0.4)';
    });
    this.passwordInput.addEventListener('blur', () => {
      this.passwordInput.style.border = '2px solid #5a4a8a';
      this.passwordInput.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    });
  }

  private createButtons(centerX: number, centerY: number) {
    this.loginButton = this.add.rectangle(centerX - 100, centerY + 100, 160, 50, 0x6b4c9a)
      .setStrokeStyle(2, 0x9d7cd8)
      .setInteractive({ useHandCursor: true });

    this.loginText = this.add.text(centerX - 100, centerY + 100, '登录', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.registerButton = this.add.rectangle(centerX + 100, centerY + 100, 160, 50, 0x4a7c59)
      .setStrokeStyle(2, 0x6bc47f)
      .setInteractive({ useHandCursor: true });

    this.registerText = this.add.text(centerX + 100, centerY + 100, '注册', {
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
    this.statusText = this.add.text(centerX, centerY + 160, '', {
      fontSize: '18px',
      color: '#ff6b6b',
      fontStyle: 'bold'
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
      this.shakeElement(this.passwordInput);
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
        
        this.tweens.add({
          targets: this.cameras.main,
          alpha: 0,
          duration: 800,
          onComplete: () => {
            this.removeInputElements();
            this.scene.start('CharacterSelectScene', { user: response.user });
          }
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.showStatus(error.message || '登录失败，请检查网络连接', '#ff6b6b');
      this.shakeElement(this.usernameInput);
      this.shakeElement(this.passwordInput);
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
      this.shakeElement(this.passwordInput);
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
      this.showStatus('注册成功! 请点击登录', '#4ade80');
      
      this.tweens.add({
        targets: this.registerButton,
        scale: 1.1,
        duration: 200,
        yoyo: true
      });
    } catch (error: any) {
      console.error('Register error:', error);
      this.showStatus(error.message || '注册失败，请检查网络连接', '#ff6b6b');
      this.shakeElement(this.usernameInput);
    } finally {
      this.setLoading(false);
    }
  }

  private shakeElement(element: HTMLElement) {
    const originalLeft = element.style.left;
    const originalX = parseInt(originalLeft);
    
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 300,
      onUpdate: (tween) => {
        const progress = tween.getValue();
        const offset = Math.sin(progress * Math.PI * 6) * 5 * (1 - progress);
        element.style.left = `${originalX + offset}px`;
      },
      onComplete: () => {
        element.style.left = originalLeft;
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
    if (this.usernameInput && this.usernameInput.parentNode) {
      this.usernameInput.parentNode.removeChild(this.usernameInput);
    }
    if (this.passwordInput && this.passwordInput.parentNode) {
      this.passwordInput.parentNode.removeChild(this.passwordInput);
    }
  }
}
