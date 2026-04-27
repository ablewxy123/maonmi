<template>
  <!-- 开始界面 -->
  <div v-if="!game.started" class="start-screen">
    <div class="start-card">
      <div class="start-cat-figure">
        <div class="scf-hat"></div>
        <span class="scf-face">🐱</span>
        <div class="scf-body" style="background:#f4c27a;"></div>
      </div>
      <h1 class="start-title">毛你咪</h1>
      <p class="start-desc">一只小猫咪正在等待你的领养…</p>
      <n-input
        v-model:value="catNameInput"
        class="name-input"
        placeholder="给猫咪起个名字"
        size="large"
        maxlength="8"
        show-count
        @keyup.enter="handleStart"
      />
      <p v-if="nameError" class="name-error">{{ nameError }}</p>
      <n-button class="start-btn" type="primary" size="large" block :disabled="!catNameInput.trim()" @click="handleStart">
        领养它！
      </n-button>
    </div>
  </div>

  <!-- 游戏界面 -->
  <div v-else class="game-screen">

    <!-- 顶部栏 -->
    <div class="game-header">
      <div class="header-left">
        <span class="phase-icon">{{ game.dayPhaseEmoji }}</span>
        <span class="phase-text">{{ game.dayPhaseLabel }}</span>
        <span class="day-text">第{{ game.ageDays + 1 }}天</span>
      </div>
      <div class="header-right">
        <span class="coins-display">💰 {{ game.coins }}</span>
      </div>
    </div>

    <!-- 猫咪房间 -->
    <div class="cat-room">
      <!-- 装饰 -->
      <div class="room-deco bed-deco">🛏️</div>
      <div class="room-deco window-deco">🪟</div>

      <!-- 猫咪本体 -->
      <div class="cat-mover" :style="{ left: `${catX}%`, top: `${catY}%` }">
        <!-- 气泡 -->
        <transition name="bubble">
          <div v-if="bubbleText" class="thought-bubble">{{ bubbleText }}</div>
        </transition>
        <!-- 翻转容器 -->
        <div class="cat-flipper" :class="{ flip: facingLeft }">
          <!-- 分层猫咪身体 -->
          <div class="cat-figure" :class="[catAnimClass, `stage-${game.stage}`]">
            <!-- 帽子 -->
            <div class="cf-hat">
              <span v-if="equippedItems.hat">{{ equippedItems.hat.icon }}</span>
            </div>
            <!-- 头部（表情 + 配件） -->
            <div class="cf-head">
              <span class="cf-face">{{ faceEmoji }}</span>
              <span v-if="equippedItems.accessory" class="cf-accessory">{{ equippedItems.accessory.icon }}</span>
            </div>
            <!-- 项圈 -->
            <div class="cf-collar">
              <span v-if="equippedItems.collar">{{ equippedItems.collar.icon }}</span>
            </div>
            <!-- 身体 -->
            <div class="cf-body" :style="{ background: catBodyColor }">
              <span v-if="equippedItems.body" class="cf-body-item">{{ equippedItems.body.icon }}</span>
              <span v-else class="cf-paw">🐾</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 房间互动区 -->
      <div class="room-zone food-zone" @click="showTab('feed')">
        <span class="zone-icon">🍖</span>
        <span class="zone-label">喂食</span>
      </div>
      <div class="room-zone water-zone" @click="quickFeedWater">
        <span class="zone-icon">💧</span>
        <span class="zone-label">喝水</span>
      </div>
      <div class="room-zone toy-zone" @click="showTab('play')">
        <span class="zone-icon">🧶</span>
        <span class="zone-label">玩耍</span>
      </div>
    </div>

    <!-- 成长进度 -->
    <div class="growth-section">
      <div class="growth-header">
        <span class="growth-label">
          {{ game.stageName }}
          <span v-if="!game.isMaxStage" class="growth-arrow"> → {{ game.nextStageName }}</span>
          <span v-else> ✨ 已成年</span>
        </span>
        <span class="growth-xp">{{ Math.round(game.growthXP) }} / {{ game.growthTarget }} XP</span>
      </div>
      <div class="growth-bar-bg">
        <div class="growth-bar-fill" :class="{ 'bar-full': game.growthPercent >= 100 }" :style="{ width: `${game.growthPercent}%` }"></div>
      </div>
    </div>

    <!-- 属性条 -->
    <div class="stats-grid">
      <div v-for="stat in statList" :key="stat.key" class="stat-item">
        <span class="stat-emoji">{{ stat.emoji }}</span>
        <div class="mini-bar-bg">
          <div class="mini-bar-fill" :style="{ width: `${game.stats[stat.key]}%`, background: statColor(game.stats[stat.key]) }"></div>
        </div>
        <span class="stat-num" :class="{ 'num-critical': game.stats[stat.key] < 20 }">{{ Math.round(game.stats[stat.key]) }}</span>
      </div>
    </div>

    <!-- 心情行 -->
    <div class="mood-row">
      <span class="mood-dot" :class="`mood-${game.mood}`"></span>
      <span>{{ game.catName }} · {{ game.moodText }} · {{ game.activityText }}</span>
    </div>

    <!-- 操作面板 -->
    <div class="action-panel">
      <n-tabs v-model:value="activeTab" type="segment" size="small" animated>

        <!-- 喂食 -->
        <n-tab-pane name="feed" tab="喂食">
          <div v-if="inventoryFoods.length === 0" class="empty-tip">库存空空，去商店买点吧 🛒</div>
          <div v-else class="item-list">
            <div v-for="food in inventoryFoods" :key="food.id" class="item-card" @click="game.feedCat(food.id)">
              <span class="item-icon">{{ food.icon }}</span>
              <div class="item-info">
                <div class="item-name">{{ food.name }}</div>
                <div class="item-desc">{{ food.description }}</div>
              </div>
              <div class="item-right">
                <span class="item-xp" v-if="!game.isMaxStage">+{{ food.growthXP }}xp</span>
                <span class="item-count">×{{ game.inventory.foods[food.id] ?? 0 }}</span>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 玩耍 -->
        <n-tab-pane name="play" tab="玩耍">
          <div v-if="inventoryToys.length === 0" class="empty-tip">没有玩具，去商店买吧 🛒</div>
          <div v-else class="item-list">
            <div v-for="toy in inventoryToys" :key="toy.id" class="item-card" @click="game.playWithCat(toy.id)">
              <span class="item-icon">{{ toy.icon }}</span>
              <div class="item-info">
                <div class="item-name">{{ toy.name }}</div>
                <div class="item-desc">+{{ toy.happinessGain }}快乐 -{{ toy.energyCost }}精力</div>
              </div>
              <div class="item-right">
                <span class="item-xp" v-if="!game.isMaxStage">+{{ toy.growthXP }}xp</span>
                <span class="item-count">×{{ game.inventory.toys[toy.id] ?? 0 }}</span>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 衣柜 -->
        <n-tab-pane name="closet" tab="衣柜">
          <!-- 当前装扮 -->
          <div class="closet-equipped">
            <div class="closet-section-title">当前装扮</div>
            <div class="equipped-slots">
              <div
                v-for="slot in CLOTHING_SLOTS"
                :key="slot.key"
                class="eq-slot"
                :class="{ 'slot-active': equippedItems[slot.key] }"
                @click="equippedItems[slot.key] && game.unequipClothing(slot.key)"
              >
                <span class="eq-slot-icon">
                  {{ equippedItems[slot.key]?.icon || slot.placeholder }}
                </span>
                <span class="eq-slot-label">{{ slot.label }}</span>
                <span v-if="equippedItems[slot.key]" class="eq-slot-remove">×</span>
              </div>
            </div>
          </div>

          <!-- 衣柜列表 -->
          <div class="closet-section-title" style="margin-top: 10px;">
            我的衣柜 <span class="closet-count">{{ game.closet.length }} 件</span>
          </div>
          <div v-if="game.closet.length === 0" class="empty-tip">还没有衣服，去商店逛逛吧 🛍️</div>
          <div v-else class="item-list">
            <div
              v-for="item in ownedClothes"
              :key="item.id"
              class="item-card"
              :class="{ 'item-equipped': isEquipped(item.id) }"
              @click="handleClothingClick(item)"
            >
              <span class="item-icon">{{ item.icon }}</span>
              <div class="item-info">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-desc">{{ item.description }}</div>
              </div>
              <div class="item-right">
                <span class="slot-badge">{{ SLOT_LABELS[item.slot] }}</span>
                <span v-if="isEquipped(item.id)" class="equipped-tag">穿着中</span>
              </div>
            </div>
          </div>
        </n-tab-pane>

        <!-- 商店 -->
        <n-tab-pane name="shop" tab="商店">
          <n-scrollbar class="shop-scroll">
            <!-- 食物 -->
            <div class="closet-section-title">食物</div>
            <div class="item-list">
              <div v-for="food in FOOD_ITEMS" :key="food.id" class="item-card" :class="{ 'item-disabled': game.coins < food.price }" @click="game.buyFood(food.id)">
                <span class="item-icon">{{ food.icon }}</span>
                <div class="item-info">
                  <div class="item-name">{{ food.name }}</div>
                  <div class="item-desc">{{ food.description }}</div>
                </div>
                <div class="item-right">
                  <span class="item-xp" v-if="!game.isMaxStage">+{{ food.growthXP }}xp</span>
                  <span class="item-price">{{ food.price === 0 ? '免费' : `💰${food.price}` }}</span>
                </div>
              </div>
            </div>
            <!-- 玩具 -->
            <div class="closet-section-title">玩具</div>
            <div class="item-list">
              <div v-for="toy in TOY_ITEMS" :key="toy.id" class="item-card" :class="{ 'item-disabled': game.coins < toy.price }" @click="game.buyToy(toy.id)">
                <span class="item-icon">{{ toy.icon }}</span>
                <div class="item-info">
                  <div class="item-name">{{ toy.name }}</div>
                  <div class="item-desc">{{ toy.description }}</div>
                </div>
                <div class="item-right">
                  <span class="item-xp" v-if="!game.isMaxStage">+{{ toy.growthXP }}xp</span>
                  <span class="item-price">💰{{ toy.price }}</span>
                </div>
              </div>
            </div>
            <!-- 服装 -->
            <div class="closet-section-title">服装</div>
            <div class="item-list">
              <div
                v-for="cloth in CLOTHING_ITEMS"
                :key="cloth.id"
                class="item-card"
                :class="{
                  'item-disabled': game.coins < cloth.price && !game.closet.includes(cloth.id),
                  'item-owned': game.closet.includes(cloth.id),
                }"
                @click="game.buyClothing(cloth.id)"
              >
                <span class="item-icon">{{ cloth.icon }}</span>
                <div class="item-info">
                  <div class="item-name">{{ cloth.name }}</div>
                  <div class="item-desc">{{ cloth.description }}</div>
                </div>
                <div class="item-right">
                  <span class="slot-badge">{{ SLOT_LABELS[cloth.slot] }}</span>
                  <span class="item-price" v-if="!game.closet.includes(cloth.id)">💰{{ cloth.price }}</span>
                  <span class="owned-tag" v-else>已拥有</span>
                </div>
              </div>
            </div>
          </n-scrollbar>
        </n-tab-pane>

        <!-- 日志 -->
        <n-tab-pane name="log" tab="日志">
          <n-scrollbar class="log-scroll">
            <div v-for="(ev, i) in game.eventLog" :key="i" class="log-entry" :class="`log-${ev.type}`">
              <span class="log-time">{{ fmtTime(ev.timestamp) }}</span>
              <span class="log-msg">{{ ev.message }}</span>
            </div>
          </n-scrollbar>
        </n-tab-pane>

      </n-tabs>
    </div>

    <!-- 底部 -->
    <div class="footer-bar">
      <n-button size="tiny" quaternary @click="confirmReset">重置游戏</n-button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { FOOD_ITEMS, TOY_ITEMS, CLOTHING_ITEMS, TICK_INTERVAL_MS } from '@/constants/game'
import { useGameStore } from '@/store/game'

const game = useGameStore()
const dialog = useDialog()

// ─── 开始界面 ────────────────────────────────────────────
const catNameInput = ref('')
const nameError = ref('')

function handleStart() {
  const name = catNameInput.value.trim()
  if (!name) { nameError.value = '请给猫咪起个名字'; return }
  nameError.value = ''
  game.startGame(name)
}

// ─── 游戏 Tick ───────────────────────────────────────────
const { pause: pauseTick, resume: resumeTick } = useIntervalFn(
  () => game.tick(),
  TICK_INTERVAL_MS,
  { immediate: false },
)

onMounted(() => {
  if (game.started) game.processOfflineTicks()
  resumeTick()
})
onUnmounted(() => pauseTick())

// ─── 猫咪走动 ────────────────────────────────────────────
const catX = ref(50)
const catY = ref(50)
const facingLeft = ref(false)
const bubbleText = ref('')

const FOOD_POS = { x: 18, y: 70 }
const WATER_POS = { x: 38, y: 70 }
const BED_POS = { x: 80, y: 20 }

function moveTo(tx: number, ty: number) {
  facingLeft.value = tx < catX.value
  catX.value = tx
  catY.value = ty
}

function roam() {
  moveTo(Math.random() * 65 + 10, Math.random() * 30 + 22)
}

let bubbleTimer: ReturnType<typeof setTimeout> | null = null
function showBubble(text: string) {
  bubbleText.value = text
  if (bubbleTimer) clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => { bubbleText.value = '' }, 2000)
}

useIntervalFn(() => {
  if (!game.started) return
  const { hunger, thirst, energy } = game.stats
  if (energy <= 15) { moveTo(BED_POS.x, BED_POS.y); return }
  if (hunger < 25) { moveTo(FOOD_POS.x, FOOD_POS.y); showBubble('🍖'); return }
  if (thirst < 25) { moveTo(WATER_POS.x, WATER_POS.y); showBubble('💧'); return }
  roam()
}, 2800, { immediate: true })

// ─── 猫咪外观 ────────────────────────────────────────────
const catBodyColor = computed(() => {
  const c: Record<Entity.CatStage, string> = {
    kitten: '#f4c27a',
    young: '#e8956a',
    adult: '#c47a45',
  }
  return c[game.stage]
})

const faceEmoji = computed(() => {
  const a = game.activity
  if (a === 'sleeping') return '😴'
  if (a === 'eating') return '😋'
  if (a === 'drinking') return '😌'
  if (a === 'playing') return '😹'
  if (a === 'grooming') return '🐱'
  const m = game.mood
  if (m === 'sick') return '🤒'
  if (m === 'hungry') return '😿'
  if (m === 'thirsty') return '😿'
  if (m === 'sleepy') return '😪'
  if (m === 'annoyed') return '😾'
  if (m === 'happy') return '😸'
  if (m === 'playful') return '😺'
  const neutral: Record<Entity.CatStage, string> = { kitten: '🐱', young: '🐈', adult: '🐈‍⬛' }
  return neutral[game.stage]
})

const catAnimClass = computed(() => {
  const a = game.activity
  if (a === 'sleeping') return 'anim-sleep'
  if (a === 'eating' || a === 'drinking') return 'anim-eat'
  if (a === 'playing') return 'anim-play'
  if (a === 'grooming') return 'anim-groom'
  return 'anim-walk'
})

// ─── 服装 ────────────────────────────────────────────────
const SLOT_LABELS: Record<Entity.ClothingSlot, string> = {
  hat: '帽子',
  body: '衣服',
  collar: '项圈',
  accessory: '配件',
}

const CLOTHING_SLOTS: { key: Entity.ClothingSlot; label: string; placeholder: string }[] = [
  { key: 'hat', label: '帽子', placeholder: '🟫' },
  { key: 'body', label: '衣服', placeholder: '⬜' },
  { key: 'collar', label: '项圈', placeholder: '🟦' },
  { key: 'accessory', label: '配件', placeholder: '🟩' },
]

const equippedItems = computed(() => {
  const result: Record<Entity.ClothingSlot, Entity.ClothingItem | null> = {
    hat: null, body: null, collar: null, accessory: null,
  }
  for (const slot of Object.keys(result) as Entity.ClothingSlot[]) {
    const id = game.equipped[slot]
    if (id) result[slot] = CLOTHING_ITEMS.find(c => c.id === id) ?? null
  }
  return result
})

const ownedClothes = computed(() =>
  game.closet.map(id => CLOTHING_ITEMS.find(c => c.id === id)).filter(Boolean) as Entity.ClothingItem[]
)

function isEquipped(id: string): boolean {
  return Object.values(game.equipped).includes(id)
}

function handleClothingClick(item: Entity.ClothingItem) {
  if (isEquipped(item.id)) {
    game.unequipClothing(item.slot)
  }
  else {
    game.equipClothing(item.id)
  }
}

// ─── 操作面板 ────────────────────────────────────────────
const activeTab = ref('feed')
function showTab(tab: string) { activeTab.value = tab }

function quickFeedWater() {
  if ((game.inventory.foods['running-water'] ?? 0) > 0) game.feedCat('running-water')
  else if ((game.inventory.foods['water'] ?? 0) > 0) game.feedCat('water')
  else window.$message?.warning('没有水了！去商店买吧')
}

// ─── 属性列表 ────────────────────────────────────────────
const statList: { key: keyof Entity.CatStats; emoji: string }[] = [
  { key: 'hunger', emoji: '🍖' },
  { key: 'thirst', emoji: '💧' },
  { key: 'energy', emoji: '⚡' },
  { key: 'happiness', emoji: '😊' },
  { key: 'cleanliness', emoji: '✨' },
  { key: 'health', emoji: '❤️' },
]

function statColor(v: number): string {
  return v >= 60 ? '#18a058' : v >= 30 ? '#f0a020' : '#d03050'
}

// ─── 库存 ────────────────────────────────────────────────
const inventoryFoods = computed(() => FOOD_ITEMS.filter(f => (game.inventory.foods[f.id] ?? 0) > 0))
const inventoryToys = computed(() => TOY_ITEMS.filter(t => (game.inventory.toys[t.id] ?? 0) > 0))

// ─── 工具 ────────────────────────────────────────────────
function fmtTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function confirmReset() {
  dialog.warning({
    title: '重置游戏',
    content: '确定要重置吗？所有进度将会丢失！',
    positiveText: '确定重置',
    negativeText: '取消',
    onPositiveClick() { game.resetGame() },
  })
}
</script>

<style scoped lang="scss">
/* ===== 全局容器 ===== */
.start-screen, .game-screen {
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 12px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ===== 开始界面 ===== */
.start-screen { justify-content: center; align-items: center; }

.start-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 40px 24px;
  border-radius: 24px;
  background: var(--n-card-color, #fff);
  box-shadow: 0 8px 32px rgba(0,0,0,.08);
}

.start-cat-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: float 3s ease-in-out infinite;
}

.scf-hat { height: 24px; }
.scf-face { font-size: 52px; line-height: 1; }
.scf-body {
  width: 46px; height: 38px;
  border-radius: 50% 50% 44% 44% / 54% 54% 46% 46%;
  margin-top: -6px;
}

.start-title { margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; }
.start-desc { margin: 0; color: var(--n-text-color-3,#999); font-size: 14px; }
.name-input { width: 100%; }
.name-error { margin: 0; color: #d03050; font-size: 13px; align-self: flex-start; }
.start-btn { border-radius: 12px; height: 48px; font-size: 16px; }

/* ===== 顶部栏 ===== */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
}

.header-left { display: flex; align-items: center; gap: 6px; }
.phase-icon { font-size: 18px; }
.phase-text { font-size: 14px; color: var(--n-text-color-2,#666); }
.day-text { font-size: 13px; color: var(--n-text-color-3,#aaa); }
.coins-display { font-size: 16px; font-weight: 600; }

/* ===== 房间 ===== */
.cat-room {
  position: relative;
  height: 210px;
  border-radius: 20px;
  background: linear-gradient(180deg, #dceefb 0%, #c8e0f4 55%, #b4c8a8 55%, #a8bc9a 100%);
  overflow: hidden;
  box-shadow: inset 0 -4px 12px rgba(0,0,0,.06);
}

.room-deco { position: absolute; z-index: 2; user-select: none; }
.bed-deco { font-size: 30px; right: 10%; top: 10%; }
.window-deco { font-size: 26px; left: 8%; top: 8%; }

.room-zone {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  cursor: pointer;
  transition: transform 0.12s;
  &:active { transform: scale(0.9); }
}

.food-zone  { bottom: 8%; left: 9%; }
.water-zone { bottom: 8%; left: 30%; }
.toy-zone   { bottom: 8%; left: 58%; }

.zone-icon { font-size: 24px; }
.zone-label { font-size: 10px; color: #666; font-weight: 600; }

/* ===== 猫咪走动容器 ===== */
.cat-mover {
  position: absolute;
  z-index: 10;
  transform: translate(-50%, -50%);
  transition: left 2.2s ease-in-out, top 2.2s ease-in-out;
}

.cat-flipper {
  display: inline-block;
  transition: transform 0.3s;
  &.flip { transform: scaleX(-1); }
}

/* ===== 猫咪分层身体 ===== */
.cat-figure {
  display: flex;
  flex-direction: column;
  align-items: center;

  /* 幼猫 */
  &.stage-kitten {
    --hat-size: 18px;
    --face-size: 34px;
    --collar-size: 14px;
    --body-w: 32px;
    --body-h: 26px;
    --body-item-size: 14px;
  }
  /* 少年猫 */
  &.stage-young {
    --hat-size: 21px;
    --face-size: 42px;
    --collar-size: 16px;
    --body-w: 40px;
    --body-h: 32px;
    --body-item-size: 17px;
  }
  /* 成年猫 */
  &.stage-adult {
    --hat-size: 24px;
    --face-size: 50px;
    --collar-size: 18px;
    --body-w: 48px;
    --body-h: 40px;
    --body-item-size: 20px;
  }
}

.cf-hat {
  font-size: var(--hat-size, 21px);
  min-height: calc(var(--hat-size, 21px) + 4px);
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-head {
  position: relative;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-face {
  font-size: var(--face-size, 42px);
  display: block;
  line-height: 1;
}

.cf-accessory {
  position: absolute;
  right: -6px;
  bottom: 2px;
  font-size: calc(var(--face-size, 42px) * 0.38);
  line-height: 1;
}

.cf-collar {
  font-size: var(--collar-size, 16px);
  min-height: calc(var(--collar-size, 16px) + 2px);
  line-height: 1;
  margin-top: -3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-body {
  width: var(--body-w, 40px);
  height: var(--body-h, 32px);
  border-radius: 50% 50% 44% 44% / 54% 54% 46% 46%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -2px;
  position: relative;
}

.cf-body-item { font-size: var(--body-item-size, 17px); }
.cf-paw { font-size: calc(var(--body-item-size, 17px) * 0.8); opacity: 0.5; }

/* 气泡 */
.thought-bubble {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.12);
  white-space: nowrap;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: white;
  }
}

.bubble-enter-active, .bubble-leave-active { transition: opacity 0.3s, transform 0.3s; }
.bubble-enter-from, .bubble-leave-to { opacity: 0; transform: translateX(-50%) translateY(-4px); }

/* ===== 成长进度 ===== */
.growth-section { display: flex; flex-direction: column; gap: 4px; }

.growth-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.growth-label { font-weight: 600; }
.growth-arrow { color: var(--n-text-color-3,#aaa); }
.growth-xp { color: var(--n-text-color-3,#aaa); font-size: 12px; }

.growth-bar-bg {
  height: 10px;
  border-radius: 5px;
  background: var(--n-border-color, #e0e0e0);
  overflow: hidden;
}

.growth-bar-fill {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, #2080f0, #18a058);
  transition: width 0.6s ease;

  &.bar-full { background: linear-gradient(90deg, #f0c020, #f0a020); }
}

/* ===== 属性条 ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
}

.stat-item { display: flex; align-items: center; gap: 4px; }
.stat-emoji { font-size: 13px; flex-shrink: 0; }

.mini-bar-bg {
  flex: 1; height: 5px;
  border-radius: 3px;
  background: var(--n-border-color,#e0e0e0);
  overflow: hidden;
}

.mini-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s, background 0.5s; }

.stat-num {
  font-size: 11px; font-weight: 600;
  width: 22px; text-align: right; flex-shrink: 0;
  &.num-critical { color: #d03050; animation: pulse 1s ease-in-out infinite; }
}

/* ===== 心情行 ===== */
.mood-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--n-text-color-2,#666);
}

.mood-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  &.mood-happy, &.mood-playful { background: #18a058; }
  &.mood-content { background: #2080f0; }
  &.mood-hungry, &.mood-thirsty, &.mood-annoyed { background: #f0a020; }
  &.mood-sleepy { background: #8a8a8a; }
  &.mood-sick { background: #d03050; }
}

/* ===== 操作面板 ===== */
.action-panel {
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--n-card-color,#fff);
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
}

.item-list { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }

.item-card {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  background: var(--n-body-color,#f8f8f8);
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
  user-select: none;

  &:active { transform: scale(0.97); }
  &:hover:not(.item-disabled):not(.item-owned) { box-shadow: 0 2px 8px rgba(0,0,0,.1); }
  &.item-disabled { opacity: 0.38; cursor: not-allowed; pointer-events: none; }
  &.item-owned { opacity: 0.6; cursor: default; }
  &.item-equipped { background: #e8f4ff; border: 1px solid #91caff; }
}

.item-icon { font-size: 26px; flex-shrink: 0; }
.item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.item-name { font-size: 13px; font-weight: 600; }
.item-desc { font-size: 11px; color: var(--n-text-color-3,#aaa); }

.item-right {
  display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0;
}

.item-xp { font-size: 11px; color: #2080f0; font-weight: 600; }
.item-count { font-size: 13px; font-weight: 600; color: var(--n-text-color-2,#666); }
.item-price { font-size: 13px; font-weight: 600; color: #f0a020; }

.slot-badge {
  font-size: 10px;
  background: var(--n-border-color,#eee);
  color: var(--n-text-color-3,#888);
  border-radius: 4px;
  padding: 1px 5px;
}

.equipped-tag { font-size: 11px; color: #2080f0; font-weight: 600; }
.owned-tag { font-size: 11px; color: #18a058; font-weight: 600; }

.empty-tip {
  text-align: center; padding: 28px 0;
  color: var(--n-text-color-3,#aaa); font-size: 14px;
}

/* ===== 衣柜 ===== */
.closet-section-title {
  font-size: 11px; font-weight: 700;
  color: var(--n-text-color-3,#aaa);
  letter-spacing: 1px;
  padding: 4px 0 4px;
}

.closet-count { font-weight: 400; color: var(--n-text-color-3,#aaa); }

.equipped-slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.eq-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 12px;
  background: var(--n-body-color,#f8f8f8);
  border: 2px dashed var(--n-border-color,#e0e0e0);
  cursor: default;
  position: relative;
  transition: border-color 0.2s;

  &.slot-active {
    border-style: solid;
    border-color: #91caff;
    background: #e8f4ff;
    cursor: pointer;
  }
}

.eq-slot-icon { font-size: 24px; line-height: 1; opacity: 0.35; }
.slot-active .eq-slot-icon { opacity: 1; }
.eq-slot-label { font-size: 10px; color: var(--n-text-color-3,#aaa); }

.eq-slot-remove {
  position: absolute;
  top: 2px; right: 5px;
  font-size: 12px;
  color: #d03050;
  font-weight: 700;
  line-height: 1;
}

/* ===== 商店 ===== */
.shop-scroll { max-height: 300px; }
.log-scroll { max-height: 280px; }

.log-entry {
  display: flex; gap: 8px; padding: 5px 2px; font-size: 12px;
  border-bottom: 1px solid var(--n-divider-color,#eee);
  &:last-child { border-bottom: none; }
  &.log-info    .log-msg { color: var(--n-text-color,#333); }
  &.log-warning .log-msg { color: #f0a020; }
  &.log-action  .log-msg { color: #2080f0; }
  &.log-auto    .log-msg { color: var(--n-text-color-3,#aaa); }
}

.log-time { flex-shrink: 0; color: var(--n-text-color-3,#aaa); font-size: 11px; }

/* ===== 底部 ===== */
.footer-bar { display: flex; justify-content: center; padding-top: 4px; }

/* ===== 猫咪动画 ===== */
@keyframes float {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes walk-bob {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-3px); }
}
@keyframes sleep-bob {
  0%,100% { transform: scaleY(1); }
  50%      { transform: scaleY(1.04); }
}
@keyframes eat-bob {
  0%,100% { transform: rotate(0deg) translateY(0); }
  33%      { transform: rotate(-6deg) translateY(-4px); }
  66%      { transform: rotate(6deg) translateY(-4px); }
}
@keyframes play-shake {
  0%,100% { transform: rotate(0deg); }
  25%      { transform: rotate(-10deg) translateY(-3px); }
  75%      { transform: rotate(10deg) translateY(-3px); }
}
@keyframes groom-tilt {
  0%,100% { transform: rotate(0deg); }
  40%      { transform: rotate(-7deg); }
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.anim-walk  { animation: walk-bob   0.45s ease-in-out infinite; }
.anim-sleep { animation: sleep-bob  2.5s  ease-in-out infinite; }
.anim-eat   { animation: eat-bob    0.5s  ease-in-out infinite; }
.anim-play  { animation: play-shake 0.4s  ease-in-out infinite; }
.anim-groom { animation: groom-tilt 1s    ease-in-out infinite; }
</style>
