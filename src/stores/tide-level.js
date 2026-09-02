import { defineStore } from 'pinia'
import {
    get_tide_station_info_ajax,
    post_load_all_data_ajax,
    post_send_official_images_ajax,
    post_upload_forecast_images_ajax,
    post_sent_non_typhoon_pictures_ajax
} from '../js/tide-level.js';
import { use_alert_store } from './alert.js';
import { wrap_api_response } from '../utils/api-request.js';

export const tide_level_store = defineStore('tide_level', {
    state: () => ({
        ty_search: {
            TyNo: '',
            InitialTime: '',
            limit: 10, // 預設10筆，最大100筆
        },
        station_list: [],
        stid_id_list: [],
        stid_list: {},
        six_hour_list: [],
        chart_list: {}, // 測站資訊
        has_chart: false,
        parameter_id: [], // 陣列存放多個參數ID，由單一資料改成陣列，因為合併相同初始時間與颱風名稱的資料
        has_collapsed: false, // 控制颱風表格縮放
        previewed_keys: [], // 記錄已被按過預覽的列（依 InitialTime__TyNo 分組 key），逐列判斷是否已預覽
        last_previewed_key: '', // 最後一次被按過預覽的列 key，用於排序移到第一列
        empty_fcst_water_level_alert_dialog: false, // 預報水位空值警告視窗
        empty_fcst_water_level_alert_dialog_lock: false, // 預報水位空值警告視窗鎖定
        hour: {
            time: '06', // 預設06Z
            items: ['00', '02', '05', '06', '08', '11', '14', '17', '20', '23'], // 可選擇的時次
        },
    }),
    actions: {
        set_ty_search(new_ty_search) {
            this.ty_search = {...this.ty_search, ...new_ty_search};
        },
        set_has_chart(value) {
            this.has_chart = value;
        },
        set_parameter_id(id) {
            this.parameter_id = Array.isArray(id) ? id : [id];
        },
        set_has_collapsed(value) {
            this.has_collapsed = value;
        },
        add_previewed_key(key) {
            if (!this.previewed_keys.includes(key)) {
                this.previewed_keys.push(key);
            }
            this.last_previewed_key = key;
        },
        reset_previewed_keys() {
            this.previewed_keys = [];
            this.last_previewed_key = '';
        },
        set_empty_fcst_water_level_alert_dialog(value) {
            this.empty_fcst_water_level_alert_dialog = value;
        },
        set_empty_fcst_water_level_alert_dialog_lock(value) {
            this.empty_fcst_water_level_alert_dialog_lock = value;
        },
        save_chart_list(data) {
            this.chart_list = data;
        },
        // 更新日期並保持當前選擇的小時
        update_date(new_date) {
            if (new_date) {
                const year = new_date.getFullYear();
                const month = new_date.getMonth() + 1;
                const day = new_date.getDate();
                const current_hour = this.hour.time || '08';
                
                this.ty_search.InitialTime = `${year}-${month.toString().padStart(2, '0')}-${day
                    .toString()
                    .padStart(2, '0')}T${current_hour}:00:00.000Z`;
            }
        },
        update_hour(newHour) {
            this.hour.time = newHour;

            if (!this.ty_search.InitialTime) return;

            const currentDate = new Date(this.ty_search.InitialTime);
            const year = currentDate.getUTCFullYear();
            const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getUTCDate()).padStart(2, '0');

            this.ty_search.InitialTime = `${year}-${month}-${day}T${newHour}:00:00.000Z`;
        },
        async get_tide_station_info() {
            try {
                const response = await get_tide_station_info_ajax();
                if (response && response.status === 'success' && response.data) {
                    this.station_list = response.data;
                    this.stid_id_list = response.data.map(station => station.StationID); // 假設每個站點都有一個唯一的 id

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::get_tide_station_info()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        async post_load_all_data(send_data, type) {
            const station_data = {
                parameters_id: send_data.parameters_id,
                station_list: send_data.station_list.toString(),
                freq: send_data.freq
            };
            try {
                const response = await post_load_all_data_ajax(station_data);
                if (response && response.status === 'success' && response.data) {
                    const data = response['data']['station_data'];
                    // 根據 freq 存入不同的時間列表
                    const list_status = type === 'twelve' ? this.stid_list : this.six_hour_list;
                    this.cal_station_data(send_data, data, list_status);
                } 
                else {
                    throw new Error('ERROR:::post_load_all_data()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        cal_station_data(station, res_data, key) {
            for(let i in station.station_list){
                let stid = station.station_list[i];

                if (res_data[stid]) {
                    key[stid] = res_data[stid];
                } else {
                    key[stid] = {};
                }
            }
            return { success: true, data: key };
        },
        // 判斷主頁面該測站是否已有可用的圖表資料（中英文卡片是否要連動顯示，依此判斷）
        station_has_chart_data(stid) {
            const data = this.stid_list[stid];
            return !!data && (data.obs_water_level?.length > 0 || data.fcst_water_level?.length > 0);
        },
        // 傳送官網圖檔
        async send_official_images(send_data) {
            const alert_store = use_alert_store();
            try {
                const { success, message } = wrap_api_response(
                    await post_send_official_images_ajax(send_data),
                    '傳送官網圖檔成功', '傳送官網圖檔失敗，請稍後再試'
                );
                alert_store.show_alert(message, success);
                return success === 'success';
            } catch (error) {
                console.error('傳送官網圖檔失敗:::send_official_images() ', error);
                return false;
            }
        },
        // 上傳預報圖片並落地歸檔（UploadForecastImagesView），form_data 由呼叫端組好（multipart/form-data）
        async upload_forecast_images(form_data) {
            const alert_store = use_alert_store();
            try {
                const { success, message } = wrap_api_response(
                    await post_upload_forecast_images_ajax(form_data),
                    '上傳圖檔成功', '上傳圖檔失敗，請稍後再試'
                );
                alert_store.show_alert(message, success);
                return success === 'success';
            } catch (error) {
                console.error('上傳圖檔失敗:::upload_forecast_images() ', error);
                return false;
            }
        },
        // 傳送非颱風期間圖檔（SentNonTyphoonPicturesView），200 時仍需檢查 data.failed_targets 是否有部分下游失敗
        async send_non_typhoon_pictures(send_data) {
            const alert_store = use_alert_store();
            try {
                const { success, data, message } = wrap_api_response(
                    await post_sent_non_typhoon_pictures_ajax(send_data),
                    '非颱風期間圖檔傳送成功', '非颱風期間圖檔傳送失敗，請稍後再試'
                );

                if (success === 'success' && data?.failed_targets?.length > 0) {
                    alert_store.show_alert(`部分地區傳送失敗：${data.failed_targets.join('、')}`, 'warning');
                    return false;
                }

                alert_store.show_alert(message, success);
                return success === 'success';
            } catch (error) {
                console.error('非颱風期間圖檔傳送失敗:::send_non_typhoon_pictures() ', error);
                return false;
            }
        }
    },
});