import {
  TICK_INTERVAL_MS,
  TICKS_PER_GAME_HOUR,
  TICKS_PER_GAME_DAY,
  MAX_OFFLINE_TICKS,
  DECAY_RATES,
  AUTO_SLEEP_THRESHOLD,
  AUTO_WAKE_THRESHOLD,
  AUTO_GROOM_CHANCE,
  SLEEP_ENERGY_RESTORE,
  GROOM_CLEANLINESS_RESTORE,
  COIN_EARN_RATE,
  PASSIVE_GROWTH_RATE,
  GROWTH_TARGETS,
  CLOTHING_ITEMS,
  createInitialState,
  deriveMood,
  clampStat,
  getFoodById,
  getToyById,
  getDayPhase,
  getActivityModifier,
} from '@/constants/game'

export const useGameStore = defineStore('game', {
  state: (): Entity.GameState => createInitialState(),

  getters: {
    gameHour: state => Math.floor(state.totalTicks / TICKS_PER_GAME_HOUR) % 24,

    dayPhase(): Entity.DayPhase {
      return getDayPhase(this.gameHour as number)
    },

    activityModifier(): number {
      return getActivityModifier(this.dayPhase as Entity.DayPhase)
    },

    isAlive: state => state.stats.health > 0,

    stageName: (state) => {
      const names: Record<Entity.CatStage, string> = {
        kitten: '幼猫',
        young: '少年猫',
        adult: '成年猫',
      }
      return names[state.stage]
    },

    stageEmoji: (state) => {
      const emojis: Record<Entity.CatStage, string> = {
        kitten: '🐱',
        young: '🐈',
        adult: '🐈‍⬛',
      }
      return emojis[state.stage]
    },

    moodText: (state) => {
      const texts: Record<Entity.CatMood, string> = {
        happy: '心情很好',
        content: '悠然自得',
        hungry: '肚子饿了',
        thirsty: '口渴了',
        sleepy: '昏昏欲睡',
        playful: '想玩耍',
        annoyed: '有点烦躁',
        sick: '感觉不舒服',
      }
      return texts[state.mood]
    },

    activityText: (state) => {
      const texts: Record<Entity.CatActivity, string> = {
        idle: '溜达中',
        sleeping: '睡觉',
        eating: '吃东西',
        drinking: '喝水',
        playing: '玩耍',
        grooming: '梳毛',
        wandering: '探索',
      }
      return texts[state.activity]
    },

    dayPhaseLabel(): string {
      const labels: Record<Entity.DayPhase, string> = {
        dawn: '黎明',
        morning: '早晨',
        noon: '正午',
        afternoon: '下午',
        dusk: '黄昏',
        evening: '傍晚',
        night: '夜晚',
        'late-night': '深夜',
      }
      return labels[this.dayPhase as Entity.DayPhase]
    },

    dayPhaseEmoji(): string {
      const emojis: Record<Entity.DayPhase, string> = {
        dawn: '🌅',
        morning: '☀️',
        noon: '🌞',
        afternoon: '⛅',
        dusk: '🌆',
        evening: '🌙',
        night: '🌙',
        'late-night': '🌃',
      }
      return emojis[this.dayPhase as Entity.DayPhase]
    },

    // 下一阶段名称
    nextStageName: (state) => {
      if (state.stage === 'kitten') return '少年猫'
      if (state.stage === 'young') return '成年猫'
      return null
    },

    growthPercent: state => Math.min(100, Math.round((state.growthXP / state.growthTarget) * 100)),

    isMaxStage: state => state.stage === 'adult',
  },

  actions: {
    startGame(catName: string) {
      const init = createInitialState()
      this.$patch(init)
      this.catName = catName
      this.started = true
      this.lastSaveTime = Date.now()
      this.addEvent(`${catName} 来到了你身边！🎉`, 'info')
    },

    tick() {
      if (!this.started || !this.isAlive) return

      // 重置本轮的瞬时活动
      if (['eating', 'drinking', 'playing'].includes(this.activity)) {
        this.activity = 'idle'
      }

      const modifier = this.activityModifier
      const isSleeping = this.activity === 'sleeping'

      // 自动睡眠/唤醒
      if (!isSleeping && this.stats.energy <= AUTO_SLEEP_THRESHOLD) {
        this.activity = 'sleeping'
        this.addEvent(`${this.catName} 累了，睡着了 💤`, 'auto')
      }
      else if (isSleeping && this.stats.energy >= AUTO_WAKE_THRESHOLD) {
        this.activity = 'idle'
        this.addEvent(`${this.catName} 睡醒了！精力满满`, 'auto')
      }

      // 自动梳毛
      if (this.activity === 'grooming') {
        this.activity = 'idle'
      }
      else if (this.activity === 'idle' && Math.random() < AUTO_GROOM_CHANCE * modifier) {
        this.activity = 'grooming'
        this.stats.cleanliness = clampStat(this.stats.cleanliness + GROOM_CLEANLINESS_RESTORE)
        this.addEvent(`${this.catName} 在梳理毛发 🐾`, 'auto')
      }

      // 属性衰减
      if (isSleeping) {
        this.stats.energy = clampStat(this.stats.energy + SLEEP_ENERGY_RESTORE)
        this.stats.hunger = clampStat(this.stats.hunger + DECAY_RATES.hunger * 0.3)
        this.stats.thirst = clampStat(this.stats.thirst + DECAY_RATES.thirst * 0.3)
        this.stats.happiness = clampStat(this.stats.happiness + DECAY_RATES.happiness * 0.5)
        this.stats.cleanliness = clampStat(this.stats.cleanliness + DECAY_RATES.cleanliness * 0.5)
      }
      else {
        this.stats.hunger = clampStat(this.stats.hunger + DECAY_RATES.hunger * modifier)
        this.stats.thirst = clampStat(this.stats.thirst + DECAY_RATES.thirst * modifier)
        this.stats.energy = clampStat(this.stats.energy + DECAY_RATES.energy * modifier)
        this.stats.happiness = clampStat(this.stats.happiness + DECAY_RATES.happiness)
        this.stats.cleanliness = clampStat(this.stats.cleanliness + DECAY_RATES.cleanliness)
      }

      // 健康趋向其他属性均值
      const avg = (this.stats.hunger + this.stats.thirst + this.stats.happiness + this.stats.cleanliness) / 4
      this.stats.health = clampStat(this.stats.health + (avg - this.stats.health) * 0.05)

      // 被动成长：照顾好的猫咪会缓慢成长
      if (!this.isMaxStage) {
        const statAvg = (this.stats.hunger + this.stats.thirst + this.stats.energy + this.stats.happiness) / 4
        if (statAvg > 60) {
          this.growthXP += PASSIVE_GROWTH_RATE
        }
      }

      // 赚金币
      this.coins += COIN_EARN_RATE

      // 更新心情
      this.mood = deriveMood(this.stats, this.activity)

      // 推进时间
      this.totalTicks++
      if (this.totalTicks % TICKS_PER_GAME_DAY === 0) {
        this.ageDays++
      }

      this.lastSaveTime = Date.now()
    },

    // 喂食 - 核心成长驱动
    feedCat(foodId: string) {
      const food = getFoodById(foodId)
      if (!food) return

      if ((this.inventory.foods[foodId] ?? 0) <= 0) {
        window.$message?.warning('库存不足！')
        return
      }

      if (Math.random() < food.refusalChance) {
        this.addEvent(`${this.catName} 拒绝了 ${food.name}，挑剔！`, 'action')
        return
      }

      this.inventory.foods[foodId]--
      Object.entries(food.effects).forEach(([key, val]) => {
        const k = key as keyof Entity.CatStats
        this.stats[k] = clampStat(this.stats[k] + (val as number))
      })
      this.activity = food.category === 'drink' ? 'drinking' : 'eating'
      this.mood = deriveMood(this.stats, this.activity)

      // 增加成长值
      if (!this.isMaxStage) {
        const xpGain = food.growthXP
        this.growthXP += xpGain
        this.addEvent(`${this.catName} 吃了 ${food.icon}${food.name}  +${xpGain}成长值`, 'action')
        this._checkGrowth()
      }
      else {
        this.addEvent(`${this.catName} 吃了 ${food.icon}${food.name}`, 'action')
      }
    },

    // 玩耍 - 也能增加成长值
    playWithCat(toyId: string) {
      const toy = getToyById(toyId)
      if (!toy) return

      if ((this.inventory.toys[toyId] ?? 0) <= 0) {
        window.$message?.warning('没有这个玩具！')
        return
      }

      if (this.stats.energy < toy.energyCost) {
        this.addEvent(`${this.catName} 太累了，不想玩`, 'action')
        window.$message?.warning('猫咪太累了！')
        return
      }

      this.stats.happiness = clampStat(this.stats.happiness + toy.happinessGain)
      this.stats.energy = clampStat(this.stats.energy - toy.energyCost)
      this.activity = 'playing'
      this.mood = deriveMood(this.stats, this.activity)

      if (!this.isMaxStage) {
        const xpGain = toy.growthXP
        this.growthXP += xpGain
        this.addEvent(`${this.catName} 玩了 ${toy.icon}${toy.name}  +${xpGain}成长值`, 'action')
        this._checkGrowth()
      }
      else {
        this.addEvent(`${this.catName} 玩了 ${toy.icon}${toy.name}！`, 'action')
      }
    },

    _checkGrowth() {
      if (this.growthXP < this.growthTarget) return
      if (this.stage === 'kitten') {
        this.stage = 'young'
        this.growthXP = 0
        this.growthTarget = GROWTH_TARGETS.young
        this.ageDays = 8
        this.addEvent(`🎉 ${this.catName} 成长为少年猫了！继续好好喂养吧`, 'info')
      }
      else if (this.stage === 'young') {
        this.stage = 'adult'
        this.growthXP = this.growthTarget
        this.addEvent(`🎊 ${this.catName} 长大了！成为了成年猫`, 'info')
      }
    },

    buyFood(foodId: string) {
      const food = getFoodById(foodId)
      if (!food) return
      if (this.coins < food.price) { window.$message?.warning('金币不足！'); return }
      this.coins -= food.price
      this.inventory.foods[foodId] = (this.inventory.foods[foodId] ?? 0) + 1
      this.addEvent(`购买了 ${food.icon}${food.name}`, 'info')
    },

    buyToy(toyId: string) {
      const toy = getToyById(toyId)
      if (!toy) return
      if (this.coins < toy.price) { window.$message?.warning('金币不足！'); return }
      this.coins -= toy.price
      this.inventory.toys[toyId] = (this.inventory.toys[toyId] ?? 0) + 1
      this.addEvent(`购买了 ${toy.icon}${toy.name}`, 'info')
    },

    addEvent(message: string, type: Entity.GameEvent['type']) {
      this.eventLog.unshift({ timestamp: Date.now(), message, type })
      if (this.eventLog.length > 60) this.eventLog.splice(60)
    },

    processOfflineTicks() {
      if (!this.started) return 0
      const elapsed = Date.now() - this.lastSaveTime
      const ticks = Math.min(Math.floor(elapsed / TICK_INTERVAL_MS), MAX_OFFLINE_TICKS)
      for (let i = 0; i < ticks; i++) this.tick()
      if (ticks > 0) {
        const mins = Math.round(ticks * TICK_INTERVAL_MS / 60000)
        this.addEvent(`欢迎回来！离线了约 ${mins} 分钟`, 'info')
      }
      return ticks
    },

    buyClothing(clothingId: string) {
      const item = CLOTHING_ITEMS.find(c => c.id === clothingId)
      if (!item) return
      if (this.closet.includes(clothingId)) {
        window.$message?.info('已经拥有了！')
        return
      }
      if (this.coins < item.price) {
        window.$message?.warning('金币不足！')
        return
      }
      this.coins -= item.price
      this.closet.push(clothingId)
      this.addEvent(`买了 ${item.icon}${item.name}`, 'info')
    },

    equipClothing(clothingId: string) {
      const item = CLOTHING_ITEMS.find(c => c.id === clothingId)
      if (!item || !this.closet.includes(clothingId)) return
      this.equipped[item.slot] = clothingId
      this.addEvent(`${this.catName} 穿上了 ${item.icon}${item.name}`, 'action')
    },

    unequipClothing(slot: Entity.ClothingSlot) {
      const id = this.equipped[slot]
      if (!id) return
      const item = CLOTHING_ITEMS.find(c => c.id === id)
      this.equipped[slot] = null
      if (item) this.addEvent(`脱下了 ${item.icon}${item.name}`, 'action')
    },

    resetGame() {
      this.$patch(createInitialState())
    },
  },

  persist: {
    storage: localStorage,
  },
})
