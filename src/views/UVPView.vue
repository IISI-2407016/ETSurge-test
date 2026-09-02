<template>
    <loading :is_loading="is_loading" />
    <div>
        <div class="relative">
            <e-map 
                class="absolute inset-0 z-0"
                style="width: 99%; height: calc(100vh - 5.8rem);"
                :track_data="drawn_typhoon_category_list"
            />
            <!-- 篩選條件 -->
            <v-expansion-panels v-model="panel" class="w-33 relative z-10">
                <v-expansion-panel>
                    <template #title>
                        <span class="title-text">UVP篩選條件選單</span>
                    </template>
                    <v-expansion-panel-text
                        class="overflow-y-auto"
                        :style="{ height: has_tau_data ? '75vh' : '45vh' }"
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
                                        item-color="blue"
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
                                        item-title="title"
                                        item-value="value"
                                        item-color="blue"
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
                                        item-color="blue"
                                        label="Hour"
                                        @update:model-value="uvp_data_store.update_hour"
                                    ></v-select>
                                </v-col>
                                <span>UTC</span>
                            </v-row>
                            <!-- 自動化欄位 -->
                            <div v-if="has_tau_data">
                                <v-row class="align-center">
                                    <v-col class="v-col-2 px-0 text-right">
                                        有效半徑
                                    </v-col>
                                    <v-col cols="8">
                                        <v-text-field 
                                            v-model="form.filter_details.Radius" 
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
                                    <v-col cols="8" class="pb-0">
                                        <v-text-field v-model="form.filter_details.Pressure_min" density="compact" :rules="pressure_validation" />
                                    </v-col>
                                    <span>~</span>
                                    <v-col class="v-col-2" />
                                    <v-col cols="8" class="py-0">
                                        <v-text-field v-model="form.filter_details.Pressure_max" density="compact" :rules="pressure_validation" />
                                    </v-col>
                                    <span>hPa</span>
                                </v-row>
                                <v-row class="align-center">
                                    <v-col class="v-col-2 px-0 text-right">
                                        最大風速
                                    </v-col>
                                    <v-col cols="8"  class="pb-0">
                                        <v-text-field v-model="form.filter_details.MaxWind_min" density="compact" :rules="maxWind_validation" />
                                    </v-col>
                                    <span>~</span>
                                    <v-col class="v-col-2" />
                                    <v-col cols="8" class="py-0">
                                        <v-text-field v-model="form.filter_details.MaxWind_max" density="compact" :rules="maxWind_validation" />
                                    </v-col>
                                    <span>m/s</span>
                                </v-row>
                                <v-row class="align-center">
                                    <v-col class="v-col-2 px-0 text-right">
                                        移速
                                    </v-col>
                                    <v-col cols="8" class="pb-0">
                                        <v-text-field v-model="form.filter_details.TranslationSpeed_min" density="compact" :rules="speed_validation" />
                                    </v-col>
                                    <span>~</span>
                                    <v-col class="v-col-2" />
                                    <v-col cols="8" class="py-0">
                                        <v-text-field v-model="form.filter_details.TranslationSpeed_max" density="compact" :rules="speed_validation" />
                                    </v-col>
                                    <span>km/hr</span>
                                </v-row>
                                <v-row class="align-center">
                                    <v-col class="v-col-2 px-0 text-right">
                                        移向
                                    </v-col>
                                    <v-col cols="8" class="position-relative">
                                        <v-combobox
                                            v-model="direction"
                                            readonly
                                            density="compact"
                                            placeholder="點擊選擇移向"
                                            chips
                                            clearable
                                            closable-chips
                                            multiple
                                            :rules="direction_validation"
                                            @click="show_compass"
                                        >
                                            <template v-slot:chip="{ props, item }">
                                            <v-chip v-bind="props">
                                                <strong>{{ item.title }}</strong>&nbsp;
                                            </v-chip>
                                            </template>
                                        </v-combobox>

                                        <v-menu
                                            v-if="compass_store.is_active"
                                            activator="parent"
                                            location="end center"
                                            :offset="10"
                                            :close-on-content-click="false"
                                            :scrim="false"
                                            content-class="compass-menu"
                                        >
                                            <compass16 @set_direction="append_dir_compass" />
                                        </v-menu>
                                    </v-col>
                                    <span>16方位</span>
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
                                            :disabled="!can_calculate"
                                            @click="show_message">
                                            計算系集平均
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                            <div v-else>
                                <v-row>
                                    <v-col class="text-center">
                                        <span class="mdi mdi-alert-circle-outline"></span>
                                        沒有颱風資料
                                    </v-col>
                                </v-row>
                            </div>
                        </v-form>
                    </v-expansion-panel-text>
                </v-expansion-panel>
                <!-- @TODO 放在共用區一起使用 -->
                <!-- <alert-message-dialog 
                    v-model="error_message_valid"
                    :message="error_message"
                    :type="message_type"
                /> -->
            </v-expansion-panels>
        </div>
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
    import { use_compass_store } from '../stores/compass';
    import { use_app_store } from '../stores/use-app.js';
    import { use_uvp_data_store } from '../stores/UVP-data.js';
    import { tide_level_store } from '../stores/tide-level.js';
    import { use_alert_store } from '../stores/alert.js';
    import { display_directions } from '../config/setting.js';
    import { format_date } from '../utils/formatted-date.js';
    import loading from '../components/loading.vue';
    import messageDialog from '../components/dialogs/messageDialog.vue';
    import compass16 from '@/components/compass16.vue';
    import alertMessageDialog from '../components/dialogs/alertMessageDialog.vue';
    import eMap from '@/components/eMap.vue';

    const app_store = use_app_store();
    const compass_store = use_compass_store();
    const uvp_data_store = use_uvp_data_store();
    const tide_level_info_store = tide_level_store();
    const alert_store = use_alert_store();

    const panel = ref(0);
    const menu = ref(false);
    const is_loading = ref(false);
    const send_category = ref({
        TyNo: '',
        TyChtName: '',
        TyEngName: ''
    });

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
    const hour = computed(() => uvp_data_store.hour);
    const has_tau_data = computed(() => uvp_data_store.uvp_data.has_filter_details);
    const drawn_typhoon_category_list = computed(() => uvp_data_store.drawn_typhoon_category_list);
    const search_results = computed(() => uvp_data_store.search_results.map(item => item.model_data));

     // 接收羅盤選擇的方位索引值並更新到篩選條件中
    const selected_date = computed({
        get: () => {
            if (!form.value.InitialTime) return new Date();
            return new Date(form.value.InitialTime);
        },
        set: (value) => uvp_data_store.update_date(value)
    });

    // 計算颱風名稱選單
    const Ty_list = computed(() => {
        const list = uvp_data_store.Ty_info;

        // 設定預設值為第一個選項
        if (list.length > 0 && !form.value.TyNo) {
            form.value.TyNo = list[0].value;
        }
        
        return list;
    });

    // 方位轉換
    const direction = computed({
        get() {
            const indexes = normalize_dir(form.value.filter_details.CardinalDirection);
            return indexes.map(i => display_directions[i]);
        },
        set(values) {
            form.value.filter_details.CardinalDirection = normalize_dir(values).slice(0, 5);
        }
    });

    // 轉換成 YYYY/MM/DD 格式
    const formatted_date = computed(() => {
        return format_date(form.value.InitialTime);
    });

    const current_signature = computed(() =>
        JSON.stringify({
            TyNo: form.value.TyNo,
            InitialTime: form.value.InitialTime,
            ModelNameList: form.value.ModelNameList,
            filter_details: form.value.filter_details,
            hour: hour.value.time
        })
    )

    const can_calculate = computed(() =>
        uvp_data_store.has_preview_result &&
        uvp_data_store.preview_signature === current_signature.value &&
        search_results.value.length > 0
    );
    // 計算類別選單
    // const category_list = computed(() => {
    //     const _list = uvp_data_store.category_list;
    //     if (!_list || !Array.isArray(_list)) {
    //         return [];
    //     }

    //     const categories = _list
    //         .filter(item => item.TyNo === form.value.TyNo)
    //         .map(item => item.Category)
    //         .filter(category => category && category.trim() !== '')
    //         .sort();

    //     const uniqueCategories = [...new Set(categories)];
    //     const list = uniqueCategories.map(category => ({
    //         text: category,
    //         value: category
    //     }));

    //     // 設定預設值為第一個選項
    //     if (list.length > 0 && !form.value.Category) {
    //         form.value.Category = list[0].value;
    //     }

    //     return list;
    // });

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

    // 監聽颱風資料初始狀態，主要檢查 TyNo 和 InitialTime 是否存在
    watch(() => [form.value.TyNo, form.value.InitialTime], 
        async ([newTyNo, newInitialTime], [oldTyNo, oldInitialTime]) => {

        // 1) 當 TyNo 變化時，優先載入對應的颱風資料
        if (newTyNo && newTyNo !== oldTyNo) {
            try {
                is_loading.value = true;
                
                // 更新 send_category
                const selected_typhoon = uvp_data_store.Ty_info.find(item => item.value === newTyNo);

                if (selected_typhoon) {
                    send_category.value = {
                        TyNo: newTyNo,
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

        // 2) 當 TyNo 或 InitialTime 變化時，載入對應的篩選條件資料
        if (!newTyNo || !newInitialTime || !oldTyNo) return
        if (newTyNo === oldTyNo && newInitialTime === oldInitialTime) return;

        const send_data = {
            TyNo: form.value.TyNo,
            InitialTime: form.value.InitialTime
        }

        const { success, data } = await uvp_data_store.post_typhoon_filter_parameters(send_data);

        if (!success) return
        // 處理 filter_details
        const next_filter_details = Array.isArray(data)
        ? data
        : Array.isArray(data?.filter_details)
            ? data.filter_details
            : form.value.filter_details;

        uvp_data_store.uvp_data = {
            ...form.value,
            filter_details: next_filter_details,
        };
    });

    // 欄位驗證規則
    const check_input = (value, name) => {
        if (value === null || value === undefined || value === '') {
            return '此欄位不可為空';
        }
        if (name === 'direction') { // 移向驗證
            const normalized = normalize_dir(value);

            if (normalized.length === 0) return '請選擇5個方位';
            if (normalized.length !== 5) return '必須剛好選擇5個方位';

            // 若原值有無法轉成有效方位的項目，視為格式錯誤
            const rawLen = Array.isArray(value) ? value.length : (value == null ? 0 : 1);
            if (normalized.length !== rawLen) return '方位資料格式錯誤';

            return true;
        }; 

        // 5組數字，逗號分隔 (逗號後必須是數字)
        const text = String(value).trim();
        const radiusPattern = /^\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?){4}$/;
        if (!radiusPattern.test(text)) {
            return '逗號後面請接數字(最多5個數字)';
        }

        if (value < 0) {
            return '請輸入有效的非負數字';
        }
        return true;
    };

    // 查詢: *目前傳遞資料上都有綁路徑，意思是每次查詢都需要將三個路徑依序塞進API做處理，之後可以優化成只載入一次資料後，前端根據條件篩選資料，或是增加一個API專門處理篩選邏輯
    const search = async () => {
        const { valid } = await form_ref.value.validate();
        if (!valid) return;

        console.log('form value:', form.value);

        is_loading.value = true;
        uvp_data_store.reset_filtered_typhoon_data(); // 重置篩選颱風資料
        uvp_data_store.save_UVP_data(form.value, hour.value.time); // 紀錄欄位內容
        const res_data = UVP_filter_details_format(form.value); // 格式化篩選條件資料以符合傳送需求

        const record_err_msg = []; // 紀錄查無資料的類別
        // 路徑種類有三種: official、ref1、ref2
        for(let i = 0; i < 3; i++) {
            const category = ['official', 'ref1', 'ref2'][i];
            const res = await uvp_data_store.get_model_data_by_track({
                ...res_data,
                Category: category
            });
            if (!res.success || res.data.length === 0) {
                record_err_msg.push(category);
            }
        }
        if (record_err_msg.length > 0) {
            const err_msg = record_err_msg.join(', ');
            alert_store.show_alert(`查無符合條件的${err_msg}颱風資料，請調整篩選條件後再試一次。`, 'warning');
            is_loading.value = false;
            return;
        }

        uvp_data_store.preview_signature = current_signature.value // 更新預覽內容的簽名，以供後續計算系集平均時驗證使用
        uvp_data_store.has_preview_result = true
        is_loading.value = false;
    }

    // 顯示訊息
    const show_message = () => {
        tide_level_info_store.set_has_collapsed(false);
        tide_level_info_store.set_has_chart(false);
        message_valid.value = true;
    }

    // 計算系集平均並切換頁籤至潮位頁面
    const change_tab = async () => {
        is_loading.value = true;

        for(let i = 0; i < 3; i++) {
            const category = ['official', 'ref1', 'ref2'][i];
            form.value.Category = category;
            form.value.filtered_typhoon_data = uvp_data_store.drawn_typhoon_category_list[category] || [];
            await bring_average_typhoon_data();
        }

        await post_typhoon_data();

        is_loading.value = false;
        app_store.change_tab('tide_level');
        uvp_data_store.set_can_calculate_average(can_calculate.value);
        uvp_data_store.set_is_uvp_search(true)
    }

    // 產製模式平均網格資料
    const bring_average_typhoon_data = async () => {
        const res = await uvp_data_store.post_uvp_average(form.value);
        if(!res.success) {
            return;
        }
    }

    const post_typhoon_data = async () => {
        const send_data = {
            TyNo: form.value.TyNo,
            ModelNameList: form.value.ModelNameList,
            // Category: form.value.Category,
            InitialTime: form.value.InitialTime,
            IsEnsemble: true,  // 是否為系集模式資料
            IsFileReady: true, // 是否檔案已準備好
            limit: 12          // 預設10筆，最大100筆
        }
        const res = await uvp_data_store.post_typhoon_data(send_data);
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
    }

    // 取得颱風資訊
    const typhoon_info = () => {
        uvp_data_store.get_typhoon_name_data();
    }

    // 顯示方位選擇盤
    const show_compass = () => {
        compass_store.activate(true);
    }

    // 接收方位選擇盤傳回的方位索引值
    const normalize_dir = (values) => {
        const arr = Array.isArray(values) ? values : (values == null ? [] : [values]);

        return arr
            .map(v => {
                if (Number.isInteger(v)) return v;
                const n = Number(v);
                if (Number.isInteger(n)) return n;
                return display_directions.indexOf(v);
            })
            .filter(i => Number.isInteger(i) && i >= 0 && i < display_directions.length)
            .slice(0, 5); // 只限制最多 5 個，不去重
    };

    const append_dir_compass = (index) => {
        const current = normalize_dir(form.value.filter_details.CardinalDirection);
        const incoming = normalize_dir(index); // 單一 index
        form.value.filter_details.CardinalDirection = [...current, ...incoming].slice(0, 5);
    };

    const UVP_filter_details_format = (data) => {
        const res = data.filter_details.Tau.map((tau, index) => {
            const item = data.filter_details;
            return {
                Tau: tau,
                Radius: item.Radius[index],
                Pressure_min: item.Pressure_min[index],
                Pressure_max: item.Pressure_max[index],
                ForecastPressure: item.ForecastPressure[index],
                CardinalDirection: item.CardinalDirection[index],
                TranslationSpeed_min: item.TranslationSpeed_min[index],
                TranslationSpeed_max: item.TranslationSpeed_max[index],
                ForecastTranslationSpeed: item.ForecastTranslationSpeed[index],
                MaxWind_min: item.MaxWind_min[index],
                MaxWind_max: item.MaxWind_max[index],
            };
        });

        return {
            ...data,
            filter_details: res
        };
    }
</script>
<style scoped lang="scss">
    .title-text {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .v-col-2 {
        flex: 0 0 20%;
        max-width: 20%;
    }
    .direction-field {
        position: relative;
    }

    @media (max-width: 1280px) {
        :deep(.compass-menu) {
            /* 小螢幕時改到下方 */
            margin-top: 8px;
        }
    }
</style>