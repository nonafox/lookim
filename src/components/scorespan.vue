<style scoped>
  .score {
    color: var(--color-font);
  }
  .score .odds {
    font-size: 80%;
    color: var(--color-font-shallow-plus);
  }
</style>

<template>
  <span class="score">
    <span v-for="(v, k) in props.score?.split('.')" :key="k" :class="k == 1 ? 'odds' : ''">
      {{ k == 1 ? '.' : '' }}{{ v }}
    </span>
  </span>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    score: string
  }>()
</script>
