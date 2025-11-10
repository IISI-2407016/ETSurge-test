<template>
    <div class="d-flex flex-column align-center gap-4">
        <!-- 颱風表格 -->
        <typhoon-table :store_fun="tide_level_store"/>

        <!-- d3 -->
        <water-level-analysis v-if="has_chart" :parameter_id="parameter_id"/>
        <!-- 功能表 -->
        <functions v-if="has_chart"/>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { tide_level_store } from '../../stores/tide-level.js';

    import functions from './functions.vue';
    import waterLevelAnalysis from './waterLevelAnalysis.vue';
    import typhoonTable from './typhoonTable.vue';
    
    const tide_level_info_store = tide_level_store();

    const has_chart = computed(() => tide_level_info_store.has_chart);
    const parameter_id = computed(() => tide_level_info_store.parameter_id);

</script>

