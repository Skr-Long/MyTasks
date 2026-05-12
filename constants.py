import pygame

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
    "level": "等级: ",
    "settings": "设置",
    "sound": "音效: ",
    "music": "音乐: ",
    "back": "返回"
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
    "level": "Level: ",
    "settings": "Settings",
    "sound": "Sound: ",
    "music": "Music: ",
    "back": "Back"
}

WEAPON_NAMES_CN = ["普通", "散射", "激光"]
WEAPON_NAMES_EN = ["Normal", "Spread", "Laser"]
MOVE_NAMES_CN = ["普通", "跟随", "自动"]
MOVE_NAMES_EN = ["Normal", "Follow", "Auto"]

def get_lang_text(lang, key):
    lang_dict = LANG_CN if lang == "cn" else LANG_EN
    return lang_dict.get(key, key)

def get_weapon_name(lang, weapon_type):
    names = WEAPON_NAMES_CN if lang == "cn" else WEAPON_NAMES_EN
    return names[weapon_type]

def get_move_name(lang, move_mode):
    names = MOVE_NAMES_CN if lang == "cn" else MOVE_NAMES_EN
    return names[move_mode]
