<style scoped>
  .nav {
    position: sticky;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    z-index: var(--nav-zindex);
    left: 0;
    top: 0;
    width: 100%;
    height: var(--nav-height);
    padding: var(--nav-padding);
    background-color: var(--colour-theme-bg);
    border-radius: 0 0 var(--radius-lg) 0;
    border-bottom: var(--border-width-lg) solid var(--colour-border);
  }
  .logo {
    height: var(--nav-logo-height);
  }
  .contents {
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: var(--contents-padding);
  }
  .copyright {
    margin-top: var(--copyright-margin-top);
    padding: var(--copyright-padding);
    border-radius: var(--copyright-radius);
    border: var(--border-width-md) solid var(--colour-border);
    color: var(--colour-font);
    font-size: var(--font-size-sm);
    font-weight: bold;
  }
  .title {
    font-size: var(--font-size-md);
    color: var(--colour-font);
  }
</style>

<template>
  <div class="nav">
    <router-link to="/"><img class="logo" src="../public/img/lookim.png"/></router-link>
    <div class="title">| {{ title }}</div>
  </div>
  <div class="contents">
    <Suspense>
      <RouterView />
    </Suspense>
    <div class="copyright">
      Copyright © 2024 谭镇洋
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { provide, ref } from 'vue'
  import { RouterView } from 'vue-router'
  
  let title = ref('')
  provide('title', title)
</script>
