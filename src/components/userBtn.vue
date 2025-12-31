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
          {{ user?.username }}
          <v-icon medium>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list class="text-center">
        <v-list-item @click="page_change">
          <v-list-item-title>暴潮展示</v-list-item-title>
        </v-list-item>
        <v-list-item @click="open_edit">
          <v-list-item-title>修改個人資料</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>登出</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- 修改個人/使用者資料 -->
    <user-edit-dialog
      user_dialog_mode="personal"
      :edit_user="edit_user"
      @edit_user_confirm="edit_user_confirm"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import userEditDialog from './dialogs/userEditDialog.vue'
import {
  update_user_info_ajax,
} from '../js/user.js'
import { use_user_store } from '../stores/user.js'
import { post_auth_logout } from '@/js/login'

const router = useRouter()
const user_store = use_user_store()

// 狀態
const edit_user = ref({})
const edit_personal_dialog = ref(false)
const show_change_error = ref(false)
const error_message = ref('')

const login_state = computed(() => user_store.is_logged_in)
const user = computed(() => {
  if (login_state.value) {
    return user_store.user
  } else {
    return null
  }
})

// 方法
function open_edit() {
  user_store.toggle_user_edit_dialog()
  edit_user.value = JSON.parse(JSON.stringify(user.value))
  // edit_personal_dialog.value = true
}

async function edit_user_confirm() {
  const send_data = {
    account: edit_user.value.account,
    name: edit_user.value.name,
    email: edit_user.value.email,
    work_unit: edit_user.value.work_unit,
  }
  if (edit_user.value.password) {
    send_data.password = edit_user.value.password
  }

  const { status, failed_code } = await update_user_info_ajax(send_data)
  if (status === 'success') {
    edit_user.value.password = ''
    user_store.set_user(edit_user.value)
    edit_personal_dialog.value = false
  } else {
    show_change_error.value = true
    error_message.value = failed_code
  }
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
