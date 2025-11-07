<template>
    <div id="app">
        <router-view />
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { use_user_store } from './stores/user.js'
import { check_login_status_ajax } from './js/user.js'

const router = useRouter()
const user_store = use_user_store()

onMounted(async () => {
    // await check_login()
})

async function check_login() {
    const result = await check_login_status_ajax()
    if (result.success) {
        user_store.is_logged_in = true
    }

    // if (result.success) {
    //     await user_store.set_all_login_info(result.user);
    //     // 如果已登入且當前在登入頁，導向主頁
    //     if (router.currentRoute.value.name === 'login') {
    //         router.push({ name: 'main' })
    //     }
    // } else {
    //     // 如果未登入且不在登入頁，導向登入頁
    //     if (router.currentRoute.value.name !== 'login') {
    //         router.push({ name: 'login' })
    //     }
    // }
}
</script>

<style scoped>
[v-cloak] {
    display: none;
}

body {
    font-family: Meiryo, Arial, Verdana, Sans-Serif, Microsoft JhengHei;
    margin: auto auto;
    -webkit-overflow-scrolling: touch;
}

.row {
    margin: 0;
}
</style>
