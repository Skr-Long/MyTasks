import pygame
import random
import math
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
BG_COLOR = (30, 30, 50)


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

    def move(self, keys):
        if keys[K_LEFT] or keys[K_a]:
            self.x -= self.speed
        if keys[K_RIGHT] or keys[K_d]:
            self.x += self.speed
        if keys[K_UP] or keys[K_w]:
            self.y -= self.speed
        if keys[K_DOWN] or keys[K_s]:
            self.y += self.speed

        self.x = max(self.width // 2, min(SCREEN_WIDTH - self.width // 2, self.x))
        self.y = max(self.height // 2, min(SCREEN_HEIGHT - self.height // 2, self.y))

    def shoot(self):
        if self.shoot_cooldown == 0:
            self.shoot_cooldown = self.shoot_delay
            return Bullet(self.x, self.y - self.height // 2, -10, YELLOW)
        return None

    def update(self):
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def draw(self, surface):
        cx, cy = self.x, self.y

        draw_hand_drawn_rect(surface, BLUE, (cx - 15, cy - 25, 30, 50), 3)
        draw_hand_drawn_line(surface, BLUE, (cx - 15, cy - 15), (cx - 35, cy + 15), 3)
        draw_hand_drawn_line(surface, BLUE, (cx + 15, cy - 15), (cx + 35, cy + 15), 3)
        draw_hand_drawn_circle(surface, BLUE, (cx, cy - 10), 10, 3)

        pygame.draw.circle(surface, RED, (cx - 20, cy + 20), 4)
        pygame.draw.circle(surface, RED, (cx + 20, cy + 20), 4)
        pygame.draw.circle(surface, YELLOW, (cx, cy + 25), 3)

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)


class Bullet:
    def __init__(self, x, y, speed, color):
        self.x = x
        self.y = y
        self.speed = speed
        self.color = color
        self.width = 6
        self.height = 15

    def update(self):
        self.y += self.speed

    def draw(self, surface):
        draw_hand_drawn_rect(surface, self.color, (self.x - 3, self.y - 7, 6, 14), 2)
        pygame.draw.circle(surface, self.color, (self.x, self.y - 7), 4)

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return self.y < -20 or self.y > SCREEN_HEIGHT + 20


class Enemy:
    def __init__(self, x, y, enemy_type):
        self.x = x
        self.y = y
        self.type = enemy_type
        self.speed = 2 + enemy_type
        self.health = 20 + enemy_type * 15
        self.max_health = self.health
        self.shoot_cooldown = random.randint(0, 60)
        self.shoot_delay = 60 - enemy_type * 10
        self.width = 40 + enemy_type * 10
        self.height = 40 + enemy_type * 10
        self.direction = 1

    def update(self):
        self.y += self.speed * 0.5
        self.x += self.direction * self.speed * 0.3

        if self.x < 50 or self.x > SCREEN_WIDTH - 50:
            self.direction *= -1

        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def shoot(self):
        if self.shoot_cooldown == 0 and self.y > 50:
            self.shoot_cooldown = self.shoot_delay
            return Bullet(self.x, self.y + self.height // 2, 5, RED)
        return None

    def draw(self, surface):
        cx, cy = self.x, self.y
        size = self.width // 2

        if self.type == 0:
            color = (200, 100, 100)
            draw_hand_drawn_circle(surface, color, (cx, cy), size, 3)
            draw_hand_drawn_line(surface, color, (cx - size, cy), (cx - size - 10, cy + 10), 2)
            draw_hand_drawn_line(surface, color, (cx + size, cy), (cx + size + 10, cy + 10), 2)
        elif self.type == 1:
            color = (150, 150, 200)
            draw_hand_drawn_rect(surface, color, (cx - size, cy - size, size * 2, size * 2), 3)
            draw_hand_drawn_line(surface, color, (cx - size, cy - size), (cx - size - 8, cy - size - 8), 2)
            draw_hand_drawn_line(surface, color, (cx + size, cy - size), (cx + size + 8, cy - size - 8), 2)
        else:
            color = (200, 200, 100)
            draw_hand_drawn_circle(surface, color, (cx, cy), size, 3)
            draw_hand_drawn_circle(surface, color, (cx, cy), size - 10, 2)
            draw_hand_drawn_line(surface, color, (cx, cy - size), (cx, cy - size - 15), 3)

        if self.health < self.max_health:
            bar_width = size * 2
            bar_height = 4
            health_ratio = self.health / self.max_health
            pygame.draw.rect(surface, RED, (cx - size, cy - size - 15, bar_width, bar_height))
            pygame.draw.rect(surface, GREEN, (cx - size, cy - size - 15, int(bar_width * health_ratio), bar_height))

    def get_rect(self):
        return pygame.Rect(self.x - self.width // 2, self.y - self.height // 2, self.width, self.height)

    def is_off_screen(self):
        return self.y > SCREEN_HEIGHT + 50


class Explosion:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.frame = 0
        self.max_frames = 20

    def update(self):
        self.frame += 1

    def draw(self, surface):
        progress = self.frame / self.max_frames
        radius = int(20 + progress * 30)
        alpha = int(255 * (1 - progress))

        colors = [(255, 200, 100), (255, 100, 50), (255, 50, 50)]
        for i, color in enumerate(colors):
            r = radius - i * 5
            if r > 0:
                draw_hand_drawn_circle(surface, color, (self.x, self.y), r, 2)

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


class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("手绘雷电战机")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.Font(None, 48)
        self.small_font = pygame.font.Font(None, 36)

        self.state = "menu"
        self.player = None
        self.bullets = []
        self.enemy_bullets = []
        self.enemies = []
        self.explosions = []
        self.stars = [Star() for _ in range(50)]
        self.score = 0
        self.wave = 0
        self.wave_timer = 0
        self.enemies_in_wave = 0
        self.max_enemies_in_wave = 0

    def reset_game(self):
        self.player = Player()
        self.bullets = []
        self.enemy_bullets = []
        self.enemies = []
        self.explosions = []
        self.score = 0
        self.wave = 0
        self.wave_timer = 0
        self.enemies_in_wave = 0
        self.max_enemies_in_wave = 0
        self.start_next_wave()

    def start_next_wave(self):
        self.wave += 1
        self.wave_timer = 60
        self.enemies_in_wave = 0
        self.max_enemies_in_wave = 5 + self.wave * 2

    def spawn_enemy(self):
        if self.enemies_in_wave < self.max_enemies_in_wave:
            x = random.randint(80, SCREEN_WIDTH - 80)
            enemy_type = min(2, (self.wave - 1) // 2)
            if self.wave > 3:
                enemy_type = random.randint(0, min(2, self.wave // 2))
            self.enemies.append(Enemy(x, -50, enemy_type))
            self.enemies_in_wave += 1

    def check_collision(self, rect1, rect2):
        return rect1.colliderect(rect2)

    def handle_menu(self, event):
        if event.type == MOUSEBUTTONDOWN:
            if event.button == 1:
                self.state = "playing"
                self.reset_game()

    def handle_game(self, event):
        if event.type == KEYDOWN:
            if event.key == K_ESCAPE:
                self.state = "menu"

    def draw_menu(self):
        self.screen.fill(BG_COLOR)

        for star in self.stars:
            star.draw(self.screen)

        title = self.font.render("手绘雷电战机", True, YELLOW)
        title_rect = title.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 3))
        self.screen.blit(title, title_rect)

        prompt = self.small_font.render("点击开始游戏", True, WHITE)
        prompt_rect = prompt.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(prompt, prompt_rect)

        controls = self.small_font.render("WASD / 方向键移动  空格射击", True, (150, 150, 150))
        controls_rect = controls.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT * 2 // 3))
        self.screen.blit(controls, controls_rect)

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

        self.player.draw(self.screen)

        for explosion in self.explosions:
            explosion.draw(self.screen)

        score_text = self.small_font.render(f"分数: {self.score}", True, WHITE)
        self.screen.blit(score_text, (20, 20))

        wave_text = self.small_font.render(f"第 {self.wave} 波", True, YELLOW)
        wave_rect = wave_text.get_rect(center=(SCREEN_WIDTH // 2, 20))
        self.screen.blit(wave_text, wave_rect)

        health_text = self.small_font.render(f"生命: {self.player.health}", True, GREEN)
        health_rect = health_text.get_rect(topright=(SCREEN_WIDTH - 20, 20))
        self.screen.blit(health_text, health_rect)

        if self.wave_timer > 0:
            wave_start = self.font.render(f"第 {self.wave} 波来袭!", True, RED)
            wave_start_rect = wave_start.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
            self.screen.blit(wave_start, wave_start_rect)

        pygame.display.flip()

    def draw_game_over(self):
        overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        overlay.set_alpha(128)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))

        game_over = self.font.render("游戏结束!", True, RED)
        game_over_rect = game_over.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 3))
        self.screen.blit(game_over, game_over_rect)

        final_score = self.small_font.render(f"最终分数: {self.score}", True, WHITE)
        score_rect = final_score.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        self.screen.blit(final_score, score_rect)

        prompt = self.small_font.render("点击返回菜单", True, YELLOW)
        prompt_rect = prompt.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT * 2 // 3))
        self.screen.blit(prompt, prompt_rect)

        pygame.display.flip()

    def update_menu(self):
        for star in self.stars:
            star.update()

    def update_game(self):
        if self.wave_timer > 0:
            self.wave_timer -= 1
            return

        keys = pygame.key.get_pressed()
        self.player.move(keys)

        if keys[K_SPACE]:
            bullet = self.player.shoot()
            if bullet:
                self.bullets.append(bullet)

        self.player.update()

        for star in self.stars:
            star.update()

        if random.randint(0, 40) == 0:
            self.spawn_enemy()

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
            bullet = enemy.shoot()
            if bullet:
                self.enemy_bullets.append(bullet)
            if enemy.is_off_screen():
                self.enemies.remove(enemy)

        for explosion in self.explosions[:]:
            explosion.update()
            if explosion.is_finished():
                self.explosions.remove(explosion)

        for bullet in self.bullets[:]:
            for enemy in self.enemies[:]:
                if self.check_collision(bullet.get_rect(), enemy.get_rect()):
                    if bullet in self.bullets:
                        self.bullets.remove(bullet)
                    enemy.health -= 10
                    if enemy.health <= 0:
                        self.explosions.append(Explosion(enemy.x, enemy.y))
                        self.enemies.remove(enemy)
                        self.score += (enemy.type + 1) * 100
                    break

        for bullet in self.enemy_bullets[:]:
            if self.check_collision(bullet.get_rect(), self.player.get_rect()):
                self.enemy_bullets.remove(bullet)
                self.player.health -= 10
                if self.player.health <= 0:
                    self.state = "gameover"

        for enemy in self.enemies[:]:
            if self.check_collision(enemy.get_rect(), self.player.get_rect()):
                self.explosions.append(Explosion(enemy.x, enemy.y))
                self.enemies.remove(enemy)
                self.player.health -= 30
                if self.player.health <= 0:
                    self.state = "gameover"

        if len(self.enemies) == 0 and self.enemies_in_wave >= self.max_enemies_in_wave:
            if self.wave >= 5:
                self.state = "gameover"
            else:
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
                elif self.state == "playing":
                    self.handle_game(event)
                elif self.state == "gameover":
                    if event.type == MOUSEBUTTONDOWN:
                        if event.button == 1:
                            self.state = "menu"

            if self.state == "menu":
                self.update_menu()
                self.draw_menu()
            elif self.state == "playing":
                self.update_game()
                self.draw_game()
            elif self.state == "gameover":
                self.draw_game_over()

        pygame.quit()


if __name__ == "__main__":
    game = Game()
    game.run()
