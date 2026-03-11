import { createApp } from 'vue'
import App from './App.vue'
import { Toast, Dialog } from 'vant'
import 'vant/lib/index.css'

const app = createApp(App)
app.use(Toast)
app.use(Dialog)
app.mount('#app')
