<template>
    <div>
        <item-legend chart_type="twelve_hour_chart" />
        <!-- @TODO -->
        <!-- twelve hour chart -->
        <!-- 彈跳視窗 -->
            <!-- 裡面出現 six hour chart -->
        
        <!-- 此時段無暴潮模式 -->
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import itemLegend from '../../components/itemLegend.vue';

    // 判斷圖表的顯示
    const action_status = ref(false)

    // 當用戶點擊「展示圖檔」按鈕時設為 false
    // 當模式時間改變時設為 true
    // 用來控制是否停止繪製圖表
    const stop_drawing = ref(false)

    // 這邊接store的模式時間
    const model_time = ref('2025-10-10 00:00')

    // station_list call API 獲取的測站列表
    const station_list = ref()

    // 取得各站圖表資料 call API
    const web_chart_data = ref()

    // 圖表loading
    const is_small_chart_loading = {}
</script>