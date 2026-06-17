import { createRouter, createWebHistory } from 'vue-router'
import { use_user_store } from '@/stores/user.js'
import login from '../views/login.vue'
import resetPassword from '../views/resetPassword.vue'
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
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: resetPassword
    }
]

const router = createRouter({
    history: createWebHistory('/app'),
    routes,
})

router.beforeEach(async (to, from, next) => {
    const user_store = use_user_store()

    // 只在未初始化時才呼叫一次
    if (!user_store.auth_initialized) {
        await user_store.bootstrap_session()
    }

    // 已登入但想去 login，導向 main
    if (user_store.is_logged_in && to.name === 'login') {
        next({ name: 'main' })
        return
    }

    // 需要驗證但未登入，導向 login
    if (to.matched.some(record => record.meta.requiresAuth) && !user_store.is_logged_in) {
        next({ name: 'login' })
        return
    }

    next()
})

export default router
