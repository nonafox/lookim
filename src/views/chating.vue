<style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 30rem;
  }
  .list {
    height: calc(70vh - var(--page-nav-height));
  }
  .uploader-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 1rem;
  }
  .uploader+.uploader {
    margin-left: 10px;
  }
  .dialog-process {
    margin-top: 1rem;
  }
</style>

<template>
  <div class="container">
    <message-list ref="list_elm" :list="list" :loading-list="loading_list"
        @load="triggerLoad" @fold="fold" class="list">
    </message-list>
    <el-input v-model="input" @keyup.enter="send" size="large"></el-input>
    <div class="uploader-container">
      <el-upload v-for="v in uploaders"
          ref="upload_elm"
          class="uploader"
          :action="apis.upload"
          method="POST"
          :data="{ user: auth.assertUser(), type: v.type }"
          :accept="v.accept"
          :show-file-list="false"
          :before-upload="upload_check"
          :on-progress="on_progress"
          :on-success="on_success"
          :on-error="on_error">
        <el-button circle>{{ v.name }}</el-button>
      </el-upload>
    </div>
  </div>

  <el-dialog
      v-model="loading_dialog"
      title="Pending"
      align-center
      :width="420"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
    <span>Upload processing...</span>
    <el-progress :text-inside="true" class="dialog-process" :stroke-width="20" :percentage="Math.floor(loading_percent)"/>
  </el-dialog>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue'
  import type { SetIntervalAsyncTimer } from 'set-interval-async'
  import type { UploadProgressEvent, UploadRawFile } from 'element-plus'
  import type { message_item } from '../utils/types'

  import { inject, ref, nextTick, onUnmounted } from 'vue'
  import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async'
  import { ElMessageBox } from 'element-plus'
  import { filesize } from 'filesize'
  import MessageList from '../components/message-list.vue'
  import { auth } from '../utils/auth'
  import {
    file_max_size,
    file_max_size_image,
    apis,
    messages_per_page,
    messages_refresh_interval,
    messages_load_more_interval
  } from '../utils/conf'

  let title: Ref<string> = inject('title')!
  title.value = 'Chating world'

  const loading_dialog = ref(false), loading_percent = ref(0)
  const uploaders: {
    name: string,
    type: string,
    accept: string
  }[] = [
    {
      name: '📸',
      type: 'image',
      accept: 'image/*'
    },
    {
      name: '📷',
      type: 'video',
      accept: 'video/*'
    },
    {
      name: '📄',
      type: 'file',
      accept: '*'
    }
  ]
  const list = ref([] as message_item[])
  const loading_list = ref(new Set<number>())
  const input = ref('')
  const list_elm = ref<InstanceType<typeof MessageList> | null>(null)

  let n = 0,
    version = [0, 0, 0] as [number, number, number] // [edited_time, last_time, counts]
  async function load(more = false) {
    const first_more = more && ! n
    const body = new FormData()
    body.append('user', await auth.user())
    body.append('n', '' + (more ? (n += messages_per_page) : n))
    body.append('version', JSON.stringify(version))
    const data = await (await fetch(apis.chat, {
      method: 'post',
      body
    })).json() as {
      status: boolean,
      data: {
        list?: message_item[],
        version?: [number, number, number]
      }
    }
    if (data.status) {
      const handler = async () => {
        list.value = data.data.list!
        loading_list.value.clear()
        await nextTick()
        if (first_more || data.data.version![1] != version[1])
          list_elm.value!.scrollEnd()
        version = data.data.version!
      }
      
      if (data.data.version![1] == version[1] && data.data.version![2] > version[2]) {
        list_elm.value!.loading()
        await new Promise<void>(resolve => {
          setTimeout(async () => {
            await handler()
            resolve()
          }, messages_load_more_interval)
        })
      }
      else {
        await handler()
      }
    }
  }
  let interval_id: SetIntervalAsyncTimer<[]> | null = null
  async function triggerLoad() {
    await load(true)
    if (! interval_id)
      interval_id = setIntervalAsync(async () => await load(), messages_refresh_interval)
  }
  async function send() {
    if (input.value) {
      const body = new FormData()
      body.append('user', await auth.user())
      body.append('type', 'common')
      body.append('msg', input.value)
      await fetch(apis.chat_send, {
        method: 'post',
        body
      })
      input.value = ''
    }
  }
  async function fold(time_id: number) {
    loading_list.value.add(time_id)
    const body = new FormData()
    body.append('user', await auth.user())
    body.append('time_id', '' + time_id)
    await fetch(apis.chat_fold, {
      method: 'post',
      body
    })
  }
  function upload_check(raw: UploadRawFile) {
    if (raw.size > file_max_size || (raw.type.startsWith('image/') && raw.size > file_max_size_image)) {
      ElMessageBox.alert(
        `Notice that you cannot upload neither files over the size of ` +
        `${filesize(file_max_size, { standard: 'jedec' })} ` +
        `nor any images over the size of `+
        `${filesize(file_max_size_image, { standard: 'jedec' })} !`,
        'Error'
      )
      return false
    }
    return true
  }
  function on_progress(event: UploadProgressEvent) {
    if (! loading_dialog.value)
      loading_dialog.value = true
    loading_percent.value = event.percent
  }
  function on_success() {
    loading_dialog.value = false
  }
  function on_error() {
    loading_dialog.value = false
    ElMessageBox.alert(
      'Upload failed for unknown reason.',
      'Error'
    )
  }

  onUnmounted(() => interval_id && clearIntervalAsync(interval_id))
</script>
