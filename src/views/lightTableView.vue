<template>
    <div>
        <typhoon-table :store_fun="use_light_store"/>
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
                            <td :rowspan="2" v-html="timeGroup.time" :style="{maxWidth: '50px'}"></td>
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
import { ref, computed } from 'vue'
import { use_light_store } from '../stores/light.js'
import { 
    time_format_chDate,
    format_hours,
    format_date_range
} from '../utils/tool-box.js'

import typhoonTable from './tide-level/typhoonTable.vue'

const light_store = use_light_store()

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
