<template>
    <div>
        <v-dialog v-model="show_forgot_password" max-width="350">
            <v-card>
                <!-- 標題區 -->
                <v-card-actions class="justify-space-between">
                    <v-card-title class="headline">忘記密碼</v-card-title>
                    <v-btn
                        icon
                        dark
                        absolute
                        top
                        right
                        color="grey lighten-1"
                        @click="show_forgot_password = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>
                <!-- 表單內容 -->
                <v-card-text cols="12">
                    <v-form
                        v-model="forgot_password_valid"
                        lazy-validation
                    >
                        <v-text-field
                          v-model="forgot.account"
                          label="帳號"
                          required
                          :rules="account_rules"
                          autofocus
                        ></v-text-field>
                        <v-text-field
                          v-model="forgot.email"
                          label="信箱"
                          required
                          :rules="email_rules"
                        ></v-text-field>
                    </v-form>
                    <v-form
                        v-model="verify_code_valid"
                        lazy-validation
                    >
                        <v-row>
                        <v-col cols="6">
                            <v-text-field
                                v-model="forgot.verify_code"
                                label="驗證碼"
                                required
                                :rules="verify_rules"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="6">
                            <v-btn
                              color="teal"
                              class="white--text mt-2"
                              :disabled="send_verify_lock"
                              @click="send_verify_confirm()"
                            >
                            取得驗證碼
                            </v-btn>
                            <div
                              class="text-red caption mt-1"
                              v-html="verify_lock_message"
                            ></div>
                        </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn
                        color="green darken-1"
                        dark
                        variant="flat"
                        @click="forgot_password_confirm()"
                    >
                        確認
                    </v-btn>

                    <v-btn
                        color="red-darken-1"
                        dark
                        variant="flat"
                        @click="show_forgot_password = false"
                    >
                        取消
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { use_user_store } from '../../stores/user.js'
import {
    forgot_password_ajax,
    send_verify_code_ajax,
} from '../../utils/user.js'

const user_store = use_user_store()
const forgot = reactive({
    account: '',
    email: '',
    verify_code: '',
})
const verify_code_valid = ref(false)
const forgot_password_valid = ref(false)
const send_verify_lock = ref(false)
const verify_lock_message = ref('')

// 表單驗證規則
const account_rules = [(v) => !!v || '請輸入帳號']
const email_rules = [
    (v) => !!v || '請輸入信箱',
    (v) =>
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        v
    ) || '信箱格式不正確',
]
const verify_rules = [(v) => !!v || '請輸入驗證碼']

// 關閉視窗
const show_forgot_password = computed({
    get: () => user_store.show_forgot_password_dialog,
    set: () => {
        user_store.toggle_forgot_password_dialog()
    },
})
async function send_verify_confirm() {
    if (send_verify_lock.value) return
    const valid = forgot_password_valid.value?.validate()
    if (!valid) return
    await send_verify_code_ajax.call({
    forgot,
    send_verify_lock,
    verify_lock_message,
    })
}
// 忘記密碼確認
async function forgot_password_confirm() {
    const valid = verify_code_valid.value?.validate()
    if (!valid) return
    await forgot_password_ajax.call({ forgot })
}
</script>