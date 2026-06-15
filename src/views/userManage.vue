<template>
    <user-setting 
        :title="'帳號管理'" 
        :action-function="create_item"
        v-model:search="search"
    />
    <v-data-table
        :headers="headers" 
        :items="users" 
        :search="search"
        :custom-filter="customFilter"
        height="500"
        fixed-header
    >
        <template v-slot:[`item.groups`]="{ item }">
            <v-select
                v-model="item.selected_group_id[0]"
                :items="select_groups"
                item-title="name"
                item-value="id"
                item-color="blue"
                chips
                variant="underlined"
                @update:modelValue="change_group(item)"
            ></v-select>
        </template>

        <template v-slot:[`item.is_active`]="{ item }">
            <v-select
                v-model="item.is_active"
                :items="status_list"
                item-title="text"
                item-value="value"
                item-color="blue"
                height="30"
                hide-selected
                variant="underlined"
                @update:modelValue="change_status(item)"
            ></v-select>
        </template>
        <template v-slot:[`item.edit`]="{ item }">
            <v-icon
                small
                class="mr-2"
                icon="mdi-pencil"
                @click="edit_item(item)"
            />
        </template>
    </v-data-table>
    <pop-form-dialog 
        v-model="dialog"
        :title="pop_title"
        :form-data="filter_form_data"
        :form-model="form_model"
        @confirm="handle_confirm"
    />
</template>

<script setup>
    import { computed, ref, onMounted  } from 'vue';
    import {get_user_info, 
            post_auth_update_user, 
            post_user_join_group,
            delete_user_leave_group,
    } from '@/js/user.js';
    import { use_user_store } from '@/stores/user.js';
    import { use_alert_store } from '@/stores/alert.js';
    import { password_rules, reset_password_rules } from '@/config/setting';
    import userSetting from '@/components/userSetting.vue';
    import popFormDialog from '@/components/dialogs/popFormDialog.vue';

    const user_store = use_user_store()
    const alert_store = use_alert_store()
    const search = ref('')
    const dialog = ref(false)
    const pop_title = ref('')
    const show_password = ref(false)
    const show_check_password = ref(false)
    const show_reset_password = ref(false)
    const form_model = ref({
        id: '',
        type: '',
        account: '',
        username: '',
        first_name: '',
        email: '',
        password: '',
        check_password: '',
        reset_password: '',
    })

    const headers = [
        { title: "帳號", key: "username", width: 100 },
        { title: "姓名", key: "first_name", width: 100 },
        { title: "信箱", key: "email", width: 100 },
        {
            title: "群組",
            key: "groups",
            sortable: false,
            width: 200
        },
        { title: "狀態", key: "is_active", width: 90 },
        { title: "修改", key: "edit", sortable: false, width: 50, align: 'center' },
    ]
    const users = ref([])
    const status_list = [
        { text: '啟用', value: true },
        { text: '停用', value: false },
    ]
    const form_data = [
        {
            key: 'username',
            label: '帳號',
            type: 'text',
            component: 'text-field',
            rules: [
                v => !!v || '此欄位為必填',
                v => v.length <= 15 || '長度不得超過 15字元',
            ]
        },{
            key: 'first_name',
            label: '姓名',
            type: 'text',
            component: 'text-field',
            rules: [
                v => !!v || '此欄位為必填',
                v => !v || v.length <= 10 || '長度不得超過 10字元',
            ]
        },{
            key: 'email',
            label: '信箱',
            type: 'text',
            component: 'text-field',
            rules: [
                v => !!v || '此欄位為必填',
                v => !v || /.+@.+\..+/.test(v) || '請輸入有效的電子郵件地址'
            ]
        },{
            key: 'password',
            label: '密碼',
            type: 'password',
            component: 'text-field',
            rules: password_rules,
            show_ref: show_password
        },{
            key: 'check_password',
            label: '確認密碼',
            type: 'password',
            component: 'text-field',
            rules: [
                v => !!v || '請輸入密碼',
                v => v === form_model.value.password || '新密碼與再次輸入不同'
            ],
            show_ref: show_check_password
        },{
            key: 'reset_password',
            label: '修改密碼',
            type: 'password',
            component: 'text-field',
            rules: reset_password_rules,
            show_ref: show_reset_password
        }
    ]

    const filter_form_data = computed(() => {
        if (form_model.value.type === 'create') {
            return form_data.filter(item => item.label !== '修改密碼')
        } 
        else {
            return form_data.filter(item => !['帳號', '密碼', '確認密碼'].includes(item.label))
        }
    })
    // 取得群組列表
    const select_groups = computed(() => {
        return user_store.groups.map(group => ({
            name: group.name,
            id: group.id
        }))
    })

    onMounted(async() => {
        get_user_list()
    })

    // 取得使用者列表
    const get_user_list = async () => {
        const result = await get_user_info()

        user_store.set_user_list(result.data.results)
        users.value = user_store.user_list;

        // 取群組名稱
        users.value.forEach(user => {
            user.selected_group_id = user.groups.map(group => group?.id ?? null)
        })
    }

    const customFilter = (value, search, item) => {
        const keyword = search.toLowerCase()
        const raw_data = item.raw
        const groupNames = (raw_data.groups || [])
            .map(selected_group_id => select_groups.value.find(group => group.id === selected_group_id.id)?.name || '')
            .join('、')

        const statusText = raw_data.is_active ? '啟用' : '停用'

        return [
            raw_data.first_name,
            raw_data.email,
            groupNames,
            statusText
        ].some(text => String(text).toLowerCase().includes(keyword))
    }

    const change_group = async (item) => {
        // 離開原本的群組值
        const cur_user_group_id = users.value.find(user => user.id === item.id)?.groups[0]?.id || null

        if (cur_user_group_id) {
            const result_del = await delete_user_leave_group(item.id, {group_id: cur_user_group_id})
            if (result_del.status !== 'success') {
                alert_store.show_alert('離開原本群組失敗', 'error')
                console.error('離開原本群組失敗:', result_del.message)
                return
            }
        }
        // 更新新的群組值
        const result_post = await post_user_join_group(item.id, {group_id: item.selected_group_id[0]})
        if (result_post.status !== 'success') {
            alert_store.show_alert('加入新群組失敗', 'error')
            console.error('加入新群組失敗:', result_post.message)
            return
        }

        // 更新紀錄的群組值
        const user = users.value.find(user => user.id === item.id)
        user.groups = [select_groups.value.find(g => g.id === item.selected_group_id[0])]

        alert_store.show_alert('更新使用者群組成功', 'success')
    }

    const change_status = async (item) => {
        const { status } = await post_auth_update_user( 
            item.id, 
            { is_active: item.is_active })

        if (status !== 'success') {
            alert_store.show_alert('更新使用者狀態失敗', 'error')
            return
        }
        alert_store.show_alert('更新使用者狀態成功', 'success')
    }

    const create_item = () => {
        // init form data
        Object.keys(form_model.value).forEach(key => {
            if (key === 'type') form_model.value[key] = 'create'
            else form_model.value[key] = '' // 其他欄位清空
        })

        pop_title.value = '新增使用者'
        dialog.value = true
    }

    const edit_item = (item) => {
        form_model.value = {
            ...form_model.value,
            id: item.id,
            first_name: item.first_name,
            email: item.email,
            reset_password: '',
        }

        form_model.value.type = 'edit'
        pop_title.value = '修改使用者'
        dialog.value = true
    }

    const handle_confirm = async (item, type) => {
        if (type === 'create') {
            await user_store.create_user_confirm(item)
            await get_user_list() // 重新取得使用者列表以更新畫面
            return
        }

        if (type === 'edit') {
            await user_store.edit_user_confirm(item)
            await get_user_list() // 重新取得使用者列表以更新畫面
        }
    }
</script>