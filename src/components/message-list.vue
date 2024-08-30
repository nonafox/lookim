<style scoped>
  .list {
    box-sizing: border-box;
    width: 100%;
    max-width: 30rem;
  }
  .list-li {
    width: 100%;
  }
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: all .3s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  .list-leave-active {
    position: absolute;
  }
  .container {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: row;
  }
  .container * {
    word-break: break-word;
    word-wrap: break-word;
    white-space: pre-wrap;
  }
  .you .container {
    justify-content: flex-start;
  }
  .me .container {
    justify-content: flex-end;
  }
  .container>* {
    box-sizing: border-box;
    border-radius: .4rem;
    margin: .3rem;
  }
  .you .container>* {
    border-top-left-radius: 0;
  }
  .me .container>* {
    border-top-right-radius: 0;
  }
  .common {
    max-width: 60%;
    padding: .6rem .8rem;
    user-select: text;
  }
  .you .common, .you .file, .you .function {
    background-color: var(--color-message-you);
  }
  .me .common, .me .file, .me .function {
    background-color: var(--color-message-me);
  }
  .image {
    min-width: 20%;
    max-width: 40%;
    min-height: 5rem;
    max-height: 15rem;
  }
  .video-wrapper {
    display: flex;
    max-width: 40%;
    max-height: 15rem;
    justify-content: center;
    position: relative;
    background-image: url(../../public/img/video-cover.png);
    background-position: center;
    background-size: cover;
    cursor: pointer;
    overflow: hidden;
  }
  .video {
    min-width: 20%;
    min-height: 5rem;
    z-index: -1;
  }
  .file {
    max-width: 60%;
    padding: 1rem;
    cursor: pointer;
  }
  .file .file-title {
    margin-bottom: .6rem;
    font-size: 120%;
    font-weight: bold;
    text-align: center;
    opacity: 70%;
  }
  .file .file-name {
    text-align: center;
  }
  .file .file-size {
    margin-top: .6rem;
    text-align: center;
    font-size: 70%;
    opacity: 70%;
  }
  .container-function {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  .function {
    box-sizing: border-box;
    margin: .3rem;
    border-radius: .4rem;
    padding: .4rem .5rem;
    font-size: 80%;
    opacity: 70%;
  }
  .time {
    box-sizing: border-box;
    margin: .6rem;
    font-size: 70%;
    opacity: 50%;
  }
</style>

<template>
  <el-scrollbar tag="ul" ref="list_elm" class="list" @scroll="scroll" v-loading="loading_status">
    <transition-group tag="div" ref="list_inner_elm" class="list-li" name="list">
      <div v-for="v in props.list" :key="v.time" :class="isMe(v.user_id) ? 'me' : 'you'"
          v-loading="loadingList.has(v.time)">
        <div v-drag.left="calc_drag(v)" :class="calc_class(v)">
          <div v-if="v.type == '__time'" class="time">
            {{ desc_time(+ v.msg) }}
          </div>
          <div v-else-if="v.folded" class="function">
            🔖folded...
          </div>
          <div v-else-if="v.type == 'common'" class="common">
            {{ v.msg }}
          </div>
          <el-image v-else-if="v.type == 'image'" class="image" :src="v.msg"
              :preview-src-list="[v.msg]" fit="cover">
          </el-image>
          <div v-else-if="v.type == 'video'" class="video-wrapper" @click="jump(v.msg)">
            <video class="video">
              <source :src="v.msg"></source>
            </video>
          </div>
          <div v-else-if="v.type == 'file'" class="file" @click="jump(v.msg)">
            <div class="file-title">📂File</div>
            <div class="file-name">{{ v.msg.split('/').findLast(() => true) }}</div>
            <div class="file-size">{{ filesize(+ v.submsg, { standard: 'jedec' }) }}</div>
          </div>
          <div v-else-if="v.type == 'function'" class="function">
            🌀{{ message_func_table[v.submsg].msg }}
          </div>
        </div>
      </div>
    </transition-group>
  </el-scrollbar>
</template>

<script lang="ts" setup>
  import type { ComponentPublicInstance } from 'vue'
  import type { message_item } from '../utils/types'

  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { ElScrollbar } from 'element-plus'
  import { filesize } from 'filesize'
  import { desc_time } from '../utils/funcs'
  import { message_func_table } from '../utils/types'

  const props = defineProps<{
    list: message_item[],
    loadingList: Set<number>
  }>()
  const emit = defineEmits<{
    (e: 'load', first?: boolean): void
    (e: 'fold', id: number): void
  }>()
  const list_elm = ref<InstanceType<typeof ElScrollbar> | null>(null)
  const list_inner_elm = ref<ComponentPublicInstance | null>(null)
  const loading_status = ref(false)

  function calc_drag(v: message_item) {
    if (v.type != 'function' && v.type != '__time')
      return () => emit('fold', v.time)
    return null
  }
  function calc_class(v: message_item) {
    if (v.folded || v.type == 'function' || v.type == '__time')
      return 'container-function'
    return 'container'
  }
  function isMe(user_id: number) {
    return user_id == Number.parseInt(localStorage.getItem('__user_id')!)
  }
  function jump(url: string) {
    window.open(url)
  }
  let scroll_top = 0
  function scroll(payload: { scrollLeft: number, scrollTop: number }) {
    scroll_top = payload.scrollTop
    if (payload.scrollTop == 0)
      emit('load', true)
  }
  function scrollEnd() {
    list_elm.value!.setScrollTop((list_inner_elm.value!.$el as HTMLDivElement).offsetHeight)
  }
  function loading() {
    loading_status.value = true
  }

  let inner_height = 0
  const observer = new ResizeObserver(() => {
    const new_height = (list_inner_elm.value!.$el as HTMLDivElement).offsetHeight
    const diff = new_height - inner_height
    if (inner_height) {
      list_elm.value!.setScrollTop(scroll_top + diff)
      loading_status.value = false
    }
    inner_height = new_height
  })
  watch(list_inner_elm, () => {
    if (list_inner_elm.value)
      observer.observe(list_inner_elm.value!.$el as HTMLDivElement)
  })
  onMounted(() => emit('load', true))
  onUnmounted(() => observer.disconnect())

  defineExpose({
    scrollEnd,
    loading
  })
</script>
