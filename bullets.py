import pygame
import math
from constants import SCREEN_WIDTH, SCREEN_HEIGHT, YELLOW, CYAN, RED, PURPLE, ORANGE
from utils import draw_hand_drawn_rect, draw_hand_drawn_circle


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
            draw_hand_drawn_rect(surface, CYAN, (cx - 5, cy - 5, 10, 10), 3)
            draw_hand_drawn_circle(surface, CYAN, (cx, cy), 8, 2)
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


def draw_hand_drawn_line(surface, color, start, end, thickness=2):
    import random
    wobble_start = (start[0] + random.randint(-1, 1), start[1] + random.randint(-1, 1))
    wobble_end = (end[0] + random.randint(-1, 1), end[1] + random.randint(-1, 1))
    pygame.draw.line(surface, color, wobble_start, wobble_end, thickness)
