export interface EnemyConfigData {
  name: string
  health: number
  speed: number
  armor: number
  magicResist: number
  reward: number
  type: 'normal' | 'fast' | 'tank' | 'ranged' | 'boss'
}

export const EnemyConfig: Record<string, EnemyConfigData> = {
  cultist: {
    name: '魔教小兵',
    health: 50,
    speed: 0.5,
    armor: 0,
    magicResist: 0,
    reward: 25,
    type: 'normal',
  },
  swordsman: {
    name: '魔教刀手',
    health: 80,
    speed: 0.4,
    armor: 2,
    magicResist: 0,
    reward: 40,
    type: 'normal',
  },
  assassin: {
    name: '魔教刺客',
    health: 60,
    speed: 0.7,
    armor: 0,
    magicResist: 0,
    reward: 50,
    type: 'fast',
  },
  shieldman: {
    name: '魔教盾兵',
    health: 150,
    speed: 0.35,
    armor: 10,
    magicResist: 0,
    reward: 70,
    type: 'tank',
  },
  mage: {
    name: '魔教法师',
    health: 70,
    speed: 0.45,
    armor: 0,
    magicResist: 8,
    reward: 60,
    type: 'ranged',
  },
  boss: {
    name: '魔教Boss',
    health: 1000,
    speed: 0.25,
    armor: 15,
    magicResist: 15,
    reward: 500,
    type: 'boss',
  },
}
