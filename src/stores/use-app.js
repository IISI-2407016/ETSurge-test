import { defineStore } from 'pinia'

export const use_app_store = defineStore('app', {
    state: () => ({
        current_tab: 'uvp'
    }),
    
    actions: {
        change_tab(new_tab) {
            this.current_tab = new_tab
        }
    }
})