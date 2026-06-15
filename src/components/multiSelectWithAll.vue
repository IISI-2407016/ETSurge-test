<template>
    <div>
        <v-select
            v-model="selected_value"
            :items="item"
            item-title="text"
            item-value="value"
            item-color="blue"
            :rules="rules"
            :label="label"
            variant="underlined"
            chips
            closable-chips
            multiple
        >
            <template #prepend-item>
                <v-list-item 
                    title="全選" 
                    @click="toggle_select_all()">
                    <template #prepend>
                        <v-checkbox-btn
                            :indeterminate="is_some_selected() && !is_all_selected()"
                            :model-value="is_all_selected()"
                        ></v-checkbox-btn>
                    </template>
                </v-list-item>

                <v-divider class="mt-2"></v-divider>
            </template>
        </v-select>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    item: {
        type: Array,
        default: () => []
    },
    label: {
        type: String,
        default: ''
    },
    rules: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['update:modelValue'])

const selected_value = computed({
    get: () => props.modelValue || [],
    set: (val) => emit('update:modelValue', val)
})
const options = computed(() => {
    if (Array.isArray(props.item)) return props.item
    return []
})

const is_all_selected = () => {
    const selected = selected_value.value || []
    return selected.length > 0 && selected.length === options.value.length
}

const is_some_selected = () => {
    const selected = selected_value.value || []
    return selected.length > 0
}

const toggle_select_all = () => {
    const selected = selected_value.value || []

    if (selected.length === options.value.length) {
        selected_value.value = []
    } else {
        selected_value.value = options.value.map(option => option.value)
    }
}
</script>