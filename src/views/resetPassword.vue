<template>
    <v-container class="mt-8" fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="5" lg="4">
                <v-card class="elevation-12 rounded-lg pa-4">
                    <v-card-item class="text-center">
                        <v-card-title class="text-h5 font-weight-bold my-2">
                            重設您的密碼
                        </v-card-title>
                        <v-card-subtitle>請輸入您的新密碼</v-card-subtitle>
                    </v-card-item>

                    <v-card-text>
                        <!-- 錯誤提示區塊 -->
                        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
                            {{ errorMessage }}
                        </v-alert>

                        <!-- 成功提示區塊 -->
                        <v-alert v-if="isSuccess" type="success" variant="tonal" class="mb-4">
                            密碼重設成功！即將為您導向登入頁面...
                        </v-alert>

                        <v-form v-if="!isSuccess" ref="form" v-model="isFormValid" @submit.prevent="handleSubmit">
                        
                            <!-- 新密碼欄位 -->
                            <v-text-field
                                v-model="newPassword1"
                                :rules="password_rules"
                                label="新密碼"
                                type="password"
                                prepend-inner-icon="mdi-lock-outline"
                                :disabled="invalid_email_reset"
                                required
                            ></v-text-field>

                            <!-- 確認新密碼欄位 -->
                            <v-text-field
                                v-model="newPassword2"
                                :rules="confirm_password_rules"
                                label="確認新密碼"
                                type="password"
                                prepend-inner-icon="mdi-lock-check-outline"
                                :disabled="invalid_email_reset"
                                required
                            ></v-text-field>

                            <v-btn
                                :disabled="!isFormValid || invalid_email_reset"
                                :loading="isLoading"
                                color="primary"
                                size="large"
                                type="submit"
                                block
                                class="mt-4"
                            >
                                確認重設密碼
                            </v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { password_rules } from '@/config/setting'
import { use_user_store } from '@/stores/user.js'

const route = useRoute()
const router = useRouter()
const user_store = use_user_store()

// 表單狀態
const form = ref(null)
const isFormValid = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

// 資料模型
const uid = ref('')
const token = ref('')
const newPassword1 = ref('')
const newPassword2 = ref('')

// 1. 組件掛載時，從 URL 解析 uidb64 和 token
onMounted(() => {
    uid.value = route.query.uid || ''
    token.value = route.query.token || ''

    // 安全檢查：如果網址缺少 uid 或 token，直接報錯
    if (invalid_email_reset.value) {
        errorMessage.value = '無效或過期的重設連結，請重新申請。'
    }
})

const invalid_email_reset = computed(() => {
    return !uid.value || !token.value
})

// 2. Vuetify 欄位驗證規則
const confirm_password_rules = [
    v => !!v || '請再次輸入新密碼',
    v => v === newPassword1.value || '兩次輸入的密碼不一致'
]

// 3. 送出表單到後端 API
const handleSubmit = async () => {
    const { valid } = await form.value.validate()
    if (!valid) return

    isLoading.value = true
    errorMessage.value = ''

    // 依照你的 API 文件規範組合 Payload
    const send_data = {
        uid: uid.value,
        token: token.value,
        new_password1: newPassword1.value,
        new_password2: newPassword2.value
    }

    const result = await user_store.reset_password_confirm(send_data)

    if (result.status !== 'success') {
        isLoading.value = false
        errorMessage.value = '密碼重設失敗，請確認連結是否有效或已過期。'
        return
    }
    isSuccess.value = true
    // 成功後延遲 3 秒自動導向登入頁面
    setTimeout(() => {
        router.push({ name: 'login' })
    }, 3000)
}
</script>
