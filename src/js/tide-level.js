import { apiRequest } from "../utils/api-request.js";

// 查詢颱風篩選參數紀錄列表
export const post_typhoon_filter_parameters_ajax = (send_data) => 
    apiRequest("post", "/surge_app/get_typhoon_filter_parameters/", send_data);

// 取得所有潮位站基本資訊
export const get_tide_station_info_ajax = () => 
    apiRequest("get", "/surge_app/get_tide_station_info/");

// 根據指定的颱風篩選參數ID、測站列表、頻率，取得各測站的風暴潮資料。
export const post_load_all_data_ajax = (send_data) => 
    apiRequest("post", "/surge_app/load_all_data/", send_data);

// 傳送水位預報至資料課 => parameters_id，等燈號作完成後才能傳送
export const post_sent_water_level_ajax = (send_data) => 
    apiRequest("post", "/surge_app/sent_water_level/", send_data);

// 上傳預報圖片並落地歸檔，上傳前先執行此API，若回傳成功，才可上傳圖片
export const post_upload_forecast_images_ajax = (send_data) => 
    apiRequest("post", "/surge_app/upload_forecast_images/", send_data);

// 傳送颱風期間 =>
export const post_send_official_images_ajax = (send_data) => 
    apiRequest("post", "/surge_app/send_official_images/", send_data);

// 傳送颱風期間(不含表格圖檔) => 
export const post_sent_typhoon_pictures_nontable_ajax = (send_data) => 
    apiRequest("post", "/surge_app/sent_typhoon_pictures_nontable/", send_data);

// 傳送非颱風期間圖檔
export const post_sent_non_typhoon_pictures_ajax = (send_data) => 
    apiRequest("post", "/surge_app/sent_non_typhoon_pictures/", send_data);