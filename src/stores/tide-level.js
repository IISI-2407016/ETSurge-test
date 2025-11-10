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
        six_hour_list: []
    }),
    actions: {
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
                stations: send_data.stations.toString(),
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
            for(let i in station.stations){
                let stid = station.stations[i];

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