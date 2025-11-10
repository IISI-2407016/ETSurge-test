import { defineStore } from 'pinia'
import { axiosConfig } from "../config/axiosConfig.js";
import { get_all_group_json, get_all_user_json, set_have_groups } from '../js/user.js'

export const use_user_store = defineStore('user', {
    state: () => ({
        user: {
            username: ''
        },
        is_logged_in: false,
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
        toggle_login_state() {
            this.is_logged_in = !this.is_logged_in
        },
        clear_user() {
            this.user.account = "";
            this.user.name = "";
            this.user.status = "";
            this.user.group_names = "";
            this.user.level = "";
        },
        check_admin() {
            this.is_admin = this.user.level === 'admin'
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
            this.user = null
            this.is_logged_in = false
            // 清除其他相關狀態
        },
        async set_all_login_info(user_data) {
            this.is_logged_in = true
            this.toggle_login_state()
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
