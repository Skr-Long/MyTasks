# -*- coding: utf-8 -*-
import pygame
import math
import random
import sys

pygame.init()

WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Cricket Battle")

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)
CYAN = (0, 255, 255)
GRAY = (128, 128, 128)

ARENA_CENTER = (WIDTH // 2, HEIGHT // 2)
ARENA_RADIUS = 220

clock = pygame.time.Clock()
FPS = 60

font_large = None
font_medium = None
font_small = None

def init_fonts():
    global font_large, font_medium, font_small
    try:
        font_large = pygame.font.SysFont("simhei, microsoftyahei, arial", 72)
        font_medium = pygame.font.SysFont("simhei, microsoftyahei, arial", 36)
        font_small = pygame.font.SysFont("simhei, microsoftyahei, arial", 24)
    except:
        font_large = pygame.font.Font(None, 72)
        font_medium = pygame.font.Font(None, 36)
        font_small = pygame.font.Font(None, 24)

init_fonts()


class Particle:
    def __init__(self, x, y, color, size, speed, lifetime):
        self.x = x
        self.y = y
        self.color = color
        self.size = size
        self.speed = speed
        self.lifetime = lifetime
        self.max_lifetime = lifetime
        angle = random.uniform(0, 2 * math.pi)
        self.dx = math.cos(angle) * speed
        self.dy = math.sin(angle) * speed

    def update(self):
        self.x += self.dx
        self.y += self.dy
        self.lifetime -= 1
        self.size *= 0.95

    def draw(self, surface):
        alpha = int((self.lifetime / self.max_lifetime) * 255)
        if alpha < 0:
            alpha = 0
        s = pygame.Surface((int(self.size * 2), int(self.size * 2)), pygame.SRCALPHA)
        pygame.draw.circle(s, (*self.color, alpha), (int(self.size), int(self.size)), int(self.size))
        surface.blit(s, (self.x - self.size, self.y - self.size))


class SkillEffect:
    def __init__(self, x, y, effect_type, color):
        self.x = x
        self.y = y
        self.effect_type = effect_type
        self.color = color
        self.frame = 0
        self.max_frames = 30
        self.particles = []
        self.active = True

    def update(self):
        self.frame += 1
        if self.frame >= self.max_frames:
            self.active = False

        if self.effect_type == "hit":
            if self.frame % 2 == 0 and self.frame < 20:
                for _ in range(5):
                    self.particles.append(
                        Particle(
                            self.x, self.y, self.color, random.randint(3, 8), random.uniform(2, 6), 20
                        )
                    )
        elif self.effect_type == "charge":
            if self.frame < 25:
                for _ in range(3):
                    angle = random.uniform(0, 2 * math.pi)
                    r = random.randint(10, 40)
                    px = self.x + math.cos(angle) * r
                    py = self.y + math.sin(angle) * r
                    self.particles.append(
                        Particle(px, py, self.color, random.randint(2, 5), random.uniform(1, 3), 15)
                    )
        elif self.effect_type == "shield":
            if self.frame % 3 == 0 and self.frame < 25:
                for _ in range(8):
                    angle = random.uniform(0, 2 * math.pi)
                    r = 35
                    px = self.x + math.cos(angle) * r
                    py = self.y + math.sin(angle) * r
                    self.particles.append(
                        Particle(px, py, self.color, random.randint(2, 4), 0, 10)
                    )

        for p in self.particles[:]:
            p.update()
            if p.lifetime <= 0:
                self.particles.remove(p)

    def draw(self, surface):
        for p in self.particles:
            p.draw(surface)

        if self.effect_type == "hit" and self.frame < 15:
            radius = 20 + self.frame * 2
            width = max(1, 5 - self.frame // 3)
            pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), int(radius), width)
        elif self.effect_type == "charge" and self.frame < 25:
            radius = 10 + self.frame
            pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), int(radius), 2)
        elif self.effect_type == "shield" and self.frame < 25:
            for i in range(3):
                radius = 30 + i * 10 + self.frame // 2
                alpha = max(0, 255 - self.frame * 10)
                s = pygame.Surface((int(radius * 2), int(radius * 2)), pygame.SRCALPHA)
                pygame.draw.circle(s, (*self.color, alpha), (int(radius), int(radius)), int(radius), 3)
                surface.blit(s, (self.x - radius, self.y - radius))


class Cricket:
    def __init__(self, x, y, color, name, is_player=True):
        self.x = x
        self.y = y
        self.color = color
        self.name = name
        self.radius = 20
        self.health = 100
        self.max_health = 100
        self.speed = 3
        self.angle = 0
        self.is_player = is_player

        self.skills = {
            "normal_attack": {"cooldown": 0, "max_cooldown": 30, "damage": 10, "range": 50},
            "power_strike": {"cooldown": 0, "max_cooldown": 90, "damage": 25, "range": 60},
            "shield": {"cooldown": 0, "max_cooldown": 150, "duration": 60, "active": False},
            "heal": {"cooldown": 0, "max_cooldown": 180, "heal_amount": 30},
        }

        self.shield_timer = 0
        self.effects = []
        self.velocity_history = []

    def update_cooldowns(self):
        for skill in self.skills.values():
            if skill["cooldown"] > 0:
                skill["cooldown"] -= 1

        if self.shield_timer > 0:
            self.shield_timer -= 1
            if self.shield_timer <= 0:
                self.skills["shield"]["active"] = False

    def move(self, dx, dy):
        if dx != 0 or dy != 0:
            length = math.hypot(dx, dy)
            dx = (dx / length) * self.speed
            dy = (dy / length) * self.speed

        new_x = self.x + dx
        new_y = self.y + dy

        dist_from_center = math.hypot(new_x - ARENA_CENTER[0], new_y - ARENA_CENTER[1])
        if dist_from_center + self.radius < ARENA_RADIUS:
            self.x = new_x
            self.y = new_y
        else:
            angle = math.atan2(new_y - ARENA_CENTER[1], new_x - ARENA_CENTER[0])
            self.x = ARENA_CENTER[0] + (ARENA_RADIUS - self.radius - 1) * math.cos(angle)
            self.y = ARENA_CENTER[1] + (ARENA_RADIUS - self.radius - 1) * math.sin(angle)

        self.velocity_history.append((dx, dy))
        if len(self.velocity_history) > 5:
            self.velocity_history.pop(0)

    def use_skill(self, skill_name, target):
        skill = self.skills[skill_name]
        if skill["cooldown"] > 0:
            return False

        dist = math.hypot(target.x - self.x, target.y - self.y)

        if skill_name == "normal_attack":
            if dist <= skill["range"]:
                skill["cooldown"] = skill["max_cooldown"]
                self.deal_damage(target, skill["damage"])
                self.effects.append(SkillEffect(target.x, target.y, "hit", self.color))
                return True
        elif skill_name == "power_strike":
            if dist <= skill["range"]:
                skill["cooldown"] = skill["max_cooldown"]
                self.effects.append(SkillEffect(self.x, self.y, "charge", self.color))
                self.deal_damage(target, skill["damage"])
                return True
        elif skill_name == "shield":
            skill["cooldown"] = skill["max_cooldown"]
            skill["active"] = True
            self.shield_timer = skill["duration"]
            self.effects.append(SkillEffect(self.x, self.y, "shield", self.color))
            return True
        elif skill_name == "heal":
            skill["cooldown"] = skill["max_cooldown"]
            self.health = min(self.max_health, self.health + skill["heal_amount"])
            self.effects.append(SkillEffect(self.x, self.y, "charge", GREEN))
            return True

        return False

    def deal_damage(self, target, damage):
        if target.skills["shield"]["active"]:
            damage = damage // 2
        target.health -= damage
        if target.health < 0:
            target.health = 0

    def ai_update(self, player):
        dx = player.x - self.x
        dy = player.y - self.y
        dist = math.hypot(dx, dy)

        if dist > 50:
            self.move(dx, dy)
        elif dist < 40:
            self.move(-dx, -dy)

        for skill_name in ["normal_attack", "power_strike", "shield", "heal"]:
            if self.skills[skill_name]["cooldown"] == 0:
                if skill_name == "heal" and self.health < 40:
                    self.use_skill(skill_name, player)
                elif skill_name == "shield" and self.health < 30:
                    self.use_skill(skill_name, player)
                elif skill_name in ["normal_attack", "power_strike"]:
                    self.use_skill(skill_name, player)
                break

    def update(self):
        self.update_cooldowns()

        avg_dx = sum(v[0] for v in self.velocity_history) / max(1, len(self.velocity_history))
        avg_dy = sum(v[1] for v in self.velocity_history) / max(1, len(self.velocity_history))
        if abs(avg_dx) > 0.1 or abs(avg_dy) > 0.1:
            self.angle = math.atan2(avg_dy, avg_dx)

        for effect in self.effects[:]:
            effect.update()
            if not effect.active:
                self.effects.remove(effect)

    def draw(self, surface):
        for effect in self.effects:
            effect.draw(surface)

        if self.skills["shield"]["active"]:
            pygame.draw.circle(surface, CYAN, (int(self.x), int(self.y)), self.radius + 8, 3)
            s = pygame.Surface((self.radius * 2 + 12, self.radius * 2 + 12), pygame.SRCALPHA)
            pygame.draw.circle(s, (*CYAN, 50), (self.radius + 6, self.radius + 6), self.radius + 6)
            surface.blit(s, (self.x - self.radius - 6, self.y - self.radius - 6))

        body_color = tuple(min(255, c + 50) for c in self.color)
        pygame.draw.circle(surface, body_color, (int(self.x), int(self.y)), self.radius)
        pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), self.radius, 3)

        antenna_length = 25
        ant1_x = self.x + math.cos(self.angle - 0.3) * antenna_length
        ant1_y = self.y + math.sin(self.angle - 0.3) * antenna_length
        ant2_x = self.x + math.cos(self.angle + 0.3) * antenna_length
        ant2_y = self.y + math.sin(self.angle + 0.3) * antenna_length
        pygame.draw.line(surface, self.color, (int(self.x), int(self.y)), (int(ant1_x), int(ant1_y)), 3)
        pygame.draw.line(surface, self.color, (int(self.x), int(self.y)), (int(ant2_x), int(ant2_y)), 3)

        eye_dist = 8
        eye1_x = self.x + math.cos(self.angle - 0.2) * eye_dist
        eye1_y = self.y + math.sin(self.angle - 0.2) * eye_dist
        eye2_x = self.x + math.cos(self.angle + 0.2) * eye_dist
        eye2_y = self.y + math.sin(self.angle + 0.2) * eye_dist
        pygame.draw.circle(surface, WHITE, (int(eye1_x), int(eye1_y)), 4)
        pygame.draw.circle(surface, WHITE, (int(eye2_x), int(eye2_y)), 4)
        pygame.draw.circle(surface, BLACK, (int(eye1_x), int(eye1_y)), 2)
        pygame.draw.circle(surface, BLACK, (int(eye2_x), int(eye2_y)), 2)

    def draw_health_bar(self, surface, x, y):
        bar_width = 100
        bar_height = 15

        pygame.draw.rect(surface, GRAY, (x, y, bar_width, bar_height))

        health_ratio = self.health / self.max_health
        health_width = int(bar_width * health_ratio)
        health_color = GREEN if health_ratio > 0.5 else YELLOW if health_ratio > 0.25 else RED
        pygame.draw.rect(surface, health_color, (x, y, health_width, bar_height))

        pygame.draw.rect(surface, WHITE, (x, y, bar_width, bar_height), 2)


class SoundManager:
    def __init__(self):
        self.cheer_timer = 0

    def play_cheer(self):
        self.cheer_timer = random.randint(60, 180)

    def update(self):
        if self.cheer_timer > 0:
            self.cheer_timer -= 1
        else:
            if random.randint(0, 300) == 0:
                self.play_cheer()


def draw_arena(surface):
    s = pygame.Surface((ARENA_RADIUS * 2, ARENA_RADIUS * 2), pygame.SRCALPHA)
    pygame.draw.circle(s, (50, 50, 60, 255), (ARENA_RADIUS, ARENA_RADIUS), ARENA_RADIUS)
    pygame.draw.circle(s, (70, 70, 80, 255), (ARENA_RADIUS, ARENA_RADIUS), ARENA_RADIUS - 5)
    surface.blit(s, (ARENA_CENTER[0] - ARENA_RADIUS, ARENA_CENTER[1] - ARENA_RADIUS))

    for i in range(8):
        angle = (i / 8) * 2 * math.pi
        x = ARENA_CENTER[0] + math.cos(angle) * (ARENA_RADIUS + 15)
        y = ARENA_CENTER[1] + math.sin(angle) * (ARENA_RADIUS + 15)
        pygame.draw.circle(surface, YELLOW, (int(x), int(y)), 5)


def draw_ui(surface, player, enemy):
    title = font_medium.render("Cricket Battle", True, WHITE)
    surface.blit(title, (WIDTH // 2 - title.get_width() // 2, 20))

    player_name = font_small.render("Red (WASD Move, 1234 Skills)", True, RED)
    surface.blit(player_name, (50, 70))
    player.draw_health_bar(surface, 50, 95)

    enemy_name = font_small.render("Blue (AI)", True, BLUE)
    surface.blit(enemy_name, (WIDTH - 150, 70))
    enemy.draw_health_bar(surface, WIDTH - 150, 95)

    skill_names = ["Attack[1]", "Power[2]", "Shield[3]", "Heal[4]"]
    skill_keys = ["normal_attack", "power_strike", "shield", "heal"]
    start_x = 50
    for i, (name, key) in enumerate(zip(skill_names, skill_keys)):
        skill = player.skills[key]
        cd_color = GREEN if skill["cooldown"] == 0 else GRAY
        text = font_small.render(f"{name}", True, cd_color)
        surface.blit(text, (start_x + i * 120, HEIGHT - 60))
        if skill["cooldown"] > 0:
            cd_text = font_small.render(f"CD:{skill['cooldown']//FPS+1}", True, RED)
            surface.blit(cd_text, (start_x + i * 120, HEIGHT - 35))


def draw_winner(surface, winner):
    s = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
    s.fill((0, 0, 0, 180))
    surface.blit(s, (0, 0))

    color = RED if winner == "Red" else BLUE
    text = font_large.render(f"{winner} Wins!", True, color)
    surface.blit(text, (WIDTH // 2 - text.get_width() // 2, HEIGHT // 2 - 50))

    restart_text = font_medium.render("Press R to Restart", True, WHITE)
    surface.blit(restart_text, (WIDTH // 2 - restart_text.get_width() // 2, HEIGHT // 2 + 30))


def reset_game():
    player = Cricket(WIDTH // 2 - 80, HEIGHT // 2, RED, "Red", True)
    enemy = Cricket(WIDTH // 2 + 80, HEIGHT // 2, BLUE, "Blue", False)
    return player, enemy


def main():
    running = True
    game_over = False
    winner = None

    player, enemy = reset_game()
    sound_manager = SoundManager()

    while running:
        clock.tick(FPS)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r and game_over:
                    player, enemy = reset_game()
                    game_over = False
                    winner = None
                if not game_over:
                    if event.key == pygame.K_1:
                        player.use_skill("normal_attack", enemy)
                    if event.key == pygame.K_2:
                        player.use_skill("power_strike", enemy)
                    if event.key == pygame.K_3:
                        player.use_skill("shield", player)
                    if event.key == pygame.K_4:
                        player.use_skill("heal", player)

        if not game_over:
            try:
                keys = pygame.key.get_pressed()
                dx, dy = 0, 0
                if keys[pygame.K_w]:
                    dy = -1
                if keys[pygame.K_s]:
                    dy = 1
                if keys[pygame.K_a]:
                    dx = -1
                if keys[pygame.K_d]:
                    dx = 1
                player.move(dx, dy)

                enemy.ai_update(player)

                player.update()
                enemy.update()
                sound_manager.update()

                if player.health <= 0:
                    game_over = True
                    winner = "Blue"
                    sound_manager.play_cheer()
                elif enemy.health <= 0:
                    game_over = True
                    winner = "Red"
                    sound_manager.play_cheer()
            except Exception as e:
                print(f"Error in game loop: {e}")

        screen.fill(BLACK)
        draw_arena(screen)
        player.draw(screen)
        enemy.draw(screen)
        draw_ui(screen, player, enemy)

        if game_over:
            draw_winner(screen, winner)

        pygame.display.flip()

    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
