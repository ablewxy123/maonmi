// 游戏时间常量
export const TICK_INTERVAL_MS = 3000 // 每tick 3秒
export const TICKS_PER_GAME_HOUR = 20 // 20 ticks = 1游戏小时
export const TICKS_PER_GAME_DAY = TICKS_PER_GAME_HOUR * 24 // 480 ticks = 1游戏天
export const MAX_OFFLINE_TICKS = 2000 // 离线最多补算2000 ticks

// 属性衰减速率 (每tick)
export const DECAY_RATES: Entity.CatStats = {
  hunger: -0.4,
  thirst: -0.6,
  energy: -0.3,
  happiness: -0.2,
  cleanliness: -0.15,
  health: 0,
}

// 自动行为阈值
export const AUTO_SLEEP_THRESHOLD = 15
export const AUTO_WAKE_THRESHOLD = 90
export const AUTO_GROOM_CHANCE = 0.03
export const SLEEP_ENERGY_RESTORE = 1.5
export const GROOM_CLEANLINESS_RESTORE = 5

// 成长阈值 (growthXP)
export const GROWTH_TARGETS: Record<Entity.CatStage, number> = {
  kitten: 300,  // 300 XP 升为少年猫
  young: 600,   // 600 XP 升为成年猫
  adult: 9999,  // 已是最终阶段
}

// 经济
export const COIN_EARN_RATE = 2
export const INITIAL_COINS = 50

// 被动成长速率 (每tick，属性均值超过60时)
export const PASSIVE_GROWTH_RATE = 0.2

// 食物目录
export const FOOD_ITEMS: Entity.FoodItem[] = [
  {
    id: 'dry-food',
    name: '猫粮',
    category: 'dry',
    icon: '🥣',
    price: 5,
    effects: { hunger: 25, thirst: -5, happiness: 5 },
    refusalChance: 0.05,
    description: '基础干粮，管饱但会口渴',
    growthXP: 8,
  },
  {
    id: 'wet-food',
    name: '猫罐头',
    category: 'wet',
    icon: '🥫',
    price: 15,
    effects: { hunger: 35, thirst: 10, happiness: 15 },
    refusalChance: 0.02,
    description: '湿粮，美味又解渴',
    growthXP: 15,
  },
  {
    id: 'fish',
    name: '小鱼干',
    category: 'treat',
    icon: '🐟',
    price: 20,
    effects: { hunger: 20, thirst: -5, happiness: 25 },
    refusalChance: 0.08,
    description: '猫咪最爱的零食',
    growthXP: 20,
  },
  {
    id: 'chicken',
    name: '鸡胸肉',
    category: 'wet',
    icon: '🍗',
    price: 18,
    effects: { hunger: 30, thirst: 5, happiness: 20 },
    refusalChance: 0.05,
    description: '高蛋白健康食品',
    growthXP: 18,
  },
  {
    id: 'catnip-treat',
    name: '猫薄荷零食',
    category: 'treat',
    icon: '🌿',
    price: 25,
    effects: { hunger: 10, happiness: 35 },
    refusalChance: 0.01,
    description: '让猫咪兴奋的神奇零食',
    growthXP: 12,
  },
  {
    id: 'milk',
    name: '牛奶',
    category: 'drink',
    icon: '🥛',
    price: 8,
    effects: { hunger: 5, thirst: 30, happiness: 10 },
    refusalChance: 0.10,
    description: '有些猫咪乳糖不耐受',
    growthXP: 10,
  },
  {
    id: 'water',
    name: '清水',
    category: 'drink',
    icon: '💧',
    price: 0,
    effects: { thirst: 40 },
    refusalChance: 0,
    description: '免费的饮用水',
    growthXP: 2,
  },
  {
    id: 'running-water',
    name: '流动水',
    category: 'drink',
    icon: '🚰',
    price: 0,
    effects: { thirst: 50, happiness: 5 },
    refusalChance: 0,
    description: '猫咪更喜欢流动的水',
    growthXP: 3,
  },
]

// 玩具目录
export const TOY_ITEMS: Entity.ToyItem[] = [
  {
    id: 'ball',
    name: '毛线球',
    category: 'ball',
    icon: '🧶',
    price: 10,
    happinessGain: 15,
    energyCost: 10,
    description: '经典的猫咪玩具',
    growthXP: 5,
  },
  {
    id: 'feather',
    name: '逗猫棒',
    category: 'feather',
    icon: '🪶',
    price: 20,
    happinessGain: 25,
    energyCost: 15,
    description: '猫咪最爱追逐的羽毛',
    growthXP: 8,
  },
  {
    id: 'laser',
    name: '激光笔',
    category: 'laser',
    icon: '🔴',
    price: 30,
    happinessGain: 30,
    energyCost: 20,
    description: '那个永远抓不到的小红点',
    growthXP: 10,
  },
  {
    id: 'mouse',
    name: '玩具老鼠',
    category: 'mouse',
    icon: '🐭',
    price: 15,
    happinessGain: 20,
    energyCost: 12,
    description: '模拟猎物，激发猫咪天性',
    growthXP: 6,
  },
]

// 服装目录
export const CLOTHING_ITEMS: Entity.ClothingItem[] = [
  // ── 帽子 ──
  { id: 'bow', name: '蝴蝶结', icon: '🎀', price: 20, slot: 'hat', description: '可爱的粉色蝴蝶结发夹' },
  { id: 'top-hat', name: '绅士礼帽', icon: '🎩', price: 60, slot: 'hat', description: '优雅的英伦绅士风范' },
  { id: 'crown', name: '小皇冠', icon: '👑', price: 120, slot: 'hat', description: '高贵的猫咪皇族专属' },
  { id: 'cap', name: '棒球帽', icon: '🧢', price: 30, slot: 'hat', description: '活力满满的运动棒球帽' },
  { id: 'graduation', name: '学士帽', icon: '🎓', price: 50, slot: 'hat', description: '聪明好学的学者派头' },
  { id: 'floral', name: '花环', icon: '🌸', price: 25, slot: 'hat', description: '清新自然的花朵头环' },
  // ── 衣服 ──
  { id: 'suit', name: '小西装', icon: '👔', price: 45, slot: 'body', description: '商务正式的精英风格' },
  { id: 'vest', name: '工作马甲', icon: '🦺', price: 30, slot: 'body', description: '专业实用的工作马甲' },
  { id: 'sports', name: '运动背心', icon: '🎽', price: 20, slot: 'body', description: '运动健将的标志装扮' },
  { id: 'kimono', name: '和服', icon: '👘', price: 80, slot: 'body', description: '优美飘逸的东方风情' },
  // ── 项圈 ──
  { id: 'ribbon', name: '粉丝带', icon: '🎗️', price: 15, slot: 'collar', description: '温柔浪漫的颈部装饰' },
  { id: 'bell', name: '铃铛项圈', icon: '🔔', price: 25, slot: 'collar', description: '走路叮叮响的小铃铛' },
  { id: 'gem', name: '水晶项链', icon: '💎', price: 90, slot: 'collar', description: '璀璨夺目的宝石项链' },
  { id: 'medal', name: '荣誉勋章', icon: '🏅', price: 40, slot: 'collar', description: '勇猛无畏的荣耀象征' },
  // ── 配件 ──
  { id: 'sunglasses', name: '墨镜', icon: '🕶️', price: 30, slot: 'accessory', description: '酷酷的太阳眼镜' },
  { id: 'glasses', name: '书呆眼镜', icon: '👓', price: 20, slot: 'accessory', description: '博学文化人专属眼镜' },
  { id: 'wand', name: '魔法棒', icon: '🪄', price: 50, slot: 'accessory', description: '神奇的魔法施法道具' },
  { id: 'bag', name: '小书包', icon: '🎒', price: 35, slot: 'accessory', description: '活泼可爱的学生书包' },
]

// 按 slot 分组工具
export function getClothingBySlot(slot: Entity.ClothingSlot): Entity.ClothingItem[] {
  return CLOTHING_ITEMS.filter(c => c.slot === slot)
}

// 日相映射 (游戏小时 → 日相)
export function getDayPhase(gameHour: number): Entity.DayPhase {
  if (gameHour >= 5 && gameHour < 7) return 'dawn'
  if (gameHour >= 7 && gameHour < 12) return 'morning'
  if (gameHour >= 12 && gameHour < 14) return 'noon'
  if (gameHour >= 14 && gameHour < 18) return 'afternoon'
  if (gameHour >= 18 && gameHour < 20) return 'dusk'
  if (gameHour >= 20 && gameHour < 23) return 'evening'
  if (gameHour >= 23 || gameHour < 2) return 'night'
  return 'late-night'
}

// 根据日相获取猫咪活跃度修正
export function getActivityModifier(phase: Entity.DayPhase): number {
  const modifiers: Record<Entity.DayPhase, number> = {
    'dawn': 1.3,
    'morning': 1.0,
    'noon': 0.7,
    'afternoon': 0.8,
    'dusk': 1.3,
    'evening': 0.9,
    'night': 0.5,
    'late-night': 0.3,
  }
  return modifiers[phase]
}

// 创建初始游戏状态
export function createInitialState(): Entity.GameState {
  return {
    started: false,
    catName: '',
    stage: 'kitten',
    ageDays: 0,
    stats: {
      hunger: 80,
      thirst: 80,
      energy: 80,
      happiness: 80,
      cleanliness: 80,
      health: 80,
    },
    mood: 'content',
    activity: 'idle',
    coins: INITIAL_COINS,
    inventory: {
      foods: { 'dry-food': 5, 'water': 99, 'running-water': 99 },
      toys: {},
    },
    totalTicks: TICKS_PER_GAME_HOUR * 8,
    lastSaveTime: Date.now(),
    eventLog: [],
    gameSpeed: 1,
    growthXP: 0,
    growthTarget: GROWTH_TARGETS.kitten,
    closet: [],
    equipped: { hat: null, body: null, collar: null, accessory: null },
  }
}

// 根据属性推导心情
export function deriveMood(stats: Entity.CatStats, activity: Entity.CatActivity): Entity.CatMood {
  if (stats.health < 20) return 'sick'
  if (activity === 'sleeping') return 'sleepy'
  if (stats.hunger < 20) return 'hungry'
  if (stats.thirst < 20) return 'thirsty'
  if (stats.energy < 25) return 'sleepy'
  if (stats.happiness > 70 && stats.energy > 50) return 'playful'
  if (stats.happiness > 50) return 'happy'
  if (stats.happiness < 30) return 'annoyed'
  return 'content'
}

// 工具函数: 限制数值在 0-100
export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value))
}

// 根据食物ID查找食物
export function getFoodById(id: string): Entity.FoodItem | undefined {
  return FOOD_ITEMS.find(f => f.id === id)
}

// 根据玩具ID查找玩具
export function getToyById(id: string): Entity.ToyItem | undefined {
  return TOY_ITEMS.find(t => t.id === id)
}
