import { defineStore } from 'pinia'
import { get_group_function_options,
        post_auth_update_user,
        get_group_info,
        get_user_me_info,
        get_user_groups,
        post_groups_create,
        patch_groups_update
} from '../js/user.js'
import { post_auth_token_refresh, 
        post_auth_registration,
        post_auth_login
} from '../js/login.js'
import { use_alert_store } from '@/stores/alert'
import { wrap_api_response } from '../utils/api-request.js';

export const use_user_store = defineStore('user', {
    state: () => ({
        user: {
            username: '',
            email: '',
            first_name: '',
            is_action: false,
            is_staff: false,
        },
        user_list: [], // 使用者列表(含群組)的狀態
        is_logged_in: false,
        session_refresh_interval: null, // 用於存儲 session 刷新的定時器 ID
        refresh_time: 15 * 60 * 1000, // 刷新時間預設 15 分鐘
        groups: [
            {
                name: '',
                stids: [],
                function_list: []
            }
        ],
        select_groups: [],
        login_state: false,
        show_forgot_password_dialog: false, // 忘記密碼視窗開關
        stids: [],
        function_list: [],
    }),
    actions: {
        set_user(newUser) {
            this.user = newUser
        },
        set_user_list(user_list) {
            this.user_list = user_list
        },
        toggle_login_state(value) {
            this.is_logged_in = value
        },
        clear_user() {
            this.user.account = "";
            this.user.name = "";
            this.user.status = "";
            this.user.group_names = "";
            this.user.is_action = false;
            this.user.is_staff = false;
        },
        set_groups(groups) {
            this.groups = groups
        },
        toggle_forgot_password_dialog() {
            this.show_forgot_password_dialog = !this.show_forgot_password_dialog
        },
        logout() {
            this.user = {}
            this.is_logged_in = false
            // 清除其他相關狀態
        },

        // 啟動自動 session 刷新
        async start_session_refresh() {
            this.stop_session_refresh(); // 先清除舊的
            
            console.log('啟動自動 session 刷新機制');
            this.session_refresh_interval = setInterval(async () => {
                try {
                    console.log('執行定期 session 刷新...');
                    const result = await post_auth_token_refresh();
                    
                    if (result.status === 'success') {
                        console.log('Session 自動刷新成功');
                    } else {
                        console.log('Session 自動刷新失敗，執行登出');
                        await this.logout();
                    }
                } catch (error) {
                    console.error('自動刷新 session 失敗:', error);
                    await this.logout();
                }
            }, this.refresh_time);
        },
        // 停止自動 session 刷新
        stop_session_refresh() {
            if (this.session_refresh_interval) {
                console.log('停止自動 session 刷新機制');
                clearInterval(this.session_refresh_interval);
                this.session_refresh_interval = null;
            }
        },

        // 新增(註冊)使用者
        async create_user_confirm(item) {
            const alert_store = use_alert_store()
            const { success, message } = wrap_api_response(
                await post_auth_registration({
                    username: item.username,
                    email: item.email,
                    first_name: item.first_name,
                    // last_name: "", //後端欄位分姓跟名，前端網頁只有一個欄位，所以只帶first name
                    password: item.password,
                    password_confirm: item.check_password
                }), 
                '註冊成功', '註冊失敗'
            );

            alert_store.show_alert(message, success)
        },

        // 登入
        async login_confirm(params) {
            const alert_store = use_alert_store()
            const {success, message, data} = wrap_api_response(
                await post_auth_login(params), 
                '登入成功', '登入失敗'
            );

            alert_store.show_alert(message, success)
            return data;
        },

        // 修改使用者資訊
        async edit_user_confirm(item) {
            const alert_store = use_alert_store()
            // user info
            const send_data = Object.fromEntries(
                Object.entries({
                    email: item.email,
                    first_name: item.first_name,
                    password: item.reset_password,
                }).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            )
            // 修改使用者資料與密碼
            const {success, message} = wrap_api_response(
                await post_auth_update_user(item.id, send_data), 
                '更新使用者資料成功', 
                '更新使用者資料失敗'
            );

            alert_store.show_alert(message, success)
        },

        // 取得群組功能選項
        async set_groups_options() {
            try {
                const response = await get_group_function_options();
                if (response.status === 'success') {
                    this.stids = response.data.stids
                    this.function_list = response.data.function_list
                }
            } catch (error) {
                console.error('取得群組功能選項失敗:', error)
            }
        },

        async fetch_user_groups(userId) {
            const user_info = await get_user_me_info();
            const result = await get_user_groups(userId);
            
            if (user_info.data.is_staff) {
                await this.get_group_data();
                this.set_user(result.data);
                return;
            }
            this.set_user(user_info.data);
        },
        async get_group_data() {
            try {
                const response = await get_group_info();
                if (response.status === 'success') {
                    this.groups = response.data.results;
                } else {
                    console.error('無法取得群組資訊:', response.message);
                    return null;
                }
            } catch (error) {
                console.error('取得群組資訊失敗:', error);
                return null;
            }
        },
        async create_group_data(data) {
            const alert_store = use_alert_store()
            const { success, message } = wrap_api_response(
                await post_groups_create(data), 
                '建立群組成功', '建立群組失敗'
            );
            alert_store.show_alert(message, success)
        },
        async patch_groups_update(id, data) {
            const alert_store = use_alert_store()
            const { success, message } = wrap_api_response(
                await patch_groups_update(id, data), 
                '更新群組成功', '更新群組失敗'
            );
            alert_store.show_alert(message, success)
        },
    }
})
