import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router'
import { createPinia } from 'pinia'
import { VueReCaptcha } from 'vue-recaptcha-v3'

import 'vuetify/styles' // Vuetify 的預設樣式
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

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