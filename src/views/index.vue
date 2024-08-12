<style scoped>
  .link {
    width: 100%;
    border-radius: 0 .8rem .8rem .8rem;
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
