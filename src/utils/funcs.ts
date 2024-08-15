import { GanCubeMove } from 'gan-web-bluetooth'

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
export function format_sol(sol_arr: GanCubeMove[]) {
  let sol = ''
  for (let v of sol_arr)
    sol += `${v.move} `
  sol = sol
    .replace(/([UFRDBL]'{0,1}) \1/g, '$12')
    .trimEnd()
}
