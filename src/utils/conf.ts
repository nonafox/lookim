// general
export const file_max_size = 50 * 1024 * 1024
export const file_max_size_image = 3 * 1024 * 1024
export const drag_transform_length = 60 // px
export const drag_transform_scale = 1.2
const api_prefix = 'https://api.lookim.cn/'
export const apis = {
  login: `${api_prefix}login`,
  storage_sync: `${api_prefix}storage_sync`,
  chat: `${api_prefix}chat`,
  chat_send: `${api_prefix}chat_send`,
  chat_send_func: `${api_prefix}chat_send_func`,
  chat_fold: `${api_prefix}chat_fold`,
  upload: `${api_prefix}chat_upload`,
}
export const login_status_check_interval = 1000
export const login_refresh_interval = 2000

// cubing base
export const facelet_solved = 'UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB'
export const prepare_time = 15, prepare_time_half = 8, voice_result_in_ms_threshold = 60 // s
export const cheating_sol_threshold = 14
export const max_recordable_moves = 500
export const sol_mse_interval_time_threshold = 320 // ms

// chating world
export const messages_per_page = 25
export const messages_refresh_interval = 500 // ms
export const messages_load_more_interval = 500 // ms
