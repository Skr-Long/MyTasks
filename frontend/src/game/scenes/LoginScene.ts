import Phaser from 'phaser';
import { AuthService } from '../../network/http/AuthService';

export class LoginScene extends Phaser.Scene {
  private usernameInput!: HTMLInputElement;
  private passwordInput!: HTMLInputElement;
  private loginButton!: Phaser.GameObjects.Text;
  private registerButton!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('LoginScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, centerY - 200, '水浒横版RPG', {
      fontSize: '48px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 140, '天罡地煞', {
      fontSize: '24px',
      color: '#8888ff'
    }).setOrigin(0.5);

    this.add.text(centerX - 120, centerY - 60, '用户名:', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.add.text(centerX - 120, centerY, '密码:', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.createInputElements(centerX, centerY);
    this.createButtons(centerX, centerY);

    this.statusText = this.add.text(centerX, centerY + 120, '', {
      fontSize: '16px',
      color: '#ff4444'
    }).setOrigin(0.5);

    this.checkExistingSession();
  }

  private createInputElements(centerX: number, centerY: number) {
    this.usernameInput = document.createElement('input');
    this.usernameInput.type = 'text';
    this.usernameInput.placeholder = '请输入用户名';
    this.usernameInput.style.position = 'absolute';
    this.usernameInput.style.left = `${centerX - 80}px`;
    this.usernameInput.style.top = `${centerY - 70}px`;
    this.usernameInput.style.width = '200px';
    this.usernameInput.style.height = '30px';
    this.usernameInput.style.padding = '5px';
    this.usernameInput.style.fontSize = '16px';
    this.usernameInput.style.borderRadius = '5px';
    this.usernameInput.style.border = '2px solid #4488ff';
    document.body.appendChild(this.usernameInput);

    this.passwordInput = document.createElement('input');
    this.passwordInput.type = 'password';
    this.passwordInput.placeholder = '请输入密码';
    this.passwordInput.style.position = 'absolute';
    this.passwordInput.style.left = `${centerX - 80}px`;
    this.passwordInput.style.top = `${centerY - 10}px`;
    this.passwordInput.style.width = '200px';
    this.passwordInput.style.height = '30px';
    this.passwordInput.style.padding = '5px';
    this.passwordInput.style.fontSize = '16px';
    this.passwordInput.style.borderRadius = '5px';
    this.passwordInput.style.border = '2px solid #4488ff';
    document.body.appendChild(this.passwordInput);
  }

  private createButtons(centerX: number, centerY: number) {
    this.loginButton = this.add.text(centerX - 60, centerY + 60, '登录', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#4488ff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.loginButton.on('pointerdown', () => this.handleLogin());
    this.loginButton.on('pointerover', () => this.loginButton.setBackgroundColor('#5599ff'));
    this.loginButton.on('pointerout', () => this.loginButton.setBackgroundColor('#4488ff'));

    this.registerButton = this.add.text(centerX + 60, centerY + 60, '注册', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#44aa44',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    this.registerButton.on('pointerdown', () => this.handleRegister());
    this.registerButton.on('pointerover', () => this.registerButton.setBackgroundColor('#55bb55'));
    this.registerButton.on('pointerout', () => this.registerButton.setBackgroundColor('#44aa44'));
  }

  private async handleLogin() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showStatus('请输入用户名和密码', '#ff4444');
      return;
    }

    try {
      this.showStatus('登录中...', '#ffff44');
      const response = await AuthService.login(username, password);
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_id', response.user.id);
        this.showStatus('登录成功!', '#44ff44');
        
        this.time.delayedCall(1000, () => {
          this.removeInputElements();
          this.scene.start('CharacterSelectScene', { user: response.user });
        });
      }
    } catch (error: any) {
      this.showStatus(error.message || '登录失败', '#ff4444');
    }
  }

  private async handleRegister() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showStatus('请输入用户名和密码', '#ff4444');
      return;
    }

    if (password.length < 6) {
      this.showStatus('密码长度至少6位', '#ff4444');
      return;
    }

    try {
      this.showStatus('注册中...', '#ffff44');
      const response = await AuthService.register(username, password);
      this.showStatus('注册成功! 请登录', '#44ff44');
    } catch (error: any) {
      this.showStatus(error.message || '注册失败', '#ff4444');
    }
  }

  private async checkExistingSession() {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (token && userId) {
      try {
        const response = await AuthService.getCurrentUser();
        if (response.user) {
          this.removeInputElements();
          this.scene.start('CharacterSelectScene', { user: response.user });
        }
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
      }
    }
  }

  private showStatus(message: string, color: string) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
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
