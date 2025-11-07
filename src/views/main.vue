<template>
    <v-app id="inspire">
        <v-card flat tile>
            <tool-bar v-model="current_tab"/>
            <v-main>
                <v-container fluid class="pa-4">
                    <div v-if="current_tab === 'uvp'">
                        <div class="fixed z-10 w-100">
                            <UVP-view @change-tab="current_tab = $event" />
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
                        <!-- <light-view /> -->
                    </div>
                </v-container>
            </v-main>
        </v-card>
    </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { use_uvp_data_store } from '../stores/UVP-data.js'
import toolBar from './toolBar.vue'
import UVPView from './UVPView.vue'
import tideLevelView from './tide-level/tideLevelView.vue'

const uvp_data_store = use_uvp_data_store()
const current_tab = ref('uvp')
</script>