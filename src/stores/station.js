// stores/stationStore.js
import { defineStore } from 'pinia'

export const station_set = defineStore('station_set', {
  state: () => ({
    station_list: [],
    official_station: [],
    regional_station_list: [],
    web_station: [],
    model_items: [
      { text: '暴潮模式+資料庫調和分析+修正', value: 'surge_model_mod' },
      { text: '模式暴潮+資料庫調和分析', value: 'surge_model' },
    ]
  }),
  actions: {
    setStationList(data) {
      this.station_list = data
    },
    getModelStationInput() {
      const res = {
        surge_model: [],
        surge_model_mod: [],
      }

      for (const s of this.station_list) {
        if (s.sent_water_level_type === 'surge_model') res.surge_model.push(s.stid)
        if (s.sent_water_level_type === 'surge_model_mod') res.surge_model_mod.push(s.stid)
      }

      return {
        surge_model: res.surge_model.join(','),
        surge_model_mod: res.surge_model_mod.join(','),
      }
    }
  }
})
