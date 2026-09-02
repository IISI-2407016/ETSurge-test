<template>
    <div>
        <!-- 框架 -->
        <v-dialog
            v-model="dialog_model"
            max-width="800"
            min-height="200"
            persistent
        >
            <v-card>
                <!-- 設定標題 -->
                <div class="position-fixed w-full z-1">
                    <h5
                        class="
                            bg-blue-darken-1 
                            text-xl 
                            font-medium 
                            leading-normal 
                            text-gray-800 
                            pa-3 
                            rounded-tl-sm
                            rounded-tr-sm
                        "
                    >{{ props.title.title }}</h5>
                    <div class="absolute top-0 right-0">
                        <v-btn
                            icon="mdi-close"
                            class="border-0"
                            variant="text"
                            color="white"
                            @click="dialog_model = false"
                        ></v-btn>
                    </div>
                </div>
                <!-- 設定內容 -->
                <v-container class="mt-12">
                    <!-- 官網設定 -->
                    <div v-if="props.title.key === 'official_station'">
                        <v-card-subtitle class="pl-0 mb-1">傳至官網測站</v-card-subtitle>
                        <v-row>
                            <v-col cols="12" md="3" 
                                v-for="area in official_list" :key="area.area_id">
                                <v-select 
                                    v-model="area.selected_station_id"
                                    :items="area.stations"
                                    :label="area.area_name"
                                    item-title="station_name"
                                    item-value="station_id"
                                    item-color="blue"
                                    variant="filled"
                                    hide-details
                                >
                                </v-select>
                            </v-col>
                        </v-row>
                    </div>
                    <!-- 顯示測站設定 -->
                    <template v-else-if="props.title.key === 'web_station'">
                        <multi-select-with-all
                            v-model="station_value"
                            :item="station_options"
                            :rules="[
                                v => (Array.isArray(v) ? v.length > 0 : !!v) || '此欄位為必填不得為空'
                            ]"
                            label="網站顯示測站"
                        />
                    </template>
                    <!-- 暴潮水位設定 -->
                    <div v-else-if="props.title.key === 'model_station'">
                        <v-data-table
                            :headers="[
                                { title: '測站ID', key: 'StationID', width: 100, sortable: false },
                                { title: '測站名稱', key: 'StationName', width: 100, sortable: false },
                                { title: '暴潮水位設定', key: 'DataSource', sortable: false },
                            ]"
                            :items="water_list"
                        >
                            <template v-slot:[`item.DataSource`]="{ item }">
                                <v-select
                                    v-model="item.DataSource"
                                    :items="setting_model_list"
                                    item-title="text"
                                    item-value="value"
                                    item-color="blue"
                                    label="模式"
                                    variant="underlined"
                                    hide-details
                                >
                                </v-select>
                            </template>
                        </v-data-table>
                    </div>
                    <div class="d-flex justify-end mt-5">
                        <v-btn
                            color="blue"
                            variant="flat"
                            @click="submit_setting()"
                        >
                            確定修改
                        </v-btn>
                    </div>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { station_set_store } from '@/stores/setting'
import { use_user_store } from '@/stores/user'
import { use_alert_store } from '@/stores/alert'
import { setting_model_list } from '@/config/setting'
import multiSelectWithAll from '@/components/multiSelectWithAll.vue'

const props = defineProps({
    type: String,
    title: Object, // key & 標題
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])
const station_set = station_set_store()
const user_store = use_user_store()
const alert_store = use_alert_store()

const dialog_model = computed({
    get: () => props.show,
    set: (value) => {
        emit('update:modelValue', value)
    }
})
// 測站資訊
const station_value = computed({
    get() {
        return station_list.value
            .filter(station => station.IsDisplayed)
            .map(station => station.StationName)
    },
    set(selectedNames) {
        const selectedSet = new Set(selectedNames || []);
        station_list.value.forEach(station => {
            station.IsDisplayed = selectedSet.has(station.StationName)
        });
    }
})
const station_options = computed(() =>
    station_list.value.map(s => ({
        text: s.StationName,
        value: s.StationName
    }))
)
const official_list = computed(() => station_set.official_list)
const station_list = computed(() => station_set.station_list)
const water_list = computed(() => station_set.water_list)

const submit_setting = () => {
    if (props.title.key === 'official_station') {
        const stations = official_list.value.map(area => {
            if (!area.selected_station_id) {
                alert_store.show_alert(`請選擇${area.area_name}的測站`, 'warning')
                throw new Error(`請選擇${area.area_name}的測站`)
            }
            return {
                area_id: area.area_id,
                station_id: area.selected_station_id
            }
        })
        const send_data = {
            stations: stations,
            user_id: user_store.user.id,
        }
        station_set.update_cwa_user_sent_config(send_data)
    } else if (props.title.key === 'web_station') {
        const configs = station_list.value.map(station => ({
            station_id: station.StationID,
            is_displayed: station.IsDisplayed
        }))
        const send_data = {
            configs: configs,
            user_id: user_store.user.id,
        }
        station_set.update_user_tide_station_display_config(send_data)
    } else if (props.title.key === 'model_station') {
        const configs = water_list.value.map(station => ({
            station_id: station.StationID,
            data_source: station.DataSource
        }))
        const send_data = {
            configs: configs,
            user_id: user_store.user.id,
        }
        station_set.update_user_tide_station_config(send_data)
    }
    dialog_model.value = false
}

onMounted(() => {
    if (props.title.key === 'official_station') {
        station_set.get_cwa_area_config()
    } else if (props.title.key === 'web_station') {
        station_set.get_user_tide_station_display_config()
    } else if (props.title.key === 'model_station') {
        station_set.get_user_tide_station_config()
    }
})
</script>