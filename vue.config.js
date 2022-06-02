const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
  productionSourceMap: false,
  configureWebpack(config) {
    config.output.libraryExport = 'default'
    config.externals = {
      'axios': 'axios',
      'qs': 'qs',
      'vue': 'vue',
      'vue-router': 'vue-router'
    }
  }
})
