<template>
    <v-container class="mx-0">
        <v-row class="align-center bg-blue-50">
            <label class="pa-3">颱風名稱</label>
            <v-col>
                <v-select
                    v-model="ty_name"
                    :items="Ty_info"
                    item-color="blue"
                    hide-details
                />
            </v-col>
            <label class="pa-3">初始時間</label>
            <v-col class="mt-5">
                <v-menu
                    v-model="menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                >
                    <template #activator="{ props }">
                        <v-text-field
                            v-model="formatted_date"
                            readonly
                            v-bind="props"
                            label="Date"
                        ></v-text-field>
                    </template>

                    <v-date-picker
                        v-model="selected_date"
                        color="primary"
                        label="Date"
                        :max="max_date"
                        @update:model-value="handle_date_select"
                    ></v-date-picker>
                </v-menu>
            </v-col>
            <v-col class="pl-0 mt-5">
                <v-select
                    v-model="hour.time"
                    :items="hour.items"
                    item-color="blue"
                    label="Hour"
                    @update:model-value="tide_level_info_store.update_hour"
                ></v-select>
            </v-col>
            <span class="pa-3 pl-0">UTC</span>
            <v-col>
                <v-btn color="green" @click="search">
                    查詢
                </v-btn>
            </v-col>
        </v-row>
        <!-- 顯示目前狀態 -->
        <v-row>
            <v-col>
                目前狀態：{{ current_status }}
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed  } from 'vue'
import { use_uvp_data_store } from '../stores/UVP-data.js'
import { tide_level_store } from '../stores/tide-level.js'
import { format_date } from '../utils/formatted-date.js'

const uvp_data_store = use_uvp_data_store()
const tide_level_info_store = tide_level_store()

const menu = ref(false)
const max_date = ref(new Date())
// 定義 emits
const emit = defineEmits(['on-resize'])

const ty_search_info = computed(() => tide_level_info_store.ty_search)
const hour = computed(() => tide_level_info_store.hour)
const Ty_info = computed(() => uvp_data_store.Ty_info)
const formatted_date = computed(() => {
    return format_date(selected_date.value)
});
const ty_name = computed({
    get: () => {
        if (!ty_search_info.value?.TyNo) {
            return Ty_info.value.length > 0 ? Ty_info.value[0].value : ''
        }
        return ty_search_info.value?.TyNo
    },
    set: (value) => {
        tide_level_info_store.set_ty_search({
            ...ty_search_info.value,
            TyNo: value
        })
    }
})

const selected_date = computed({
    get: () => {
        if (!ty_search_info.value?.InitialTime) return new Date()
        return new Date(ty_search_info.value?.InitialTime)
    },
    set: (value) => {
        debugger
        const date = value instanceof Date ? value : new Date(value)
        tide_level_info_store.update_date(date)
    }
})

const current_status = computed(() => {
    const { TyNo, InitialTime } = uvp_data_store.uvp_data
    const uvp_title = Ty_info.value.find(item => item.value === TyNo)?.title
    const tide_title = Ty_info.value.find(item => item.value === ty_name.value)?.title
    let current_status_txt = ''

    if (uvp_data_store.is_uvp_search) {
        if (!uvp_title || !InitialTime || !uvp_data_store.can_calculate_average) return '尚無查詢結果'
        current_status_txt = `${uvp_title} (${InitialTime}) 的系集查詢結果`
    }
    else if (!uvp_data_store.is_uvp_search) {
        current_status_txt = `${tide_title} (${format_date(selected_date.value)} ${hour.value.time}:00:00Z) 的颱風查詢結果`
    }

    return `${current_status_txt || '尚無查詢結果'}`;
});

const handle_date_select = (date) => {
    if (date) {
        selected_date.value = date
    }
    menu.value = false
}

const search = async () => {
    tide_level_info_store.set_ty_search({
        TyNo: ty_name.value,
        InitialTime: selected_date.value.toISOString().split('T')[0] + `T${hour.value.time}:00:00Z`
    })
    const res = await uvp_data_store.post_typhoon_data(ty_search_info.value);
    if(!res.success) {
        return;
    }
    uvp_data_store.set_is_uvp_search(false) // 設定為系集查詢
    tide_level_info_store.reset_previewed_keys() // 新查詢結果，重置逐列已預覽狀態
    emit('on-resize')
}
</script>
