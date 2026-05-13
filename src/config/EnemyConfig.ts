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
    health: 100,
    speed: 1.0,
    armor: 0,
    magicResist: 0,
    reward: 10,
    type: 'normal',
  },
  swordsman: {
    name: '魔教刀手',
    health: 200,
    speed: 0.8,
    armor: 5,
    magicResist: 0,
    reward: 20,
    type: 'normal',
  },
  assassin: {
    name: '魔教刺客',
    health: 150,
    speed: 1.5,
    armor: 0,
    magicResist: 0,
    reward: 25,
    type: 'fast',
  },
  shieldman: {
    name: '魔教盾兵',
    health: 400,
    speed: 0.6,
    armor: 20,
    magicResist: 0,
    reward: 35,
    type: 'tank',
  },
  mage: {
    name: '魔教法师',
    health: 180,
    speed: 0.9,
    armor: 0,
    magicResist: 15,
    reward: 30,
    type: 'ranged',
  },
  boss: {
    name: '魔教Boss',
    health: 3000,
    speed: 0.5,
    armor: 30,
    magicResist: 30,
    reward: 300,
    type: 'boss',
  },
}
