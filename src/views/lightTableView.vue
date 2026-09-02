<template>
    <div>
        <v-row class="align-center mx-0 mb-4" no-gutters>
            <label class="pa-3">颱風名稱</label>
            <v-col cols="12" sm="3">
                <v-select
                    v-model="selected_ty_no"
                    :items="Ty_info"
                    hide-details
                    density="compact"
                    placeholder="請選擇颱風"
                ></v-select>
            </v-col>
            <label class="pa-3">初始時間</label>
            <v-col cols="12" sm="3">
                <v-select
                    v-model="selected_initial_time"
                    :items="initial_time_options"
                    :disabled="!selected_ty_no"
                    hide-details
                    density="compact"
                    placeholder="請選擇初始時間"
                ></v-select>
            </v-col>
            <v-col cols="auto" class="pa-3">
                <v-btn
                    color="primary"
                    :loading="light_store.is_loading"
                    :disabled="!selected_ty_no || !selected_initial_time"
                    @click="on_draw"
                >
                    繪製
                </v-btn>
            </v-col>
        </v-row>
        <div v-if="!light_list.length && !has_light_send" class="d-flex flex-column align-center">
            <v-icon icon="mdi-table-off" class="mb-2" size="x-large"></v-icon>
            無資料
        </div>
        <div v-if="light_list.length && has_light_send">
            <div class="ml-5 mb-4">{{table_msg}}</div>
            <v-table>
                <thead>
                    <tr>
                        <th v-for="city in headers" 
                            class="text-center"
                           :style="{ minWidth: city.width }" 
                           :key="city"
                        >
                            {{ city.title }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(timeGroup, timeIndex) in grouped_data" :key="timeIndex">
                        <tr class="text-center">
                            <td :rowspan="2" v-html="sanitize_html(timeGroup.time)" :style="{maxWidth: '50px'}"></td>
                            <td>發生時段<br/>(時)</td>
                            <td v-for="city in cities" :key="`${city}-period`">
                                {{ timeGroup.data[city]?.max_time || '-' }}
                            </td>
                        </tr>
                        <tr class="text-center">
                            <td class="text-h7">燈號</td>
                            <td v-for="city in cities" :key="`${city}-lights`">
                                <div class="rounded-circle mx-auto h-[24px] w-[24px]"
                                :style="get_warning_color(timeGroup.data[city]?.warning_level)"></div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>
            <div class="d-flex ml-5 mt-4 justify-space-between">
                <!-- table note -->
                <div class="d-flex flex-column gap-4">
                    <div>
                        <p>註:</p>
                        <span>本表為依據暴潮模式之預報值，實際發生可能會有差異，請注意。</span>
                    </div>
                    <div>
                        <div v-for="note in table_note" :key="note.text" class="d-flex align-center mb-1">
                            <div 
                                class="rounded-circle me-2 w-[16px] h-[16px]"
                                :style="{
                                    'background-color': note.bg_color,
                                    'border': `1px solid ${note.b_color}`,
                                    'margin-bottom': `${note.b_color ? '0' : '8px'}`
                                }"
                                
                            >{{ note.content }}</div>
                            <span>{{ note.text }}</span>
                        </div>
                    </div>
                </div>
                <!-- table time -->
                <div class="d-flex align-self-end">發布時間: {{ send_time_msg }}</div>
                <!-- table img -->
                <div class="d-flex align-self-center w-[200px] h-[100px] justify-content-right">
                    <img src="../assets/img/ROC_Central_Weather.png" alt="">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { use_light_store } from '../stores/light.js'
import { use_uvp_data_store } from '../stores/UVP-data.js'
import { tide_level_store } from '../stores/tide-level.js'
import { sanitize_html } from '../utils/sanitize-html.js'
import { 
    time_format_chDate,
    time_format_utc,
    format_hours,
    format_date_range
} from '../utils/tool-box.js'

const light_store = use_light_store()
const uvp_data_store = use_uvp_data_store()
const tide_level_info_store = tide_level_store()

// 颱風名稱下拉選單
const Ty_info = computed(() => uvp_data_store.Ty_info)
const selected_ty_no = ref('')
// 初始時間下拉選單（依所選颱風動態載入）
const selected_initial_time = ref('')
const initial_time_options = ref([])

onMounted(async () => {
    // 若尚未載入過颱風清單（例如未先經過颱風查詢頁面），才主動載入
    if (Ty_info.value.length === 0) {
        await uvp_data_store.get_typhoon_name_data()
    }

    // 預設帶入最新一筆颱風（清單第一筆）
    if (!selected_ty_no.value && Ty_info.value.length > 0) {
        selected_ty_no.value = Ty_info.value[0].value
    }
})

watch(selected_ty_no, async (ty_no) => {
    selected_initial_time.value = ''
    initial_time_options.value = []
    if (!ty_no) return

    const selected_typhoon = Ty_info.value.find(item => item.value === ty_no)
    const { status, data } = await uvp_data_store.post_typhoon_category_data({
        TyNo: ty_no,
        TyChtName: selected_typhoon?.TyChtName || '',
        TyEngName: selected_typhoon?.TyEngName || ''
    })

    if (status !== 'success' || !data || data.length === 0) return

    // 取得該颱風不重複的初始時間清單
    const unique_times = [...new Set(data.map(item => item.InitialTime))]
    initial_time_options.value = unique_times.map(time => ({
        title: time_format_utc(time),
        value: time
    }))

    // 預設帶入與目前設定小時相符的初始時間，找不到則帶入第一筆
    const default_hour = tide_level_info_store.hour?.time
    const matched_time = data.find(item => {
        const time = new Date(item.InitialTime)
        return String(time.getUTCHours()).padStart(2, '0') === default_hour
    })?.InitialTime
    selected_initial_time.value = matched_time ?? unique_times[0]
})

const on_draw = async () => {
    if (!selected_ty_no.value || !selected_initial_time.value) return

    light_store.set_is_loading(true)

    const { success, data } = await uvp_data_store.post_typhoon_data({
        TyNo: selected_ty_no.value,
        InitialTime: selected_initial_time.value,
        limit: 10
    })

    if (!success || !data || data.length === 0) {
        light_store.set_is_loading(false)
        return
    }

    // 同一颱風/初始時間可能有多個路徑類別，需一併帶入所有對應的參數 ID
    const matched_ids = data
        .filter(item => item.TyNo === selected_ty_no.value && item.InitialTime === selected_initial_time.value)
        .map(item => item.id)

    if (matched_ids.length === 0) {
        light_store.set_is_loading(false)
        return
    }

    tide_level_info_store.set_parameter_id(matched_ids)

    // 「繪製」僅為預覽既有結果，改用 get_county_tide_warnings_result 直接讀取已儲存資料，不觸發重新計算
    const result = await light_store.get_county_tide_warnings_result({
        parameters_id: tide_level_info_store.parameter_id[0]
    })

    light_store.set_is_loading(false)

    if (result.success) {
        light_store.set_has_light_send(true)
    }
}

const table_msg = ref('')
const send_time_msg = ref('')
const first_time_range = ref('')
const table_note = ref([
    { text: '潮位預報最高水位超過潮位警戒值', bg_color: 'salmon', b_color: 'coral'},
    { text: '潮位預報最高水位超過潮位注意值', bg_color: 'gold', b_color: 'goldenrod'},
    { text: '潮位預報最高水位未超過潮位注意值', bg_color: 'darkgray', b_color: 'gray'},
    { text: '無資料', content: '—', bg_color: 'transparent', b_color: null}
])

// 燈號數據
const light_list = computed(() => light_store.light_list)
// 確定有按下傳送水位按鈕
const has_light_send = computed(() => light_store.has_light_send)

// 從 API 數據中提取所有城市名稱
const cities = computed(() => {
    const citySet = new Set()
    light_list.value.forEach(item => {
        citySet.add(item.city)
    })
    return Array.from(citySet).sort()
})

const headers = computed(() => {
    let light_header = [
        { title: '預報時段', value: 'time', width: '120px' },
        { title: '縣市', value: 'city', width: '100px' }
    ]
    light_list.value.forEach(item => {
        light_header.push({ title: item.city, value: item.city, width: '100px' })
    })
    return light_header
})

// 將數據按時間範圍歸納
const grouped_data = computed(() => {
    const time_map = new Map()
    
    light_list.value.forEach(city_item => {
        city_item.data.forEach(data_item => {
            const timeKey = `${data_item.time_range[0]}_${data_item.time_range[1]}`
            const start_date = time_format_chDate(data_item.time_range[0])
            const end_date = time_format_chDate(data_item.time_range[1])
            const time_label = `${start_date}<br/>至<br/> ${end_date}`
            
            // 記錄第一個遇到的時間範圍
            if (!first_time_range.value) {
                first_time_range.value = data_item.time_range[0]
            }

            if (!time_map.has(timeKey)) {
                time_map.set(timeKey, {
                    time: time_label,
                    data: {}
                })
            }

            const group = time_map.get(timeKey)
            group.data[city_item.city] = {
                warning_level: data_item.warning_level,
                max_value: data_item.max_value,
                max_time: format_hours(data_item.max_time),
                max_station: data_item.max_station
            }
        })
    })

    // 設定表格說明文字
    if (first_time_range.value) {
        table_msg.value = formatSimpleDateRange(first_time_range.value)
    }
    
    return Array.from(time_map.values())
})

// 格式化簡單的日期範圍文字
function formatSimpleDateRange(time) {
    const msg = format_date_range(time)
    const msg_lunar = format_date_range(time, true).replace(/^\d+年/, '')
    send_time_msg.value = msg.split('至')[0] // 發布時間只取開始日期

    return `影響期間(${msg}，農曆${msg_lunar})各縣市最大暴潮發生時段及暴潮預警燈號如下表。`
}

// 警戒等級顏色
function get_warning_color(level) {
    switch(level) {
        case 'gray': 
            return { 'background-color': 'darkgray', 'border': '1px solid gray' }
        case 'yellow': 
            return { 'background-color': 'gold', 'border': '1px solid goldenrod' }
        case 'orange': 
            return { 'background-color': 'salmon', 'border': '1px solid coral' }
        case 'red': 
            return { 'background-color': 'red', 'border': '1px solid darkred' }
        default: 
            return { 'background-color': 'darkgray', 'border': '1px solid gray' }
    }
}
</script>

<style scoped>
table th, table td {
    border: 1px solid #000 !important;
    font-size: 16px !important;
}
table th:not(:first-child, :nth-child(2)) {
    min-width: 50px !important;
    max-width: 50px !important;
}
</style>
