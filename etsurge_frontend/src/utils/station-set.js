import axios from 'axios'
import {
    axiosConfig
} from '../config/axiosConfig.js'

export function get_station_data_ajax () {
    let send_data = {};

    return axios.post('/load_station_data/', send_data, axiosConfig)
        .then(function (response) {
            let data = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
            if (data['status'] == 'success') {
                let station_data = data['data'];
                this.regional_station_list = station_data.regional_station_list;
                this.station_list = station_data.station_list;

                let regional_selected_stations = [];
                this.regional_station_list.forEach(function(e){
                    regional_selected_stations.push(e.selected_station);
                });

                this.regional_selected_stations = regional_selected_stations;
                this.official_station = arr_sort(station_data.sent_to_web, this.station_list);
                this.web_station = arr_sort(station_data.show_on_web, this.station_list);

                function arr_sort (arr, station_list) {
                    let newArray = [];
                    arr.forEach(stid => {
                        station_list.forEach(e => {
                            if(e.stid === stid){
                                newArray[e.order] = stid;
                            }
                        });
                    });
                
                    return newArray.filter(Boolean);
                }
            }

        }.bind(this))
        .catch(function (error) {
            console.log(error);
        })
}

export function update_official_station_ajax (stations) {
    let send_data = {
        "stations": stations.toString(),
    };

    return axios.post('/update_official_station/', send_data, axiosConfig)
        .then(function (response) {
            let data = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
            if (data['status'] == 'success') {
                console.log("儲存成功");
            }

        }.bind(this))
        .catch(function (error) {
            console.log(error);
        })
}

export function update_web_station_ajax (stations) {
    let send_data = {
        "stations": stations.toString(),
    };

    return axios.post('/update_web_station/', send_data, axiosConfig)
        .then(function (response) {
            let data = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
            if (data['status'] == 'success') {
                console.log("儲存成功");
            }

        }.bind(this))
        .catch(function (error) {
            console.log(error);
        })
}

export function update_model_station_ajax (inputs) {
    let send_data = {
        "surge_model": inputs.surge_model,
        "surge_model_mod": inputs.surge_model_mod,
    };

    return axios.post('/update_model_station/', send_data, axiosConfig)
        .then(function (response) {
            let data = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
            if (data['status'] == 'success') {
                console.log("儲存成功");
            }

        }.bind(this))
        .catch(function (error) {
            console.log(error);
        })
}
