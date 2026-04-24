<script setup lang="ts">
const router = useRouter()
</script>

<template>
  <div class="flex-col-center h-full">
    <n-button type="primary" @click="router.push('/')">
      回到首页
    </n-button>
  </div>
</template>
