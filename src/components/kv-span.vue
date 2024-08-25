<style scoped>
  .item {
    display: inline-block;
    box-sizing: border-box;
    margin: .4rem .3rem 0 0;
    font-size: 80%;
    color: var(--color-font);
  }
  .item.tiny {
    font-size: 70%;
  }
  .item .name {
    display: inline-block;
    box-sizing: border-box;
    border-radius: 1rem;
    background-color: var(--color-theme);
    color: var(--color-font-rev);
    padding: .3rem .4rem;
    margin-right: .3rem;
  }
  .item .name.plain {
    background: none;
    color: var(--color-font);
    border: 1.5px solid var(--color-border);
  }
  .item.tiny .name.plain {
    border: 1px solid var(--color-border);
  }
</style>

<template>
  <span class="item" :class="tiny ? 'tiny' : ''">
    <span class="name" :class="props.plain ? 'plain' : ''">{{ props.name }}</span>
    <score-span v-if="props.val[0] == '$'" :score="props.val.substring(1)"></score-span>
    <span v-else>{{ props.val }}</span>
  </span>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    name: string,
    val: string,
    plain?: boolean,
    tiny?: boolean
  }>()
</script>
