import axios from "axios";
import { axiosConfig } from "../config/axiosConfig.js";
import router from "@/router/index.js";

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
        if(result.status === 'error' && result.data.detail === 'Authentication credentials were not provided.') {
            //未登入轉導登入頁
            router.push({ name: 'login' });
            return;
        }
        if(result.status === 'error') {
            throw new Error(result.data.detail || 'API Request Error');
        }
        return result;
    } catch (error) {
        console.error(`API Request Error [${method.toUpperCase()} ${url}] :::`, error);
        throw error;
    }
}