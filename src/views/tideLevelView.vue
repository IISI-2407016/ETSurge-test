<template>
    <div>
        <v-data-table
            :headers="headers"
            :items="desserts"
            hide-default-footer
            hover
        >
            <template v-slot:item="{ item }">
                <tr class="text-no-wrap">
                    <td>{{ item.update_time }}</td>
                    <td>{{ item.typhoon_name }}</td>
                    <td>{{ item.initial_time }}</td>
                    <td>{{ item.path_type }}</td>
                    <td class="text-center">{{ item.effective_radius }}</td>
                    <td class="text-center">{{ item.central_pressure }}</td>
                    <td class="text-center">{{ item.movement_speed }}</td>
                    <td class="text-center">{{ item.movement_direction }}</td>
                    <td class="text-center">
                        <v-btn color="primary">
                            預覽
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table>
    </div>
</template>
<script setup>
    import { ref } from 'vue'
    const headers = ref([
        { title: '更新時間(地方時)', key: 'update_time', align: 'start', sortable: false },
        { title: '颱風名稱', key: 'typhoon_name', align: 'start', sortable: false },
        { title: '初始時間(UTC)', key: 'initial_time', align: 'start', sortable: false },
        { title: '路徑種類', key: 'path_type', align: 'start', sortable: false },
        { title: '有效半徑(km)', key: 'effective_radius', align: 'center', sortable: false },
        { title: '中心氣壓(hPa)', key: 'central_pressure', align: 'center', sortable: false },
        { title: '移速(km/h)', key: 'movement_speed', align: 'center', sortable: false },
        { title: '移向', key: 'movement_direction', align: 'center', sortable: false },
        { title: '動作', key: 'action', align: 'center', sortable: false }
    ])
    const desserts = [
        {
            update_time: '2025-10-10 12:00',
            typhoon_name: '2504-丹娜絲',
            initial_time: '2025-10-10 00:00',
            path_type: 'Forecast',
            effective_radius: 100,
            central_pressure: '960~950',
            movement_speed: '10~20',
            movement_direction: 'NNE',
            action: 'None'
        },
        {
            update_time: '2025-10-11 12:00',
            typhoon_name: '2504-丹娜絲',
            initial_time: '2025-10-11 00:00',
            path_type: 'Observed',
            effective_radius: 150,
            central_pressure: '970~960',
            movement_speed: '15~25',
            movement_direction: 'NE',
            action: 'None'
        },
        {
            update_time: '2025-10-12 12:00',
            typhoon_name: '2504-丹娜絲',
            initial_time: '2025-10-12 00:00',
            path_type: 'Forecast',
            effective_radius: 120,
            central_pressure: '980~970',
            movement_speed: '20~30',
            movement_direction: 'ENE',
            action: 'None'
        }
    ]
</script>