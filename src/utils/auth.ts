import { apis, login_refresh_interval } from './conf'
import { ElMessage, ElMessageBox } from 'element-plus'

export class auth {
  public static async user() {
    try {
      let __user = localStorage.getItem('__user')
      if (! __user) {
        const { value: user } = await ElMessageBox.prompt('Please input your username.', 'Log in', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          inputErrorMessage: 'Invalid username!',
          inputType: 'password',
          inputValue: ''
        })
        const { value: pass } = await ElMessageBox.prompt('Please input your password.', 'Log in', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          inputErrorMessage: 'Invalid password!',
          inputType: 'password',
          inputValue: ''
        })
        const body = new FormData()
        body.append('user', user)
        body.append('pass', pass)
        const json = await (await fetch(apis.login, {
          method: 'POST',
          body
        })).json() as {
          status: boolean,
          data: {
            real_name: string,
            user_id: number
          }
        }
        if (json.status) {
          __user = json.data.real_name
          localStorage.setItem('__user', __user)
          localStorage.setItem('__user_id', '' + json.data.user_id)
          ElMessage.success('Logged in successfully.')
        }
        else {
          throw new Error('Login failed.')
        }
      }
      return __user
    }
    catch {
      await this.logout('Login failed.')
      throw new Error('Login failed.')
    }
  }
  public static assertUser() {
    const user = localStorage.getItem('__user')
    if (user)
      return user
    else
      throw new Error('Login status unusual.')
  }
  public static async logout(msg = '') {
    await ElMessageBox.confirm(
      `${msg}${msg ? ' ' : ''}Ready to refresh.`,
      'Warning',
      {
        showClose: false,
        showConfirmButton: false,
        showCancelButton: false,
        closeOnClickModal: false,
        closeOnPressEscape: false
      }
    )
    setTimeout(() => {
      localStorage.clear()
      location.reload()
    }, login_refresh_interval)
  }
}
