import { defineStore } from 'pinia'
import { 
    get_typhoon_name_data_ajax,
    post_typhoon_track_data_ajax,
    post_typhoon_filter_parameters_from_tafis_ajax,
    post_uvp_preview_ajax,
    post_uvp_average_ajax
 } from '../js/typhoon-data.js'
import { post_typhoon_filter_parameters_ajax } from '../js/tide-level.js'
import { use_alert_store } from './alert.js'

export const use_uvp_data_store = defineStore('uvp_data', {
    state: () => ({
        uvp_data: {
            ModelNameList: ['TWRF'], // 目前尚未有其他模式
            TyNo: '',
            InitialTime: '',
            Category: '',
            filtered_typhoon_data: [],
            filter_details: { // tau data info
                Tau: [0, 12, 24, 48, 72],
                Radius: [],
                Pressure_min: [],
                Pressure_max: [],
                ForecastPressure: [],
                CardinalDirection: [],
                TranslationSpeed_min: [],
                TranslationSpeed_max: [],
                ForecastTranslationSpeed: [],
                MaxWind_min: [],
                MaxWind_max: [],
            },
            has_filter_details: false, // 是否有篩選條件資料
        },
        hour: {
            time: '06', // 預設06Z
            items: ['00', '02', '05', '06', '08', '11', '14', '17', '20', '23'], // 可選擇的時次
        },
        Ty_info: [],
        tide_list: [],
        category_list: [],
        search_results: [], // 查詢結果
        drawn_typhoon_category_list: {}, // 繪製在地圖上的颱風軌跡類別資料
        average_typhoon_data: [],
        angle: 0,
        is_active: false,
        selected_direction: '',
        preview_signature: '',
        has_preview_result: false, // 是否有預覽結果的標記
        is_uvp_search: true, // 判斷目前是颱風查詢還是系集查詢，false: 颱風查詢，true: 系集查詢
        can_calculate_average: false, // 判斷是否可以計算平均，false: 不可計算，true: 可計算
    }),
    actions: {
        activate() {
            this.is_active = true;
        },
        deactivate() {
            this.is_active = false;
        },
        save_UVP_data(new_uvp_data, new_hour) {
            this.uvp_data = {...this.uvp_data, ...new_uvp_data};
            this.hour.time = new_hour;
        },
        set_angle(new_angle) {
            this.angle = new_angle;
        },
        set_selected_direction(direction) {
            this.selected_direction = direction;
        },
        reset_filtered_typhoon_data() {
            this.uvp_data.filtered_typhoon_data = [];
        },
        set_is_uvp_search(value) {
            this.is_uvp_search = value;
        },
        set_can_calculate_average(value) {
            this.can_calculate_average = value;
        },
        // 更新日期並保持當前選擇的小時
        update_date(new_date) {
            if (new_date) {
                const year = new_date.getFullYear();
                const month = new_date.getMonth() + 1;
                const day = new_date.getDate();
                const current_hour = this.hour.time || '08';
                
                const date_string = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${current_hour}:00:00.000Z`;
                this.uvp_data.InitialTime = date_string;
            }
        },
        // 更新小時並同步到 InitialTime
        update_hour(new_hour) {
            this.hour.time = new_hour;
            
            if (this.uvp_data.InitialTime) {
                const current_date = new Date(this.uvp_data.InitialTime);
                const year = current_date.getFullYear();
                const month = current_date.getMonth() + 1;
                const day = current_date.getDate();
                
                const date_string = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${new_hour}:00:00.000Z`;
                this.uvp_data.InitialTime = date_string;
            }
        },
        async get_typhoon_name_data() {
            const { status, data } = await get_typhoon_name_data_ajax();
            if (status === 'success') {
                this.Ty_info = data.map(t => ({
                    title: `${t.TyNo}-${t.TyChtName}`,
                    value: t.TyNo,
                    TyChtName: t.TyChtName,
                    TyEngName: t.TyEngName,
                }));
            }
            return;
        },
        async post_typhoon_category_data(send_data) {
            const { status, data } = await post_typhoon_track_data_ajax(send_data);
            if (status === 'success') {
                this.category_list = data;
                this.uvp_data.InitialTime = data.find(item => item.InitialTime.includes(`${this.hour.time}:00:00`))?.InitialTime || this.uvp_data.InitialTime;
            }
            return { status, data };
        },
        async post_typhoon_filter_parameters(send_data) {
            const alert_store = use_alert_store()
            const { status, data } = await post_typhoon_filter_parameters_from_tafis_ajax(send_data);
            if (status === 'success') {
                if (!data || data.length === 0) {
                    this.uvp_data.has_filter_details = false;
                    alert_store.show_alert('沒有颱風資料', 'warning');
                    return { success: true, data: [] };
                }
                // 清空現有的篩選條件資料
                this.uvp_data.filter_details = {
                    Tau: [0, 12, 24, 48, 72],
                    Radius: [],
                    Pressure_min: [],
                    Pressure_max: [],
                    ForecastPressure: [],
                    CardinalDirection: [],
                    TranslationSpeed_min: [],
                    TranslationSpeed_max: [],
                    ForecastTranslationSpeed: [],
                    MaxWind_min: [],
                    MaxWind_max: [],
                };
                const res = data.filter_details.forEach(item => {
                    this.uvp_data.filter_details.Radius.push(item.Radius)
                    this.uvp_data.filter_details.Pressure_min.push(item.Pressure_min);
                    this.uvp_data.filter_details.Pressure_max.push(item.Pressure_max);
                    this.uvp_data.filter_details.ForecastPressure.push(item.ForecastPressure);
                    this.uvp_data.filter_details.CardinalDirection.push(item.CardinalDirection);
                    this.uvp_data.filter_details.TranslationSpeed_min.push(item.TranslationSpeed_min);
                    this.uvp_data.filter_details.TranslationSpeed_max.push(item.TranslationSpeed_max);
                    this.uvp_data.filter_details.ForecastTranslationSpeed.push(item.ForecastTranslationSpeed);
                    this.uvp_data.filter_details.MaxWind_min.push(item.MaxWind_min);
                    this.uvp_data.filter_details.MaxWind_max.push(item.MaxWind_max);
                })
                this.uvp_data.has_filter_details = true; // 標記已獲取篩選條件資料
                return { success: true, res };
            }
            this.uvp_data.has_filter_details = false;
            alert_store.show_alert('獲取颱風資料失敗', 'error');
            return { success: false};
        },
        async get_model_data_by_track(send_data) {
            try {
                const response = await post_uvp_preview_ajax(send_data);
                if (response && response.status === 'success' && response.data) {
                    this.search_results = response.data;
                    this.drawn_typhoon_category_list[send_data.Category] = response.data;
                    console.log("drawn_typhoon_category_list DATA: ", this.drawn_typhoon_category_list);

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::get_model_data_by_track()');
                }
            } catch (error) {
                this.drawn_typhoon_category_list = []; // 查無資料時清空繪製的颱風軌跡類別資料
                return { success: false, error };
            }
        },
        async post_uvp_average(send_data) {
            // const data = {
            //     ModelNameList: [send_data.ModelNameList],
            //     Radius: send_data.Radius,
            //     Pressure_range: [send_data.Pressure_range[0], send_data.Pressure_range[1]],
            //     CardinalDirection: send_data.CardinalDirection,
            //     TranslationSpeed_range: [send_data.TranslationSpeed_range[0], send_data.TranslationSpeed_range[1]],
            //     MaxWind_range: [send_data.MaxWind_range[0], send_data.MaxWind_range[1]],
            //     filtered_typhoon_data: send_data.filtered_typhoon_data
            // }
            console.log('post_uvp_average send data:', send_data);
            try {
                const response = await post_uvp_average_ajax(send_data);
                
                if (response && response.status === 'success' && response.data) {
                    this.average_typhoon_data = response.data;

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::post_uvp_average()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        async post_typhoon_data(send_data) {
            try {
                const response = await post_typhoon_filter_parameters_ajax(send_data);
                if (response && response.status === 'success' && response.data) {
                    this.tide_list = response.data;

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::post_typhoon_data()');
                }
            } catch (error) {
                return { success: false, error };
            }
        }
    },
});