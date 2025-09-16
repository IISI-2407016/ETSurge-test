<template>
    <div>
        <v-dialog 
            v-model="show_signup" 
            max-width="290" 
            @keyup.enter="signup_confirm">
            <v-card 
                class="pa-0" 
                style="position: relative; overflow: hidden;">
                <!-- 標題區 -->
                <v-card-actions 
                    class="sticky-header pa-4 pb-0 justify-space-between">
                    <v-card-title class="headline">註冊會員</v-card-title>
                    <v-btn
                        icon
                        class="position-absolute top-0 right-0"
                        color="grey-lighten-1"
                        @click="show_signup = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>
                <!-- 表單內容 -->
                <v-card-text cols="12" class="pb-0" style="overflow-y: auto;">
                    <v-form ref="form" 
                        v-model="signup_form" 
                        @submit.prevent
                    >
                    <v-text-field
                        v-model="user.account"
                        :rules="account_rules"
                        label="帳號"
                        required
                    />
                    <v-text-field
                        v-model="user.name"
                        :rules="name_rules"
                        label="姓名"
                        required
                    />
                    <v-text-field
                        v-model="user.work_unit"
                        :rules="workUnit_rules"
                        label="單位"
                        required
                    />
                    <v-text-field
                        v-model="user.email"
                        :rules="email_rules"
                        label="Email"
                        required
                    />
                    <v-text-field
                        v-model="user.password"
                        :rules="password_rules"
                        label="密碼"
                        type="password"
                        name="sign-up-password"
                        required
                    />
                    <v-text-field
                        v-model="password_check"
                        :rules="password_check_rules"
                        label="確認密碼"
                        type="password"
                        name="sign-up-password-check"
                        required
                    />
                    </v-form>
                </v-card-text>

                <div v-show="show_error_message" class="text-red px-6">
                    *帳號重複
                </div>

                <v-card-actions class="justify-space-evenly">
                    <v-btn color="teal" variant="flat" @click="reset_form">清空</v-btn>
                    <v-btn color="green-darken-1" variant="flat" @click="signup_confirm">確認送出</v-btn>
                    <v-btn color="red-darken-1" variant="flat" @click="show_signup = false">取消</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="signup_success" max-width="290">
            <v-card-title>
                <div v-html="success_message"></div>
            </v-card-title>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use_user_store } from '../../stores/user-store.js'
import { signup_ajax } from '../../utils/user.js'
import { useReCaptcha } from 'vue-recaptcha-v3'

// 狀態
const user_store = use_user_store()
const { recaptchaLoaded, executeRecaptcha } = useReCaptcha()
const signup_form = ref(false)
const form = ref(null)

const user = ref({
    account: '',
    name: '',
    work_unit: '',
    email: '',
    password: '',
})

const password_check = ref('')
const signup_success = ref(false)
const success_message = ref('')
const show_error_message = ref(false)

// 表單規則
const account_rules = [
    v => !!v || '請輸入帳號',
    v => v.length <= 15 || '長度不得超過 15字元',
]
const name_rules = [
    v => !!v || '請輸入姓名',
    v => v.length <= 10 || '長度不得超過 10字元',
]
const workUnit_rules = [
    v => !!v || '請輸入單位',
    v => v.length <= 10 || '長度不得超過 10字元',
]
const email_rules = [
    v => !!v || '請輸入信箱',
    v =>
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        v
        ) || '信箱格式不正確',
]
const password_rules = [
    v => !!v || '請輸入8~16個字元，需包含數字和英文字母及符號',
    v =>
        /^((?=.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*|(?=.{8,}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!"#$%&'()*+,./:;<=>?@[\\]^_`{|}~-])).*$/.test(v) 
        || 
        '密碼需包含英文大寫、英文小寫、數字和特殊字元其中三種',
    v => v.length >= 8 || '請輸入8~16個字元，需包含數字和英文字母及符號',
]
const password_check_rules = [
    v => !!v || '請輸入密碼',
    v => v === user.value.password || '新密碼與再次輸入不同',
]

// 關閉視窗
const show_signup = computed({
    get: () => user_store.show_signup_dialog,
    set: () => {
        user_store.toggle_signup_dialog()
    },
})

const reset_form = () => {
    form.value.reset()
}

const signup_confirm = async () => {
    show_error_message.value = false
    const valid = await form.value.validate()
    if (!valid) return
    await signup_ajax({
        user: user.value,
        user_store,
        success_message,
        signup_success,
        show_error_message,
        recaptchaLoaded,
        executeRecaptcha
    })
}
</script>
