import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser = {
    _id: 'mock-id-123',
    username: 'testuser',
    password: 'hashed-password',
    level: 1,
    exp: 0,
    heroes: ['wu_song'],
    save: jest.fn().mockResolvedValue(true)
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    constructor: jest.fn().mockImplementation(() => ({
      save: mockUser.save
    }))
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token')
          }
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

      const result = await service.register({
        username: 'newuser',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('注册成功');
    });

    it('should throw ConflictException when username already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          username: 'testuser',
          password: 'password123'
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token and user data on successful login', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('testuser');
      expect(result.user.id).toBe('mock-id-123');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          username: 'nonexistent',
          password: 'password123'
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({
          username: 'testuser',
          password: 'wrongpassword'
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data without password', async () => {
      const userWithoutPassword = {
        _id: 'mock-id-123',
        username: 'testuser',
        level: 1,
        exp: 0,
        heroes: ['wu_song']
      };
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(userWithoutPassword)
      });

      const result = await service.getCurrentUser('mock-id-123');

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('testuser');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(
        service.getCurrentUser('invalid-id')
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
