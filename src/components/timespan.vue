<style scoped>
  .time {
    font-size: 80%;
    color: var(--color-font-shallow);
  }
  .time .odds {
    font-size: 95%;
    color: var(--color-font-shallow-plus);
  }
</style>

<template>
  <span class="time">
    <span v-for="(v, k) in props.time?.split(time_sp)" :key="k" :class="k == 1 ? 'odds' : ''">
      {{ k == 1 ? time_sp : '' }}{{ v }}
    </span>
  </span>
</template>

<script lang="ts" setup>
  import { time_sp } from '../utils/funcs'
  const props = defineProps<{
    time: string
  }>()
</script>
