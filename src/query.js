import {isArray, isBoolean, isNumber, isString} from './utils/types'
import trim from './utils/trim'
import converter from './converter'
import {getCurrentInstance, inject, reactive, onMounted, isReactive} from 'vue'
import {matchedRouteKey, viewDepthKey, useRouter, useRoute, onBeforeRouteUpdate, onBeforeRouteLeave} from 'vue-router'

class Query {
  constructor(options) {
    this.options = options
    this._default = {}
    this._defaultQS = {}
    this.value = isReactive(options.query) ? options.query : reactive(options.query)
    let conv = Object.assign({}, options.converters)
    Object.entries(this.value).forEach(([key, value]) => {
      if (!isString(value) && !conv.hasOwnProperty(key)) {
        if (isNumber(value)) conv[key] = converter.proxy.Number
        else if (isBoolean(value)) conv[key] = converter.proxy.Boolean
        else if (isArray(value)) conv[key] = converter.proxy.Array
      }
      if (isNumber(value) && isNaN(value)) value = this.value[key] = ''
      this._default[key] = value
      this._defaultQS[key] = conv.hasOwnProperty(key) ? conv[key].toQueryString(value) : value
    })
    this.converters = conv
    this.router = useRouter()
    this.route = useRoute()
  }

  handleRouteChange(routeQuery) {
    let query = {}, conv = this.converters
    Object.entries(routeQuery).forEach(([key, value]) => {
      value = trim(value)
      if (conv.hasOwnProperty(key)) value = conv[key].toModel(value)
      query[key] = value
    })
    Object.assign(this.value, this._default, query)
    if (this.options.onRouteChanged) this.options.onRouteChanged(this.value, this.route.params)
  }

  locateOrigin() {
    this.locateByQS()
  }

  locate() {
    this.locateByModel(this.value)
  }

  locateByModel(model) {
    let query = {}, conv = this.converters
    Object.entries(model).forEach(([key, value]) => {
      if (conv.hasOwnProperty(key)) value = conv[key].toQueryString(value)
      if (isString(value) && value !== '') value = trim(value)
      if (this._defaultQS[key] !== value) query[key] = value
    })
    this.locateByQS(query)
  }

  locateByQS(query) {
    //TODO query未改变时不会触发 handleRouteChange
    this.router.push({path: this.route.path, query})
      .then(() => '')
      .catch(e => this.handleRouteChange(query))
  }
}

let query

export default {
  init(queryObj, onRouteChanged, converters) {
    if (!getCurrentInstance() || !inject(matchedRouteKey, {}).value) return
    const deep = inject(viewDepthKey)
    if (query && query.deep > deep) return
    query = new Query({query: queryObj, onRouteChanged, converters})
    query.deep = deep
    onMounted(() => query.handleRouteChange(query.route.query))
    onBeforeRouteUpdate((to) => query.handleRouteChange(to.query))
    onBeforeRouteLeave(() => query = null)
    return query.value
  },
  value() {
    if (query) return query.value
  },
  locate() {
    if (query) query.locate()
  },
  locateOrigin() {
    if (query) query.locateOrigin()
  },
  locateByModel(model) {
    if (query) query.locateByModel(model)
  },
  locateByQS(qs) {
    if (query) query.locateByQS(qs)
  }
}
