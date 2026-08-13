import { defineStore } from 'pinia'
import { 
    get_tide_station_info_ajax,
    post_load_all_data_ajax
} from '../js/tide-level.js';

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
        }
    },
});