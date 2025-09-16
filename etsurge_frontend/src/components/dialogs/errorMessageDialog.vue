<template>
    <div>
        <v-dialog v-model="internal_visible" max-width="200">
            <v-card>
                <div class="text-red text-center">{{ error_message }}</div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    model_value: Boolean,
    error_message: String
})
const emit = defineEmits(['update:model_value'])

const internal_visible = computed({
    get: () => props.model_value,
    set: (val) => emit('update:model_value', val)
})
</script>