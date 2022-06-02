import service from './service'
import query from './query'
import converter from './converter'
import option from './option'
import localJson from './local-json'
import {isArray, isObject} from './utils/types'

const sweets = {}
sweets.query = query
sweets.converter = converter.proxy
sweets.option = option.proxy
sweets.service = service
sweets.localJson = localJson

sweets.addConverter = converter.add
sweets.addOption = option.add
sweets.addOptionAsync = option.addAsync

sweets.install = function (Vue, config) {

  if (config.converter) Object.entries(config.converter)
    .forEach(([name, conv]) => converter.add(name, conv.toModel, conv.toQueryString))

  if (config.service) Object.entries(config.service)
    .forEach(([name, serv]) => {
      if (!serv.name) serv.name = name
      service.add(serv)
    })

  if (config.option) Object.entries(config.option)
    .forEach(([name, opt]) => {
      if (isArray(opt)) option.add(name, opt)
      else if (isObject(opt)) {
        let {api, keys, result} = opt
        let prePromise = result ? () => service.invoke(api).then(res => res[result]) : service.api(api)
        option.addAsync(name, prePromise, keys)
      }
    })
}

export default sweets
