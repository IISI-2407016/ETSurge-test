<template>
    <loading :is_loading="is_loading" />
    <div class="d-flex flex-column align-center gap-4">
        <!-- 颱風表格 -->
        <typhoon-table :store_fun="tide_level_store"/>

        <!-- d3 -->
        <water-level-analysis v-if="has_chart" :parameter_id="parameter_id"/>
        <!-- 功能表 -->
        <functions v-if="has_chart"/>
        <!-- 警告視窗，@TODO: 之後有需要做元件嗎? -->
        <v-dialog
            v-model="show_alert_dialog"
            max-width="300"
            persistent="false"
        >
            <v-card class="d-flex">
                <v-alert
                    border="top"
                    type="warning"
                    variant=""
                    prominent
                    >
                    此時段無暴潮模式
                    <v-btn
                        icon="mdi-close"
                        class="ml-8 mb-1"
                        variant=""
                        color="black"
                        size="small"
                        @click="close_alert_dialog"
                    ></v-btn>
                </v-alert>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { tide_level_store } from '../../stores/tide-level.js';
    import { use_light_store } from '../../stores/light.js';
    
    import loading from '@/components/loading.vue';
    import functions from './functions.vue';
    import waterLevelAnalysis from './waterLevelAnalysis.vue';
    import typhoonTable from './typhoonTable.vue';
    
    const tide_level_info_store = tide_level_store();
    const light_store = use_light_store();

    const is_loading = computed(() => light_store.is_loading);

    const has_chart = computed(() => tide_level_info_store.has_chart);
    const parameter_id = computed(() => tide_level_info_store.parameter_id);
    const show_alert_dialog = computed(() => tide_level_info_store.empty_fcst_water_level_alert_dialog);

    const close_alert_dialog = () => {
        tide_level_info_store.set_empty_fcst_water_level_alert_dialog(false);
    }
</script>
