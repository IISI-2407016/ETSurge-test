import { apiRequest } from "../utils/api-request.js";

// 查詢颱風篩選參數紀錄列表
export const post_typhoon_filter_parameters_ajax = () => 
    apiRequest("post", "/surge_app/get_typhoon_filter_parameters/");

// 取得所有潮位站基本資訊
export const get_tide_station_info_ajax = () => 
    apiRequest("get", "/surge_app/get_tide_station_info/");

// 根據指定的颱風篩選參數ID、測站列表、頻率，取得各測站的風暴潮資料。
export const post_load_all_data_ajax = (send_data) => 
    apiRequest("post", "/surge_app/load_all_data/", send_data);