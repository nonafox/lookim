import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async'
import { apis, login_status_check_interval } from './conf'
import { auth } from './auth'

export class binStorage {
  private static async data(json = false) {
    const body = new FormData()
    body.append('user', await auth.user())
    body.append('type', 'from')
    if (json)
      body.append('json', '1')
    const res = await (await fetch(apis.storage_sync, {
      method: 'POST',
      body
    })).json() as {
      status: boolean,
      data: {
        json: {
          [_: string]: string
        } | null,
        version: number | null
      }
    }
    if (! res.status)
      await auth.logout()
    return res
  }
  private static async sync_from() {
    const { json, version } = (await this.data(true)).data
    const keys_to_add = new Set<string>(Object.keys(json!)),
      keys_to_del = new Set<string>()
    for (let i = 0, k: string; i < localStorage.length; i ++) {
      k = localStorage.key(i)!
      if (k.startsWith('__'))
        continue
      if (k in json!)
        localStorage.setItem(k, json![k])
      else
        keys_to_del.add(k)
      keys_to_add.delete(k)
    }
    for (let k of keys_to_add)
      localStorage.setItem(k, json![k])
    for (let k of keys_to_del)
      localStorage.removeItem(k)
    return version!
  }
  private static async sync_to(k: string | null = null) {
    const new_version = new Date().valueOf()
    if (! k) {
      const json: {
        [_: string]: string
      } = {}
      for (let i = 0, k: string; i < localStorage.length; i ++) {
        k = localStorage.key(i)!
        if (k.startsWith('__'))
          continue
        json[k] = localStorage.getItem(k)!
      }
      const body = new FormData()
      body.append('user', await auth.user())
      body.append('type', 'to')
      body.append('json', JSON.stringify(json))
      body.append('version', '' + new_version)
      await fetch(apis.storage_sync, {
        method: 'POST',
        body
      })
    }
    else {
      const body = new FormData()
      body.append('user', await auth.user())
      body.append('type', 'to_single')
      body.append('key', k)
      body.append('val', localStorage.getItem(k)!)
      body.append('version', '' + new_version)
      await fetch(apis.storage_sync, {
        method: 'POST',
        body
      })
    }
    return new_version
  }
  private static async sync(force_push_k: string | null = null) {
    const v1 = Number.parseInt(localStorage.getItem('__version') || '0'),
      v2 = (await this.data()).data.version
    if (typeof v2 != 'number') {
      await auth.logout()
      return
    }
    let push = true
    if (! force_push_k) {
      if (v1 < v2)
        push = false
      else if (v1 == v2)
        return
    }
    let version: number = 0
    try {
      if (push)
        version = await this.sync_to(force_push_k)
      else
        version = await this.sync_from()
    }
    catch {
      const new_version = new Date().valueOf()
      if (push)
        version = new_version
    }
    localStorage.setItem('__version', '' + version)
  }
  public static async getItem(key: string) {
    if (key.startsWith('__'))
      return null
    return localStorage.getItem(key)
  }
  public static async setItem(key: string, value: string) {
    if (key.startsWith('__'))
      return
    if (value == localStorage.getItem(key))
      return
    localStorage.setItem(key, value)
    await this.sync(key)
  }
  public static async init() {
    await this.sync()
    const interval_id = setIntervalAsync(async () => {
      if (typeof (await this.data()).data.version != 'number') {
        await auth.logout()
        await clearIntervalAsync(interval_id)
      }
    }, login_status_check_interval)
  }
}
