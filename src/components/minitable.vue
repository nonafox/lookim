<style scoped>
  .item {
    display: inline-block;
    box-sizing: border-box;
    margin: var(--minitable-margin);
    font-size: var(--font-size-sm);
    color: var(--colour-font);
  }
  .item .name {
    display: inline-block;
    box-sizing: border-box;
    border-radius: var(--radius-lg);
    background-color: var(--colour-theme);
    color: var(--colour-font-rev);
    padding: var(--minitable-key-padding);
    margin-right: var(--minitable-key-margin);
  }
</style>

<template>
  <span class="item">
    <span class="name">{{ props.name }}</span>
    <score v-if="props.val[0] == '$'" :score="props.val.substr(1)"></score>
    <span v-else class="val">{{ props.val }}</span>
  </span>
</template>

<script lang="ts" setup>
  import Score from './score.vue'

  const props = defineProps<{
    name: string,
    val: string
  }>()
</script>