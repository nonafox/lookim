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
  <span v-if="props.score" class="score">
    <span v-for="(v, k) in props.score.split(sp_reg)" :key="k" :class="k >= 1 ? 'odds' : ''">
      {{ k >= 1 ? props.score.match(sp_reg)![k - 1][0] : '' }}{{ v }}
    </span>
  </span>
</template>

<script lang="ts" setup>
  const sp_reg = /[\. ]/g
  const props = defineProps<{
    score: string
  }>()
</script>
