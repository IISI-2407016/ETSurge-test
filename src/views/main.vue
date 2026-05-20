<template>
    <v-app id="inspire">
        <v-card flat tile>
            <tool-bar v-model="current_tab"/>
            <v-main>
                <v-container fluid class="pa-4">
                    <div v-if="current_tab === 'uvp'">
                        <div class="fixed z-10 w-100">
                            <UVP-view />
                        </div>
                        <div 
                            v-if="uvp_data_store.search_results.length > 0 && current_tab === 'uvp'" 
                            class="relative z-1">
                            {{ uvp_data_store.search_results }}
                        </div>
                    </div>
                    <div v-else-if="current_tab === 'tide_level'">
                        <tide-level-view />
                    </div>
                    <div v-else-if="current_tab === 'light'">
                        <light-table-view />
                    </div>
                    <div v-else-if="current_tab === 'user_manage'">
                        <user-manage />
                    </div>
                    <div v-else-if="current_tab === 'group_manage'">
                        <group-manage />
                    </div>
                </v-container>
            </v-main>
        </v-card>
    </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { use_app_store } from '../stores/use-app.js'
import { use_uvp_data_store } from '../stores/UVP-data.js'
import toolBar from './toolBar.vue'
import UVPView from './UVPView.vue'
import tideLevelView from './tide-level/tideLevelView.vue'
import lightTableView from './lightTableView.vue'
import userManage from './userManage.vue'
import groupManage from './groupManage.vue'

const uvp_data_store = use_uvp_data_store()
const app_store = use_app_store()
const current_tab = computed(() => app_store.current_tab)
</script>