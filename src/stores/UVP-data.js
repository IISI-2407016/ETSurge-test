import { defineStore } from 'pinia'
import { 
    get_typhoon_name_data_ajax,
    post_typhoon_track_data_ajax,
    post_uvp_preview_ajax,
    post_uvp_average_ajax
 } from '../js/typhoon-data.js'
import { get_typhoon_filter_parameters_ajax } from '../js/tide-level.js'

export const use_uvp_data_store = defineStore('uvp_data', {
    state: () => ({
        uvp_data: {
            ModelName: '',
            TyNo: '',
            InitialTime: '',
            Category: '',
            Radius: '',
            Pressure_range: {
                from: '',
                to: ''
            },
            MaxWind_range: {
                from: '',
                to: ''
            },
            TranslationSpeed_range: {
                from: '',
                to: ''
            },
            CardinalDirection: ''
        },
        Ty_info: [],
        tide_list: [],
        search_results: [],
        average_typhoon_data: [],
        angle: 0,
        is_active: false,
        selected_direction: ''
    }),
    actions: {
        activate() {
            this.is_active = true;
        },
        deactivate() {
            this.is_active = false;
        },
        save_UVP_data(new_uvp_data) {
            this.uvp_data = {...this.uvp_data, ...new_uvp_data};
        },
        async get_typhoon_name_data() {
            const { status, data } = await get_typhoon_name_data_ajax();
            if (status === 'success') {
                this.Ty_info = data;
                this.uvp_data.TyNo = data.length > 0 ? data[0].TyNo : '';
            }
            return;
        },
        async post_typhoon_category_data(send_data) {
            const { status, data } = await post_typhoon_track_data_ajax(send_data);
            if (status === 'success') {
                this.uvp_data.Category = data;
            }
            return;
        },
        async get_model_data_by_track(send_data) {
            try {
                const response = await post_uvp_preview_ajax(send_data);
                
                if (response && response.status === 'success' && response.data) {
                    this.search_results = response.data;

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::get_model_data_by_track()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        async post_uvp_average(send_data) {
            try {
                const response = await post_uvp_average_ajax(send_data);
                
                if (response && response.status === 'success' && response.data) {
                    this.average_typhoon_data = response.data;

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::post_uvp_average()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        async get_typhoon_data() {
            try {
                const response = await get_typhoon_filter_parameters_ajax();
                if (response && response.status === 'success' && response.data) {
                    this.tide_list = response.data;

                    return { success: true, data: response.data };
                } else {
                    throw new Error('ERROR:::get_typhoon_data()');
                }
            } catch (error) {
                return { success: false, error };
            }
        },
        set_angle(new_angle) {
            this.angle = new_angle;
        },
        set_selected_direction(direction) {
            this.selected_direction = direction;
        }
    },
});