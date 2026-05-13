import axios from 'axios';
import { GameConfig } from '../../shared/GameConfig';

const api = axios.create({
  baseURL: GameConfig.API_BASE_URL,
  timeout: 10000
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

export class AuthService {
  static async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败');
    }
  }

  static async register(username: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', { username, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '注册失败');
    }
  }

  static async getCurrentUser(): Promise<{ user: User }> {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '获取用户信息失败');
    }
  }
}
