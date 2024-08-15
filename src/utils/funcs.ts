import { GanCubeMove } from 'gan-web-bluetooth'
import { sol_mse_interval_time_threshold } from './conf'

export const time_sp = ' '
function desc_date(time: number, show_today = false) {
  let date = new Date(time)
  let y, m, d
  y = date.getFullYear()
  m = date.getMonth() + 1
  d = date.getDate()
  let cdate = new Date()
  let cy, cm, cd
  cy = cdate.getFullYear()
  cm = cdate.getMonth() + 1
  cd = cdate.getDate()
  if (y == cy) {
    if (m == cm) {
      if (d == cd)
        return show_today ? `today${time_sp}` : ''
      else if (d == cd - 1)
        return `yday${time_sp}`
      else if (d == cd + 1)
        return `tmrw${time_sp}`
    }
    return `${m}/${d}${time_sp}`
  }
  return `${y}/${m}/${d}${time_sp}`
}
export function desc_time(time: number, has_s = false) {
  let date = new Date(time)
  let dateText, h, i, s
  dateText = desc_date(time)
  h = `${date.getHours()}`
  i = `${date.getMinutes()}`.padStart(2, '0')
  s = `${date.getSeconds()}`.padStart(2, '0')
  if (has_s)
    return `${dateText}${h}:${i}:${s}`
  else
    return `${dateText}${h}:${i}`
}
export function floor_dig(num: number, dig: number) {
  let int = Math.floor(num)
  if (dig <= 0)
    return `${int}`
  let dec = Math.floor((num - int) * 10 ** dig)
  return `${int}.${`${dec}`.padStart(dig, '0')}`
}
function format_score_sec(sec: number, dig = 3, add_zero = true) {
  let parts = `${floor_dig(sec, dig)}`.split('.')
  if (add_zero)
    parts[0] = parts[0].padStart(2, '0')
  return parts.join('.')
}
export function format_score(time: number, ms = true) {
  if (! Number.isFinite(time))
    return '-'
  if (time >= 60)
    return `${Math.floor(time / 60)}:${format_score_sec(time % 60, ms ? 3 : 0)}`
  return `${format_score_sec(time, ms ? 3 : 0, false)}`
}
export function voice_score(time: number, dig = 0) {
  if (! Number.isFinite(time))
    return ''
  let m = Math.floor(time / 60)
  let s = time % 60
  if (m > 0)
    return `${m} minute${time >= 60 * 2 ? 's' : ''}`
      + ` ${s > 0 ? format_score_sec(s, dig).replace(/^0/g, 'o') : ''}.`
  return `${format_score_sec(s, dig)}.`
}
type any_sol = string | string[] | GanCubeMove[]
function sol_is_rotation(sol: string) {
  return 'xyz'.includes(sol[0])
}
function sol_is_mse(sol: string) {
  return 'MSE'.includes(sol[0])
}
// making me fking crazy here
// any attempt to acquire about the theory from me would make me even madder
class notation_mat {
  private mat
  private mat_mse
  constructor() {
    this.mat = [
      ['U', 'D'], ['R', 'L'], ['F', 'B']
    ]
    this.mat_mse = [
      ["E", "E'"], ["M", "M'"], ["S", "S'"]
    ]
  }
  // dir: 0 = scroll 'right', 1 = scroll 'left'
  private shift(a: number, b: number, dir: number) {
    [this.mat[a][0], this.mat[b][0], this.mat[a][1], this.mat[b][1]]
      = dir
        ? [this.mat[b][0], this.mat[a][1], this.mat[b][1], this.mat[a][0]]
        : [this.mat[b][1], this.mat[a][0], this.mat[b][0], this.mat[a][1]]
  }
  private shift_mse(a: number, b: number, dir: number) {
    [this.mat_mse[a][0], this.mat_mse[b][0], this.mat_mse[a][1], this.mat_mse[b][1]]
      = dir
        ? [this.mat_mse[b][0], this.mat_mse[a][1], this.mat_mse[b][1], this.mat_mse[a][0]]
        : [this.mat_mse[b][1], this.mat_mse[a][0], this.mat_mse[b][0], this.mat_mse[a][1]]
  }
  // though something is odd here, it is hopefully correct
  private rotation_shift_params: {
    [_: string]: [number, number, number]
  } = {
    "x": [0, 2, 1],
    "x'": [0, 2, 0],
    "y": [1, 2, 0],
    "y'": [1, 2, 1],
    "z": [0, 1, 0],
    "z'": [0, 1, 1]
  }
  private rotation_shift_params_mse: {
    [_: string]: [number, number, number]
  } = {
    "x": [0, 2, 0],
    "x'": [0, 2, 1],
    "y": [1, 2, 1],
    "y'": [1, 2, 0],
    "z": [0, 1, 0],
    "z'": [0, 1, 1]
  }
  public rotate(rot: string) {
    this.shift(...this.rotation_shift_params[rot])
    this.shift_mse(...this.rotation_shift_params_mse[rot])
  }
  private get_indexes: {
    [_: string]: [number, number]
  } = {
    'U': [0, 0],
    'D': [0, 1],
    'R': [1, 0],
    'L': [1, 1],
    'F': [2, 0],
    'B': [2, 1]
  }
  private get_indexes_mse: {
    [_: string]: [number, number]
  } = {
    "E": [0, 0],
    "E'": [0, 1],
    "M": [1, 0],
    "M'": [1, 1],
    "S": [2, 0],
    "S'": [2, 1]
  }
  public get(nota: string) {
    if (sol_is_mse(nota)) {
      let indexes = this.get_indexes_mse[nota]
      return this.mat_mse[indexes[0]][indexes[1]]
    }
    else {
      let indexes = this.get_indexes[nota[0]]
      return this.mat[indexes[0]][indexes[1]] + (nota[1] || '')
    }
  }
}
function shallowly_format_sol(sol_arr: any_sol, mark_intervals = false) {
  let sol = ''
  if (typeof sol_arr == 'string') {
    sol = sol_arr
  }
  else if (typeof sol_arr[0] == 'string') {
    sol_arr = sol_arr as string[]
    sol = sol_arr.join(' ')
  }
  else {
    let last: GanCubeMove | null = null
    sol_arr = sol_arr as GanCubeMove[]
    for (let v of sol_arr) {
      if (mark_intervals && last
          && v.cubeTimestamp - last.cubeTimestamp <= sol_mse_interval_time_threshold)
        sol += '_'
      else
        sol += ' '
      sol += `${v.move}`
      last = v
    }
  }
  return sol.trim()
}
function sol_kill_rotations(sol_arr: any_sol) {
  let sol = shallowly_format_sol(sol_arr).split(' ')
  let res_sol = [] as string[]
  let mat = new notation_mat()
  for (let v of sol) {
    if (sol_is_rotation(v))
      mat.rotate(v)
    else
      res_sol.push(mat.get(v))
  }
  return res_sol.join(' ')
}
const sol_mse_trans_table = [
  [/(R_L'|L'_R)(?!')/g, "M"],
  [/(R'_L|L_R')(?!')/g, "M'"],
  [/(F'_B|B_F')(?!')/g, "S"],
  [/(F_B'|B'_F)(?!')/g, "S'"],
  [/(U_D'|D'_U)(?!')/g, "E"],
  [/(U'_D|D_U')(?!')/g, "E'"]
]
const sol_mse_adaptation_table = {
  "M": "x",
  "M'": "x'",
  "S": "z'",
  "S'": "z",
  "E": "y",
  "E'": "y'"
}
export function format_sol(sol_arr: any_sol) {
  let sol = shallowly_format_sol(sol_arr, true)
  console.log('original: ', sol)
  for (let [ reg, v1 ] of sol_mse_trans_table) {
    let v2 = sol_mse_adaptation_table[v1 as (keyof typeof sol_mse_adaptation_table)]
    sol = sol.replace(reg, `${v1} ${v2}`)
  }
  sol = sol.replace(/_/g, ' ')
  sol = sol_kill_rotations(sol)
  sol = sol.replace(/([UFRDBLMSE]'{0,1}) \1/g, '$12')
  console.log('formated: ', sol)
  return sol
}
