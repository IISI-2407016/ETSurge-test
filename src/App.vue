<template>
    <div id="app">
        <v-app id="inspire">
        <!-- <Loading /> -->
        <v-card flat tile>
            <tool-bar v-model="current_tab"/>
            <v-main>
                <login v-if="current_page === 'Login'" class="mt-12"/>

                <!-- 登入後TAB內容 -->
                <!-- <v-container v-else fluid class="pa-4"> -->
                <v-container v-else fluid class="pa-4">
                    <div v-if="current_tab === 'uvp'">
                        <div class="fixed z-10 w-100">
                            <UVP-view  
                                @change-tab="current_tab = $event"
                            />
                        </div>
                        <div 
                            v-if="uvp_data_store.search_results.length > 0 && current_tab === 'uvp'" 
                            class="relative z-1">
                            {{ uvp_data_store.search_results }}
                        </div>
                    </div>
                    <div v-else-if="current_tab === 'tide_level'">
                        <tide-level-view />
                    </div>
                    <div v-else-if="current_tab === 'light'">
                        <light-view />
                    </div>
                </v-container>
                <!-- <light-view v-if="current_tab === 'light'" /> -->
            <!-- <Main v-if="current_page === 'Main'" />
            <UserManage v-if="current_page === 'UserManage'" />
            <GroupManage v-if="current_page === 'GroupManage'" />
            <ChangePassword v-if="current_page === 'ChangePassword'" /> -->
            </v-main>
        </v-card>
        </v-app>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { use_user_store } from './stores/user.js'
import { use_uvp_data_store } from './stores/UVP-data.js'

// import Loading from './components/loading.vue'
import toolBar from './views/toolBar.vue'
// import Main from './components/pages/main.vue'
import login from './views/login.vue'
import UVPView from './views/UVPView.vue'
import tideLevelView from './views/tideLevelView.vue'
// import UserManage from './components/pages/userManage.vue'
// import GroupManage from './components/pages/groupManage.vue'
// import ChangePassword from './components/pages/changePassword.vue'

import {
  check_login_status_ajax,
  // get_all_group_json,
  // get_all_user_json,
} from './utils/user.js'

// 取得 Pinia Store
const uvp_data_store = use_uvp_data_store()
const user_store = use_user_store()
const { current_page, user, have_stids_title } = storeToRefs(user_store)
const current_tab = ref('uvp');

onMounted(async () => {
    await check_login()
})

async function check_login() {
    const result = await check_login_status_ajax()

    if (result.success) {
        await user_store.set_all_login_info(result.user)
    } else {
        user_store.set_current_page('Login')
    }
}


// async function check_login() {
//   await check_login_status_ajax()
//   // await user_store.set_all_login_info(user_data)
// }

// async function set_all_login_info(loginUser) {
//   user_store.toggle_login_state()
//   user_store.set_user(loginUser)
//   user_store.check_admin()

//   await get_all_group_json(user_store)
//   user_store.get_have_groups()

//   await get_all_user(loginUser.level)
// }

// async function get_all_user(level) {
//   const has_user_manage = have_stids_title.value.includes('帳號管理')
//   if (has_user_manage || level === 'admin') {
//     await get_all_user_json()
//   }
// }
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
