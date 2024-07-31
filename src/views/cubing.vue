<style scoped>
  .kit {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .note {
    color: var(--colour-font);
  }
  .note>* {
    width: 100%;
    text-align: center;
  }
  .note .title {
    font-size: var(--font-size-sm);
  }
  .note .msg {
    font-size: var(--font-size-lg);
  }
</style>

<template>
  <div class="kit">
    <el-button @click="conn_status ? disconnect() : connect()" v-loading="conn_loading" round :type="conn_status ? 'primary' : ''">
      {{ conn_status ? 'Disconnect' : 'Connect' }}
    </el-button>
    <el-button v-show="conn_status" @click="reset_cube" round>
      Reset cube
    </el-button>
    <el-button v-show="conn_status" @click="switch_earphone_mode" round :type="earphone_mode ? 'primary' : ''">
      Earphone mode
    </el-button>
  </div>
  <div v-show="conn_status" v-loading="conn_status && ! conn_synced" id="cube"></div>
  <div class="note">
    <div class="title">{{ note_title }}</div>
    <div class="msg">{{ note_msg }}</div>
  </div>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue'
  import type { GanCubeConnection, GanCubeMove } from 'gan-web-bluetooth'

  import { ref, inject, onMounted, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import { connectGanCube, cubeTimestampLinearFit, now } from 'gan-web-bluetooth'
  import { TwistyPlayer } from 'cubing/twisty'
  import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search'
  import { patternToFacelets, faceletsToPattern } from '../utils/afedotov'

  let title: Ref<string> = inject('title')!
  title.value = 'Cubing base'

  const facelet_solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
  const prepare_time = 15, prepare_time_half = 8, voice_result_in_ms_threshold = 60
  const cheat_sol_threshold = 14
  const max_move_records = 500

  const make_move_buf = () => '    '.split('')
  let conn: GanCubeConnection | null = null, cube_player: TwistyPlayer | null = null
  let conn_status = ref(false), conn_loading = ref(false), conn_premove_buf = '', conn_synced = ref(false)
  let cube_status = ref(false)
  let note_msg = ref(''), note_title = ref('')
  type timer_clocks_list = {
    id: number,
    type: string
  }[]
  let earphone_mode = ref(false), timer_move_buf = make_move_buf(), timer_clocks: timer_clocks_list = []
  let timer_ready_status = false, timer_status = false,
    timer_move_events: GanCubeMove[] = [],
    timer_auto_go_timestamp = 0

  function floor_dig(num: number, dig: number) {
    let int = Math.floor(num)
    if (dig <= 0)
      return `${int}`
    let dec = Math.floor((num - int) * 10 ** dig)
    return `${int}.${`${dec}`.padStart(dig, '0')}`
  }
  function format_sec(sec: number, dig = 3, add_zero = true) {
    let parts = `${floor_dig(sec, dig)}`.split('.')
    if (add_zero && parts[0].length < 2)
      parts[0] = `0${parts[0]}`
    return parts.join('.')
  }
  function format_time(time: number, ms = true) {
    if (time >= 60)
      return `${Math.floor(time / 60)}:${format_sec(time % 60, ms ? 3 : 0)}`
    return `${format_sec(time, ms ? 3 : 0, false)}`
  }
  function voice_time(time: number, dig = 0) {
    let m = Math.floor(time / 60)
    let s = time % 60
    if (m > 0)
      return `${m} minute${time >= 60 * 2 ? 's' : ''}`
        + ` ${s > 0 ? format_sec(s, dig).replace(/0/g, 'o') : ''}.`
    return `${format_sec(s, dig)}.`
  }

  function cube() {
    cube_player = new TwistyPlayer({
      puzzle: '3x3x3',
      visualization: 'PG3D',
      alg: '',
      experimentalSetupAnchor: 'start',
      background: 'none',
      controlPanel: 'none',
      hintFacelets: 'none',
      tempoScale: 5
    })
    document.querySelector('#cube')!.append(cube_player)
  }
  function make_note(msg = '', title = '') {
    note_msg.value = msg
    note_title.value = title
  }
  function make_voice(msg: string) {
    let ssu = new SpeechSynthesisUtterance()
    ssu.text = msg
    ssu.lang = 'en'
    window.speechSynthesis.speak(ssu)
  }
  async function connect() {
    conn_loading.value = true
    try {
      conn = await connectGanCube()
    }
    catch {
      ElMessage.error('Failed!')
      throw new Error
    }
    finally {
      conn_loading.value = false
    }
    conn_status.value = true
    ElMessage.success('Connected!')
    conn.events$.subscribe(async (event) => {
      if (event.type == 'FACELETS') {
        if (event.facelets != facelet_solved) {
          let kpattern = faceletsToPattern(event.facelets)
          let solution = await experimentalSolve3x3x3IgnoringCenters(kpattern)
          let scramble = solution.invert()
          cube_player!.alg = scramble + conn_premove_buf
        }
        else {
          cube_player!.alg = conn_premove_buf
        }
        conn_premove_buf = ''
        conn_synced.value = true
      }
      else if (event.type == 'MOVE') {
        if (! conn_synced.value) {
          conn_premove_buf += ' ' + event.move
        }
        else {
          cube_player!.experimentalAddMove(event.move, { cancel: false })
          if (timer_status) {
            if (timer_move_events.length >= max_move_records)
              timer_move_events.splice(1, 1)
            timer_move_events.push(event)
          }
          // strict logical sequences here
          if (timer_ready_status)
            timer_go()
          await push_move_buf(event.move)
        }
      }
      else if (event.type == 'DISCONNECT') {
        conn_status.value = false
        ElMessage.info('Disconnected!')
      }
    })
    await conn.sendCubeCommand({ type: 'REQUEST_FACELETS' })
  }
  function disconnect() {
    if (! conn)
      return 0
    conn.disconnect()
    conn = null
    conn_status.value = conn_synced.value = earphone_mode.value = false
    conn_premove_buf = ''
    timer_move_buf = make_move_buf()
    make_note()
  }
  async function reset_cube() {
    await conn!.sendCubeCommand({ type: 'REQUEST_RESET' })
    ElMessage.info('Cube reset!')
  }
  function switch_earphone_mode() {
    if (timer_ready_status || timer_status)
      return 0
    earphone_mode.value = ! earphone_mode.value
    ElMessage.info(earphone_mode.value ? 'Earphone mode on!' : 'Earphone mode off!')
  }
  async function push_move_buf(move: string) {
    timer_move_buf.splice(0, 1)
    timer_move_buf.push(move)
    if (earphone_mode.value && ! timer_status) {
      if (timer_move_buf.every((val) => val == timer_move_buf[0])) {
        let kpattern = await cube_player!.experimentalModel.currentPattern.get()
        let solution = (await experimentalSolve3x3x3IgnoringCenters(kpattern)).toString()
        let facelets = patternToFacelets(kpattern)
        if (facelets == facelet_solved || solution.split(' ').length <= cheat_sol_threshold)
          timer_cheat()
        else
          timer_ready()
        timer_move_buf = make_move_buf()
      }
    }
  }
  function timer_clocks_interval(...args: Parameters<typeof setInterval>) {
    timer_clocks.push({
      type: 'interval',
      id: setInterval(...args)
    })
  }
  function timer_clocks_timeout(...args: Parameters<typeof setTimeout>) {
    timer_clocks.push({
      type: 'timeout',
      id: setTimeout(...args)
    })
  }
  function timer_clocks_clear() {
    for (let clock of timer_clocks) {
      if (clock.type == 'interval')
        clearInterval(clock.id)
      else if (clock.type == 'timeout')
        clearTimeout(clock.id)
    }
    timer_clocks = []
  }
  function timer_ready() {
    timer_ready_status = true
    let counter = prepare_time
    timer_clocks_clear()
    timer_clocks_interval(() => {
      counter --
      if (counter >= 0)
        make_note(`${format_time(counter, false)}`, 'Inspection')
      if (counter == prepare_time_half)
        make_voice(`${prepare_time_half} seconds.`)
    }, 1000)
    timer_clocks_timeout(() => {
      if (! timer_status) {
        timer_auto_go_timestamp = now()
        timer_go()
      }
    }, prepare_time * 1000)
    make_note('Ready!')
    make_voice('ready.')
  }
  function timer_cheat() {
    make_note('Cheating!')
    make_voice('no cheating. you stupid.')
  }
  function timer_go() {
    timer_ready_status = false
    timer_status = true
    let counter = 0
    timer_clocks_clear()
    timer_clocks_interval(() => {
      counter ++
      make_note(`${format_time(counter, false)}`, 'Cubing')
      if (counter % 60 == 0)
        make_voice(voice_time(counter))
    }, 1000)
    make_note('Go!')
    make_voice('go.')
  }
  function timer_stop() {
    timer_clocks_clear()
    timer_move_events = cubeTimestampLinearFit(timer_move_events)
    let time = timer_move_events[timer_move_events.length - 1].cubeTimestamp
      - timer_move_events[0].cubeTimestamp
    let wasted_time = timer_move_events[0].localTimestamp! - timer_auto_go_timestamp
    if (timer_auto_go_timestamp && wasted_time > 0)
      time += wasted_time
    time = time / 1000
    make_note(format_time(time))
    make_voice(`done at. ${voice_time(time, time <= voice_result_in_ms_threshold ? 1 : 0)}`)
    timer_move_events = []
    timer_ready_status = timer_status = false
    timer_move_buf = make_move_buf()
    timer_auto_go_timestamp = 0
  }

  onMounted(() => {
    cube()
    cube_player!.experimentalModel.currentPattern.addFreshListener(async (kpattern) => {
      let facelets = patternToFacelets(kpattern)
      cube_status.value = facelets == facelet_solved
      if (cube_status.value && timer_status)
        timer_stop()
    })
  })
  onBeforeUnmount(() => {
    disconnect()
    cube_player = null
  })
</script>
