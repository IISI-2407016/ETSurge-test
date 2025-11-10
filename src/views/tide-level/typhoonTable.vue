<template>
    <div>
        <v-sheet 
            border 
            rounded 
            elevation="1" 
            class="pb-2 table-container"
            :class="{ 'collapsed': has_collapsed }"
        >
            <v-data-table 
                v-show="!has_collapsed"
                :headers="headers"
                :items="uvp_data_list"
                hide-default-footer
                hover
                class="data-table"
            >
                <template v-slot:item="{ item }">
                    <tr class="text-no-wrap">
                        <td>{{ item.update_time }}</td>
                        <td>{{ item.typhoon_name }}</td>
                        <td>{{ item.initial_time }}</td>
                        <td>{{ item.category }}</td>
                        <td class="text-center">{{ item.radius }}</td>
                        <td class="text-center">{{ item.pressure_range }}</td>
                        <td class="text-center">{{ item.translationSpeed_range }}</td>
                        <td class="text-center">{{ item.cardinalDirection }}</td>
                        <td class="text-center">
                            <v-btn 
                                color="primary" 
                                size="small" 
                                :disabled="!item.action"
                                @click="show_chart(item)">
                                預覽
                            </v-btn>
                        </td>
                    </tr>
                </template>
            </v-data-table>
            
            <div class="d-flex flex-column align-center justify-center mt-2">
                <v-icon v-if="has_collapsed" icon="mdi-table-off" class="mb-2" size="x-large"></v-icon>
                <v-btn
                    :icon="has_collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'"
                    :title="has_collapsed ? '展開表格' : '收合表格'"
                    color="primary"
                    density="comfortable"
                    size="small"
                    variant="text"
                    @click="toggle_collapse"
                >
                </v-btn>
            </div>
        </v-sheet>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue';
    import { storeToRefs } from "pinia";
    import { use_uvp_data_store } from '../../stores/UVP-data.js';
    import { tide_level_store } from '../../stores/tide-level.js';
    import { time_format } from '../../utils/tool-box.js';

    // const emit = defineEmits(['change-tab']);
    const props = defineProps({
        store_fun: Function
    })

    const uvp_data_store = use_uvp_data_store();
    const tide_level_info_store = tide_level_store();
    const [collapsed_store] = [props.store_fun()]
    const { has_collapsed } = storeToRefs(collapsed_store);

    // const has_collapsed = computed(() => [props.store_fun].has_collapsed);
    
    const uvp_data_list = computed(() => {
        if (
            !uvp_data_store.tide_list || 
            uvp_data_store.tide_list.length === 0
        ) {
            return [];
        }

        // 先按時間排序（最新的在前面）
        const sortedData = [...uvp_data_store.tide_list].sort((a, b) => {
            const timeA = new Date(a.ModifyTime || a.InitialTime);
            const timeB = new Date(b.ModifyTime || b.InitialTime);
            return timeB - timeA; // 降序排列（最新的在前）
        });

        // 取前五筆資料與時間格式化
        return sortedData
            .slice(0, 5)
            .map((item) => {
                return {
                    id: item.id,
                    update_time: time_format(item.ModifyTime),
                    typhoon_name: `${item.TyNo}-${item.TyChtName}`,
                    initial_time: time_format(item.InitialTime),
                    category: item.Category,
                    radius: item.Radius,
                    pressure_range: item.Pressure_range?.length > 1 
                        ? item.Pressure_range.join(' ~ ') 
                        : item.Pressure_range?.[0] || '--',
                    translationSpeed_range: item.TranslationSpeed_range?.length > 1 
                        ? item.TranslationSpeed_range.join(' ~ ') 
                        : item.TranslationSpeed_range?.[0] || '--',
                    cardinalDirection: item.CardinalDirection,
                    action: item.IsFileReady
                }
            });
    })
    
    const headers = ref([
        { title: '更新時間(地方時)', key: 'update_time', align: 'start', sortable: false },
        { title: '颱風名稱', key: 'typhoon_name', align: 'start', sortable: false },
        { title: '初始時間(UTC)', key: 'initial_time', align: 'start', sortable: false },
        { title: '路徑種類', key: 'category', align: 'start', sortable: false },
        { title: '有效半徑(km)', key: 'radius', align: 'center', sortable: false },
        { title: '中心氣壓(hPa)', key: 'pressure_range', align: 'center', sortable: false },
        { title: '移速(km/h)', key: 'translationSpeed_range', align: 'center', sortable: false },
        { title: '移向', key: 'cardinalDirection', align: 'center', sortable: false },
        { title: '動作', key: 'action', align: 'center', sortable: false }
    ]);

    const toggle_collapse = () => {
        collapsed_store.set_has_collapsed(!has_collapsed.value)
    };

    const show_chart = (item) => {
        tide_level_info_store.set_has_chart(true);
        collapsed_store.set_has_collapsed(!has_collapsed.value)
        tide_level_info_store.set_parameter_id(item.id);
    };
</script>

<style scoped>
    .table-container {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        width: 90%;
        max-width: 1200px;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        transform-origin: center top;
    }

    .table-container.collapsed {
        position: fixed;
        top: 80px;
        right: 20px;
        left: auto;
        transform: translateX(0) scale(0.8);
        width: auto;
        min-width: 100px;
        max-width: 300px;
    }

    .data-table {
        transition: opacity 0.3s ease;
    }
</style>