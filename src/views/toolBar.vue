<template>
    <v-app-bar color="white" dense fixed class="grey lighten-3">
        <v-toolbar-title @click="page_change" style="cursor: pointer;">暴潮系集展示系統</v-toolbar-title>

        <template v-if="login_state" #append>
            <v-tabs v-model="tab" 
                align-tabs="center" 
                color="primary">
                <v-tab value="uvp">UVP查詢結果預覧</v-tab>
                <v-tab value="tide_level">預報潮位時序圖預覧</v-tab>
                <v-tab value="light">系集燈號表格預覧</v-tab>
            </v-tabs>
    
            <user-btn />
    
            <v-menu
                bottom
                origin="center center"
                transition="scale-transition"
            >
                <template #activator="{ props }">
                    <v-btn v-show="haveStidsLength > 0" icon v-bind="props">
                        <span class="mdi mdi-cog" />
                    </v-btn>
                </template>
    
                <v-list>
                    <v-list-item
                        v-for="(stid, i) in stids"
                        :key="i"
                        @click="set_station(stid.id)"
                    >
                    <v-list-item-title>{{ stid.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
    
            <station-set v-if="render_station" :dialog_name="dialog_name" />
        </template>
    </v-app-bar>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { use_user_store } from '../stores/user.js'
import stationSet from './stationSet.vue'
import userBtn from '../components/userBtn.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'uvp'
  }
});
const emit = defineEmits(['update:modelValue']);

const toolBarStore = use_user_store()
const login_state = computed(() => toolBarStore.is_logged_in)

const tab = ref(props.modelValue);
const dialog_name = ref('')
const render_station = ref(false)
const show_icon = ref(false)

// 父變動 → 子同步
watch(() => props.modelValue, (val) => {
  tab.value = val;
});

// 子變動 → emit 給父
watch(tab, (val) => {
  emit('update:modelValue', val);
});

const haveStidsLength = computed(() => {
    const userlevel = toolBarStore.user.level
    if (userlevel === 'admin') return 1
    return toolBarStore.have_stids_title.length
})

const stids = computed(() => {
    const userlevel = toolBarStore.user.level
    const allStids = toolBarStore.stids
    if (userlevel === 'admin') return allStids
    const haveStids = toolBarStore.have_stids_title
    const map = {}
    const userStids = []
    if (haveStids.length <= 0) return userStids
    show_icon.value = true
    allStids.forEach((stid) => {
        map[stid.title] = stid
    })
    haveStids.forEach((haveStid) => {
        userStids.push(map[haveStid])
    })
    return userStids
})

function set_station(name) {
    render_station.value = false
    dialog_name.value = name

    if (name === 'user_manage') {
        toolBarStore.CURRENT_PAGE('UserManage')
    }
    if (name === 'group_manage') {
        toolBarStore.CURRENT_PAGE('GroupManage')
    }

    nextTick(() => {
        render_station.value = true
    })
}

function page_change() {
    toolBarStore.CURRENT_PAGE('Main')
}
</script>
