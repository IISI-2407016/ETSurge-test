<template>
    <div v-if="is_active">
        <div class="text-right p-2 border-b border-gray-300">
            <button @click="close_compass" class="hover:bg-red-100 position-relative left-4 mdi mdi-close-circle" />
        </div>
        <div class="flex justify-center items-center p-5">
            <div class="
                grid grid-cols-4 
                gap-0 
                border-1 
                border-gray-800"
            >
                <div 
                    v-for="(direction, index) in directions" 
                    :key="index"
                    class="
                        w-15 
                        h-15 
                        border border-gray-600 
                        flex 
                        items-center 
                        justify-center 
                        font-bold 
                        text-xs
                        text-center 
                        bg-blue-50 
                        hover:bg-blue-100 
                        cursor-pointer 
                        transition-colors"
                >
                    <span @click="select_direction(direction, index)" v-html="direction"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { use_compass_store } from '../stores/compass';

    const directions = [
        "北<br/>(N)", "北北東<br/>(NNE)", "北東<br/>(NE)", "東北東<br/>(ENE)",
        "東<br/>(E)", "東南東<br/>(ESE)", "南東<br/>(SE)", "南南東<br/>(SSE)",
        "南<br/>(S)", "南南西<br/>(SSW)", "南西<br/>(SW)", "西南西<br/>(WSW)",
        "西<br/>(W)", "西北西<br/>(WNW)", "北西<br/>(NW)", "北北西<br/>(NNW)"
    ];
    
    // 對應的簡化顯示文字
    const display_directions = [
        "北(N)", "北北東(NNE)", "東北(NE)", "東北東(ENE)",
        "東(E)", "東南東(ESE)", "東南(SE)", "南南東(SSE)",
        "南(S)", "南南西(SSW)", "西南(SW)", "西南西(WSW)",
        "西(W)", "西北西(WNW)", "西北(NW)", "北北西(NNW)"
    ];
    
    const compass_store = use_compass_store();
    const is_active = computed(() => compass_store.is_active);

    const select_direction = (direction, index) => {
        // 設定選中的方向（使用簡化版本）
        compass_store.set_selected_direction(display_directions[index]);
        // 關閉羅盤
        compass_store.deactivate();
    };

    const close_compass = () => {
        compass_store.deactivate();
    };
</script>