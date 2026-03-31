<template>
    <v-data-table
        :headers="headers"
        :items="items_data"
        hide-default-footer
        fixed-header
    >
        <template #item.category ="{ item }">
            <div class="category-cell">
                <span 
                    class="key-dot" 
                    :style="{ backgroundColor: item.color }"
                ></span>
                {{ item.text }}
            </div>
        </template>
    </v-data-table>
</template>
<script setup>
    import { computed } from 'vue';
    import itemData from '@/data/item_data.js'

    const props = defineProps({
        model_time: String,
        table_data: Object
    });

    const { six_hour_table_item_data } = itemData;
    const start_time = new Date(props.model_time);

    // 生成3天期間，每6分鐘的日期時間欄位
    const generate_headers = () => {
        const headers = [
            {
                title: '項目/時間',
                key: 'category',
                align: 'start',
                sortable: false,
                fixed: true,
                width: 200,
                headerProps: {
                    class: 'headcol_th'
                },
                cellProps: {
                    class: 'headcol_th'
                },
            }
        ];

        start_time.setHours(start_time.getHours() - 6);

        const total_minutes = 3 * 24 * 60; // 3天的總分鐘數
        const interval_minutes = 6; // 每6分鐘間隔
        
        // 72小時的時間欄位
        for (let minutes = 0; minutes < total_minutes; minutes += interval_minutes) {
            const date = new Date(start_time);
            date.setMinutes(date.getMinutes() + minutes);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            
            const timeStr = `${year}/${month}/${day} ${hour}:${minute}`;
            
            const key = `time_${minutes}`;
            headers.push({
                title: timeStr,
                key: key,
                align: 'center',
                sortable: false
            });
        }
        
        return headers;
    };

    // 從 table_data 提取真實數據
    const generateRealData = (itemKey) => {
        const data = {};
        const total_minutes = 3 * 24 * 60;
        const interval_minutes = 6;
        
        // 如果沒有 table_data，返回空數據
        if (!props.table_data) {
            return data;
        }
        
        // 根據 itemKey 映射到 table_data 的對應欄位
        const dataKeyMapping = {
            'obs_water_level': 'obs_water_level',
            'fcst_surge_diff': 'fcst_surge_diff',
            'surge_model_mod': 'surge_model_mod',
            'harmonic': 'harmonic',
            'surge_model': 'surge_model',
            'getWarn': 'getWarn',
            'getAtte': 'getAtte'
        };
        
        const dataKey = dataKeyMapping[itemKey];
        
        // 如果沒有對應的 dataKey 或 table_data 中沒有這個欄位，返回 '--'
        if (!dataKey || !props.table_data[dataKey]) {
            for (let minutes = 0; minutes < total_minutes; minutes += interval_minutes) {
                const key = `time_${minutes}`;
                data[key] = '--';
            }
            return data;
        }
        const tableDataItem = props.table_data[dataKey];
        
        // 處理固定數值（getWarn, getAtte）
        if (typeof tableDataItem === 'number') {
            // 對所有時間點使用相同的固定值
            for (let minutes = 0; minutes < total_minutes; minutes += interval_minutes) {
                const key = `time_${minutes}`;
                data[key] = tableDataItem.toString().split('.')[1]?.length > 3 
                    ? tableDataItem.toFixed(3) 
                    : tableDataItem.toString();
            }
            return data;
        }
        
        // 處理時間序列數據（obs_water_level, fcst_water_level 等）
        if (Array.isArray(tableDataItem)) {
            // 建立時間映射表
            const timeValueMap = {};
            tableDataItem.forEach(item => {
                if (item.time && item.val !== undefined) {
                    // 將時間格式統一為時間戳
                    const timeKey = (Date.parse(item.time)).valueOf();
                    const val = item.val.toString().split('.')[1]?.length > 3 
                        ? item.val.toFixed(3) 
                        : item.val.toString();
                    timeValueMap[timeKey] = val;
                }
            });
            
            // 為每個時間點尋找對應的數值
            for (let minutes = 0; minutes < total_minutes; minutes += interval_minutes) {
                const currentTime = new Date(start_time);
                currentTime.setMinutes(currentTime.getMinutes() + minutes);
                
                const key = `time_${minutes}`;
                
                // 直接查找對應的時間戳
                const timeKey = currentTime.getTime();
                const item_val = timeValueMap[timeKey];
                
                data[key] = item_val || '--';
                
                // Object.keys(timeValueMap).forEach(timeKey => {
                //     const timeDiff = Math.abs(currentTime.getTime() - parseInt(timeKey));
                //     // 如果時間差在30分鐘內，認為是匹配的
                //     if (timeDiff < 30 * 60 * 1000 && timeDiff < minTimeDiff) {
                //         minTimeDiff = timeDiff;
                //         closestValue = timeValueMap[timeKey];
                //     }
                // });
                
                // data[key] = closestValue !== null ? parseFloat(closestValue).toFixed(2) : '--';
            }
        } else {
            // 非預期的數據格式，返回 '--'
            for (let minutes = 0; minutes < total_minutes; minutes += interval_minutes) {
                const key = `time_${minutes}`;
                data[key] = '--';
            }
        }
        
        return data;
    };

    const headers = computed(() => generate_headers());
    const items_data = computed(() => {
        const items = [];
        
        for (let itemKey in six_hour_table_item_data) {
            const item = six_hour_table_item_data[itemKey];
            const realData = generateRealData(itemKey);
            
            items.push({
                category: item.text,
                text: item.text,
                color: item.color,
                itemKey: itemKey,
                ...realData
            });
        }
        
        return items;
    });
</script>

<style scoped lang="scss">
    .category-cell {
        padding: 8px;
        white-space: nowrap;
        min-width: 180px;
    }
    :deep(.headcol_th) {
        background-color: #ececec !important;
    }
</style>