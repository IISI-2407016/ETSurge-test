import { defineStore } from 'pinia'

export const use_compass_store = defineStore('use_compass_store', {
    state: () => ({
        angle: 0,
        is_active: false,
        selected_direction: ''
    }),
    actions: {
        activate() {
            this.is_active = true;
        },
        deactivate() {
            this.is_active = false;
        },
        set_angle(new_angle) {
            this.angle = new_angle;
        },
        set_selected_direction(direction) {
            this.selected_direction = direction;
        }
    },
});