import {isString} from './utils/types'
import forceInterval from './utils/force-interval'
import {reactive, watch} from 'vue'

let support = false

try {
  window.localStorage.setItem('___test', 'OK')
  const result = window.localStorage.getItem('___test')
  window.localStorage.removeItem('___test')
  support = (result === 'OK')
} catch (err) {
  support = false
}

const forceIntervalSave = json => {
  if (support) return forceInterval(() => window.localStorage.setItem(json.name, JSON.stringify(json.value)))
  return _ => _
}

class LocalJson {
  constructor(name, getDefValue) {
    this.getDefValue = getDefValue || (() => ({}))
    this.name = name
    this.save = forceIntervalSave(this)
    this.reload()
  }

  remove() {
    if (support) window.localStorage.removeItem(this.name)
    this.unwatch()
  }

  reload() {
    let obj, str
    if (support) str = window.localStorage.getItem(this.name)
    if (!!str && isString(str)) {
      try {
        obj = JSON.parse(str)
      } catch (e) {
      }
    }
    if (!obj) obj = this.getDefValue(support)
    this.value = reactive(obj)
    this.unwatch = watch(this.value, this.save)
  }
}

const cache = {}

window.addEventListener('storage', e => {
  let name = e.key
  let json = cache[name]
  if (json) json.reload()
})

export default {
  get(name, getDefValue = null) {
    let json = cache[name]
    if (!json) json = cache[name] = new LocalJson(name, getDefValue)
    return json.value
  },
  remove(name) {
    let json = cache[name]
    if (json) {
      json.remove()
      delete cache[name]
    }
  }
}