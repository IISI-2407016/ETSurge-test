import { defineStore } from 'pinia'
import { axiosConfig } from "../config/axiosConfig.js";
import { get_all_group_json, get_all_user_json, set_have_groups } from '../js/user.js'
import { post_auth_token_refresh } from '../js/login.js'

export const use_user_store = defineStore('user', {
    state: () => ({
        user: {
            username: '',
            email: '',
            first_name: '',
            level: ''
        },
        is_logged_in: false,
        session_refresh_interval: null, // 用於存儲 session 刷新的定時器 ID
        refresh_time: 15 * 60 * 1000, // 刷新時間預設 15 分鐘
        users: [],
        users_map: [],
        have_stids_title: [],
        have_function_list_title: [],
        groups: [
        {
            name: '',
            stids: [],
            function_list: []
        }
        ],
        select_groups: [],
        login_state: false,
        is_admin: false,
        show_signup_dialog: false, // 註冊視窗開關
        show_forgot_password_dialog: false, // 忘記密碼視窗開關
        show_user_edit_dialog: false, // 修改個人/使用者開關
        stids: [
            {
                id: "official_station",
                title: "傳送官網設定",
            },
            {
                id: "web_station",
                title: "網站顯示測站設定",
            },
            {
                id: "model_station",
                title: "傳送報潮水位設定",
            },
            {
                id: "user_manage",
                title: "帳號管理",
            },
            {
                id: "group_manage",
                title: "群組管理",
            },
        ],
    }),
    actions: {
        set_user(newUser) {
            this.user = newUser
        },
        set_users(users) {
            this.users = users
        },
        set_users_map(users_map) {
            this.users_map = users_map
        },
        toggle_login_state(value) {
            this.is_logged_in = value
        },
        clear_user() {
            this.user.account = "";
            this.user.name = "";
            this.user.status = "";
            this.user.group_names = "";
            this.user.level = "";
        },
        // @TODO 這邊尚未有使用者權限管理，因此先用first name來判斷是否為admin
        check_admin() {
            this.is_admin = this.user.first_name === 'admin'
        },
        set_have_stids(have_stids_title) {
            this.have_stids_title = have_stids_title
        },
        set_have_func_list(have_function_list_title) {
            this.have_function_list_title = have_function_list_title
        },
        set_groups(groups) {
            this.groups = groups
        },
        set_select_groups(select_groups) {
            this.select_groups = select_groups
        },
        toggle_signup_dialog() {
            this.show_signup_dialog = !this.show_signup_dialog
        },
        toggle_forgot_password_dialog() {
            this.show_forgot_password_dialog = !this.show_forgot_password_dialog
        },
        toggle_user_edit_dialog() {
            this.show_user_edit_dialog = !this.show_user_edit_dialog
        },
        logout() {
            this.user = {}
            this.is_logged_in = false
            // 清除其他相關狀態
        },
        async set_all_login_info(user_data) {
            this.is_logged_in = true
            this.set_user(user_data)
            this.check_admin()

            await get_all_group_json()
            this.get_have_groups()

            // 取得使用者
            if (
                user_data.level === 'admin' ||
                this.have_stids_title.includes('帳號管理')
            ) {
                await get_all_user_json()
            }
        },
        async get_have_groups() {
            const {
                have_stids_title,
                have_function_list_title,
                select_groups
            } = set_have_groups(this.groups, this.user.group_names)

            this.set_have_stids(have_stids_title)
            this.set_have_func_list(have_function_list_title)
            this.set_select_groups(select_groups)
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

        // 註冊
        async signup_ajax({
            user,
            user_store,
            success_message,
            signup_success,
            show_error_message,
            recaptchaLoaded,
            executeRecaptcha
        }) 
        {
            await recaptchaLoaded()
            const token = await executeRecaptcha('signup')
            if (!token) return console.log('驗證錯誤');

            const send_data = {
                account: user.account,
                name: user.name,
                email: user.email,
                work_unit: user.work_unit,
                password: user.password,
                token
            }

            try {
                const response = await axios.post('/user_signup/', send_data, axiosConfig)
                const data = typeof response.data === 'object' ? response.data : JSON.parse(response.data)

                if (data.status === 'success') {
                    signup_success.value = true
                    show_error_message.value = false

                    // success_message.value = user_store.$state.current_page === 'UserManage'
                    //     ? '新增成功!'
                    //     : '註冊成功!<br />等待管理員審核。'

                    // if (user_store.$state.current_page === 'UserManage') {
                    //     const newUser = {
                    //     account: user.account,
                    //     name: user.name,
                    //     work_unit: user.work_unit,
                    //     email: user.email,
                    //     group_names: [],
                    //     level: 'user',
                    //     status: '未審核',
                    //     }
                    //     // 假設你有傳入一個 emit 函式
                    //     emit('update_users', newUser)
                    // }

                    user_store.toggle_signup_dialog()
                } 
                else {
                    show_error_message.value = true
                }
            } catch (err) {
                console.error(err)
                show_error_message.value = true
            }
        }
    }
})
