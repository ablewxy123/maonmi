declare namespace Entity {
  type CatStage = 'kitten' | 'young' | 'adult'
  type CatMood = 'happy' | 'content' | 'hungry' | 'thirsty' | 'sleepy' | 'playful' | 'annoyed' | 'sick'
  type CatActivity = 'idle' | 'sleeping' | 'eating' | 'drinking' | 'playing' | 'grooming' | 'wandering'
  type DayPhase = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'late-night'
  type FoodCategory = 'dry' | 'wet' | 'treat' | 'drink'
  type ToyCategory = 'ball' | 'feather' | 'laser' | 'mouse'
  type ClothingSlot = 'hat' | 'body' | 'collar' | 'accessory'

  interface CatStats {
    hunger: number
    thirst: number
    energy: number
    happiness: number
    cleanliness: number
    health: number
  }

  interface FoodItem {
    id: string
    name: string
    category: FoodCategory
    icon: string
    price: number
    effects: Partial<CatStats>
    refusalChance: number
    description: string
    growthXP: number
  }

  interface ToyItem {
    id: string
    name: string
    category: ToyCategory
    icon: string
    price: number
    happinessGain: number
    energyCost: number
    description: string
    growthXP: number
  }

  interface ClothingItem {
    id: string
    name: string
    icon: string
    price: number
    slot: ClothingSlot
    description: string
  }

  interface Inventory {
    foods: Record<string, number>
    toys: Record<string, number>
  }

  interface GameEvent {
    timestamp: number
    message: string
    type: 'info' | 'warning' | 'action' | 'auto'
  }

  interface GameState {
    started: boolean
    catName: string
    stage: CatStage
    ageDays: number
    stats: CatStats
    mood: CatMood
    activity: CatActivity
    coins: number
    inventory: Inventory
    totalTicks: number
    lastSaveTime: number
    eventLog: GameEvent[]
    gameSpeed: number
    growthXP: number
    growthTarget: number
    closet: string[]
    equipped: Record<ClothingSlot, string | null>
  }
}
