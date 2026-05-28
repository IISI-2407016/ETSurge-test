<template>
    <div id="app">
        <router-view />

        <alert-message-dialog 
            v-model="alert_store.alert_state.visible"
            :message="alert_store.alert_state.message"
            :type="alert_store.alert_state.type"
        />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { use_user_store } from './stores/user.js'
import { use_alert_store } from './stores/alert.js'
import { post_check_login } from './js/login.js'
import alertMessageDialog from './components/dialogs/alertMessageDialog.vue'

const router = useRouter()
const user_store = use_user_store()
const alert_store = use_alert_store()

onMounted(async () => {
    await check_login()
})

onUnmounted(() => {
    // 應用卸載時清理定時器
    user_store.stop_session_refresh()
});

const check_login = async () => {
    const { status, data } = await post_check_login()
    if (status === 'success') {
        user_store.toggle_login_state(true)
        user_store.user = data.user
        user_store.start_session_refresh(); // 開始自動刷新

        await user_store.fetch_user_groups(data.user.pk) // 取得完整的使用者資訊（包含群組）
        await user_store.set_groups_options() // 設定群組功能的可選項目清單

        // 如果已登入且當前在登入頁，導向主頁
        if (router.currentRoute.value.name === 'login') {
            router.push({ name: 'main' })
        }
    } else {
        user_store.logout();
        // 如果未登入且不在登入頁，導向登入頁
        if (router.currentRoute.value.name !== 'login') {
            router.push({ name: 'login' })
        }
    }
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
</style>
