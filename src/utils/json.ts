// JSON conversion functions that fit Infinity numbers

export function json2str(json: any) {
  return JSON.stringify(json, (_, val) => {
    if (typeof val == 'string') {
      if (val[0] == '\0')
        return `\0${val}`
    }
    else if (val === Infinity)
      return `\0Infinity`
    else if (val === - Infinity)
      return `\0-Infinity`
    return val
  }, '')
}

export function str2json(str: string) {
  str = str.replace(/:"\\u0000Infinity"/g, ':Infinity')
    .replace(/:"\\u0000-Infinity"/g, ':-Infinity')
    .replace(/:"\\u0000\\u0000/g, ':"\0')
  return eval(`(${str})`)
}
