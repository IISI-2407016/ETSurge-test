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
import { onUnmounted } from 'vue'
import { use_user_store } from './stores/user.js'
import { use_alert_store } from './stores/alert.js'
import alertMessageDialog from './components/dialogs/alertMessageDialog.vue'

const user_store = use_user_store()
const alert_store = use_alert_store()

onUnmounted(() => {
    // 應用卸載時清理定時器
    user_store.stop_session_refresh()
});

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
