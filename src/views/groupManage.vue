<template>
    <user-setting 
        :title="'群組管理'" 
        :action-function="create_item"
        v-model:search="search"
    />
    <v-data-table
        :headers="headers" 
        :items="group_lists" 
        :search="search"
        :custom-filter="customFilter"
        height="500"
        fixed-header
    >
        <template  v-slot:[`item.stids`]="{ item }">
            <v-chip
                v-for="(stid, index) in item.stids"
                :key="index"
                class="ma-1"
            >
                {{ stid.Title }}
            </v-chip>
        </template>

        <template v-slot:[`item.function_list`]="{ item }">
            <v-chip
                v-for="(functions, index) in item.function_list"
                :key="index"
                class="ma-1"
            >
                {{ functions.Title }}
            </v-chip>
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
        :form-data="form_data"
        :form-model="form_model"
        :reset-model="false"
        @confirm="handle_confirm"
    />
</template>

<script setup>
    import { computed, ref, onMounted  } from 'vue';
    import { use_user_store } from '@/stores/user.js';
    import userSetting from '@/components/userSetting.vue';
    import popFormDialog from '@/components/dialogs/popFormDialog.vue';

    const user_store = use_user_store()
    const search = ref('')
    const dialog = ref(false)
    const pop_title = ref('')
    const pop_type = ref('') // create or edit
    const form_model = ref({
        id: '',
        type: '',
        name: '',
        stids: [],
        function_list: [],
    })

    const stids = computed(() => {
        return user_store.stids.map(stid => ({
            text: stid.title,
            value: stid.key
        }))
    })
    const function_list = computed(() => {
        return user_store.function_list.map(func => ({
            text: func.title,
            value: func.key
        }))
    })
    const group_lists = computed(() => {
        return user_store.groups
    })

    const headers = [
        { title: "名稱", key: "name", width: 100 },
        { title: "管理功能選擇", key: "stids", width: 400 },
        { title: "傳送功能選擇", key: "function_list", width: 400 },
        { title: "修改", key: "edit", sortable: false, width: 50, align: 'center' },
    ]

    const form_data = [
        {
            key: 'name',
            label: '名稱',
            type: 'text',
            component: 'text-field',
            rules: [
                v => !!v || '此欄位為必填',
                v => !v || v.length <= 10 || '長度不得超過 10字元',
            ]
        },{
            key: 'stids',
            label: '管理功能選擇',
            component: 'select',
            rules: [
                v => (Array.isArray(v) ? v.length > 0 : !!v) || '此欄位為必填'
            ],
            options: stids.value
        },{
            key: 'function_list',
            label: '傳送功能選擇',
            component: 'select',
            rules: [
                v => (Array.isArray(v) ? v.length > 0 : !!v) || '此欄位為必填'
            ],
            options: function_list.value
        }
    ]

    onMounted(async() => {
        user_store.get_group_data();
    })

    const create_item = () => {
        // init form data
        form_model.value.id = ''
        form_model.value.type = 'create'
        form_model.value.name = ''
        form_model.value.stids = []
        form_model.value.function_list = []


        pop_type.value = 'create'
        pop_title.value = '新增群組'
        dialog.value = true
    }

    const edit_item = (item) => {
        form_model.value.type = 'edit'
        pop_title.value = '修改群組'
        form_model.value = {
            ...form_model.value,
            id: item.id,
            name: item.name,
            stids: item.stids.map(stid => stid.Key) ?? [],
            function_list: item.function_list.map(func => func.Key) ?? [],
        }

        pop_type.value = 'edit'
        dialog.value = true
    }

    const handle_confirm = async (item, type) => {
        if (type === 'create') {
            await user_store.create_group_data(item)
            await user_store.get_group_data(); // 重新取得使用者列表以更新畫面
            return
        }

        if (type === 'edit') {
            await user_store.patch_groups_update(item.id, item)
            await user_store.get_group_data(); // 重新取得使用者列表以更新畫面
        }
    }

    const customFilter = (value, search, item) => {
        const keyword = search.toLowerCase()
        const raw_data = item.raw
        const stids_names = (raw_data.stids || [])
            .map(value => stids.value.find(stid => stid.text === value.Title)?.text || '')
            .join('、')
        const function_list_names = (raw_data.function_list || [])
            .map(value => function_list.value.find(func => func.text === value.Title)?.text || '')
            .join('、')

        return [
            raw_data.name,
            stids_names,
            function_list_names
        ].some(text => String(text).toLowerCase().includes(keyword))
    }
</script>