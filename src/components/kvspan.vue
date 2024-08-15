<style scoped>
  .item {
    display: inline-block;
    box-sizing: border-box;
    margin: .2rem;
    font-size: 80%;
    color: var(--color-font);
  }
  .item .name {
    display: inline-block;
    box-sizing: border-box;
    border-radius: 1rem;
    background-color: var(--color-theme);
    color: var(--color-font-rev);
    padding: .4rem;
    margin-right: .2rem;
  }
</style>

<template>
  <span class="item">
    <span class="name">{{ props.name }}</span>
    <score v-if="props.val[0] == '$'" :score="props.val.substring(1)"></score>
    <span v-else class="val">{{ props.val }}</span>
  </span>
</template>

<script lang="ts" setup>
  import Score from './scorespan.vue'

  const props = defineProps<{
    name: string,
    val: string
  }>()
</script>
