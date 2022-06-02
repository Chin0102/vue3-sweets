const converters = {
  Number: {
    toModel(str) {
      if (str === '') return str
      return parseFloat(str)
    },
    toQueryString(num) {
      if (num !== 0 && num !== '' && !num) return NaN
      return num.toString()
    }
  },
  Boolean: {
    toModel(str) {
      return str !== '0' && str !== 'false'
    },
    toQueryString(bool) {
      if (!bool) return 'false'
      return bool.toString()
    }
  },
  Array: {
    toModel(str) {
      return str === '' ? [] : str.split(',')
    },
    toQueryString(arr) {
      return arr ? arr.join(',') : ''
    }
  },
  NumberArray: {
    toModel(str) {
      return str === '' ? [] : str.split(',').map(s => parseFloat(s))
    },
    toQueryString(arr) {
      return arr ? arr.join(',') : ''
    }
  }
}

export default {
  proxy: new Proxy({}, {
    get: (_, name) => converters[name]
  }),
  add(type, toModel, toQueryString) {
    converters[type] = {toModel, toQueryString}
  }
}