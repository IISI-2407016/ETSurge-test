<template>
    <div>
        <!-- 篩選條件 -->
        <v-expansion-panels v-model="panel" class="w-33">
            <v-expansion-panel>
                <template #title>
                    <span class="title-text">UVP篩選條件選單</span>
                </template>
                <v-expansion-panel-text>
                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            颱風名稱
                        </v-col>
                        <v-col cols="7">
                            <v-select
                                v-model="form.typhoon_name"
                                :items="names"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            初始時間
                        </v-col>
                        <v-col cols="7">
                            <v-menu
                                v-model="menu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="290px"
                            >
                                <template #activator="{ props }">
                                    <v-text-field
                                        v-model="formatted_date"
                                        readonly
                                        v-bind="props"
                                    ></v-text-field>
                                </template>

                                <v-date-picker
                                    v-model="raw_date"
                                    no-title 
                                    color="primary"
                                    :max="max_date"
                                    @update:modelValue="handleDateSelect"
                                ></v-date-picker>
                            </v-menu>
                        </v-col>
                        <span>UTC</span>
                    </v-row>

                    <v-row class="align-center mt-0">
                        <v-col cols="3" class="text-right">
                            路徑種類
                        </v-col>
                        <v-col cols="7" class="pt-0">
                            <v-select
                                v-model="form.typhoon_category"
                                :items="roles"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            有效半徑
                        </v-col>
                        <v-col cols="7">
                            <v-text-field v-model="form.radius" density="compact" hide-details />
                        </v-col>
                        <span>km</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            中心氣壓
                        </v-col>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="form.pa.from" density="compact" hide-details />
                        </v-col>
                        <span>~</span>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="form.pa.to" density="compact" hide-details />
                        </v-col>
                        <span>hPa</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            最大風速
                        </v-col>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="form.speed.from" density="compact" hide-details />
                        </v-col>
                        <span>~</span>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="form.speed.to" density="compact" hide-details />
                        </v-col>
                        <span>m/s</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            移速
                        </v-col>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="form.move_speed.from" density="compact" hide-details />
                        </v-col>
                        <span>~</span>
                        <v-col class="v-col-2_8">
                            <v-text-field v-model="form.move_speed.to" density="compact" hide-details />
                        </v-col>
                        <span>km/hr</span>
                    </v-row>

                    <v-row class="align-center">
                        <v-col cols="3" class="text-right">
                            移向
                        </v-col>
                        <v-col cols="7">
                            <v-text-field
                                v-model="form.moving_direction"
                                readonly
                                density="compact"
                                hide-details
                                @click="show_compass"
                                placeholder="點擊選擇移向"
                            />
                        </v-col>
                        <span>16方位</span>
                    </v-row>
                    <v-row class="justify-center">
                        <compass-16 />
                    </v-row>

                    <!-- 預覽查詢 -->
                    <v-row class="justify-center">
                        <v-col cols="10" class="text-center pb-0">
                            <v-btn 
                                class="text-none text-subtitle-1"
                                color="primary"
                                variant="flat"
                                prepend-icon="mdi mdi-magnify">
                                預覽查詢
                            </v-btn>
                        </v-col>
                        <v-col cols="10" class="text-center">
                            <v-btn 
                                class="text-none text-subtitle-1"
                                color="success"
                                variant="flat"
                                prepend-icon="mdi mdi-calculator">
                                計算系集平均
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>
<script setup>
    import { ref, computed, watch } from 'vue';
    import { use_compass_store } from '../stores/compass';
    import compass16 from '../components/compass16.vue';

    const compass_store = use_compass_store();

    const panel = ref(0)
    const menu = ref(false);
    const raw_date = ref(new Date().toString('YYYY/MM/DD'));
    const max_date = ref(new Date().toString('YYYY/MM/DD')); // 可選擇至最大日期
    const form = ref({
        typhoon_name: '',
        initial_time: '',
        typhoon_category: '',
        radius: '',
        pa: {
            from: '',
            to: ''
        },
        speed: {
            from: '',
            to: ''
        },
        move_speed: {
            from: '',
            to: ''
        },
        moving_direction: ''
    });

    watch(
        () => compass_store.selected_direction,
        (new_direction) => {
            if (new_direction) {
                form.value.moving_direction = new_direction;
                // 清除store中的選擇，避免重複觸發
                compass_store.set_selected_direction('');
            }
        }
    );

    // 轉換成 YYYY/MM/DD 格式
    const formatted_date = computed(() => {
        if (!raw_date.value) return '';
        const date = new Date(raw_date.value);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd}`;
    });

    // 選擇日期後關閉選擇器
    const handleDateSelect = () => {
        menu.value = false;
    };

    const show_compass = () => {
        compass_store.activate();
    };

    const roles = ['北(N)', '北北東(NNE)', '東北(NE)', '東北東(ENE)', '東(E)', '東南東(ESE)', '東南(SE)', '南南東(SSE)', '南(S)', '南南西(SSW)', '西南(SW)', '西南西(WSW)', '西(W)', '西北西(NNW)', '西北(NW)', '北北西(NNW)'];
</script>
<style scoped>
    .title-text {
        font-size: 1.2rem;
        font-weight: bold;
    }
    .v-col-2_8 {
        flex: 0 0 28%;
        max-width: 28%;
}
</style>