import './style.css'
import App from './App.vue'

import router from './router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueReCaptcha } from 'vue-recaptcha-v3'

import 'vuetify/styles' // Vuetify 的預設樣式
import '@mdi/font/css/materialdesignicons.css' // Material Design Icons
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 顯示版本資訊
console.log(`%c ETSurge Frontend v${__APP_VERSION__} `, 'background: #4CAF50; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;');

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

app.config.globalProperties.$version = __APP_VERSION__

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueReCaptcha, {
  siteKey: '6LeFx2QfAAAAAGM0Nj7I8HAstPkoOzYrZ9ndfeQI',
  loaderOptions: {
    autoHideBadge: true,
  },
})

app.mount('#app')