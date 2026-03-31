import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const use_alert_store = defineStore('alert', () => {
    const alert_state = reactive({
        visible: false,
        message: '',
        type: 'error' // error, warning, info, success
    })

    const show_alert = (message, type = 'error') => {
        alert_state.message = message
        alert_state.type = type
        alert_state.visible = true
    }

    const hide_alert = () => {
        alert_state.visible = false
    }

    return {
        alert_state,
        show_alert,
        hide_alert
    }
})