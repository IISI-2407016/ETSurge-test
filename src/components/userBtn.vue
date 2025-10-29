<template>
  <div>
    <v-menu open-on-hover offset-y>
      <template #activator="{ props }">
        <v-btn
          color="primary"
          variant="text"
          v-bind="props"
          class="text-capitalize font-italic"
        >
          {{ user.name }}
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
import userEditDialog from './dialogs/userEditDialog.vue'
import {
  user_logout_ajax,
  update_user_info_ajax,
} from '../utils/user.js'
import { use_user_store } from '../stores/user.js'

const user_store = use_user_store()

// 狀態
const edit_user = ref({})
const edit_personal_dialog = ref(false)
const show_change_error = ref(false)
const error_message = ref('')

// pinia computed
const user = computed(() => user_store.user)
const login_state = computed(() => user_store.login_state)

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
  user_store.set_current_page('Main')
}

async function logout() {
  await user_logout_ajax()
}
</script>
