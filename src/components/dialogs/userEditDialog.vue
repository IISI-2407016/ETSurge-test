<template>
    <div>
        <v-dialog v-model="show_user_edit" max-width="350">
            <v-card>
                <v-card-actions class="justify-space-between">
                    <v-card-title class="text-h6">
                        {{ `修改${user_dialog_mode === 'personal' ? '個人資料' : '使用者'}` }}
                    </v-card-title>
                    <v-btn
                        icon
                        color="grey-lighten-1"
                        class="position-absolute top-0 right-0 ma-2"
                        @click="show_user_edit = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>
                <v-card-text>
                    <v-form ref="update_user_form">
                        <v-text-field
                            v-model="edit_user.name"
                            :rules="name_rules"
                            type="text"
                            label="姓名"
                        />
                        <v-text-field
                            v-model="edit_user.work_unit"
                            :rules="work_unit_rules"
                            type="text"
                            label="單位"
                        />
                        <v-text-field
                            v-model="edit_user.email"
                            :rules="email_rules"
                            type="text"
                            label="信箱"
                        />
                    </v-form>
        
                    <v-form ref="update_password_form">
                        <v-text-field
                            v-model="edit_user.password"
                            :rules="password_rules"
                            type="password"
                            label="修改密碼"
                        />
                    </v-form>
                </v-card-text>
        
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="green" variant="elevated" @click="edit_user_confirm">
                        確認送出
                    </v-btn>
                    <v-btn color="red-darken-1" variant="elevated" @click="show_user_edit = false">
                        取消
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use_user_store } from '../../stores/user.js';
import { use_alert_store } from '../../stores/alert.js';
import { update_user_info_ajax } from '../../js/user.js'

// 定義 props
const props = defineProps({
    edit_user: {
        type: Object,
        default: () => ({})
    },
    user_dialog_mode: {
        type: String,
        default: 'personal'
    }
})

// 定義 emits
const emit = defineEmits(['edit_user_confirm'])

// refs for form validation
const user_store = use_user_store();
const alert_store = use_alert_store()
const update_user_form = ref(null)
const update_password_form = ref(null)

const show_user_edit = computed({
    get: () => user_store.show_user_edit_dialog,
    set: () => user_store.toggle_user_edit_dialog()
})

// rules
const name_rules = [
    (v) => !!v || '請輸入姓名',
    (v) => (v && v.length <= 10) || '長度不得超過 10字元'
]

const work_unit_rules = [
    (v) => !!v || '請輸入單位',
    (v) => (v && v.length <= 10) || '長度不得超過 10字元'
]

const email_rules = [
    (v) => !!v || '請輸入信箱',
    (v) =>
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        v
        ) || '信箱格式不正確'
]

const password_rules = [
    (v) => !!v || '請輸入8~16個字元，需包含數字和英文字母及符號',
    (v) =>
        /^((?=.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*|(?=.{8,}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!\u0022#$%&'()*+,./:;<=>?@[\]\^_`{|}~-]).*)$/.test(
        v
        ) || '密碼需包含英文大寫、英文小寫、數字和特殊字元其中三種',
    (v) => v?.length >= 8 || '請輸入8~16個字元，需包含數字和英文字母及符號'
]

const edit_user_confirm = async() => {
    const { valid } = await update_user_form.value?.validate()
    const { valid: password_valid }= await update_password_form.value?.validate()
    if (!valid || !password_valid) return

    const send_data = {
        account: props.edit_user.account,
        name: props.edit_user.name,
        email: props.edit_user.email,
        work_unit: props.edit_user.work_unit,
    }
    if (props.edit_user.password) {
        send_data.password = props.edit_user.password
    }
    const { status, failed_code } = await update_user_info_ajax(send_data)
    if (status !== 'success') {
        alert_store.show_alert(failed_code || '使用者資料修改失敗', 'error')
        return
    }
    props.edit_user.password = ''
    user_store.set_user(props.edit_user)
    show_user_edit.value = false
    alert_store.show_alert('使用者資料修改成功', 'success')
}
</script>
