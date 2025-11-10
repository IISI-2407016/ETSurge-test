import { defineStore } from 'pinia';
import { post_county_tide_warnings_ajax } from '../js/light.js';

export const use_light_store = defineStore('light', {
    state: () => ({
        light_list: [],
        has_collapsed: false // 控制表格縮放
    }),
    actions: {
        set_has_collapsed(value) {
            this.has_collapsed = value;
        },
        async post_county_tide_warnings() {
            try {
                const response = await post_county_tide_warnings_ajax();
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
        }
    }
})
