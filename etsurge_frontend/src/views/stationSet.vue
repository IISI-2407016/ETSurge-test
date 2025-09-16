<template>
    <div>
        <!-- 官網測站 Dialog -->
        <v-dialog v-model="dialog_official_station" max-width="800">
            <v-card tile>
                <v-toolbar color="primary">
                    <v-toolbar-title>傳送官網設定</v-toolbar-title>
                    <v-spacer />
                    <v-btn icon 
                        @click="dialog_official_station = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-card-subtitle class="pb-0 pt-3">傳至官網測站</v-card-subtitle>
                <v-container>
                    <v-row>
                        <v-col
                            v-for="(regional_data, index) in station_set_store.regional_station_list"
                            :key="regional_data.area_id"
                            cols="12" md="3"
                        >
                        <v-select
                            v-model="station_set_store.official_station[index]"
                            :items="regional_data.stations"
                            :label="regional_data.text"
                            item-value="stid"
                            item-text="text"
                            variant="filled"
                            hide-details
                        />
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="info" 
                        @click="update_official_station">確定修改
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 網站測站 Dialog -->
        <v-dialog v-model="dialog_web_station" max-width="800">
            <v-card tile>
                <v-toolbar color="primary">
                    <v-toolbar-title>網站顯示測站設定</v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="dialog_web_station = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-autocomplete
                                v-model="station_set_store.web_station"
                                :items="station_set_store.station_list"
                                chips
                                label="網站顯示測站"
                                item-text="stnac"
                                item-value="stid"
                                multiple
                                hide-details
                            >
                                <template #selection="{ attrs, selected, item, select }">
                                    <v-chip
                                        v-bind="attrs"
                                        :input-value="selected"
                                        close
                                        @click="select"
                                        @click:close="remove(item)"
                                    >
                                        {{ item.stnac }}
                                    </v-chip>
                                </template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="info" 
                        @click="update_web_station">確定修改
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 模式測站 Dialog -->
        <v-dialog v-model="dialog_model_station" max-width="800">
            <v-card tile>
                <v-toolbar color="primary">
                    <v-toolbar-title>傳送暴潮水位設定</v-toolbar-title>
                    <v-spacer />
                    <v-btn icon @click="dialog_model_station = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-toolbar>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-data-table
                                :headers="model_station_headers"
                                :items="station_set_store.station_list"
                                class="elevation-1"
                            >
                                <template v-slot:[`item.sent_water_level_type`]="{ item }">
                                    <v-select
                                        v-model="item.sent_water_level_type"
                                        :items="station_set_store.model_items"
                                        item-value="value"
                                        item-text="text"
                                        label="模式"
                                    />
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </v-container>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="info" 
                        @click="update_model_station">確定修改
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { station_set } from '../stores/station-store.js'
import { emitter } from '../utils/event-bus.js'
import {
    get_station_data_ajax,
    update_official_station_ajax,
    update_web_station_ajax,
    update_model_station_ajax,
} from '../utils/station-set.js'

const props = defineProps({
    dialog_name: String
})

const station_set_store = station_set()
const dialog_official_station = ref(false)
const dialog_web_station = ref(false)
const dialog_model_station = ref(false)

onMounted(async () => {
    await get_station_data_ajax().then((data) => {
        station_set_store.setStationList(data)
    })
    if (props.dialog_name === 'official_station') dialog_official_station.value = true
    if (props.dialog_name === 'web_station') dialog_web_station.value = true
    if (props.dialog_name === 'model_station') dialog_model_station.value = true
})

function update_official_station() {
    if (station_set_store.official_station.length !== 8) {
        alert('傳至官網測站只能8個')
        return
    }
    dialog_official_station.value = false
    update_official_station_ajax(station_set_store.official_station)
    emitter.emit('render_main_content', ['official_web_station', station_set_store.official_station])
}

function update_web_station() {
    dialog_web_station.value = false
    update_web_station_ajax(station_set_store.web_station)
    emitter.emit('render_main_content', ['web_station', station_set_store.web_station])
}

function update_model_station() {
    dialog_model_station.value = false
    const inputs = station_set_store.getModelStationInput()
    update_model_station_ajax(inputs)
}

function remove(item) {
    const index = station_set_store.web_station.indexOf(item.stid)
    if (index >= 0) station_set_store.web_station.splice(index, 1)
}

const model_station_headers = [
    { text: '測站ID', value: 'stid', align: 'left', sortable: false },
    { text: '測站名稱', value: 'stnac', align: 'center', sortable: false },
    { text: '暴潮水位設定', value: 'sent_water_level_type', align: 'center', sortable: false },
]
</script>