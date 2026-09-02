<template>
    <div>
        <v-dialog v-model="show_forgot_password" max-width="350">
            <v-card>
                <!-- 標題區 -->
                <v-card-actions class="justify-space-between">
                    <v-card-title class="text-h5 font-weight-bold">忘記密碼</v-card-title>
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
                <v-alert
                    color="info"
                    type="info"
                    variant="tonal"
                    density="compact"
                    class="forgot-alert px-2 w-76 mx-auto"
                >
                    輸入註冊會員之信箱，我們會重新寄送密碼重設之連結。
                </v-alert>
                <!-- 表單內容 -->
                <v-card-text>
                    <v-form
                        ref="forgot_password_valid"
                        lazy-validation
                    >
                        <v-text-field
                          v-model="forgot.email"
                          label="信箱"
                          required
                          :rules="email_rules"
                        ></v-text-field>
                    </v-form>
                    
                    <v-form
                        ref="verify_code_valid"
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
                              v-html="sanitized_verify_lock_message"
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
import { sanitize_html } from '../../utils/sanitize-html.js'
import {
    send_verify_code_ajax,
} from '../../js/user.js'

const user_store = use_user_store()
const forgot = reactive({
    email: '',
})

const forgot_password_valid = ref(false)
const send_verify_lock = ref(false)
const verify_lock_message = ref('')
const sanitized_verify_lock_message = computed(() => sanitize_html(verify_lock_message.value))

// 表單驗證規則
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
    const { valid } = await forgot_password_valid.value?.validate()
    if (!valid) return

    const send_data = { email: forgot.email }
    const { success } = await user_store.forgot_password_confirm(send_data)
    if(success !== 'success') return

    show_forgot_password.value = false
}
</script>

<style scoped>
.forgot-alert :deep(.v-alert__prepend) {
    margin-inline-end: 6px; /* icon 與文字距離 */
}
</style>