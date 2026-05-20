import { defineStore } from 'pinia'
import { axiosConfig } from "../config/axiosConfig.js";
import { get_all_group_json, 
        get_all_user_json, 
        set_have_groups,
        get_group_function_options,
        post_auth_update_user,
        get_user_id_info,
        get_group_info,
        post_groups_create,
        patch_groups_update
} from '../js/user.js'
import { post_auth_token_refresh, 
        post_auth_registration 
} from '../js/login.js'
import { use_alert_store } from '@/stores/alert'

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
        
        stids: [],
        function_list: []
        // stids: [
        //     {
        //         id: "official_station",
        //         title: "傳送官網設定",
        //     },
        //     {
        //         id: "web_station",
        //         title: "網站顯示測站設定",
        //     },
        //     {
        //         id: "model_station",
        //         title: "傳送報潮水位設定",
        //     },
        //     {
        //         id: "user_manage",
        //         title: "帳號管理",
        //     },
        //     {
        //         id: "group_manage",
        //         title: "群組管理",
        //     },
        // ],
    }),
    actions: {
        set_user(newUser) {
            this.user = newUser
        },
        set_users(users) {
            this.users = users
        },
        set_user_list(user_list) {
            this.user_list = user_list
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
            this.user.is_action = false;
            this.user.is_staff = false;
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
        },
        set_user_manage(user) {
            this.user.is_action = user.is_action;
            this.user.is_staff = user.is_staff;
        },

        // 修改使用者資訊
        // async edit_user_confirm() {
        //     const { valid } = await update_user_form.value?.validate()
        //     const { valid: password_valid }= await update_password_form.value?.validate()
        //     if (!valid || !password_valid) return

        //     // user info
        //     const send_data = {
        //         email: props.edit_user.email,
        //         first_name: props.edit_user.first_name,
        //     }

        //     // password info
        //     const send_pas_data = {
        //         new_password1: props.edit_user.password,
        //         new_password2: props.edit_user.password
        //     }

        //     // 修改使用者資料與密碼
        //     const data_result = await post_auth_update_user(send_data);
        //     if (data_result.status !== 'success') {
        //         alert_store.show_alert('使用者資料修改失敗', 'error')
        //         return
        //     }
        //     const pas_result = await post_auth_change_password(send_pas_data);
        //     if (pas_result.status !== 'success') {
        //         alert_store.show_alert('密碼修改失敗', 'error')
        //         return
        //     }

        //     props.edit_user.password = ''
        //     user_store.set_user(props.edit_user)
        //     show_user_edit.value = false
        //     alert_store.show_alert('使用者資料修改成功', 'success')
        // },

        // 新增使用者
        async create_user_confirm(item) {
            const alert_store = use_alert_store()
            const { status, message } = await post_auth_registration({
                username: item.username,
                email: item.email,
                first_name: item.first_name,
                // last_name: "", //後端欄位分姓跟名，前端網頁只有一個欄位，所以只帶first name
                password: item.password,
                password_confirm: item.check_password
            })
            if (status !== 'success') {
                alert_store.show_alert('註冊失敗', 'error')
                console.error(message)
                return
            }

            alert_store.show_alert('註冊成功', 'success')
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
            const result = await post_auth_update_user(item.id, send_data);
            if (result.status !== 'success') {
                alert_store.show_alert(
                    `${result.data.message}，${result.data.data.password[0]}` || 
                    '使用者資料修改失敗', 
                    'error'
                )
                return
            }

            alert_store.show_alert("更新使用者資料成功", 'success')
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

        async get_user_groups(u_id) {
            const user_info = await get_user_id_info(u_id)
            this.set_user(user_info.data)

            const is_staff = this.user.is_staff; // 是否為管理員
            if (is_staff) {
                this.get_group_data()
            }
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
            try {
                const response = await post_groups_create(data);
                if (response.status === 'success') {
                    alert_store.show_alert('建立群組成功', 'success')
                    return response.data;
                } else {
                    console.error('無法建立群組:', response.message);
                    return null;
                }
            } catch (error) {
                console.error('建立群組失敗:', error);
                alert_store.show_alert('無法建立群組', 'error')
                return null;
            }
        },
        async patch_groups_update(id, data) {
            const alert_store = use_alert_store()
            try {
                const response = await patch_groups_update(id, data);
                if (response.status === 'success') {
                    alert_store.show_alert('更新群組成功', 'success')
                    return response.data;
                }
                else {
                    console.error('無法更新群組:', response.message);
                    return null;
                }
            } catch (error) {
                console.error('更新群組失敗:', error);
                alert_store.show_alert('無法更新群組', 'error')
                return null;
            }
        }
    }
})
