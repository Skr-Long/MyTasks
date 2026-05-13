import axios from 'axios';
import { GameConfig } from '../../shared/GameConfig';

const api = axios.create({
  baseURL: GameConfig.API_BASE_URL,
  timeout: 5000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  level: number;
  exp: number;
  heroes: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

const DEMO_USERS_KEY = 'water_margin_demo_users';

function getDemoUsers(): Map<string, { password: string; user: User }> {
  const stored = localStorage.getItem(DEMO_USERS_KEY);
  if (stored) {
    return new Map(JSON.parse(stored));
  }
  return new Map();
}

function saveDemoUsers(users: Map<string, { password: string; user: User }>) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(Array.from(users.entries())));
}

export class AuthService {
  private static useDemoMode = false;

  static async login(username: string, password: string): Promise<LoginResponse> {
    if (this.useDemoMode) {
      return this.demoLogin(username, password);
    }

    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || '用户名或密码错误');
      }
      console.log('API failed, falling back to demo mode');
      return this.demoLogin(username, password);
    }
  }

  private static demoLogin(username: string, password: string): Promise<LoginResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getDemoUsers();
        const userData = users.get(username);
        
        if (userData && userData.password === password) {
          resolve({
            token: 'demo_token_' + Date.now(),
            user: userData.user
          });
        } else if (username === 'demo' && password === 'demo123') {
          const demoUser: User = {
            id: 'demo_user',
            username: 'demo',
            level: 1,
            exp: 0,
            heroes: ['wu_song', 'lu_zhi_shen', 'lin_chong']
          };
          resolve({
            token: 'demo_token_' + Date.now(),
            user: demoUser
          });
        } else {
          reject(new Error('用户名或密码错误 (演示账号: demo/demo123)'));
        }
      }, 500);
    });
  }

  static async register(username: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', { username, password });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || '注册失败');
      }
      console.log('API failed, falling back to demo mode');
      return this.demoRegister(username, password);
    }
  }

  private static demoRegister(username: string, password: string): Promise<RegisterResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username.length < 3) {
          reject(new Error('用户名至少3个字符'));
          return;
        }
        if (password.length < 6) {
          reject(new Error('密码至少6个字符'));
          return;
        }

        const users = getDemoUsers();
        if (users.has(username)) {
          reject(new Error('用户名已存在'));
          return;
        }

        const newUser: User = {
          id: 'user_' + Date.now(),
          username,
          level: 1,
          exp: 0,
          heroes: ['wu_song', 'lu_zhi_shen', 'lin_chong']
        };

        users.set(username, { password, user: newUser });
        saveDemoUsers(users);

        resolve({
          success: true,
          message: '注册成功！请登录'
        });
      }, 500);
    });
  }

  static async getCurrentUser(): Promise<{ user: User }> {
    const token = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      throw new Error('未登录');
    }

    if (this.useDemoMode || token.startsWith('demo_')) {
      const users = getDemoUsers();
      for (const [, data] of users) {
        if (data.user.id === userId) {
          return { user: data.user };
        }
      }
      return {
        user: {
          id: 'demo_user',
          username: 'demo',
          level: 1,
          exp: 0,
          heroes: ['wu_song', 'lu_zhi_shen', 'lin_chong']
        }
      };
    }

    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
      }
      throw new Error('获取用户信息失败');
    }
  }
}
