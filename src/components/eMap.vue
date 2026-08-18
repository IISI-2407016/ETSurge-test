<template>
    <div ref="map_container" class="typhoon-map"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import L from 'leaflet';
import moment from 'moment';
import { display_directions } from '@/config/setting';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
    // 傳入 uvp_data_store.search_results（完整陣列）
    track_data: {
      type: [Array, Object], // 允許陣列或物件（依後端回傳格式）
      default: () => ({})
    }
});

const map_container = ref(null);
let map = null;
let track_layers = [];

// 三條路徑顏色
const TRACK_COLORS = {
    official: '#e74c3c',  // 紅
    ref1:     '#3498db',  // 藍
    ref2:     '#2ecc71',  // 綠
};

const normalize_track_data = (raw) => {
    if (Array.isArray(raw)) return raw;

    if (raw && typeof raw === 'object') {
        return Object.entries(raw).flatMap(([category, list]) => {
            if (!Array.isArray(list)) return [];
            return list.map(item => ({
                ...item,
                track_data: {
                    ...item.track_data,
                    Category: item.track_data?.Category ?? category
                }
            }));
        });
    }

    return [];
};

const draw_tracks = (data) => {
    // 清除舊圖層
    track_layers.forEach(layer => map.removeLayer(layer));
    track_layers = [];

    const normalized = normalize_track_data(data);
    if (normalized.length === 0) return;

    // 只取 InterPoint: false，依 Category 分組
    const grouped = {};
    normalized.forEach(item => {
        const td = item.track_data;
        if (!grouped[td.Category]) grouped[td.Category] = [];
        grouped[td.Category].push({ ...td, filter_params: item.filter_params, model_data: item.model_data });
    });

    // 依 Tau 排序後畫線 + 標記
    Object.entries(grouped).forEach(([category, points]) => {
        const sorted = [...points].sort((a, b) => a.Tau - b.Tau);
        const color = TRACK_COLORS[category] ?? '#888';
        // const latlngs = sorted.map(p => [parseFloat(p.Lat), parseFloat(p.Lon)]);

        // // 折線
        // const polyline = L.polyline(latlngs, { 
        //     color, 
        //     weight: 2.5,
        //     dashArray: '5, 5' // 虛線效果
        // }).addTo(map);
        // track_layers.push(polyline);

        // 每個主要點畫圓圈
        sorted.forEach(p => {
            const is_main_point = p.InterPoint === false;
            // model_data 為空陣列或 null 時代表查無模式資料，畫面呈現微透明
            const has_no_data = !p.model_data || p.model_data.length === 0;
            const popup_info = `
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">${category}</div>
                <b>Tau：${p.Tau} Hours</b><br/>
                <b>預報時間：${initial_time_format(p.InitialTime)} UTC</b><br/>
                <b>經緯度：${p.Lon}, ${p.Lat}</b><br/>
                <b>中心氣壓：${p.filter_params.Pressure_min} ~ ${p.filter_params.Pressure_max} hPa</b><br/>
                <b>最大陣風：${p.filter_params.MaxWind_min} ~ ${p.filter_params.MaxWind_max} m/s</b><br/>
                <b>移速：${p.filter_params.TranslationSpeed_min} ~ ${p.filter_params.TranslationSpeed_max} km/hr</b><br/>
                <b>移向：${direction(p.filter_params.CardinalDirection)}</b><br/>
            `;
            const marker = L.circleMarker(
                [parseFloat(p.Lat), parseFloat(p.Lon)],
                { 
                    radius: is_main_point ? 7 : 2.5, 
                    color: '#fff', 
                    weight: is_main_point ? 1.5 : 1,
                    fillColor: color,
                    fillOpacity: has_no_data ? 0.3 : (is_main_point ? 1 : 0.9),
                    opacity: has_no_data ? 0.4 : 1
                }
            )
            .on('mouseover', function () { this.openPopup(); })
            .on('mouseout', function () { this.closePopup(); })
            .addTo(map);

            if (is_main_point) marker.bindPopup(popup_info);
            
            track_layers.push(marker);
        });
    });

    // 自動縮放到所有路徑範圍
    // if (track_layers.length > 0) {
    //     const group = L.featureGroup(track_layers);
    //     map.fitBounds(group.getBounds().pad(0.15));
    // }
}

const initial_time_format = (time) => {
    return moment(time).utc().format('YYYY-MM-DD HH:mm');
}

const direction = (d) => {
    return display_directions[d] ?? d;
}

onMounted(() => {
    map = L.map(map_container.value, {
        minZoom: 3,  // ← 加這行，限制最小縮放
        zoomControl: false , // ← 加這行，移除預設的縮放控制
        attributionControl: false // ← 加這行，移除右下角 Leaflet 文字
    }).setView([25, 120], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
    
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    draw_tracks(props.track_data);
    // map = L.map(map_container.value).setView([20, 130], 3);

    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 8,
    // }).addTo(map);

    // draw_tracks(props.track_data);
});

onBeforeUnmount(() => {
    if (map) {
        map.remove();
        map = null;
    }
});

// 資料更新時重繪
watch(() => props.track_data, (new_data) => {
    if (map) draw_tracks(new_data);
}, { deep: true });

</script>

<style scoped>
.typhoon-map {
    width: 100%;
    height: 100%;
}
</style>