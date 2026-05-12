# -*- coding: utf-8 -*-
import pygame
import random
import math
import json
import os
from pygame.locals import *

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 80, 80)
BLUE = (80, 150, 255)
YELLOW = (255, 255, 100)
GREEN = (100, 255, 100)
PURPLE = (180, 100, 255)
ORANGE = (255, 165, 0)
CYAN = (100, 255, 255)
BG_COLOR = (30, 30, 50)
DAMAGE_COLOR = (255, 100, 100)

LANG_CN = {
    "title": "手绘雷霆战机",
    "start": "点击开始游戏",
    "controls": "WASD/方向键:移动  空格:射击  M:移动模式  1/2/3:武器",
    "score": "分数: ",
    "wave": "第 ",
    "wave_suffix": " 波",
    "health": "生命: ",
    "wave_coming": "第 ",
    "wave_coming_suffix": " 波来袭!",
    "game_over": "游戏结束",
    "final_score": "最终分数: ",
    "return_menu": "点击返回菜单",
    "leaderboard": "排行榜",
    "no_scores": "暂无记录",
    "boss": "BOSS",
    "weapon": "武器: ",
    "move_mode": "移动: ",
    "lang": "语言",
    "level": "等级: "
}

LANG_EN = {
    "title": "Hand-Drawn Thunder Fighter",
    "start": "Click to Start Game",
    "controls": "WASD/Arrows:Move  Space:Shoot  M:Move Mode  1/2/3:Weapon",
    "score": "Score: ",
    "wave": "Wave ",
    "wave_suffix": "",
    "health": "Health: ",
    "wave_coming": "Wave ",
    "wave_coming_suffix": " Coming!",
    "game_over": "Game Over",
    "final_score": "Final Score: ",
    "return_menu": "Click to Return to Menu",
    "leaderboard": "Leaderboard",
    "no_scores": "No Records",
    "boss": "BOSS",
    "weapon": "Weapon: ",
    "move_mode": "Move: ",
    "lang": "Language",
    "level": "Level: "
}

WEAPON_NAMES_CN = ["普通", "散射", "激光"]
WEAPON_NAMES_EN = ["Normal", "Spread", "Laser"]
MOVE_NAMES_CN = ["普通", "跟随", "自动"]
MOVE_NAMES_EN = ["Normal", "Follow", "Auto"]


def draw_hand_drawn_circle(surface, color, center, radius, thickness=2):
    points = []
    for i in range(36):
        angle = i * 10
        wobble = random.randint(-2, 2)
        x = center[0] + int((radius + wobble) * math.cos(math.radians(angle)))
        y = center[1] + int((radius + wobble) * math.sin(math.radians(angle)))
        points.append((x, y))
    pygame.draw.lines(surface, color, True, points, thickness)


def draw_hand_drawn_line(surface, color, start, end, thickness=2):
    wobble_start = (start[0] + random.randint(-1, 1), start[1] + random.randint(-1, 1))
    wobble_end = (end[0] + random.randint(-1, 1), end[1] + random.randint(-1, 1))
    pygame.draw.line(surface, color, wobble_start, wobble_end, thickness)


def draw_hand_drawn_rect(surface, color, rect, thickness=2):
    x, y, w, h = rect
    points = [
        (x + random.randint(-1, 1), y + random.randint(-1, 1)),
        (x + w + random.randint(-1, 1), y + random.randint(-1, 1)),
        (x + w + random.randint(-1, 1), y + h + random.randint(-1, 1)),
        (x + random.randint(-1, 1), y + h + random.randint(-1, 1)),
    ]
    pygame.draw.lines(surface, color, True, points, thickness)


class Player:
    def __init__(self):
        self.x = SCREEN_WIDTH // 2
        self.y = SCREEN_HEIGHT - 100
        self.width = 50
        self.height = 60
        self.speed = 5
        self.health = 100
        self.max_health = 100
        self.shoot_cooldown = 0
        self.shoot_delay = 15
        self.hit_flash = 0
        self.hit_flash_max = 15
        self.weapon_type = 0
        self.weapon_level = 1
        self.move_mode = 0
        self.target_x = self.x
        self.target_y = self.y
        self.invincible = 0

    def move(self, keys, mouse_pos=None):
        if self.move_mode == 0:
            if keys[K_LEFT] or keys[pygame.K_a]:
                self.x -= self.speed
            if keys[K_RIGHT] or keys[pygame.K_d]:
                self.x += self.speed
            if keys[K_UP] or keys[pygame.K_w]:
                self.y -= self.speed
            if keys[K_DOWN] or keys[pygame.K_s]:
                self.y += self.speed
        elif self.move_mode == 1:
            if mouse_pos:
                self.target_x, self.target_y = mouse_pos
                dx = self.target_x - self.x
                dy = self.target_y - self.y
                dist = math.sqrt(dx * dx + dy * dy)
                if dist > 5:
                    self.x += dx * self.speed / dist
                    self.y += dy * self.speed / dist
        elif self.move_mode == 2:
            self.x += math.sin(pygame.time.get_ticks() * 0.005) * 3

        self.x = max(self.width // 2, min(SCREEN_WIDTH - self.width // 2, self.x))
        self.y = max(self.height // 2, min(SCREEN_HEIGHT - self.height // 2, self.y))

    def shoot(self):
        if self.shoot_cooldown == 0:
            self.shoot_cooldown = max(5, self.shoot_delay - self.weapon_level * 2)
            bullets = []
            
            if self.weapon_type == 0:
                bullets.append(Bullet(self.x, self.y - self.height // 2, -10, YELLOW, 10 + self.weapon_level * 2))
                if self.weapon_level >= 2:
                    bullets.append(Bullet(self.x - 15, self.y - self.height // 2, -10, YELLOW, 10 + self.weapon_level * 2))
                    bullets.append(Bullet(self.x + 15, self.y - self.height // 2, -10, YELLOW, 10 + self.weapon_level * 2))
            
            elif self.weapon_type == 1:
                for i in range(-2, 3):
                    angle = math.radians(i * 15)
                    speed_x = math.sin(angle) * 5
                    speed_y = -10
                    bullets.append(Bullet(self.x + i * 10, self.y - self.height // 2, speed_y, CYAN, 
                                        8 + self.weapon_level, speed_x))
                if self.weapon_level >= 2:
                    bullets.append(Bullet(self.x - 20, self.y - self.height // 2, -10, CYAN, 8 + self.weapon_level))
                    bullets.append(Bullet(self.x + 20, self.y - self.height // 2, -10, CYAN, 8 + self.weapon_level))
            
            elif self.weapon_type == 2:
                bullets.append(Laser(self.x, self.y - self.height // 2, 15 + self.weapon_level * 5))
                
            return bullets
        return []

    def take_damage(self, amount):
        if self.invincible > 0:
            return
        self.health -= amount
        self.hit_flash = self.hit_flash_max
        self.invincible = 60
        if self.health < 0:
            self.health = 0

    def upgrade_weapon(self):
        if self.weapon_level < 3:
            self.weapon_level += 1
            return True
        return False

    def heal(self, amount):
        self.health = min(self.max_health, self.health + amount)

    def update(self):
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1
        if self.hit_flash > 0:
            self.hit_flash -= 1
        if self.invincible > 0:
            self.invincible -= 1

    def draw(self, surface):
        cx, cy = self.x, self.y
        color = DAMAGE_COLOR if self.hit_flash > 0 else BLUE
        
        if self.invincible > 0 and self.invincible % 5 < 3:
            color = WHITE

        draw_hand_drawn_rect(surface, color, (cx - 15, cy - 25, 30, 50), 3)
        draw_hand_drawn_line(surface, color, (cx - 15, cy - 15), (cx - 35, cy + 15), 3)
        draw_hand_drawn_line(surface, color, (cx + 15, cy - 15), (cx + 35, cy + 15), 3)
        draw_hand_drawn_circle(surface, color, (cx, cy - 10), 10, 3)

        pygame.draw.circle(surface, RED, (cx - 20, cy + 20), 4)
        pygame.draw.circle(surface, RED, (cx + 20, cy + 20), 4)
        pygame.draw.circle(surface, YELLOW, (cx, cy + 25), 3)

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)


class Bullet:
    def __init__(self, x, y, speed_y, color, damage, speed_x=0):
        self.x = x
        self.y = y
        self.speed_y = speed_y
        self.speed_x = speed_x
        self.color = color
        self.damage = damage
        self.width = 6
        self.height = 15

    def update(self):
        self.y += self.speed_y
        self.x += self.speed_x

    def draw(self, surface):
        draw_hand_drawn_rect(surface, self.color, (self.x - 3, self.y - 7, 6, 14), 2)
        pygame.draw.circle(surface, self.color, (self.x, self.y - 7), 4)

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return self.y < -20 or self.y > SCREEN_HEIGHT + 20 or self.x < -20 or self.x > SCREEN_WIDTH + 20


class Laser:
    def __init__(self, x, y, damage):
        self.x = x
        self.y = y
        self.damage = damage
        self.width = 8
        self.life = 30

    def update(self):
        self.life -= 1

    def draw(self, surface):
        alpha = int(255 * (self.life / 30))
        color = (255, 100, 100, alpha)
        s = pygame.Surface((16, SCREEN_HEIGHT), pygame.SRCALPHA)
        pygame.draw.rect(s, (*color[:3], alpha), (4, 0, 8, self.y))
        surface.blit(s, (self.x - 8, 0))
        draw_hand_drawn_circle(surface, color, (self.x, self.y), 15, 3)

    def get_rect(self):
        return pygame.Rect(self.x - 4, 0, 8, self.y)

    def is_off_screen(self):
        return self.life <= 0


class EnemyBullet:
    def __init__(self, x, y, speed_y, color, damage, bullet_type="normal", speed_x=0):
        self.x = x
        self.y = y
        self.speed_y = speed_y
        self.speed_x = speed_x
        self.color = color
        self.damage = damage
        self.type = bullet_type
        self.width = 8
        self.height = 12
        self.angle = 0
        self.amplitude = 3
        self.frequency = 0.1
        self.start_x = x

    def update(self):
        if self.type == "wave":
            self.angle += self.frequency
            self.x = self.start_x + math.sin(self.angle) * 20
            self.y += self.speed_y
        elif self.type == "slow":
            self.y += self.speed_y * 0.5
            self.x += self.speed_x
        elif self.type == "homing":
            pass
        else:
            self.y += self.speed_y
            self.x += self.speed_x

    def draw(self, surface):
        cx, cy = self.x, self.y
        
        if self.type == "debug":
            draw_hand_drawn_rect(surface, GREEN, (cx - 5, cy - 5, 10, 10), 3)
            draw_hand_drawn_circle(surface, GREEN, (cx, cy), 8, 2)
        elif self.type == "fish":
            draw_hand_drawn_circle(surface, ORANGE, (cx, cy), 8, 2)
            draw_hand_drawn_line(surface, ORANGE, (cx, cy - 6), (cx, cy + 6), 2)
            draw_hand_drawn_line(surface, ORANGE, (cx - 8, cy), (cx - 12, cy - 4), 2)
            draw_hand_drawn_line(surface, ORANGE, (cx - 8, cy), (cx - 12, cy + 4), 2)
        elif self.type == "wave":
            draw_hand_drawn_circle(surface, PURPLE, (cx, cy), 6, 2)
        elif self.type == "slow":
            draw_hand_drawn_circle(surface, (150, 150, 150), (cx, cy), 10, 3)
        else:
            draw_hand_drawn_rect(surface, self.color, (cx - 4, cy - 6, 8, 12), 2)

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return self.y > SCREEN_HEIGHT + 50 or self.y < -50 or self.x < -50 or self.x > SCREEN_WIDTH + 50


class Enemy:
    def __init__(self, x, y, enemy_type):
        self.x = x
        self.y = y
        self.type = enemy_type
        self.speed = 2 + enemy_type * 0.5
        self.health = 30 + enemy_type * 20
        self.max_health = self.health
        self.shoot_cooldown = random.randint(0, 60)
        self.shoot_delay = max(30, 80 - enemy_type * 10)
        self.width = 40 + enemy_type * 10
        self.height = 40 + enemy_type * 10
        self.direction = 1
        self.hit_flash = 0
        self.hit_flash_max = 10
        self.move_pattern = random.randint(0, 2)
        self.start_x = x
        self.angle = 0

    def update(self):
        if self.move_pattern == 0:
            self.y += self.speed * 0.5
            self.x += self.direction * self.speed * 0.3
            if self.x < 50 or self.x > SCREEN_WIDTH - 50:
                self.direction *= -1
        elif self.move_pattern == 1:
            self.angle += 0.02
            self.y += self.speed * 0.6
            self.x = self.start_x + math.sin(self.angle) * 50
        else:
            self.y += self.speed * 0.8

        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1
        if self.hit_flash > 0:
            self.hit_flash -= 1

    def shoot(self, player_x=None, player_y=None):
        if self.shoot_cooldown == 0 and self.y > 50:
            self.shoot_cooldown = self.shoot_delay
            bullets = []
            
            bullet_types = ["normal", "wave", "fish", "slow"]
            chosen_type = random.choice(bullet_types) if self.type >= 2 else "normal"
            
            if self.type == 0:
                bullets.append(EnemyBullet(self.x, self.y + self.height // 2, 5, RED, 10, chosen_type))
            elif self.type == 1:
                bullets.append(EnemyBullet(self.x - 10, self.y + self.height // 2, 5, RED, 10, chosen_type))
                bullets.append(EnemyBullet(self.x + 10, self.y + self.height // 2, 5, RED, 10, chosen_type))
            elif self.type == 2:
                for i in [-1, 0, 1]:
                    angle = math.radians(i * 20)
                    sx = math.sin(angle) * 2
                    bullets.append(EnemyBullet(self.x, self.y + self.height // 2, 5, RED, 12, chosen_type, sx))
            elif self.type == 3:
                bullets.append(EnemyBullet(self.x, self.y + self.height // 2, 3, GREEN, 15, "debug"))
                if random.random() < 0.3:
                    bullets.append(EnemyBullet(self.x, self.y + self.height // 2, 6, RED, 10, "fish"))
                    
            return bullets
        return []

    def take_damage(self, amount):
        self.health -= amount
        self.hit_flash = self.hit_flash_max
        if self.health < 0:
            self.health = 0

    def draw(self, surface):
        cx, cy = self.x, self.y
        size = self.width // 2

        base_color = (200, 100, 100) if self.type == 0 else (150, 150, 200) if self.type == 1 else (200, 200, 100) if self.type == 2 else (100, 255, 100)
        color = DAMAGE_COLOR if self.hit_flash > 0 else base_color

        if self.type == 0:
            draw_hand_drawn_circle(surface, color, (cx, cy), size, 3)
            draw_hand_drawn_line(surface, color, (cx - size, cy), (cx - size - 10, cy + 10), 2)
            draw_hand_drawn_line(surface, color, (cx + size, cy), (cx + size + 10, cy + 10), 2)
        elif self.type == 1:
            draw_hand_drawn_rect(surface, color, (cx - size, cy - size, size * 2, size * 2), 3)
            draw_hand_drawn_line(surface, color, (cx - size, cy - size), (cx - size - 8, cy - size - 8), 2)
            draw_hand_drawn_line(surface, color, (cx + size, cy - size), (cx + size + 8, cy - size - 8), 2)
        elif self.type == 2:
            draw_hand_drawn_circle(surface, color, (cx, cy), size, 3)
            draw_hand_drawn_circle(surface, color, (cx, cy), size - 10, 2)
            draw_hand_drawn_line(surface, color, (cx, cy - size), (cx, cy - size - 15), 3)
        else:
            draw_hand_drawn_circle(surface, color, (cx, cy), size, 4)
            draw_hand_drawn_rect(surface, color, (cx - size - 5, cy - 5, size * 2 + 10, 10), 3)
            draw_hand_drawn_rect(surface, color, (cx - 5, cy - size - 5, 10, size * 2 + 10), 3)

        bar_width = size * 2
        bar_height = 4
        health_ratio = self.health / self.max_health
        pygame.draw.rect(surface, RED, (cx - size, cy - size - 15, bar_width, bar_height))
        pygame.draw.rect(surface, GREEN, (cx - size, cy - size - 15, int(bar_width * health_ratio), bar_height))

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return self.y > SCREEN_HEIGHT + 50


class Boss:
    def __init__(self, wave):
        self.x = SCREEN_WIDTH // 2
        self.y = -100
        self.target_y = 100
        self.width = 120
        self.height = 100
        self.speed = 2
        self.health = 500 + wave * 200
        self.max_health = self.health
        self.shoot_cooldown = 0
        self.shoot_delay = 30
        self.phase = 0
        self.hit_flash = 0
        self.hit_flash_max = 10
        self.direction = 1
        self.entering = True
        self.angle = 0

    def update(self):
        if self.entering:
            self.y += 2
            if self.y >= self.target_y:
                self.entering = False
            return

        self.angle += 0.02
        self.x += self.direction * self.speed
        if self.x < 150 or self.x > SCREEN_WIDTH - 150:
            self.direction *= -1

        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1
        if self.hit_flash > 0:
            self.hit_flash -= 1

        health_ratio = self.health / self.max_health
        if health_ratio < 0.3:
            self.phase = 2
        elif health_ratio < 0.6:
            self.phase = 1

    def shoot(self):
        if self.entering:
            return []
        
        if self.shoot_cooldown == 0:
            self.shoot_cooldown = max(15, self.shoot_delay - self.phase * 5)
            bullets = []
            
            if self.phase == 0:
                for i in [-2, -1, 0, 1, 2]:
                    angle = math.radians(i * 15)
                    sx = math.sin(angle) * 3
                    bullets.append(EnemyBullet(self.x + i * 15, self.y + 50, 6, RED, 15, "normal", sx))
            
            elif self.phase == 1:
                for i in range(8):
                    angle = math.radians(i * 45 + self.angle * 50)
                    sx = math.cos(angle) * 4
                    sy = math.sin(angle) * 4 + 2
                    bullets.append(EnemyBullet(self.x, self.y + 40, sy, PURPLE, 12, "wave", sx))
            
            else:
                for i in range(12):
                    angle = math.radians(i * 30 + self.angle * 100)
                    sx = math.cos(angle) * 5
                    sy = math.sin(angle) * 5 + 3
                    b_type = "fish" if i % 3 == 0 else "debug" if i % 3 == 1 else "slow"
                    bullets.append(EnemyBullet(self.x, self.y + 40, sy, ORANGE, 20, b_type, sx))
                
            return bullets
        return []

    def take_damage(self, amount):
        self.health -= amount
        self.hit_flash = self.hit_flash_max
        if self.health < 0:
            self.health = 0

    def draw(self, surface):
        cx, cy = self.x, self.y
        color = DAMAGE_COLOR if self.hit_flash > 0 else (255, 50, 50)

        draw_hand_drawn_rect(surface, color, (cx - 50, cy - 40, 100, 80), 4)
        draw_hand_drawn_circle(surface, color, (cx, cy), 35, 3)
        
        draw_hand_drawn_rect(surface, color, (cx - 70, cy + 20, 30, 20), 3)
        draw_hand_drawn_rect(surface, color, (cx + 40, cy + 20, 30, 20), 3)
        
        draw_hand_drawn_circle(surface, YELLOW, (cx - 25, cy - 10), 8, 2)
        draw_hand_drawn_circle(surface, YELLOW, (cx + 25, cy - 10), 8, 2)
        draw_hand_drawn_circle(surface, RED, (cx, cy + 10), 12, 3)

        bar_width = 100
        bar_height = 8
        health_ratio = self.health / self.max_health
        pygame.draw.rect(surface, RED, (cx - 50, cy - 60, bar_width, bar_height))
        pygame.draw.rect(surface, GREEN, (cx - 50, cy - 60, int(bar_width * health_ratio), bar_height))

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return False

    def is_dead(self):
        return self.health <= 0


class PowerUp:
    def __init__(self, x, y, power_type):
        self.x = x
        self.y = y
        self.type = power_type
        self.speed = 2
        self.width = 25
        self.height = 25
        self.angle = 0

    def update(self):
        self.y += self.speed
        self.angle += 0.1

    def draw(self, surface):
        cx, cy = self.x, self.y
        
        colors = [YELLOW, GREEN, RED, BLUE, PURPLE]
        color = colors[self.type % len(colors)]
        
        draw_hand_drawn_circle(surface, color, (cx, cy), 12, 2)
        
        if self.type == 0:
            draw_hand_drawn_line(surface, color, (cx, cy - 8), (cx, cy + 8), 2)
            draw_hand_drawn_line(surface, color, (cx - 8, cy), (cx + 8, cy), 2)
        elif self.type == 1:
            draw_hand_drawn_rect(surface, color, (cx - 6, cy - 6, 12, 12), 2)
        elif self.type == 2:
            draw_hand_drawn_line(surface, color, (cx, cy - 6), (cx, cy + 6), 2)
            draw_hand_drawn_line(surface, color, (cx - 5, cy - 3), (cx + 5, cy - 3), 2)
            draw_hand_drawn_line(surface, color, (cx - 5, cy + 3), (cx + 5, cy + 3), 2)
        elif self.type == 3:
            draw_hand_drawn_line(surface, color, (cx - 6, cy), (cx + 6, cy), 2)
            draw_hand_drawn_line(surface, color, (cx - 4, cy - 4), (cx + 4, cy + 4), 2)
        else:
            draw_hand_drawn_line(surface, color, (cx - 6, cy), (cx + 6, cy), 2)

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return self.y > SCREEN_HEIGHT + 30


class Explosion:
    def __init__(self, x, y, size=1):
        self.x = x
        self.y = y
        self.frame = 0
        self.max_frames = int(20 * size)
        self.size = size

    def update(self):
        self.frame += 1

    def draw(self, surface):
        progress = self.frame / self.max_frames
        radius = int(20 * self.size + progress * 30 * self.size)

        colors = [(255, 200, 100), (255, 100, 50), (255, 50, 50)]
        for i, color in enumerate(colors):
            r = radius - i * 5
            if r > 0:
                draw_hand_drawn_circle(surface, color, (self.x, self.y), r, 2)

    def is_finished(self):
        return self.frame >= self.max_frames


class DamageNumber:
    def __init__(self, x, y, damage):
        self.x = x
        self.y = y
        self.damage = damage
        self.frame = 0
        self.max_frames = 30

    def update(self):
        self.frame += 1
        self.y -= 1

    def draw(self, surface, font):
        alpha = int(255 * (1 - self.frame / self.max_frames))
        text = font.render(f"-{self.damage}", True, RED)
        text.set_alpha(alpha)
        surface.blit(text, (self.x - text.get_width() // 2, self.y))

    def is_finished(self):
        return self.frame >= self.max_frames


class Star:
    def __init__(self):
        self.x = random.randint(0, SCREEN_WIDTH)
        self.y = random.randint(0, SCREEN_HEIGHT)
        self.size = random.randint(1, 3)
        self.speed = self.size * 0.5

    def update(self):
        self.y += self.speed
        if self.y > SCREEN_HEIGHT:
            self.y = 0
            self.x = random.randint(0, SCREEN_WIDTH)

    def draw(self, surface):
        pygame.draw.circle(surface, (150, 150, 200), (self.x, self.y), self.size)


class Leaderboard:
    def __init__(self):
        self.scores = []
        self.load()

    def load(self):
        try:
            if os.path.exists("leaderboard.json"):
                with open("leaderboard.json", "r") as f:
                    self.scores = json.load(f)
        except:
            self.scores = []

    def save(self):
        try:
            with open("leaderboard.json", "w") as f:
                json.dump(self.scores, f)
        except:
            pass

    def add_score(self, score, name="Player"):
        self.scores.append({"score": score, "name": name})
        self.scores.sort(key=lambda x: x["score"], reverse=True)
        self.scores = self.scores[:10]
        self.save()

    def get_top_scores(self, n=10):
        return self.scores[:n]


class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Hand-Drawn Thunder Fighter")

        try:
            self.font = pygame.font.SysFont("microsoftyahei", 48)
            self.small_font = pygame.font.SysFont("microsoftyahei", 28)
            self.damage_font = pygame.font.SysFont("microsoftyahei", 20)
            self.tiny_font = pygame.font.SysFont("microsoftyahei", 16)
        except:
            try:
                self.font = pygame.font.SysFont("simhei", 48)
                self.small_font = pygame.font.SysFont("simhei", 28)
                self.damage_font = pygame.font.SysFont("simhei", 20)
                self.tiny_font = pygame.font.SysFont("simhei", 16)
            except:
                self.font = pygame.font.Font(None, 48)
                self.small_font = pygame.font.Font(None, 28)
                self.damage_font = pygame.font.Font(None, 20)
                self.tiny_font = pygame.font.Font(None, 16)

        self.clock = pygame.time.Clock()
        self.leaderboard = Leaderboard()
        self.lang = "cn"
        
        self.state = "menu"
        self.player = None
        self.bullets = []
        self.enemy_bullets = []
        self.enemies = []
        self.boss = None
        self.powerups = []
        self.explosions = []
        self.damage_numbers = []
        self.stars = [Star() for _ in range(50)]
        self.score = 0
        self.wave = 0
        self.wave_timer = 0
        self.enemies_in_wave = 0
        self.max_enemies_in_wave = 0
        self.supply_timer = 0

    def reset_game(self):
        self.player = Player()
        self.bullets = []
        self.enemy_bullets = []
        self.enemies = []
        self.boss = None
        self.powerups = []
        self.explosions = []
        self.damage_numbers = []
        self.score = 0
        self.wave = 0
        self.wave_timer = 0
        self.enemies_in_wave = 0
        self.max_enemies_in_wave = 0
        self.supply_timer = 0
        self.start_next_wave()

    def start_next_wave(self):
        self.wave += 1
        self.wave_timer = 90
        self.enemies_in_wave = 0
        self.max_enemies_in_wave = 5 + self.wave * 2
        
        if self.wave % 3 == 0:
            self.boss = Boss(self.wave)

    def spawn_enemy(self):
        if self.boss:
            return
            
        if self.enemies_in_wave < self.max_enemies_in_wave:
            x = random.randint(80, SCREEN_WIDTH - 80)
            enemy_type = min(3, (self.wave - 1) // 2)
            if self.wave > 3:
                enemy_type = random.randint(0, min(3, self.wave // 2))
            self.enemies.append(Enemy(x, -50, enemy_type))
            self.enemies_in_wave += 1

    def spawn_powerup(self, x, y):
        if random.random() < 0.3:
            power_type = random.randint(0, 4)
            self.powerups.append(PowerUp(x, y, power_type))

    def check_collision(self, rect1, rect2):
        return rect1.colliderect(rect2)

    def handle_menu(self, event):
        if event.type == MOUSEBUTTONDOWN:
            if event.button == 1:
                mx, my = pygame.mouse.get_pos()
                
                lang_btn_rect = pygame.Rect(SCREEN_WIDTH - 130, SCREEN_HEIGHT - 50, 120, 40)
                if lang_btn_rect.collidepoint(mx, my):
                    self.lang = "en" if self.lang == "cn" else "cn"
                    return
                
                leader_btn_rect = pygame.Rect(20, SCREEN_HEIGHT - 50, 120, 40)
                if leader_btn_rect.collidepoint(mx, my):
                    self.state = "leaderboard"
                    return
                
                self.state = "playing"
                self.reset_game()

    def handle_leaderboard(self, event):
        if event.type == MOUSEBUTTONDOWN:
            if event.button == 1:
                self.state = "menu"

    def handle_game(self, event):
        if event.type == KEYDOWN:
            if event.key == K_ESCAPE:
                self.state = "menu"
            elif event.key == pygame.K_m:
                self.player.move_mode = (self.player.move_mode + 1) % 3
            elif event.key == pygame.K_1:
                self.player.weapon_type = 0
            elif event.key == pygame.K_2:
                self.player.weapon_type = 1
            elif event.key == pygame.K_3:
                self.player.weapon_type = 2

    def draw_menu(self):
        self.screen.fill(BG_COLOR)

        for star in self.stars:
            star.draw(self.screen)

        lang = LANG_CN if self.lang == "cn" else LANG_EN
        
        title = self.font.render(lang["title"], True, YELLOW)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 3))
        self.screen.blit(title, title_rect)

        prompt = self.small_font.render(lang["start"], True, WHITE)
        prompt_rect = prompt.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(prompt, prompt_rect)

        controls = self.tiny_font.render(lang["controls"], True, (150, 150, 150))
        controls_rect = controls.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT * 2 // 3))
        self.screen.blit(controls, controls_rect)

        pygame.draw.rect(self.screen, (80, 80, 100), (SCREEN_WIDTH - 130, SCREEN_HEIGHT - 50, 120, 40))
        lang_text = self.tiny_font.render(f"{lang['lang']}: {'CN' if self.lang == 'cn' else 'EN'}", True, WHITE)
        lang_rect = lang_text.get_rect(center=(SCREEN_WIDTH - 70, SCREEN_HEIGHT - 30))
        self.screen.blit(lang_text, lang_rect)

        pygame.draw.rect(self.screen, (80, 80, 100), (20, SCREEN_HEIGHT - 50, 120, 40))
        leader_text = self.tiny_font.render(lang["leaderboard"], True, WHITE)
        leader_rect = leader_text.get_rect(center=(80, SCREEN_HEIGHT - 30))
        self.screen.blit(leader_text, leader_rect)

        pygame.display.flip()

    def draw_leaderboard(self):
        self.screen.fill(BG_COLOR)

        for star in self.stars:
            star.draw(self.screen)

        lang = LANG_CN if self.lang == "cn" else LANG_EN

        title = self.font.render(lang["leaderboard"], True, YELLOW)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, 80))
        self.screen.blit(title, title_rect)

        scores = self.leaderboard.get_top_scores(10)
        if not scores:
            no_scores = self.small_font.render(lang["no_scores"], True, (150, 150, 150))
            no_scores_rect = no_scores.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
            self.screen.blit(no_scores, no_scores_rect)
        else:
            for i, score_data in enumerate(scores):
                y = 150 + i * 35
                rank_text = self.small_font.render(f"{i + 1}.", True, WHITE)
                self.screen.blit(rank_text, (200, y))
                
                name_text = self.small_font.render(score_data["name"], True, WHITE)
                self.screen.blit(name_text, (260, y))
                
                score_text = self.small_font.render(f"{score_data['score']}", True, YELLOW)
                self.screen.blit(score_text, (450, y))

        prompt = self.small_font.render(lang["return_menu"], True, YELLOW)
        prompt_rect = prompt.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT - 80))
        self.screen.blit(prompt, prompt_rect)

        pygame.display.flip()

    def draw_game(self):
        self.screen.fill(BG_COLOR)

        for star in self.stars:
            star.draw(self.screen)

        for bullet in self.bullets:
            bullet.draw(self.screen)

        for bullet in self.enemy_bullets:
            bullet.draw(self.screen)

        for enemy in self.enemies:
            enemy.draw(self.screen)

        if self.boss:
            self.boss.draw(self.screen)

        for powerup in self.powerups:
            powerup.draw(self.screen)

        self.player.draw(self.screen)

        for explosion in self.explosions:
            explosion.draw(self.screen)

        for damage_num in self.damage_numbers:
            damage_num.draw(self.screen, self.damage_font)

        lang = LANG_CN if self.lang == "cn" else LANG_EN
        weapon_names = WEAPON_NAMES_CN if self.lang == "cn" else WEAPON_NAMES_EN
        move_names = MOVE_NAMES_CN if self.lang == "cn" else MOVE_NAMES_EN

        score_text = self.small_font.render(f"{lang['score']}{self.score}", True, WHITE)
        self.screen.blit(score_text, (20, 20))

        wave_text = self.small_font.render(f"{lang['wave']}{self.wave}{lang['wave_suffix']}", True, YELLOW)
        wave_rect = wave_text.get_rect(center=(SCREEN_WIDTH // 2, 20))
        self.screen.blit(wave_text, wave_rect)

        health_text = self.small_font.render(f"{lang['health']}{self.player.health}", True, GREEN)
        health_rect = health_text.get_rect(topright=(SCREEN_WIDTH - 20, 20))
        self.screen.blit(health_text, health_rect)

        weapon_text = self.tiny_font.render(f"{lang['weapon']}{weapon_names[self.player.weapon_type]}", True, CYAN)
        self.screen.blit(weapon_text, (20, 50))

        level_text = self.tiny_font.render(f"{lang['level']}{self.player.weapon_level}", True, PURPLE)
        self.screen.blit(level_text, (20, 75))

        move_text = self.tiny_font.render(f"{lang['move_mode']}{move_names[self.player.move_mode]}", True, ORANGE)
        move_rect = move_text.get_rect(topright=(SCREEN_WIDTH - 20, 50))
        self.screen.blit(move_text, move_rect)

        if self.wave_timer > 0:
            wave_start = self.font.render(f"{lang['wave_coming']}{self.wave}{lang['wave_coming_suffix']}", True, RED)
            wave_start_rect = wave_start.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
            self.screen.blit(wave_start, wave_start_rect)

        if self.boss and self.boss.entering:
            boss_text = self.font.render(lang["boss"], True, RED)
            boss_rect = boss_text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
            self.screen.blit(boss_text, boss_rect)

        pygame.display.flip()

    def draw_game_over(self):
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        lang = LANG_CN if self.lang == "cn" else LANG_EN

        game_over = self.font.render(lang["game_over"], True, RED)
        game_over_rect = game_over.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 3))
        self.screen.blit(game_over, game_over_rect)

        final_score = self.small_font.render(f"{lang['final_score']}{self.score}", True, WHITE)
        score_rect = final_score.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(final_score, score_rect)

        prompt = self.small_font.render(lang["return_menu"], True, YELLOW)
        prompt_rect = prompt.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT * 2 // 3))
        self.screen.blit(prompt, prompt_rect)

        pygame.display.flip()

    def update_menu(self):
        for star in self.stars:
            star.update()

    def update_leaderboard(self):
        for star in self.stars:
            star.update()

    def update_game(self):
        if self.wave_timer > 0:
            self.wave_timer -= 1
            return

        keys = pygame.key.get_pressed()
        mouse_pos = pygame.mouse.get_pos()
        self.player.move(keys, mouse_pos)

        if keys[K_SPACE]:
            bullets = self.player.shoot()
            self.bullets.extend(bullets)

        self.player.update()

        for star in self.stars:
            star.update()

        if random.randint(0, max(20, 50 - self.wave * 2)) == 0:
            self.spawn_enemy()

        self.supply_timer += 1
        if self.supply_timer > 600:
            self.supply_timer = 0
            x = random.randint(50, SCREEN_WIDTH - 50)
            self.powerups.append(PowerUp(x, -30, random.randint(0, 4)))

        for bullet in self.bullets[:]:
            bullet.update()
            if bullet.is_off_screen():
                self.bullets.remove(bullet)

        for bullet in self.enemy_bullets[:]:
            bullet.update()
            if bullet.is_off_screen():
                self.enemy_bullets.remove(bullet)

        for enemy in self.enemies[:]:
            enemy.update()
            bullets = enemy.shoot(self.player.x, self.player.y)
            self.enemy_bullets.extend(bullets)
            if enemy.is_off_screen():
                self.enemies.remove(enemy)

        if self.boss:
            self.boss.update()
            bullets = self.boss.shoot()
            self.enemy_bullets.extend(bullets)
            if self.boss.is_dead():
                for _ in range(10):
                    x = self.boss.x + random.randint(-50, 50)
                    y = self.boss.y + random.randint(-50, 50)
                    self.explosions.append(Explosion(x, y, 2))
                self.score += 5000
                self.spawn_powerup(self.boss.x, self.boss.y)
                self.spawn_powerup(self.boss.x - 30, self.boss.y)
                self.spawn_powerup(self.boss.x + 30, self.boss.y)
                self.boss = None

        for powerup in self.powerups[:]:
            powerup.update()
            if powerup.is_off_screen():
                self.powerups.remove(powerup)

        for explosion in self.explosions[:]:
            explosion.update()
            if explosion.is_finished():
                self.explosions.remove(explosion)

        for damage_num in self.damage_numbers[:]:
            damage_num.update()
            if damage_num.is_finished():
                self.damage_numbers.remove(damage_num)

        for bullet in self.bullets[:]:
            for enemy in self.enemies[:]:
                if self.check_collision(bullet.get_rect(), enemy.get_rect()):
                    if bullet in self.bullets and not isinstance(bullet, Laser):
                        self.bullets.remove(bullet)
                    enemy.take_damage(bullet.damage)
                    self.damage_numbers.append(DamageNumber(enemy.x, enemy.y - 20, bullet.damage))
                    if enemy.health <= 0:
                        self.explosions.append(Explosion(enemy.x, enemy.y))
                        self.enemies.remove(enemy)
                        self.score += (enemy.type + 1) * 100
                        self.spawn_powerup(enemy.x, enemy.y)
                    break
            
            if self.boss and bullet in self.bullets:
                if self.check_collision(bullet.get_rect(), self.boss.get_rect()):
                    if not isinstance(bullet, Laser):
                        self.bullets.remove(bullet)
                    self.boss.take_damage(bullet.damage)
                    self.damage_numbers.append(DamageNumber(self.boss.x, self.boss.y - 50, bullet.damage))

        for bullet in self.enemy_bullets[:]:
            if self.check_collision(bullet.get_rect(), self.player.get_rect()):
                self.enemy_bullets.remove(bullet)
                self.player.take_damage(bullet.damage)
                self.damage_numbers.append(DamageNumber(self.player.x, self.player.y - 30, bullet.damage))
                if self.player.health <= 0:
                    self.leaderboard.add_score(self.score)
                    self.state = "gameover"

        for enemy in self.enemies[:]:
            if self.check_collision(enemy.get_rect(), self.player.get_rect()):
                self.explosions.append(Explosion(enemy.x, enemy.y))
                self.enemies.remove(enemy)
                damage = 30
                self.player.take_damage(damage)
                self.damage_numbers.append(DamageNumber(self.player.x, self.player.y - 30, damage))
                if self.player.health <= 0:
                    self.leaderboard.add_score(self.score)
                    self.state = "gameover"

        if self.boss and not self.boss.entering:
            if self.check_collision(self.boss.get_rect(), self.player.get_rect()):
                damage = 50
                self.player.take_damage(damage)
                self.damage_numbers.append(DamageNumber(self.player.x, self.player.y - 30, damage))
                if self.player.health <= 0:
                    self.leaderboard.add_score(self.score)
                    self.state = "gameover"

        for powerup in self.powerups[:]:
            if self.check_collision(powerup.get_rect(), self.player.get_rect()):
                self.powerups.remove(powerup)
                if powerup.type == 0:
                    self.player.upgrade_weapon()
                elif powerup.type == 1:
                    self.player.heal(30)
                elif powerup.type == 2:
                    self.player.weapon_type = (self.player.weapon_type + 1) % 3
                elif powerup.type == 3:
                    self.score += 500
                else:
                    self.player.max_health += 20
                    self.player.health += 20

        if len(self.enemies) == 0 and self.enemies_in_wave >= self.max_enemies_in_wave and not self.boss:
            self.start_next_wave()

    def run(self):
        running = True
        while running:
            self.clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == QUIT:
                    running = False

                if self.state == "menu":
                    self.handle_menu(event)
                elif self.state == "leaderboard":
                    self.handle_leaderboard(event)
                elif self.state == "playing":
                    self.handle_game(event)
                elif self.state == "gameover":
                    if event.type == MOUSEBUTTONDOWN:
                        if event.button == 1:
                            self.state = "menu"

            if self.state == "menu":
                self.update_menu()
                self.draw_menu()
            elif self.state == "leaderboard":
                self.update_leaderboard()
                self.draw_leaderboard()
            elif self.state == "playing":
                self.update_game()
                self.draw_game()
            elif self.state == "gameover":
                self.draw_game_over()

        pygame.quit()


if __name__ == "__main__":
    game = Game()
    game.run()
