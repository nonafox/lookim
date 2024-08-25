<style scoped>
  .link {
    width: 100%;
    border-radius: .8rem .2rem 2.4rem .2rem;
    margin-bottom: 1rem;
  }
</style>

<template>
  <router-link to="/cubing"><img class="link" src="../../public/img/lookim-cubing.png"/></router-link>
  <router-link to="/chating"><img class="link" src="../../public/img/lookim-chating.png"/></router-link>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue'

  import { inject } from 'vue'

  let title: Ref<string> = inject('title')!
  title.value = 'Home'
</script>
