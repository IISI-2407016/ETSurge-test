import { createRouter, createWebHistory } from 'vue-router'
import login from '../views/login.vue'
import main from '../views/main.vue'

const routes = [
    {
        path: '/login',
        name: 'login', // 預設重定導向登入頁
        component: login
    },
    {
        path: '/',
        name: 'main',
        component: main,
        meta: { requiresAuth: true } // 需要登入權限
    }
]

const router = createRouter({
    history: createWebHistory('/app'),
    routes,
})

export default router
