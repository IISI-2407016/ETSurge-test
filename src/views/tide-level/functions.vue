<template>
    <div class="fixed bottom-5">
        <v-sheet 
            border rounded elevation="1" 
            class="pa-3 px-10 z-10 d-flex justify-center"
        >
            <v-btn
                v-for="(func, index) in function_list"
                :key="index"
                class="mx-3"
                color="secondary"
                @click="btn_action(func.action)"
            >
                {{ func.name }}
            </v-btn>
        </v-sheet>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import { use_app_store } from '../../stores/use-app.js'
    import { use_light_store } from '../../stores/light.js'
    import { tide_level_store } from '../../stores/tide-level.js';

    const app_store = use_app_store();
    const light_store = use_light_store();
    const tide_level_info_store = tide_level_store();

    const function_list = ref([
        {name: "傳送水位", action: "send_water_level"},
        {name: "傳送颱風期間圖檔", action: "send_typhoon_period_chart"},
        {name: "傳送颱風期間圖檔(不包含表格)", action: "send_typhoon_period_chart_no_table"},
        {name: "傳送非颱風期間圖檔", action: "send_non_typhoon_period_chart"}
    ]);

    const parameters_id = computed(() => tide_level_info_store.chart_list.parameters_id);

    const btn_action = async(action) => {
        switch(action) {
            case "send_water_level":
                const send_data = {
                    parameters_id: parameters_id.value,
                    data_source: "surge_model_mod" // 預設 @TODO 之後會放在load data 裡面
                }
                light_store.set_is_loading(true);
                await light_store.post_county_tide_warnings(send_data);
                light_store.set_is_loading(false);
                light_store.set_has_light_send(true);
                app_store.change_tab('light');
                console.log("傳送水位");
                break;
            case "send_typhoon_period_chart":
                console.log("傳送颱風期間圖檔");
                break;
            case "send_typhoon_period_chart_no_table":
                console.log("傳送颱風期間圖檔(不包含表格)");
                break;
            case "send_non_typhoon_period_chart":
                console.log("傳送非颱風期間圖檔");
                break;
            default:
                console.log("未知的動作");
        }
    }
</script>