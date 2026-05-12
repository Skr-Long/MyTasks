import pygame
import random
import math
from constants import SCREEN_WIDTH, SCREEN_HEIGHT

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
        from constants import RED
        alpha = int(255 * (1 - self.frame / self.max_frames))
        text = font.render(f"-{self.damage}", True, RED)
        text.set_alpha(alpha)
        surface.blit(text, (self.x - text.get_width() // 2, self.y))

    def is_finished(self):
        return self.frame >= self.max_frames


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
