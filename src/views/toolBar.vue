<template>
    <v-app-bar color="white" dense fixed class="grey lighten-3">
        <v-toolbar-title class="cursor-pointer text-h5" title="回首頁">暴潮系集展示系統</v-toolbar-title>

        <template v-if="login_state" #append>
            <v-tabs v-model="tab" 
                align-tabs="center" 
                color="primary">
                <v-tab style="font-size: medium;" value="uvp">UVP查詢結果預覧</v-tab>
                <v-tab style="font-size: medium;" value="tide_level">預報潮位時序圖預覧</v-tab>
                <v-tab style="font-size: medium;" value="light">系集燈號表格預覧</v-tab>
            </v-tabs>

            <user-btn />

            <v-menu
                v-if="stids.length > 0"
                open-on-hover
                bottom
                transition="scale-transition"
            >
                <template #activator="{ props }">
                    <v-btn icon v-bind="props">
                        <span class="mdi mdi-cog" />
                    </v-btn>
                </template>
    
                <v-list>
                    <v-list-item
                        v-for="(stid, i) in stids"
                        :key="i"
                        @click="set_station(stid.Key)"
                    >
                        <v-list-item-title>{{ stid.Title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <station-set v-if="render_station" :dialog_name="dialog_name" />
        </template>
    </v-app-bar>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { use_app_store } from '../stores/use-app.js'
import { use_user_store } from '../stores/user.js'
import stationSet from './stationSet.vue'
import userBtn from '../components/userBtn.vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: 'uvp'
    }
});

const app_store = use_app_store()
const user_store = use_user_store()
const login_state = computed(() => user_store.is_logged_in)

const tab = ref(props.modelValue);
const dialog_name = ref('')
const render_station = ref(false)

// 父變動 → 子同步
watch(() => props.modelValue, (val) => {
    tab.value = val;
});

// 子變動 → store 給父
watch(tab, (val) => {
    app_store.change_tab(val);
});

const stids = computed(() => {
    if (!user_store.user.is_staff) return []
    return user_store.user.groups[0].stids
})

function set_station(name) {
    if (name === 'user_manage') {
        app_store.change_tab(name);
    }
    if (name === 'group_manage') {
        app_store.change_tab(name);
    }
}

</script>
