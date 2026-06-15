import { defineStore } from 'pinia'
import { get_cwa_area_config_ajax, 
        update_cwa_user_sent_config_ajax,
        get_tide_station_info_ajax,
        get_user_tide_station_display_config_ajax,
        update_user_tide_station_display_config_ajax,
        get_user_tide_station_config_ajax,
        update_user_tide_station_config_ajax
} from "@/js/setting";
import { wrap_api_response } from '../utils/api-request.js';
import { use_alert_store } from '@/stores/alert'

export const station_set_store = defineStore('station_set_store', {
    state: () => ({
        official_list: [],
        station_list: [],
        water_list: [],
    }),

    actions: {
        async get_cwa_area_config() {
            try {
                const response = await get_cwa_area_config_ajax();
                if (response.status === 'success') {
                    this.official_list = response.data;
                }
            }catch (error) {
                console.error('取得傳送官網設定失敗:::get_cwa_area_config() ', error);
            }
        },

        async update_cwa_user_sent_config(data) {
            const alert_store = use_alert_store()
            try {
                 const { success, message } = wrap_api_response(
                    await update_cwa_user_sent_config_ajax(data), 
                    '更新傳送官網設定成功', '更新傳送官網設定失敗，請檢查輸入的資料是否正確'
                );
                alert_store.show_alert(message, success)
                if (success) {
                    console.log('更新傳送官網設定成功');
                }
            }catch (error) {
                console.error('更新傳送官網設定失敗:::update_cwa_user_sent_config() ', error);
            }
        },

        async get_tide_station_info() {
            try {
                const response = await get_tide_station_info_ajax();
                if (response.status === 'success') {
                    this.station_list = response.data;
                }
            }catch (error) {
                console.error('取得所有潮位站基本資訊失敗:::get_tide_station_info() ', error);
            }
        },

        async get_user_tide_station_display_config() {
            try {
                const response = await get_user_tide_station_display_config_ajax();
                if (response.status === 'success') {
                    this.station_list = response.data.length > 0 ? 
                        response.data : 
                        await get_tide_station_info_ajax().then(res => res.data);
                }
            }catch (error) {
                console.error('取得顯示測站設定失敗:::get_user_tide_station_display_config() ', error);
            }
        },

        async update_user_tide_station_display_config(data) {
            const alert_store = use_alert_store()
            try {
                const { success, message } = wrap_api_response(
                    await update_user_tide_station_display_config_ajax(data), 
                    '更新顯示測站設定成功', '更新顯示測站設定失敗，請檢查輸入的資料是否正確'
                );
                alert_store.show_alert(message, success)
                if (success) {
                    console.log('更新顯示測站設定成功');
                }
            }catch (error) {
                console.error('更新顯示測站設定失敗:::update_user_tide_station_display_config() ', error);
            }
        },

        async get_user_tide_station_config() {
            try {
                const response = await get_user_tide_station_config_ajax();
                if (response.status !== 'success') return;
                const data = Array.isArray(response.data) ? response.data : [];
                this.water_list = data.length > 0
                    ? data
                    : this.station_list.map(({ StationID, StationName }) => ({
                        StationID: StationID,
                        StationName: StationName,
                        DataSource: "surge_model_mod"
                    }));
            }catch (error) {
                console.error('取得水位設定失敗:::get_user_tide_station_config() ', error);
            }
        },

        async update_user_tide_station_config(data) {
            const alert_store = use_alert_store()
            try {
                 const { success, message } = wrap_api_response(
                    await update_user_tide_station_config_ajax(data), 
                    '更新水位設定成功', '更新水位設定失敗，請檢查輸入的資料是否正確'
                );
                alert_store.show_alert(message, success)
                if (success) {
                    console.log('更新水位設定成功');
                }
            }catch (error) {
                console.error('更新水位設定失敗:::update_user_tide_station_config() ', error);
            }
        }
    }
})