<template>
    <div>
        <v-dialog
            v-model="internal_visible"
            max-width="350"
            persistent
        >
            <v-card class="pa-1">
                <h5
                    class="text-xl font-medium leading-normal text-gray-800 pa-2"
                    v-html="title"
                />
                <div class="absolute top-0 right-0">
                    <v-btn
                        icon="mdi-close"
                        class="border-0"
                        variant="text"
                        @click="internal_visible = false"
                    ></v-btn>
                </div>
                <v-divider></v-divider>
                <span v-html="message" class="my-4 px-4 text-center"></span>
                <v-divider></v-divider>
                <template v-slot:actions>
                    <v-btn 
                        color="green" 
                        variant="flat" 
                        @click="handle_confirm">
                        確定
                    </v-btn>

                    <v-btn 
                        color="red-darken-1" 
                        variant="flat" 
                        @click="internal_visible = false">
                        取消
                    </v-btn>
                </template>
            </v-card>
        </v-dialog>
    </div>
</template>
<script setup>
    import { computed } from 'vue'
    const props = defineProps({
        model_value: Boolean,
        message: String,
        title: String
    });
    const emit = defineEmits(['update:model_value', 'confirm']);

    const internal_visible = computed({
        get: () => props.model_value,
        set: (val) => emit('update:model_value', val)
    });

    const handle_confirm = () => {
        emit('confirm');
        internal_visible.value = false;
    }
</script>