<template>
  <div>
    <v-menu open-on-hover offset-y>
      <template #activator="{ props }">
        <v-btn
          color="primary"
          variant="text"
          v-bind="props"
          class="text-capitalize"
        >
          {{ user?.first_name }}
          <v-icon medium>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list class="text-center">
        <v-list-item @click="page_change">
          <v-list-item-title>暴潮展示</v-list-item-title>
        </v-list-item>
        <v-list-item @click="open_edit">
          <v-list-item-title>{{ personal_title }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>登出</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- 修改個人/使用者資料 -->
    <pop-form-dialog
      v-model="edit_personal_dialog"
      :title="personal_title"
      :form-data="personal_form_data"
      :form-model="personal_form_model"
      @confirm="handle_confirm"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import popFormDialog from './dialogs/popFormDialog.vue'
import { use_user_store } from '../stores/user.js'
import { post_auth_logout } from '@/js/login'
import { reset_password_rules } from '@/config/setting'
import { get_user_id_info } from '@/js/user.js'

const router = useRouter()
const user_store = use_user_store()

const edit_personal_dialog = ref(false)
const show_reset_password = ref(false)
const personal_title = ref('修改個人資料')
const personal_form_model = ref({
  id: '',
  first_name: '',
  email: '',
  reset_password: ''
})
const personal_form_data = [
  { 
    key: 'first_name', 
    label: '姓名', 
    type: 'text',
    component: 'text-field',
    rules: [
        v => !!v || '此欄位為必填',
        v => !v || v.length <= 10 || '長度不得超過 10字元',
    ]
  },
  { 
    key: 'email', 
    label: '信箱',
    type: 'text',
    component: 'text-field',
    rules: [
        v => !!v || '此欄位為必填',
        v => !v || /.+@.+\..+/.test(v) || '請輸入有效的電子郵件地址',
    ]
  },
  { 
    key: 'reset_password', 
    label: '修改密碼', 
    type: 'password',
    component: 'text-field',
    rules: reset_password_rules,
    show_ref: show_reset_password
  }
]

const login_state = computed(() => user_store.is_logged_in)
const user = computed(() => {
  if (login_state.value) {
    return user_store.user
  } else {
    return null
  }
})

// 打開修改個人資料的對話框
function open_edit() {
  personal_form_model.value = {
    id: user.value.id,
    first_name: user.value.first_name,
    email: user.value.email,
    reset_password: ''
  }
  edit_personal_dialog.value = true
}

// 更新使用者資料
const handle_confirm = async (item) => {
  await user_store.edit_user_confirm(item)
  const result = await get_user_id_info(item.id)
  user_store.set_user(result.data)
}

function page_change() {
  router.push({ name: 'main' })
}

async function logout() {
  const { status } = await post_auth_logout()
  if (status !== 'success') return
  user_store.logout();
  router.push({ name: 'login' })
}
</script>
