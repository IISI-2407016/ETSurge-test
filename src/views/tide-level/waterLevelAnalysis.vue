<template>
    <div>
        <v-row class="justify-center">
            <!-- 測站載入進度 -->
            <v-col v-if="getLoadingCount() > 0" cols="12" md="12" class="mb-3">
                <div class="d-flex align-center justify-center gap-3 fixed w-100 z-1">
                    <v-chip 
                        :color="getLoadingCount() > 0 ? 'warning' : 'success'" 
                        size="small"
                    >
                        {{ getLoadingCount() }} 個測站載入中...
                    </v-chip>
                </div>
            </v-col>
            <!-- @TODO 之後感覺可以合併成一個chart元件-->
            <!-- twelve hour chart -->
            <v-col cols="12" md="12" class="p-0">
                <v-row>
                    <v-col
                        v-for="(stid, index) in stid_id_list"
                        :key="'twelve_' + stid"
                        class="d-flex justify-center"
                        cols="12"
                        sm="6"
                        md="6"
                        lg="4"
                        xl="4"
                    >
                        <twelve-hour-chart 
                            :stop_draw="stop_drawing" 
                            :model_time="model_time" 
                            :station_list="station_list" 
                            :web_chart_data="stid_list[stid]" 
                            :info="{
                                lan: 'c',
                                div_name: `twelve-chart-${stid}`,
                                stid: stid,
                            }"
                            :station_name="station_list[index].StationName"
                            v-model:is_loading="is_loading[`twelve_chart_${stid}`]"
                            @loading-completed="handleLoadingCompleted"
                            @click="draw_six_chart(station_list[index])"
                        />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
        <!-- 彈跳視窗 -->
        <v-dialog
            v-model="show_chart"
            max-width="1000"
            min-height="200"
            persistent
            >
            <v-card>
                <!-- 測站標題 -->
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
                    >{{ six_hour_chart_info.station_name }}</h5>
                    <div class="absolute top-0 right-0">
                        <v-btn
                            icon="mdi-close"
                            class="border-0"
                            variant="text"
                            color="white"
                            @click="show_chart = false"
                        ></v-btn>
                    </div>
                </div>
                <!-- 測站圖表內容 -->
                <v-card-text class="mt-8">
                    <v-col>
                        <six-hour-chart 
                            :chart_info="six_hour_chart_info"
                            :web_chart_data="six_hour_list[six_hour_chart_info.stid]"
                            :stop_draw="stop_drawing" 
                            v-model:is_loading="is_loading[`six_chart_${six_hour_chart_info.stid}`]"
                            @loading-completed="handleLoadingCompleted"
                        />
                    </v-col>
                    <v-col class="text-center">
                        <v-btn color="green" @click="form_btn_click">{{ form_btn_text }}</v-btn>
                    </v-col>
                    <v-col v-if="form_btn">
                        <six-hour-table 
                            :model_time="model_time"
                            :table_data="six_hour_list[six_hour_chart_info.stid]"
                        />
                    </v-col>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import { computed, ref, onMounted, reactive, watch } from 'vue';
    import { tide_level_store } from '../../stores/tide-level.js';
    import { use_uvp_data_store } from '../../stores/UVP-data.js';
    import { sliceArray } from '../../utils/tool-box.js';

    import twelveHourChart from '../twelveHourChart.vue';
    import sixHourChart from '../sixHourChart.vue';
    import sixHourTable from '../sixHourTable.vue';

    const props = defineProps({
        parameter_id: Number
    });

    const uvp_data_store = use_uvp_data_store();
    const tide_level_info_store = tide_level_store();

    // 表格
    const form_btn = ref(false);

    // 用來控制是否停止繪製圖表
    const stop_drawing = ref(false)
    const show_chart = ref(false);

    const model_name = ref(uvp_data_store.uvp_data.ModelName);
    const six_hour_chart_info = ref({});

    // 圖表loading - 使用 reactive 物件來管理每個測站的載入狀態
    const is_loading = reactive({});
    const stop_count = ref(0);

    // 載入完成處理函數
    const handleLoadingCompleted = (stid) => {
        console.log(`Chart loading completed for station: ${stid}`);
    };

    // 控制每6分鐘時間區間表格顯示
    const form_btn_click = () => {
        form_btn.value = !form_btn.value;
    };

    // 計算目前的模式時間
    const model_time = computed(() => {
        const date_formatted = new Date(uvp_data_store.uvp_data.InitialTime).toISOString().substring(0, 10);
        return date_formatted + " " + uvp_data_store.hour.time + ":00";
    })

    const form_btn_text = computed(() => form_btn.value ? '隱藏表格' : '顯示表格');

    // station_list call API 獲取的測站列表
    const station_list = computed(() => {
        return tide_level_info_store.station_list;
    });
    // 獲取的測站列表 ID 陣列
    const stid_id_list = computed(() => {
        return tide_level_info_store.stid_id_list;
    });
    // 取得各站圖表資料
    const stid_list = computed(() => {
        return tide_level_info_store.stid_list;
    });
    // 取得六小時圖表資料
    const six_hour_list = computed(() => {
        return tide_level_info_store.six_hour_list;
    });

    // 監聽 stop_drawing 變化，當為 true 時停止所有載入
    watch(() => stop_drawing.value, (newVal) => {
        if (newVal) {
            // 強制停止所有測站的載入狀態
            Object.keys(is_loading).forEach(key => {
                is_loading[key] = false;
            });
            console.log('All loading stopped due to stop_drawing');
        }
    });
    watch(() => show_chart.value, (newVal) => {
        if (!newVal) {
            form_btn.value = false;
        }
    });

    onMounted(async () => {
        await draw_twelve_chart()
    });

    // 計算目前載入中的測站數量
    const getLoadingCount = () => {
        return Object.values(is_loading).filter(loading => loading).length;
    };

    // 畫12小時圖
    const draw_twelve_chart = async() => {
        tide_level_info_store.set_empty_fcst_water_level_alert_dialog(false);

        await tide_level_info_store.get_tide_station_info();

        stop_count.value += 1;
        stop_count.value = stop_count.value;
        let slice_station = sliceArray(stid_id_list.value);

        // 初始化每個測站的載入狀態為 true
        slice_station.flat().forEach(stid => {
            is_loading[`twelve_chart_${stid}`] = true;
        });

        for (let index in slice_station) {
            if (stop_drawing.value) break; // 如果 stop_drawing 為 true，停止載入
            await get_web_chart_data(slice_station[index], 'twelve');
            await get_web_chart_data(slice_station[index], 'six');
            // if (this.stop_count == stop_count) {
            //     this.$nextTick(function() {
            //         slice_station[index].forEach(stid => {
            //             this.$set(this.is_small_chart_loading,`smallchart_${stid}`, false);
            //         });
            //     });
            // }
        }
    };

    // 顯示六小時圖表
    const draw_six_chart = async (stid) => {
        // 如果正在載入，則不進行任何操作
        if(is_loading[`twelve_chart_${stid.StationID}`]) {
            return;
        }
        show_chart.value = true;
        six_hour_chart_info.value = {
            stid: stid.StationID,
            station_name: stid.StationName,
            model_value: model_name.value,
            model_time: model_time.value,
        };
        const loadingKey = `six_chart_${stid.StationID}`;

        // 檢查是否已有數據，沒有則載入
        if (!six_hour_list.value[stid.StationID] || Object.keys(six_hour_list.value[stid.StationID]).length === 0) {
            is_loading[loadingKey] = true;
            try {
                await get_web_chart_data([stid.StationID], 'six');
            } catch (error) {
                console.error('載入六小時圖表數據失敗:', error);
            } finally {
                is_loading[loadingKey] = false;
            }
        } else {
            // 已有數據，直接設置為不載入
            is_loading[loadingKey] = false;
        }
    }

    const get_web_chart_data = async(stations, type) => {
        // let inputs = {
        //     parameters_id: props.parameter_id,
        //     station_list: stations,
        //     freq: type === 'twelve' ? "hour" : "6minute",
        // };
        props.parameter_id.forEach(async (id) => {
            const inputs = {
                parameters_id: id,
                station_list: stations,
                freq: type === 'twelve' ? "hour" : "6minute",
            }
            tide_level_info_store.save_chart_list(inputs)
            await tide_level_info_store.post_load_all_data(inputs, type);
        })

    };
</script>