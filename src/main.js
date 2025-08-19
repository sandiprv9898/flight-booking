import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Initialize auth store after pinia is set up
import { useAuthStore } from './store/auth'
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')