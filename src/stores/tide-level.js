import { defineStore } from 'pinia'
import { 
    get_tide_station_info_ajax,
    post_load_all_data_ajax
} from '../js/tide-level.js';

export const tide_level_store = defineStore('tide_level', {
    state: () => ({
        station_list: [],
        stid_id_list: [],
        stid_list: {},
        six_hour_list: [],
        chart_list: {}, // 測站資訊
        has_chart: false,
        parameter_id: null,
        has_collapsed: false, // 控制颱風表格縮放
        empty_fcst_water_level_alert_dialog: false, // 預報水位空值警告視窗
        empty_fcst_water_level_alert_dialog_lock: false, // 預報水位空值警告視窗鎖定
    }),
    actions: {
        set_has_chart(value) {
            this.has_chart = value;
        },
        set_parameter_id(id) {
            this.parameter_id = id;
        },
        set_has_collapsed(value) {
            this.has_collapsed = value;
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