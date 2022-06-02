# vue3-sweets

vue3 plugin

## usage

```js
Vue.use(sweets)
```

### demo

#### main.js

```js
import {createApp} from 'vue'
import app from './app'
import router from './router'
import sweets from 'vue-sweets'

// import sweetsConfig from './sweets'

const sweetsConfig = {
  service: {
    user: {
      // name: 'user',
      config: {
        baseURL: 'http://localhost:3000/user'
      },
      init(axios) {
        axios.interceptors.request.use(config => {
          // ...
          return config
        })
        axios.interceptors.response.use(res => {
          //...
          return res
        })
      },
      api: {
        all(query) {
          return {url: '/list', query}
        },
        save(user) {
          return {url: '/save', data: user}
        }
      }
    }
  },
  // converter: {},
  option: {
    // sweets.option.test.value = this array
    // sweets.option.test.format('1') === 'BBB'
    // sweets.option.test.get('2') === {label: 'CCC', value: '2'}
    test: [ //static
      {label: 'AAA', value: '0'},
      {label: 'BBB', value: '1'},
      {label: 'CCC', value: '2'}
    ],
    user: { //async
      api: 'user/all', // service.user.api.all
      result: 'result',// response.data.result
      keys: {label: 'name', value: 'id'}
    }
  }
}

createApp(app)
  .use(router)
  .use(sweets, sweetsConfig)
  .mount('#app')
```

#### *.vue

```vue

<template>
  <div>
    <el-form label-width="80px" style="margin-bottom:10px;">
      <el-form-item label="keyword">
        <el-select v-model="query.keyword">
          <el-option v-for="opt in sweets.option.user.value" :label="opt.name" :value="opt.id" :key="opt.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="keyword2">
        <el-select v-model="query.keyword2">
          <el-option v-for="opt in sweets.option.test.value" :label="opt.label" :value="opt.value" :key="opt.value"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-button @click="sweets.query.locateOrigin()">reset</el-button>
    <el-button @click="sweets.query.locate()" type="primary">query</el-button>
    <div>
      <el-table :data="users.list" stripe>
        <el-table-column prop="id" label="ID" width="60"/>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import sweets from 'vue3-sweets'
import {reactive} from 'vue'

const users = reactive({
  list: []
})

//use local storage
//const query = sweets.localJson.get('QueryTest', () => ({keyword: 1, keyword2: '2'}))
//or
//const query = reactive({keyword: 1, keyword2: '2'})
// sweets.query.init(query,
//     (query) => {
//       sweets.service.invoke('user/all', query).then(res => users.list = res.result)
//     })
//or
const query = sweets.query.init(
    {keyword: 1, keyword2: '2'},
    (query) => {
      sweets.service.invoke('user/all', query).then(res => users.list = res.result)
    })

</script>

```