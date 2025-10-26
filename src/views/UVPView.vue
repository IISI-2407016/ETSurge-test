<template>
    <loading :is_loading="is_loading" />
    <div>
        <!-- 篩選條件 -->
        <v-expansion-panels v-model="panel" class="w-33">
            <v-expansion-panel>
                <template #title>
                    <span class="title-text">UVP篩選條件選單</span>
                </template>
                <v-expansion-panel-text
                    class="overflow-y-auto"
                    style="height: 70vh;">
                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            颱風名稱
                        </v-col>
                        <v-col cols="7">
                            <v-select
                                v-model="form.TyNo"
                                :items="Ty_list"
                                item-title="text"
                                item-value="value"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            初始時間
                        </v-col>
                        <v-col cols="7">
                            <v-menu
                                v-model="menu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="290px"
                            >
                                <template #activator="{ props }">
                                    <v-text-field
                                        v-model="formatted_date"
                                        readonly
                                        v-bind="props"
                                    ></v-text-field>
                                </template>

                                <v-date-picker
                                    v-model="raw_date"
                                    no-title 
                                    color="primary"
                                    :max="max_date"
                                    @update:modelValue="handleDateSelect"
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <span>UTC</span>
                    </v-row>

                    <v-row class="align-center mt-0">
                        <v-col cols="3" class="text-right">
                            路徑種類
                        </v-col>
                        <v-col cols="7" class="pt-0">
                            <v-select
                                v-model="form.Category"
                                :items="category_list"
                                item-title="text"
                                item-value="value"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            有效半徑
                        </v-col>
                        <v-col cols="7">
                            <v-text-field v-model="form.Radius" density="compact" hide-details />
                        </v-col>
                        <span>km</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            中心氣壓
                        </v-col>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="pressure_from" density="compact" hide-details />
                        </v-col>
                        <span>~</span>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="pressure_to" density="compact" hide-details />
                        </v-col>
                        <span>hPa</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            最大風速
                        </v-col>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="wind_from" density="compact" hide-details />
                        </v-col>
                        <span>~</span>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="wind_to" density="compact" hide-details />
                        </v-col>
                        <span>m/s</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            移速
                        </v-col>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="speed_from" density="compact" hide-details />
                        </v-col>
                        <span>~</span>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="speed_to" density="compact" hide-details />
                        </v-col>
                        <span>km/hr</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            移向
                        </v-col>
                        <v-col cols="7">
                            <v-text-field
                                v-model="form.CardinalDirection"
                                readonly
                                density="compact"
                                hide-details
                                @click="show_compass"
                                placeholder="點擊選擇移向"
                            />
                        </v-col>
                        <span>16方位</span>
                    </v-row>
                    <v-row class="justify-center">
                        <compass-16 />
                    </v-row>

                    <!-- 預覽查詢 -->
                    <v-row class="justify-center">
                        <v-col cols="10" class="text-center pb-0">
                            <v-btn 
                                class="text-none text-subtitle-1"
                                color="primary"
                                variant="flat"
                                prepend-icon="mdi mdi-magnify"
                                @click="search">
                                預覽查詢
                            </v-btn>
                        </v-col>
                        <v-col cols="10" class="text-center">
                            <v-btn 
                                class="text-none text-subtitle-1"
                                color="success"
                                variant="flat"
                                prepend-icon="mdi mdi-calculator"
                                :disabled="!has_search || search_results.length === 0"
                                @click="show_message">
                                計算系集平均
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        <message-dialog 
            :model_value="message_valid"
            :message="message"
            :title="'系集平均計算確認'"
            @update:model_value="message_valid = $event"
            @confirm="change_tab('tide_level')"
        />
    </div>
</template>
<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { use_uvp_data_store } from '../stores/UVP-data.js';
    import { use_compass_store } from '../stores/compass';
    import compass16 from '../components/compass16.vue';
    import loading from '../components/loading.vue';
    import messageDialog from '../components/dialogs/messageDialog.vue';

    const emit = defineEmits(['change-tab']);

    const uvp_data_store = use_uvp_data_store();
    const compass_store = use_compass_store();

    const panel = ref(0);
    const menu = ref(false);
    const raw_date = ref(new Date().toString('YYYY/MM/DD'));
    const max_date = ref(new Date().toString('YYYY/MM/DD')); // 可選擇至最大日期
    const form = ref({
        TyNo: '',
        InitialTime: '',
        Category: '',
        Radius: '',
        Pressure_range: [null, null],
        MaxWind_range: [null, null],
        TranslationSpeed_range: [null, null],
        CardinalDirection: '',
        filtered_typhoon_data: []
    });
    const is_loading = ref(false);
    const send_category = ref({
        TyNo: '',
        TyChtName: '',
        TyEngName: ''
    });
    const search_results = ref([]);
    const has_search = ref(false);
    const message = ref('是否進入預報潮位時序圖預覧頁面<br/>等待計算結果?');
    const message_valid = ref(false);

    // 綁定範圍輸入框
    const pressure_from = computed({
        get: () => form.value.Pressure_range[0] || '',
        set: (value) => {
            form.value.Pressure_range[0] = value ? Number(value) : null;
        }
    });

    const pressure_to = computed({
        get: () => form.value.Pressure_range[1] || '',
        set: (value) => {
            form.value.Pressure_range[1] = value ? Number(value) : null;
        }
    });

    const wind_from = computed({
        get: () => form.value.MaxWind_range[0] || '',
        set: (value) => {
            form.value.MaxWind_range[0] = value ? Number(value) : null;
        }
    });

    const wind_to = computed({
        get: () => form.value.MaxWind_range[1] || '',
        set: (value) => {
            form.value.MaxWind_range[1] = value ? Number(value) : null;
        }
    });

    const speed_from = computed({
        get: () => form.value.TranslationSpeed_range[0] || '',
        set: (value) => {
            form.value.TranslationSpeed_range[0] = value ? Number(value) : null;
        }
    });

    const speed_to = computed({
        get: () => form.value.TranslationSpeed_range[1] || '',
        set: (value) => {
            form.value.TranslationSpeed_range[1] = value ? Number(value) : null;
        }
    });

    // 計算颱風名稱選單
    const Ty_list = computed(() => {
        const list = uvp_data_store.Ty_info.map(item => ({
            text: `${item.TyChtName} (${item.TyEngName})`,
            value: item.TyNo
        }));

        // 設定預設值為第一個選項
        if (list.length > 0 && !form.value.TyNo) {
            form.value.TyNo = list[0].value;
        }
        
        return list;
    });

    // 轉換成 YYYY/MM/DD 格式
    const formatted_date = computed(() => {
        if (!raw_date.value) return '';
        const date = new Date(raw_date.value);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd}`;
    });

    // 計算類別選單
    const category_list = computed(() => {
        if (!uvp_data_store.uvp_data?.Category || !Array.isArray(uvp_data_store.uvp_data.Category)) {
            return [];
        }

        const categories = uvp_data_store.uvp_data.Category
            .filter(item => item.TyNo === form.value.TyNo)
            .map(item => item.Category)
            .filter(category => category && category.trim() !== '')
            .sort();

        const uniqueCategories = [...new Set(categories)];
        const list = uniqueCategories.map(category => ({
            text: category,
            value: category
        }));

        // 設定預設值為第一個選項
        if (list.length > 0 && !form.value.Category) {
            form.value.Category = list[0].value;
        }

        return list;
    });

    onMounted(async () => {
        is_loading.value = true;
        await typhoon_info();
        is_loading.value = false;
    });

    // 監聽 store 中的 selected_direction，更新表單中的 CardinalDirection
    watch(() => compass_store.selected_direction,
        (new_direction) => {
            if (new_direction) {
                form.value.CardinalDirection = new_direction;
                // 清除store中的選擇，避免重複觸發
                compass_store.set_selected_direction('');
            }
        }
    );

    // 監聽颱風編號變化，載入對應的類別資料
    watch(() => form.value.TyNo, async (new_tyNo, old_tyNo) => {
        if (new_tyNo && new_tyNo !== old_tyNo) {
            form.value.Category = ''; // 重置類別選擇
            try {
                is_loading.value = true;
                
                // 更新 send_category
                const selected_typhoon = uvp_data_store.Ty_info.find(item => item.TyNo === new_tyNo);
                if (selected_typhoon) {
                    send_category.value = {
                        TyNo: new_tyNo,
                        TyChtName: selected_typhoon.TyChtName || '',
                        TyEngName: selected_typhoon.TyEngName || ''
                    };

                    // 載入該颱風的類別資料
                    await uvp_data_store.post_typhoon_category_data(send_category.value);
                }
            } catch (error) {
                console.error('載入颱風類別資料失敗:', error);
            } finally {
                is_loading.value = false;
            }
        }
    });

    // 查詢
    const search = async () => {
        is_loading.value = true;
        const res = await uvp_data_store.get_model_data_by_track(form.value);
        if (!res.success || res.data.length === 0) {
            return;
        }

        has_search.value = true;
        form.value.filtered_typhoon_data = uvp_data_store.search_results;
        search_results.value = uvp_data_store.search_results.map(item => item.model_data);
        is_loading.value = false;
        console.log('search_results:', search_results.value);
    }

    // 顯示訊息
    const show_message = () => {
        message_valid.value = true;
    }

    // 切換頁籤至潮位頁面
    const change_tab = (tab_name) => {
        emit('change-tab', tab_name);
    }

    // 計算系集平均 @TODO等確定完成才進行計算作業
    const cal_average_typhoon_data = async () => {
        is_loading.value = true;
        const res = await uvp_data_store.post_uvp_average(form.value);
        if(!res.success) {
            return;
        }
        is_loading.value = false;
        console.log("uvp_data_store.average_typhoon_data: ", uvp_data_store.average_typhoon_data);
    }

    // 選擇日期後關閉選擇器
    const handleDateSelect = () => {
        menu.value = false;
    };

    // 顯示羅盤
    const show_compass = () => {
        compass_store.activate();
    };

    // 取得颱風資訊
    const typhoon_info = () => {
        uvp_data_store.get_typhoon_name_data();
    }
</script>
<style scoped>
    .title-text {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .v-col-2_8 {
        flex: 0 0 28%;
        max-width: 28%;
}
</style>