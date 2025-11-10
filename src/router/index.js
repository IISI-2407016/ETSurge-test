import { createRouter, createWebHistory } from 'vue-router'
import { use_user_store } from '../stores/user.js' 
import login from '../views/login.vue'
import main from '../views/main.vue'

const routes = [
    {
        path: '/',
        name: 'login', // 預設重定導向登入頁
        component: login
    },
    {
        path: '/login',
        name: 'login',
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

// 登入狀態導向正確路由
router.beforeEach((to, from, next) => {
    const user_store = use_user_store();
    
    // 需要登入但未登入 → 重導向到登入頁
    if (to.meta?.requiresAuth && !user_store.is_logged_in) {
        next({ name: 'login' });
    } 
    // 已登入但嘗試訪問登入頁 → 重導向到主頁
    else if (to.name === 'login' && user_store.is_logged_in) {
        next({ name: 'main' });
    } 
    else {
        next();
    }
});

export default router
