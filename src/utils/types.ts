export type message_item_type = 'common' | 'image' | 'video' | 'file' | 'function' | '__time'
export type message_item = {
  time: number,
  edited_time: number,
  user_id: number,
  type: message_item_type,
  msg: string,
  submsg: string,
  folded: 0 | 1
}

export const message_func_table: {
  [k: string]: { desc: string, msg: string }
} = {
  notify: { desc: 'Notify you by SMS.', msg: 'notified.' },
}
