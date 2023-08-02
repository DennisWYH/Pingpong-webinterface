import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeComponent from './views/HomeComponent.vue'
import AboutComponent from './views/AboutComponent.vue'
import UploadImage from './views/UploadImage.vue'

const routes = [
  { path: '/home', component: HomeComponent },
  { path: '/about', component: AboutComponent },
  { path: '/upload', component: UploadImage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
