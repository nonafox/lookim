<style scoped>
  .link {
    width: var(--link-img-width);
    border-radius: 0 var(--radius-md) var(--radius-md) var(--radius-md);
  }
</style>

<template>
  <router-link to="/cubing"><img class="link" src="../../public/img/lookim-cubing.png"/></router-link>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue'

  import { inject } from 'vue'

  let title: Ref<string> = inject('title')!
  title.value = 'Home'
</script>
