import { apiRequest } from "../utils/api-request.js";

// 取得傳送官網設定
export const get_cwa_area_config_ajax = () => 
    apiRequest("get", "/surge_app/get_cwa_area_config/");

// 更新傳送官網設定
export const update_cwa_user_sent_config_ajax = (data) => 
    apiRequest("post", "/surge_app/update_cwa_user_sent_config/", data);

// 取得顯示測站設定
export const get_user_tide_station_display_config_ajax = () =>
    apiRequest("get", "/surge_app/user_tide_station_display_config/");

// 更新顯示測站設定
export const update_user_tide_station_display_config_ajax = (data) =>
    apiRequest("post", "/surge_app/user_tide_station_display_config/", data);

// 取得所有潮位站基本資訊
export const get_tide_station_info_ajax = () =>
    apiRequest("get", "/surge_app/get_tide_station_info/");

// 取得水位設定
export const get_user_tide_station_config_ajax = () =>
    apiRequest("get", "/surge_app/user_tide_station_config/");

// 更新水位設定
export const update_user_tide_station_config_ajax = (data) =>
    apiRequest("post", "/surge_app/user_tide_station_config/", data);