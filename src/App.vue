<style scoped>
  .nav {
    position: sticky;
    display: flex;
    flex-direction: row;
    align-items: center;
    box-sizing: border-box;
    z-index: 12;
    left: 0;
    top: 0;
    width: 100%;
    height: 5rem;
    padding: .1rem .5rem;
    background-color: var(--color-theme-bg);
    border-radius: 0 0 1rem 0;
    border-bottom: 4px solid var(--color-border);
  }
  .logo {
    height: 3rem;
  }
  .contents {
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 2rem 1rem;
  }
  .copyright {
    margin-top: 12rem;
    color: var(--color-font);
    font-size: 80%;
  }
  .title {
    font-size: 110%;
    color: var(--color-font);
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
      Copyright © 2024 Jason Tan
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { provide, ref } from 'vue'
  import { RouterView } from 'vue-router'

  import { css as font_css1 } from '../public/font/Gotham-Medium.ttf'
  document.body.style.fontFamily = `"${font_css1.family}"`;
  
  let title = ref('')
  provide('title', title)
</script>
