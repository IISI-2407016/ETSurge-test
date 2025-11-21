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
                    style="height: 75vh;"
                >
                    <v-form ref="form_ref" @submit.prevent>
                        <v-row>
                            <v-col class="v-col-2 px-0 text-right">
                                模式選擇
                            </v-col>
                            <v-col cols="8" class="pt-0">
                                <v-select
                                    v-model="form.ModelNameList"
                                    density="compact"
                                    hide-details
                                    disabled
                                ></v-select>
                            </v-col>
                        </v-row>
                        <v-row class="align-center">
                            <v-col class="v-col-2 px-0 text-right">
                                颱風名稱
                            </v-col>
                            <v-col cols="8">
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
                            <v-col class="v-col-2 px-0 text-right">
                                初始時間
                            </v-col>
                            <v-col cols="5">
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
                                            label="Date"
                                        ></v-text-field>
                                    </template>
    
                                    <v-date-picker
                                        v-model="selected_date"
                                        no-title 
                                        color="primary"
                                        label="Date"
                                        :max="max_date"
                                        @update:model-value="handle_date_select"
                                        ></v-date-picker>
                                </v-menu>
                            </v-col>
                            <v-col cols="3" class="pl-0">
                                <v-select
                                    v-model="hour.time"
                                    :items="hour.items"
                                    label="Hour"
                                    @update:model-value="uvp_data_store.update_hour"
                                ></v-select>
                            </v-col>
                            <span>UTC</span>
                        </v-row>
    
                        <v-row class="align-center mt-0">
                            <v-col class="v-col-2 px-0 text-right">
                                路徑種類
                            </v-col>
                            <v-col cols="8" class="pt-0">
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
                            <v-col class="v-col-2 px-0 text-right">
                                有效半徑
                            </v-col>
                            <v-col cols="8">
                                <v-text-field 
                                    v-model.number="form.Radius" 
                                    density="compact" 
                                    :rules="radius_validation"
                                />
                            </v-col>
                            <span>km</span>
                        </v-row>
    
                        <v-row class="align-center">
                            <v-col class="v-col-2 px-0 text-right">
                                中心氣壓
                            </v-col>
                            <v-col class="v-col-32">
                                <v-text-field v-model.number="form.Pressure_range[0]" density="compact" :rules="pressure_validation" />
                            </v-col>
                            <span>~</span>
                            <v-col class="v-col-32">
                                <v-text-field v-model.number="form.Pressure_range[1]" density="compact" :rules="pressure_validation" />
                            </v-col>
                            <span>hPa</span>
                        </v-row>
    
                        <v-row class="align-center">
                            <v-col class="v-col-2 px-0 text-right">
                                最大風速
                            </v-col>
                            <v-col class="v-col-32">
                                <v-text-field v-model.number="form.MaxWind_range[0]" density="compact" :rules="maxWind_validation" />
                            </v-col>
                            <span>~</span>
                            <v-col class="v-col-32">
                                <v-text-field v-model.number="form.MaxWind_range[1]" density="compact" :rules="maxWind_validation" />
                            </v-col>
                            <span>m/s</span>
                        </v-row>
    
                        <v-row class="align-center">
                            <v-col class="v-col-2 px-0 text-right">
                                移速
                            </v-col>
                            <v-col class="v-col-32">
                                <v-text-field v-model.number="form.TranslationSpeed_range[0]" density="compact" :rules="speed_validation" />
                            </v-col>
                            <span>~</span>
                            <v-col class="v-col-32">
                                <v-text-field v-model.number="form.TranslationSpeed_range[1]" density="compact" :rules="speed_validation" />
                            </v-col>
                            <span>km/hr</span>
                        </v-row>
    
                        <v-row class="align-center">
                            <v-col class="v-col-2 px-0 text-right">
                                移向
                            </v-col>
                            <v-col cols="8">
                                <v-text-field
                                    v-model="directions"
                                    readonly
                                    density="compact"
                                    placeholder="點擊選擇移向"
                                    @click="show_compass"
                                    :rules="direction_validation"
                                />
                            </v-col>
                            <span>16方位</span>
                        </v-row>
                        <v-row class="justify-center">
                            <compass-16 @set_direction="handle_set_direction"/>
                        </v-row>
    
                        <!-- 預覽查詢 -->
                        <v-row class="justify-center">
                            <v-col cols="10" class="text-center pb-0">
                                <v-btn 
                                    type="submit"
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
                    </v-form>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
        <message-dialog 
            :model_value="message_valid"
            :message="message"
            :title="'系集平均計算確認'"
            @update:model_value="message_valid = $event"
            @confirm="change_tab"
        />
    </div>
</template>
<script setup>
    import { ref, computed, onMounted, watch } from 'vue';
    import { use_app_store } from '../stores/use-app.js';
    import { use_uvp_data_store } from '../stores/UVP-data.js';
    import { use_compass_store } from '../stores/compass';
    import { tide_level_store } from '../stores/tide-level.js';
    import compass16 from '../components/compass16.vue';
    import loading from '../components/loading.vue';
    import messageDialog from '../components/dialogs/messageDialog.vue';

    const app_store = use_app_store();
    const uvp_data_store = use_uvp_data_store();
    const compass_store = use_compass_store();
    const tide_level_info_store = tide_level_store();

    const panel = ref(0);
    const menu = ref(false);
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
    // 欄位驗證
    const form_ref = ref(null);
    const radius_validation = [value => check_input(value)];
    const pressure_validation = [value => check_input(value)];
    const maxWind_validation = [value => check_input(value)];
    const speed_validation = [value => check_input(value)];
    const direction_validation = [value => check_input(value, 'direction')];

    const max_date = computed(() => new Date()); // 最大可選日期
    const form = computed(() => uvp_data_store.uvp_data);
    const directions = computed(() => compass_store.selected_direction);
    const hour = computed(() => uvp_data_store.hour);
    const selected_date = computed({
        get: () => {
            if (!form.value.InitialTime) return new Date();
            return new Date(form.value.InitialTime);
        },
        set: (value) => uvp_data_store.update_date(value)
    });

    // 計算颱風名稱選單
    const Ty_list = computed(() => {
        const list = uvp_data_store.Ty_info.map(item => ({
            text: `${item.TyNo}-${item.TyChtName}`,
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
        if (!form.value.InitialTime) return '';
        const date = new Date(form.value.InitialTime);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd}`;
    });

    // 計算類別選單
    const category_list = computed(() => {
        const _list = uvp_data_store.category_list;
        if (!_list || !Array.isArray(_list)) {
            return [];
        }

        const categories = _list
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
        // 設定預設為今天
        if (!form.value.InitialTime) {
            const today = new Date();
            form.value.InitialTime = today.toISOString();
        }

        is_loading.value = true;
        await typhoon_info();
        is_loading.value = false;
    });

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
    // 欄位驗證規則
    const check_input = (value, name) => {
        if (value === null || value === undefined || value === '') {
            return '此欄位不可為空';
        }
        if (name === 'direction') return true; // 移向不需數字驗證
        if (isNaN(value) || value < 0) {
            return '請輸入有效的非負數字';
        }
        return true;
    };

    // 查詢
    const search = async () => {
        const { valid } = await form_ref.value.validate();
        if (!valid) return;

        console.log('form value:', form.value);

        is_loading.value = true;
        uvp_data_store.reset_filtered_typhoon_data(); // 重置篩選颱風資料
        uvp_data_store.save_UVP_data(form.value, hour.value.time); // 紀錄欄位內容
        const res = await uvp_data_store.get_model_data_by_track(form.value);

        if (!res.success || res.data.length === 0) {
            // @TODO視窗的錯誤提醒
            is_loading.value = false;
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
        tide_level_info_store.set_has_collapsed(false);
        tide_level_info_store.set_has_chart(false);
        message_valid.value = true;
    }

    // 切換頁籤至潮位頁面
    const change_tab = async () => {
        is_loading.value = true;

        await bring_average_typhoon_data();
        await get_typhoon_data();

        is_loading.value = false;
        app_store.change_tab('tide_level');
    }

    // 產製模式平均網格資料
    const bring_average_typhoon_data = async () => {
        const res = await uvp_data_store.post_uvp_average(form.value);
        if(!res.success) {
            return;
        }
    }

    const get_typhoon_data = async () => {
        const res = await uvp_data_store.get_typhoon_data();
        if(!res.success) {
            return;
        }
    }

    // 選擇日期後關閉選擇器
    const handle_date_select = (date) => {
        if (date) {
            selected_date.value = date;
        }
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

    const handle_set_direction = (index) => {
        form.value.CardinalDirection = index;
    };
</script>
<style scoped>
    .title-text {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .v-col-32 {
        flex: 0 0 32.5%;
        max-width: 32.5%;
    }
    .v-col-2 {
        flex: 0 0 20%;
        max-width: 20%;
    }
</style>