<template>
    <v-container class="ms-auto d-flex justify-center">
        <!-- login -->
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
                        :rules="password_rules"
                        type="password"
                        name="password"
                        label="密碼"
                        class="mt-3"
                    ></v-text-field>
                </v-form>
                <div class="text-red">{{ error_message }}</div>
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
        <signup-dialog />
    </v-container>
</template>
<script setup>
import { ref } from 'vue'
import { use_user_store } from '../stores/user-store'
import signupDialog from '../components/dialogs/signupDialog.vue'
import forgotPasswordDialog from '../components/dialogs/forgotPasswordDialog.vue'
import { user_login_ajax } from '../utils/user.js'

// 呼叫 pinia store
const user_store = use_user_store()

// 表單資料與狀態
const login_form = ref(null) // 專門拿來呼叫 validate()
const is_login_form_valid = ref(false) // v-model 綁定這個 Boolean

const account = ref('')
const password = ref('')
const error_message = ref('')

// 表單驗證規則
const account_rules = [(v) => !!v || '請輸入帳號']
const password_rules = [(v) => !!v || '請輸入密碼']

// 打開註冊POP
function open_signup() {
    user_store.toggle_signup_dialog()
}

// 打開忘記密碼POP
function open_forgot_password() {
    user_store.toggle_forgot_password_dialog()
}

async function login_confirm() {
    const valid = login_form.value?.validate()
    if (!valid) return

    //   await user_store.set_all_login_info(user_data)

    const result = await user_login_ajax(account.value, password.value)

    if (result.status === "success") {
        await user_store.set_all_login_info(result.user)
    } else {
        error_message.value = result.message
        setTimeout(() => {
            error_message.value = ''
        }, 1500)
    }
    //   await user_login_ajax.call({
    //     account: account.value,
    //     password: password.value,
    //     user_store,
    //     error_message,
    //   })
}
</script>