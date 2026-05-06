<template>
    <pop-form-dialog
        :title="'註冊會員'"
        :form-data="form_data"
        :form-model="form_model"
        @confirm="signup_confirm"
    >
    </pop-form-dialog>
</template>

<script setup>
    import { ref } from 'vue'
    import { use_user_store } from '@/stores/user.js'
    import { password_rules } from '@/config/setting'
    import popFormDialog from '@/components/dialogs/popFormDialog.vue'

    const user_store = use_user_store()
    const show_password = ref(false)
    const show_check_password = ref(false)
    const form_data = [
        {
            key: 'username',
            label: '帳號',
            type: 'text',
            rules: [
                v => !!v || '此欄位為必填',
                v => v.length <= 15 || '長度不得超過 15字元',
            ]
        },{
            key: 'first_name',
            label: '姓名',
            type: 'text',
            rules: [
                v => !!v || '此欄位為必填',
                v => !v || v.length <= 10 || '長度不得超過 10字元',
            ]
        },{
            key: 'email',
            label: '信箱',
            type: 'text',
            rules: [
                v => !!v || '此欄位為必填',
                v => !v || /.+@.+\..+/.test(v) || '請輸入有效的電子郵件地址'
            ]
        },{
            key: 'password',
            label: '密碼',
            type: 'password',
            rules: password_rules,
            show_ref: show_password
        },{
            key: 'check_password',
            label: '確認密碼',
            type: 'password',
            rules: [
                v => !!v || '請輸入密碼',
                v => v === form_model.value.password || '新密碼與再次輸入不同'
            ],
            show_ref: show_check_password
        }
    ]
    const form_model = ref({
        username: '',
        first_name: '',
        email: '',
        password: '',
        check_password: ''
    })

    const signup_confirm = async (item) => {
        user_store.create_user_confirm(item)
        // reset form
        Object.keys(form_model.value).forEach(key => {
            form_model.value[key] = ''
        })
    }
</script>
