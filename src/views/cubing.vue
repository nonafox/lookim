<style scoped>
  .kit {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .connect-note {
    box-sizing: border-box;
    width: 100%;
    margin-top: 5rem;
    padding: 1rem 1.5rem;
    color: var(--color-font);
    font-size: 150%;
    border-radius: 0 0 .8rem 0;
    border-bottom: 4px solid var(--color-border);
  }
  #cube {
    margin: 2.5rem 0;
  }
  .note {
    color: var(--color-font);
  }
  .note>* {
    width: 100%;
    text-align: center;
  }
  .note .title {
    font-size: 80%;
  }
  .note .msg {
    font-size: 150%;
  }
  .note .score {
    font-size: 150%;
  }
  .score-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1.5rem 0;
  }
  .score-list {
    box-sizing: border-box;
    max-width: 100%;
    width: 20rem;
    height: 18rem;
    padding: 0;
    overflow: hidden scroll;
  }
  .score-item {
    transition: all .3s ease;
    box-sizing: border-box;
    width: 100%;
    background-color: var(--color-theme-bg);
    border-radius: 0 0 .8rem 0;
    border-bottom: 2px solid var(--color-border);
    margin-bottom: 1rem;
    padding: .6rem;
  }
  .score-item-main {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .score-item-note {
    width: 100%;
    border-top: 1px solid var(--color-border-shallow);
    margin-top: .6rem;
    padding-top: .6rem;
    color: var(--color-font);
  }
  .score-item-rightop {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .score-item-rightop>* {
    margin: 0 .4rem;
  }
  .score-item-rightop .id {
    color: var(--color-font);
  }
  .score-item:active {
    background-color: var(--color-theme-bg-hover);
  }
  .score-item .score {
    font-size: 150%;
  }
  .score-item-folded {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: .2rem;
  }
  .score-list-move,
  .score-list-enter-active,
  .score-list-leave-active {
    transition: all .3s ease;
  }
  .score-list-enter-from,
  .score-list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  .score-list-leave-active {
    position: absolute;
  }
  .overall {
    box-sizing: border-box;
    text-align: center;
    width: 100vw;
    overflow: scroll hidden;
    text-wrap: nowrap;
    margin: 1rem 0;
    padding: .2rem;
  }
</style>

<template>
  <div class="kit">
    <el-button @click="conn_status ? disconnect() : connect()" v-loading="conn_loading"
        circle :type="conn_status ? 'primary' : ''">
      {{ conn_status ? '💘' : '💓' }}
    </el-button>
    <el-button v-show="conn_status" @click="reset_cube" circle>
      💞
    </el-button>
    <el-button v-show="conn_status" @click="switch_earphone_mode" circle :type="earphone_mode ? 'primary' : ''">
      💖
    </el-button>
    <el-button @click="switch_page" circle>
      {{ page ? '♋' : '♉' }}
    </el-button>
  </div>
  <div>
    <div v-show="page == 0">
      <div v-show="conn_status" v-loading="conn_status && ! conn_synced" id="cube"></div>
      <div v-show="! conn_status" class="connect-note">
        Connect the cube to show more here...
      </div>
    </div>
    <div v-show="page == 1" class="score-page">
      <transition-group name="score-list" tag="ul" class="score-list"
          @touchmove="scores_unfolded_items.clear()">
        <li v-for="(v, k) in scores_list.toReversed()" :key="v.time"
            @click="click_score_item(v.time)" class="score-item">
          <div class="score-item-main">
            <score-span :score="format_score(v.score)"></score-span>
            <transition name="el-zoom-in-bottom" mode="out-in">
              <div v-if="scores_unfolded_items.has(v.time)" class="score-item-folded">
                <el-button @click.stop="score_item_note(v.time)"
                    circle :type="v.note ? 'primary' : ''">
                  ❤
                </el-button>
                <el-button @click.stop="score_item_del(v.time)" circle>
                  💔
                </el-button>
              </div>
              <div class="score-item-rightop" v-else>
                <time-span :time="desc_time(v.time)"></time-span>
                <span class="id">#{{ scores_list.length - k }}</span>
              </div>
            </transition>
          </div>
          <transition name="el-zoom-in-bottom" mode="out-in">
            <div v-if="scores_unfolded_items.has(v.time)">
              <template v-for="(f2, k2) in data_single_keys">
                <kv-span :name="k2 as string" :val="f2(v)" plain tiny></kv-span>
              </template>
            </div>
            <div v-else>
              <template v-for="(v2, k2) in data_extreme_keys">
                <kv-span v-if="v.flags[k2]" :name="v2" :val="'$' + v[k2]" plain tiny></kv-span>
              </template>
            </div>
          </transition>
          <div v-if="v.note" class="score-item-note">❤ {{ v.note }}</div>
        </li>
      </transition-group>
      <div class="overall">
        <kv-span v-for="(f, k) in data_keys" :name="k as string" :val="f()"></kv-span>
      </div>
    </div>
    <div class="note">
      <div class="title">{{ note_title }}</div>
      <div class="msg">{{ note_msg }}</div>
      <div class="score">
        <score-span v-show="note_score" :score="note_score"></score-span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { Ref } from 'vue'
  import type { GanCubeConnection, GanCubeMove } from 'gan-web-bluetooth'

  import { ref, inject, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { connectGanCube, cubeTimestampLinearFit, now } from 'gan-web-bluetooth'
  import { TwistyPlayer } from 'cubing/twisty'
  import { experimentalSolve3x3x3IgnoringCenters } from 'cubing/search'
  import {
    facelet_solved,
    prepare_time, prepare_time_half, voice_result_in_ms_threshold,
    cheating_sol_threshold,
    max_recordable_moves
  } from '../utils/conf.ts'
  import { desc_time, format_score, voice_score, format_sol } from '../utils/funcs.ts'
  import { patternToFacelets, faceletsToPattern } from '../utils/afedotovs.ts'
  import { json2str, str2json } from '../utils/json'
  import ScoreSpan from '../components/scorespan.vue'
  import KvSpan from '../components/kvspan.vue'
  import TimeSpan from '../components/timespan.vue'

  let title: Ref<string> = inject('title')!
  title.value = 'Cubing base'

  const version_updater = {
    '24.8.16.03': () => {
      localStorage.clear()
      localStorage.setItem('scores', '')
    }
  }
  const curr_version = localStorage.getItem('version')
  const latest_version = Object.keys(version_updater)[0]
  if (curr_version != latest_version) {
    let updater = version_updater[latest_version as keyof typeof version_updater]
    if (updater)
      updater()
    localStorage.setItem('version', latest_version)
    ElMessage.info(`Version updated to: ${latest_version}`)
  }

  const make_move_buf = () => '    '.split('')
  type score_item_flags = {
    best?: boolean,
    worst?: boolean,
    best_ao5?: boolean
  }
  type score_item = {
    time: number,
    score: number,
    steps: number,
    best: number,
    worst: number,
    ao5: number,
    best_ao5: number,
    note: string,
    flags: score_item_flags
  }
  const page = ref(0), scores_list = ref([] as score_item[]),
    scores_unfolded_items = ref(new Set<number>())
  const last_template = {
    score: Infinity,
    ao5: Infinity,
    best_ao5: Infinity,
    best: Infinity,
    worst: Infinity
  } as score_item
  let last: score_item = last_template
  const data_keys = ref(
    {
      'counts': () => `${scores_list.value.length}`,
      'last': () => `$${format_score(last.score)}`,
      'ao5': () => `$${format_score(last.ao5)}`,
      'best ao5': () => `$${format_score(last.best_ao5)}`,
      'best': () => `$${format_score(last.best)}`,
      'worst': () => `$${format_score(last.worst)}`
    } as {
      [k: string]: () => string
    }
  ), data_extreme_keys = ref(
    {
      'best': 'best !!',
      'best_ao5': 'best ao5 !!'
    } as {
      [k in keyof score_item & keyof score_item_flags]: string
    }
  ), data_single_keys = ref(
    {
      // SETM = Similar ETM:
      // splits R3 R4 ... into R2(s) & R(s), ex: R3 = R2 + R counting as 2 steps;
      // no counts for rotations.
      'steps': (v: score_item) => `$${v.steps} SETM`,
      'TPS': (v: score_item) => `$${(v.steps / v.score).toFixed(3)} SETPS`
    } as {
      [k: string]: (v: score_item) => string
    }
  )
  let conn: GanCubeConnection | null = null, cube_player: TwistyPlayer | null = null,
    conn_premove_buf = ''
  const conn_status = ref(false), conn_loading = ref(false), conn_synced = ref(false),
    cube_status = ref(false)
  const note_msg = ref(''), note_title = ref(''), note_score = ref('')
  type timer_clock_item = {
    id: number,
    type: string
  }
  let timer_move_buf = make_move_buf(), timer_clocks: timer_clock_item[] = []
  const earphone_mode = ref(false)
  let timer_ready_status = false, timer_status = false,
    timer_move_events: GanCubeMove[] = [],
    timer_auto_go_timestamp = 0

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
  function scores() {
    if (! localStorage.getItem('scores'))
      localStorage.setItem('scores', json2str([]))
    scores_list.value = str2json(localStorage.getItem('scores')!) as score_item[]
  }
  watch(scores_list, () => {
    localStorage.setItem('scores', json2str(scores_list.value))
    last = scores_list.value[scores_list.value.length - 1] || last_template
    scores_unfolded_items.value.clear()
  }, { deep: true })
  function make_note(msg = '', title = '', score = '') {
    note_msg.value = msg
    note_title.value = title
    note_score.value = score
  }
  function make_voice(msg: string) {
    let ssu = new SpeechSynthesisUtterance()
    ssu.text = msg
    ssu.lang = 'en'
    window.speechSynthesis.speak(ssu)
  }
  function switch_page() {
    page.value = 1 - page.value
  }
  async function connect() {
    conn_loading.value = true
    try {
      conn = await connectGanCube()
    }
    catch {
      ElMessage.error('Failed!')
      throw new Error('Connection failed.')
    }
    finally {
      conn_loading.value = false
    }
    conn_status.value = true
    ElMessage.success('Connected!')
    conn.events$.subscribe(async event => {
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
          if (earphone_mode.value) {
            if (timer_ready_status)
              timer_go()
            if (timer_status) {
              if (timer_move_events.length >= max_recordable_moves)
                timer_move_events.splice(1, 1)
              timer_move_events.push(event)
            }
            await push_move_buf(event.move)
          }
        }
      }
      else if (event.type == 'DISCONNECT') {
        conn_status.value = false
        ElMessage.info('Disconnected!')
      }
    })
    await conn.sendCubeCommand({ type: 'REQUEST_FACELETS' })
  }
  function everything_off(handle_earphone_mode = false) {
    if (handle_earphone_mode)
      earphone_mode.value = false
    conn_premove_buf = ''
    timer_move_buf = make_move_buf()
    timer_clocks_clear()
    make_note()
  }
  function disconnect() {
    if (! conn)
      return 0
    conn.disconnect()
    conn = null
    conn_status.value = conn_synced.value = false
    everything_off(true)
    page.value = 0
  }
  async function reset_cube() {
    await conn!.sendCubeCommand({ type: 'REQUEST_RESET' })
    ElMessage.info('Cube reset!')
  }
  function switch_earphone_mode() {
    if (timer_ready_status || timer_status)
      return 0
    earphone_mode.value = ! earphone_mode.value
    everything_off()
    ElMessage.info(earphone_mode.value ? 'Earphone mode on!' : 'Earphone mode off!')
  }
  async function push_move_buf(move: string) {
    timer_move_buf.splice(0, 1)
    timer_move_buf.push(move)
    if (earphone_mode.value && ! timer_status) {
      if (timer_move_buf.every(val => val == timer_move_buf[0])) {
        let kpattern = await cube_player!.experimentalModel.currentPattern.get()
        let solution = (await experimentalSolve3x3x3IgnoringCenters(kpattern)).toString()
        let facelets = patternToFacelets(kpattern)
        if (facelets == facelet_solved || solution.split(' ').length <= cheating_sol_threshold)
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
        make_note(`${format_score(counter, false)}`, 'Inspection')
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
    make_voice('no cheating. you little stupid.')
  }
  function timer_go() {
    timer_ready_status = false
    timer_status = true
    let counter = 0
    timer_clocks_clear()
    timer_clocks_interval(() => {
      counter ++
      make_note(`${format_score(counter, false)}`, 'Cubing')
      if (counter % 60 == 0)
        make_voice(voice_score(counter))
    }, 1000)
    make_note('Go!')
    make_voice('go.')
  }
  async function timer_stop() {
    timer_clocks_clear()
    timer_move_events = cubeTimestampLinearFit(timer_move_events)
    let time = timer_move_events[timer_move_events.length - 1].cubeTimestamp
      - timer_move_events[0].cubeTimestamp
    let wasted_time = timer_move_events[0].localTimestamp! - timer_auto_go_timestamp
    if (timer_auto_go_timestamp && wasted_time > 0)
      time += wasted_time
    time /= 1000
    make_note('', '', format_score(time))
    let len = scores_list.value.length, last = scores_list.value[len - 1] || {
      best: Infinity,
      worst: - Infinity,
      best_ao5: Infinity
    }
    const ao = (n: number) => {
      let ao_sum = 0, ao_best = Infinity, ao_worst = - Infinity
      if (len + 1 >= n) {
        for (let i = len - (n - 1); i < len + 1; i ++) {
          let v = scores_list.value[i] || {
            score: time
          }
          ao_sum += v.score
          if (v.score < ao_best)
          ao_best = v.score
          if (v.score > ao_worst)
          ao_worst = v.score
        }
        return + ((ao_sum - ao_best - ao_worst) / (n - 2)).toFixed(3)
      }
      return Infinity
    }
    let ao5 = ao(5)
    let formated_sol = format_sol(timer_move_events)
    let body = {
      time: Date.now(),
      score: time,
      steps: formated_sol.split(' ').length,
      best: Math.min(time, last.best),
      worst: Math.max(time, last.worst),
      ao5: ao5,
      best_ao5: Math.min(ao5, last.best_ao5),
      note: '',
      flags: {}
    } as score_item
    // notice that `len` and `last`'d been behind the time
    make_voice(`done at. ${voice_score(time, time <= voice_result_in_ms_threshold ? 1 : 0)}`)
    let voiced = false
    if (time <= last.best) {
      body.flags.best = true
      ElMessage.success('BEST single ever!')
      make_voice(`congratulations. best single ever.`)
      voiced = true
    }
    if (time >= last.worst) {
      body.flags.worst = true
      if (! voiced) {
        ElMessage.error('WORST single ever!')
        make_voice(`stupid. worst single ever.`)
        voiced = true
      }
    }
    if (len + 1 >= 5 && ao5 <= last.best_ao5) {
      body.flags.best_ao5 = true
      ElMessage.success('BEST ao5 ever!')
      make_voice(`${voiced ? 'and ' : 'perfect. '}best AO5 ever.`)
    }
    scores_list.value.push(body)
    await nextTick()
    scores_unfolded_items.value.clear()
    scores_unfolded_items.value.add(body.time)
    timer_move_events = []
    timer_ready_status = timer_status = false
    timer_move_buf = make_move_buf()
    timer_auto_go_timestamp = 0
  }
  function click_score_item(time_id: number) {
    if (scores_unfolded_items.value.has(time_id))
      scores_unfolded_items.value.delete(time_id)
    else
      scores_unfolded_items.value.add(time_id)
  }
  function score_item_note(time_id: number) {
    let v = scores_list.value.find(v => v.time == time_id)!
    ElMessageBox.prompt(
      'Write something to like it! Or leave a blank to cancel the like.',
      'Like',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputValue: v.note
      }
    ).then(({ value }) => {
      v.note = value
      if (value)
        ElMessage.success('Liked!')
      else
        ElMessage.info('Canceled like!')
    })
  }
  enum extreme_orient { neg, pos }
  enum extreme_mode { single, ao }
  function score_item_del(time_id: number) {
    const doit = () => {
      let k = scores_list.value.findIndex(v => v.time == time_id)
      let v = scores_list.value[k]

      const handle_ao = (
          n: number,
          write_fn: (item: score_item, val: number) => void) => {
        if (scores_list.value.length < n)
          return
        let buf: number[] = [], sum = 0, min = Infinity, max = - Infinity
        for (let i = Math.max(k - (n - 1), 0);
            i <= Math.min(k + (n - 1), scores_list.value.length - 1);
            i ++) {
          let curr = scores_list.value[i]
          if (i != k) {
            buf.push(curr.score)
            if (buf.length > n) {
              sum += - buf[0] + curr.score
              buf.splice(0, 1)
            }
            else {
              sum += curr.score
            }

            if (buf.length >= n) {
              max = Math.max(...buf)
              min = Math.min(...buf)
              let ao = + ((sum - min - max) / (n - 2)).toFixed(3)
              write_fn(scores_list.value[i], ao)
            }
            else if ((i > k ? i - 1 : i) < n - 1) {
              write_fn(scores_list.value[i], Infinity)
            }
          }
        }
      }
      const handle_extremum = (
          orient: extreme_orient,
          mode: extreme_mode,
          read_val_fn: (item: score_item) => number,
          read_extreme_fn: (item: score_item) => number,
          read_extreme_flag_fn: (item: score_item) => boolean | undefined,
          write_extreme_flag_fn: (item: score_item, val: boolean) => void,
          write_extreme_fn: (item: score_item, val: number) => void) => {
        if (scores_list.value.length < 2)
          return
        if (mode == extreme_mode.ao || read_extreme_flag_fn(v)) {
          const compare = orient == extreme_orient.pos
            ? (a: number, b: number) => isFinite(a) && a >= b
            : (a: number, b: number) => isFinite(a) && a <= b
          let original = read_val_fn(v), original_holder, holder_val
          if (k - 1 >= 0) {
            original_holder = scores_list.value[k - 1]
            holder_val = read_extreme_fn(original_holder)
          }
          else {
            original_holder = scores_list.value[1]
            holder_val = read_val_fn(original_holder)
            if (isFinite(holder_val))
              write_extreme_flag_fn(original_holder, true)
          }
          for (let i = k + 1; i <= scores_list.value.length - 1; i ++) {
            let curr = scores_list.value[i]
            let curr_val = read_val_fn(curr)
            if (isFinite(original) && compare(curr_val, original))
              break
            if (compare(curr_val, holder_val)) {
              holder_val = curr_val
              write_extreme_flag_fn(curr, true)
            }
            else {
              write_extreme_flag_fn(curr, false)
            }
            write_extreme_fn(curr, holder_val)
          }
        }
      }

      handle_ao(5, (item, val) => item.ao5 = val)
      handle_extremum(
        extreme_orient.neg,
        extreme_mode.single,
        item => item.score,
        item => item.best,
        item => item.flags.best,
        (item, val) => item.flags.best = val,
        (item, val) => item.best = val
      )
      handle_extremum(
        extreme_orient.pos,
        extreme_mode.single,
        item => item.score,
        item => item.worst,
        item => item.flags.worst,
        (item, val) => item.flags.worst = val,
        (item, val) => item.worst = val
      )
      handle_extremum(
        extreme_orient.neg,
        extreme_mode.ao,
        item => item.ao5,
        item => item.best_ao5,
        item => item.flags.best_ao5,
        (item, val) => item.flags.best_ao5 = val,
        (item, val) => item.best_ao5 = val
      )

      scores_list.value.splice(k, 1)
    }

    ElMessageBox.prompt(
      `Please input 🐏's birthday in the form of "2008/04/24" to confirm the deletion.`,
      'Warning! You are trying to DELETE something.',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel'
      }
    ).then(({ value }) => {
      if (value == '2008/07/23') {
        doit()
        ElMessage.success('Deleted!')
      }
      else {
        ElMessage.error('NOT deleted.')
      }
    })
  }

  onMounted(() => {
    cube()
    scores()
    cube_player!.experimentalModel.currentPattern.addFreshListener(async kpattern => {
      let facelets = patternToFacelets(kpattern)
      cube_status.value = facelets == facelet_solved
      if (cube_status.value && timer_status)
        await timer_stop()
    })
  })
  onBeforeUnmount(() => {
    disconnect()
    cube_player = null
  })
</script>
