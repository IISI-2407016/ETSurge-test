import { defineStore } from 'pinia';
import { post_county_tide_warnings_ajax, post_county_tide_warnings_result_ajax } from '../js/light.js';

export const use_light_store = defineStore('light', {
    state: () => ({
        light_list: [],
        has_collapsed: true, // 控制表格縮放
        has_light_send: false, // 確定系集燈號發送
        is_loading: false, // 控制載入動畫
    }),
    actions: {
        set_has_collapsed(value) {
            this.has_collapsed = value;
        },
        set_has_light_send(value) {
            this.has_light_send = value;
        },
        set_is_loading(value) {
            this.is_loading = value;
        },
        async post_county_tide_warnings(send_data) {
            try {
                const response = await post_county_tide_warnings_ajax(send_data);
                if (response && response.status === 'success' && response.data) {
                    this.light_list = response.data;
                    console.log("light_list: ", this.light_list);
                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::post_county_tide_warnings()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        // 直接讀取已儲存的縣市潮位警戒資料（不重新計算），供燈號表格「繪製」預覽使用
        async get_county_tide_warnings_result(send_data) {
            try {
                const response = await post_county_tide_warnings_result_ajax(send_data);
                if (response && response.status === 'success' && response.data) {
                    this.light_list = response.data;
                    console.log("light_list: ", this.light_list);
                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::get_county_tide_warnings_result()');
                }
            } catch (error) {
                return { success: false, error };
            }
        }
    }
})
