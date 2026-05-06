<template>
    <v-app>
        <v-app-bar color="white" dense fixed class="grey lighten-3">
            <v-toolbar-title class="text-h5">暴潮系集展示系統</v-toolbar-title>
        </v-app-bar>
        <v-main>
            <v-container class="mt-8 ms-auto d-flex justify-center">
                <v-card
                    max-width="300"
                    min-width="250"
                    v-on:keyup.enter="login_confirm"
                    class="grey lighten-5"
                >
                    <v-card-title class="headline blue-grey--text text--darken-4">
                        會員登入
                    </v-card-title>
                    <v-col cols="12">
                        <v-form v-model="is_login_form_valid" ref="login_form">
                            <v-text-field
                                v-model="account"
                                label="帳號"
                                autofocus
                                :rules="account_rules"
                                type="account"
                                name="account"
                                required
                            ></v-text-field>
                            <v-text-field
                                v-model="password"
                                name="password"
                                label="密碼"
                                class="mt-3"
                                :rules="password_rules"
                                :append-inner-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show ? 'text' : 'password'"
                                @click:append-inner="show = !show"
                            ></v-text-field>
                        </v-form>
                    </v-col>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn 
                            color="green darken-1" 
                            dark 
                            variant="flat" 
                            @click="login_confirm()">
                            登入
                        </v-btn>
                    </v-card-actions>
                    <v-card-actions class="justify-center">
                        <v-btn color="info" text @click="open_signup()">
                            註冊
                        </v-btn>
                        <v-btn color="info" text @click="open_forgot_password()">
                            忘記密碼?
                        </v-btn>
                    </v-card-actions>
                </v-card>
        
                <forgot-password-dialog />

                <signup-dialog v-model="dialog"/>
            </v-container>
        </v-main>
    </v-app>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { use_user_store } from '../stores/user.js'
import { use_alert_store } from '../stores/alert.js'
import signupDialog from './signupDialog.vue'
import forgotPasswordDialog from '../components/dialogs/forgotPasswordDialog.vue'
import { post_auth_login } from '../js/login.js'

const router = useRouter()
const user_store = use_user_store()
const alert_store = use_alert_store()
const dialog = ref(false)

// 表單資料與狀態
const login_form = ref(null) // 專門拿來呼叫 validate()
const is_login_form_valid = ref(false) // v-model 綁定這個 Boolean

const account = ref('')
const password = ref('')
const show = ref(false) // 密碼欄位是否顯示明文，預設為 false（不顯示）

// 表單驗證規則
const account_rules = [(v) => !!v || '請輸入帳號']
const password_rules = [(v) => !!v || '請輸入密碼']

// 打開註冊POP
function open_signup() {
    dialog.value = true
}

// 打開忘記密碼POP
function open_forgot_password() {
    user_store.toggle_forgot_password_dialog()
}

async function login_confirm() {
    const { valid } = await login_form.value?.validate()
    if (!valid) return
    const params = {
        username: account.value,
        password: password.value,
        email: "" //後端要求參數
    }
    try {
        const result = await post_auth_login(params)
        if (result.status !== 'success') {
            if (account.value && password.value) {
                alert_store.show_alert('登入失敗，請檢查帳號密碼', 'error')
            }
            return
        }
        user_store.toggle_login_state(true)
        user_store.set_user(result.data.user)
        await user_store.get_user_groups(result.data.user.pk) // 取得完整的使用者資訊（包含群組）
        await user_store.set_groups_options() // 設定群組功能的可選項目清單
        // 登入成功後跳轉到主頁面
        router.push({ name: 'main' })
    } catch(err) {

    }
}
</script>