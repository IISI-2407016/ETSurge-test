<template>
    <div>
        <div
            v-for="(item, num) in items[chart_type]"
            :key="num"
            class="float-left ml-4"
        >
            <span class="key-dot" :style="{ background: item.color }" />{{ item.text }}
        </div>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue'
    import itemData from '@/data/item_data.js'

    const props = defineProps({
        chart_type: String
    });

    const { six_hour_table_item_data, twelve_hour_chart } = itemData;

    const six_hour_chart_array = computed(() => {
        return Object.values(six_hour_table_item_data);
    });
    

    const items = ref({
        twelve_hour_chart: twelve_hour_chart,
        six_hour_chart: six_hour_chart_array.value
    })
</script>
