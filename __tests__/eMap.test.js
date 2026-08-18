import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import eMap from '@/components/eMap.vue';

// leaflet 操作真實 DOM/Canvas，測試環境用假的 L 物件取代，
// 只保留 circleMarker 呼叫時的 options 供斷言用
const { circle_marker_calls } = vi.hoisted(() => ({ circle_marker_calls: [] }));

vi.mock('leaflet', () => {
    const create_mock_map = () => {
        const map_instance = {
            setView: () => map_instance,
            removeLayer: () => {},
            remove: () => {},
        };
        return map_instance;
    };

    const circleMarker = (latlng, options) => {
        circle_marker_calls.push({ latlng, options });
        const marker = {
            on: () => marker,
            addTo: () => marker,
            bindPopup: () => marker,
        };
        return marker;
    };

    return {
        default: {
            map: () => create_mock_map(),
            tileLayer: () => ({ addTo: () => {} }),
            control: { zoom: () => ({ addTo: () => {} }) },
            circleMarker,
            featureGroup: () => ({ getBounds: () => ({ pad: () => {} }) }),
        },
    };
});

// 模擬 /surge_app/get_model_data_by_track/ 回傳的單筆軌跡點結構
const build_point = (tau, model_data, category = 'official') => ({
    track_data: {
        TyNo: '202526',
        Category: category,
        InitialTime: '2025-11-06T06:00:00Z',
        Tau: tau,
        Lon: '120.0000',
        Lat: '20.0000',
        InterPoint: false,
    },
    model_data,
    filter_params: {
        Pressure_min: 900,
        Pressure_max: 1000,
        MaxWind_min: 20,
        MaxWind_max: 30,
        TranslationSpeed_min: 10,
        TranslationSpeed_max: 20,
        CardinalDirection: 1,
    },
});

describe('eMap.vue — model_data 為空/null 時的透明度處理', () => {
    beforeEach(() => {
        circle_marker_calls.length = 0;
    });

    it('model_data 為空陣列時，該點降低 fillOpacity/opacity；有資料的點維持原樣', () => {
        const track_data = {
            official: [
                build_point(0, []),
                build_point(12, [{ ModelName: 'TWRF' }]),
            ],
        };
        mount(eMap, { props: { track_data } });

        expect(circle_marker_calls).toHaveLength(2);
        const [no_data_point, has_data_point] = circle_marker_calls;

        expect(no_data_point.options.fillOpacity).toBe(0.3);
        expect(no_data_point.options.opacity).toBe(0.4);

        expect(has_data_point.options.fillOpacity).toBe(1); // 主要點 is_main_point ? 1 : 0.9
        expect(has_data_point.options.opacity).toBe(1);
    });

    it('model_data 為 null 時，等同無資料處理', () => {
        const track_data = {
            official: [build_point(0, null)],
        };
        mount(eMap, { props: { track_data } });

        expect(circle_marker_calls).toHaveLength(1);
        expect(circle_marker_calls[0].options.fillOpacity).toBe(0.3);
        expect(circle_marker_calls[0].options.opacity).toBe(0.4);
    });

    it('不影響其他資料：多類別中只有無資料的點被調整透明度', () => {
        const track_data = {
            official: [build_point(0, [], 'official')],
            ref1: [build_point(0, [{ ModelName: 'TWRF' }], 'ref1')],
        };
        mount(eMap, { props: { track_data } });

        expect(circle_marker_calls).toHaveLength(2);
        const official_call = circle_marker_calls.find(c => c.options.fillColor === '#e74c3c');
        const ref1_call = circle_marker_calls.find(c => c.options.fillColor === '#3498db');

        expect(official_call.options.fillOpacity).toBe(0.3);
        expect(ref1_call.options.fillOpacity).toBe(1);
        expect(ref1_call.options.opacity).toBe(1);
    });
});
