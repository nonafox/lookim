<style scoped>
</style>

<template>
  
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue'

  import { inject } from 'vue'

  let title: Ref<string> = inject('title')!
  title.value = 'Chating world'
</script>
