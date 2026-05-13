export interface TowerConfigData {
  name: string
  sect: string
  cost: number
  damage: number
  attackSpeed: number
  range: number
  damageType: 'physical' | 'internal' | 'poison'
  description: string
  upgrades: Array<{
    cost: number
    damage?: number
    attackSpeed?: number
    range?: number
    special?: string
  }>
}

export const TowerConfig: Record<string, TowerConfigData> = {
  shaolinLuohan: {
    name: '少林罗汉塔',
    sect: 'shaolin',
    cost: 200,
    damage: 30,
    attackSpeed: 1000,
    range: 2,
    damageType: 'physical',
    description: '高防御范围控制',
    upgrades: [
      { cost: 150, damage: 20, range: 0.5 },
      { cost: 250, damage: 30, special: '范围眩晕' },
      { cost: 400, damage: 50, special: '眩晕时间+0.5秒' },
    ],
  },
  wudangSwordQi: {
    name: '武当剑气塔',
    sect: 'wudang',
    cost: 250,
    damage: 45,
    attackSpeed: 1200,
    range: 4,
    damageType: 'internal',
    description: '高伤害远程攻击',
    upgrades: [
      { cost: 200, damage: 30, special: '穿透+1' },
      { cost: 350, damage: 50, special: '贯穿攻击' },
      { cost: 500, damage: 80, special: '贯穿数量+2' },
    ],
  },
  tangmenPoison: {
    name: '唐门毒针塔',
    sect: 'tangmen',
    cost: 180,
    damage: 15,
    attackSpeed: 500,
    range: 3,
    damageType: 'poison',
    description: '高攻速毒素伤害',
    upgrades: [
      { cost: 120, damage: 10, special: '毒伤害+3' },
      { cost: 220, damage: 15, attackSpeed: 100 },
      { cost: 380, damage: 25, special: '毒层数上限+3' },
    ],
  },
  emeiLight: {
    name: '峨眉佛光塔',
    sect: 'emei',
    cost: 220,
    damage: 0,
    attackSpeed: 0,
    range: 3,
    damageType: 'physical',
    description: '攻击力加成辅助',
    upgrades: [
      { cost: 180, range: 1, special: '攻击力加成+10%' },
      { cost: 300, special: '护盾效果' },
      { cost: 450, special: '攻击力加成+15%，护盾翻倍' },
    ],
  },
  gaibangAlms: {
    name: '丐帮化缘钵',
    sect: 'gaibang',
    cost: 150,
    damage: 10,
    attackSpeed: 1500,
    range: 2,
    damageType: 'physical',
    description: '偷钱经济建筑',
    upgrades: [
      { cost: 100, special: '偷钱+5-8金币' },
      { cost: 150, special: '范围+1格' },
      { cost: 200, special: '偷钱双倍概率30%' },
    ],
  },
}
