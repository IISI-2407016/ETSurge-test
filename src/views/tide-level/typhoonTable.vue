<template>
    <div>
        <v-sheet 
            border 
            rounded 
            elevation="1" 
            class="pb-2 table-container"
            :class="{ 'collapsed': has_collapsed }"
        >
            <div v-show="!has_collapsed" ref="tool_bar">
                <!-- 搜尋卡片 -->
                <search-card @on-resize="onResize"/>
                <v-divider/>
            </div>
            <div v-resize="onResize">
                <v-data-table
                    :headers="headers"
                    :items="!has_collapsed ? uvp_data_list : selected_preview_row"
                    hide-default-footer
                    hover
                    fixed-header
                    :height="table_height"
                    class="data-table"
                >
                    <template v-slot:item="{ item }">
                        <tr class="text-no-wrap">
                            <td>{{ item.update_time }}</td>
                            <td>{{ item.typhoon_name }}</td>
                            <td>{{ item.initial_time }}</td>
                            <td>{{ item.category }}</td>
                            <td>
                                <div
                                    v-for="i in item.radius_list.length"
                                    :key="'r-' + i"
                                    class="align-left"
                                >
                                    <span>{{ item.radius_list[i-1] }}</span>
                                    <span v-if="i < item.radius_list.length">,</span>
                                </div>
                            </td>
                            <td>
                                <div
                                    v-for="i in Math.max(item.pressure_min_list.length, item.pressure_max_list.length)"
                                    :key="'p-' + i"
                                    class="pair-row"
                                >
                                    <span>{{ item.pressure_min_list[i-1] }}</span>
                                    <span class="p">~</span>
                                    <span>{{ item.pressure_max_list[i-1] }}</span>
                                </div>
                            </td>
                            <td>
                                <div
                                    v-for="i in Math.max(item.translationSpeed_min_list.length, item.translationSpeed_max_list.length)"
                                    :key="'t-' + i"
                                    class="pair-row"
                                >
                                    <span>{{ item.translationSpeed_min_list[i-1] }}</span>
                                    <span>~</span>
                                    <span>{{ item.translationSpeed_max_list[i-1] }}</span>
                                </div>
                            </td>
                            <td>
                                <div
                                    v-for="i in item.cardinalDirection_list.length"
                                    :key="'c-' + i"
                                >
                                    <span>{{ item.cardinalDirection_list[i-1] }}</span>
                                    <span v-if="i < item.cardinalDirection_list.length">,</span>
                                </div>
                            </td>
                            <td v-if="!item.action || !is_previewed(item.key)" class="text-center">
                                <v-btn
                                    color="primary"
                                    :disabled="!item.action"
                                    @click="show_chart(item)"
                                >
                                    預覽
                                </v-btn>
                            </td>

                            <td v-else class="text-center">
                                <!-- 使用按鈕組將主按鈕和箭頭按鈕綁在一起 -->
                                <v-btn-group divided density="compact" color="primary">
                                    
                                    <!-- 1. 左側：主按鈕（按下直接觸發目前選中的功能） -->
                                    <v-btn @click="handleMainAction(item)">
                                        {{ currentAction.text }}
                                    </v-btn>
        
                                    <!-- 2. 右側：下拉箭頭（按下只負責打開選單，不觸發功能） -->
                                    <v-menu activator>
                                        <template #activator="{ props }">
                                            <v-btn v-bind="props" icon="mdi-chevron-down" width="25"></v-btn>
                                        </template>
        
                                        <!-- 下拉選單內容 -->
                                        <v-list density="compact" class="align-center">
                                            <v-list-item
                                                v-for="(action, index) in function_list"
                                                :key="index"
                                                :value="action.value"
                                                :title="action.text"
                                                :subtitle="action.title"
                                                @click="currentAction = action;"
                                            />
                                        </v-list>
                                    </v-menu>
                                </v-btn-group>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
            </div>
            
            <div class="d-flex flex-column align-center justify-center mt-2">
                <!-- <v-icon v-if="has_collapsed" icon="mdi-table-off" class="mb-2" size="x-large"></v-icon> -->
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
        <message-dialog 
            :model_value="message_valid"
            :message="message"
            :title="'傳送確認'"
            @update:model_value="message_valid = $event"
            @confirm="send_data"
        />
    </div>
</template>

<script setup>
    import { computed, ref, nextTick } from 'vue';
    import { storeToRefs } from "pinia";
    import { use_uvp_data_store } from '../../stores/UVP-data.js';
    import { tide_level_store } from '../../stores/tide-level.js';
    import { time_format, time_format_utc } from '../../utils/tool-box.js';
    import { use_app_store } from '../../stores/use-app.js';
    import { use_user_store } from '../../stores/user.js'
    import { display_directions } from '../../config/setting.js';
    import searchCard from '@/components/searchCard.vue';
    import messageDialog from '@/components/dialogs/messageDialog.vue';

    const props = defineProps({
        store_fun: Function
    })
    const app_store = use_app_store();
    const user_store = use_user_store();
    const uvp_data_store = use_uvp_data_store();
    const tide_level_info_store = tide_level_store();
    const [collapsed_store] = [props.store_fun()]
    const { has_collapsed } = storeToRefs(collapsed_store);

    const message = ref('')
    const message_valid = ref(false);
    const table_height = ref(0);
    const tool_bar = ref(null);
    const collection_height = ref(200)
    const headers = ref([
        { title: '更新時間(地方時)', key: 'update_time', align: 'center', sortable: true },
        { title: '颱風名稱', key: 'typhoon_name', align: 'center', sortable: false },
        { title: '初始時間(UTC)', key: 'initial_time', align: 'center', sortable: true },
        { title: '路徑種類', key: 'category', align: 'center', sortable: false },
        { title: '有效半徑(km)', key: 'radius', align: 'center', sortable: false },
        { title: '中心氣壓(hPa)', key: 'pressure_range', align: 'center', sortable: false },
        { title: '移速(km/h)', key: 'translationSpeed_range', align: 'center', sortable: false },
        { title: '移向', key: 'cardinalDirection', align: 'center', sortable: false },
        { title: '動作', key: 'action', align: 'center', sortable: true }
    ]);

    const uvp_data_list = computed(() => {
        const list = uvp_data_store.tide_list || [];
        if (list.length === 0) return [];

        // todo 先做相同初始時間與颱風名稱的資料合併
        const groups = list.reduce((acc, item) => {
        const key = `${item.InitialTime}__${item.TyNo}`;

            if (!acc[key]) {
                acc[key] = {
                    id: [], // 用陣列的方式存放
                    key,
                    InitialTime: item.InitialTime,
                    TyNo: item.TyNo,
                    TyChtName: item.TyChtName,
                    details: item.details || [],
                    latest: item,                 // 先放一筆，後續更新成最新
                    categories: new Set(),        // 收集路徑種類
                    rows: []
                };
            }

            acc[key].id.push(item.id);
            acc[key].rows.push(item);
            acc[key].categories.add(item.Category);

            // 2) 組內選最新一筆當代表資料（例如 ModifyTime 最新）
            const tNew = new Date(item.ModifyTime || item.InitialTime).getTime();
            const tOld = new Date(acc[key].latest.ModifyTime || acc[key].latest.InitialTime).getTime();
            if (tNew > tOld) {
                acc[key].latest = item;
            }

            return acc;
        }, {});

        // 取前五筆資料與時間格式化
        const sorted_list = Object.values(groups)
            .sort((a, b) => {
                const timeA = new Date(a.latest.ModifyTime || a.latest.InitialTime).getTime();
                const timeB = new Date(b.latest.ModifyTime || b.latest.InitialTime).getTime();
                return timeB - timeA; // 降序排列（最新的在前）
            })
            .slice(0, 10)
            .map((g) => {
                const item = g.latest;
                return {
                    id: g.id,
                    key: g.key, // 分組 key，用於逐列判斷是否已預覽
                    update_time: time_format(item.ModifyTime),
                    typhoon_name: `${g.TyNo}-${g.TyChtName}`,
                    initial_time: time_format_utc(g.InitialTime),
                    category: Array.from(g.categories).join(', '), // 同組多 category 合併顯示
                    radius_list: g.details.map(d => d.Radius).filter(r => r !== null && r !== undefined) || '--',
                    pressure_min_list: g.details.map(d => d.Pressure_min).filter(r => r !== null && r !== undefined) || '--',
                    pressure_max_list: g.details.map(d => d.Pressure_max).filter(r => r !== null && r !== undefined) || '--',
                    translationSpeed_min_list: g.details.map(d => d.TranslationSpeed_min).filter(r => r !== null && r !== undefined) || '--',
                    translationSpeed_max_list: g.details.map(d => d.TranslationSpeed_max).filter(r => r !== null && r !== undefined) || '--',
                    cardinalDirection_list: g.details.map(d =>
                        display_directions.find(i => i.indexOf(d.CardinalDirection) !== -1)
                        ).filter(r => r !== null && r !== undefined) || '--',
                    action: g.rows.some(r => r.IsFileReady), // 同組任一可預覽就可按
                }
            });

        // 最後一次被按過預覽的列移到第一位，其餘維持原本依時間排序的順序
        const last_previewed_key = tide_level_info_store.last_previewed_key;
        if (last_previewed_key) {
            const previewed_index = sorted_list.findIndex(row => row.key === last_previewed_key);
            if (previewed_index > 0) {
                const [previewed_row] = sorted_list.splice(previewed_index, 1);
                sorted_list.unshift(previewed_row);
            }
        }

        return sorted_list;
    })

    const selected_preview_row = computed(() => {
        const row = uvp_data_list.value.find(r => r.key === tide_level_info_store.last_previewed_key);
        return row ? [row] : [];
    });

    const function_list = computed(() => {
        const user_function_list = user_store.user.groups[0].function_list
        const mapped_function_list = user_function_list.map(fun => {
            return {
                text: fun.Title,
                value: fun.Key,
            }
        })
        return [
            { text: '預覽', value: 'preview'},
            ...mapped_function_list
        ];
    })

    // 監聽視窗大小變化，調整表格高度
    const onResize = () => {
        // 取得元素的高度: 180px 表格以外固定高度
        const tool_bar_height = tool_bar.value ? (tool_bar.value?.offsetHeight === 0 ? 180 : tool_bar.value?.offsetHeight) : 30;
        const auto_height = window.innerHeight > 600 ? 350 : 130;

        table_height.value = window.innerHeight - tool_bar_height - auto_height; // 減去其他元素的高度

        if (uvp_data_list.value.length === 0) table_height.value = 180; // 沒有資料時，表格高度固定
        if (has_collapsed.value) table_height.value = collection_height.value; // 收合表格時，表格高度固定
    };

    const toggle_collapse = async () => {
        const next_collapsed = !has_collapsed.value;
        collapsed_store.set_has_collapsed(!has_collapsed.value);

        if (next_collapsed) {
            table_height.value = collection_height.value; // 收合表格時，表格高度固定
            return;
        }
        await nextTick();
        onResize();
    };

    // 判斷該列（依分組 key）是否已被按過預覽
    const is_previewed = (key) => tide_level_info_store.previewed_keys.includes(key);

    const show_chart = async (item) => {
        tide_level_info_store.set_has_chart(true);
        collapsed_store.set_has_collapsed(!has_collapsed.value);
        tide_level_info_store.set_parameter_id(item.id);
        tide_level_info_store.add_previewed_key(item.key);
        app_store.change_tab('tide_level');

        await nextTick();
        onResize();
    };

    // 紀錄目前被選中的按鈕狀態（預設第一項）
    const currentAction = ref(function_list.value[0])

    // 動作 1：按下左側主按鈕時觸發
    const handleMainAction = (item) => {
        //@TODO: 每個動作都要有對話框確認是否要執行，之後再補上
        if (currentAction.value.value === 'preview') {
            // tide_level_info_store.set_parameter_id(item.id);
            show_chart(item);
        } else {
            message.value = `是否${currentAction.value.text}?`;
            message_valid.value = true;
        }
        // 在這裡寫你實際要執行的 function，例如：if (currentAction.value.value === 'save') { ... }
    }

    const send_data = () => {
        alert(currentAction.value.text + '，' + currentAction.value.value);
    }

</script>

<style scoped lang="scss">
    .table-container {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        width: 90%;
        display: flex;
        flex-direction: column;
        // 動畫效果
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

    .pair-row {
        display: grid;
        grid-template-columns: .5fr auto 1fr;
        align-items: center;
        column-gap: 15px;
        line-height: 1.5;

        span {
            text-align: left;
        }
    }
</style>