import axios from "axios";
import { axiosConfig } from "../config/axiosConfig.js";

// 創建 axios 實例
const apiClient = axios.create(axiosConfig);

export async function apiRequest(method, url, data = null) {
    try {
        const options = {
            method,
            url
        };
        if (data) options.data = data;

        const res = await apiClient(options);
        const result = typeof res.data === "object" ? res.data : JSON.parse(res.data);

        return result;
    } catch (error) {
        console.error(`API Request Error [${method.toUpperCase()} ${url}] :::`, error.response);
        return {
            status: 'error',
            data: null,
            message: error.message || '網路請求失敗',
            error: error
        };
    }
}