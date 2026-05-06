<template>
    <v-container fluid class="ma-0">
        <v-row>
            <v-col class="text-h6" >{{ title }}</v-col>
            <v-col :cols="5">
                <v-text-field
                    v-model="searchModel"
                    color="primary"
                    append-inner-icon="mdi-magnify"
                    label="搜尋"
                    variant="underlined"
                    hide-details
                    single-line
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row class="mb-5">
            <v-col>
                <v-btn color="primary" @click="actionFunction">
                    新增
                </v-btn>
            </v-col>
        </v-row>
        <v-divider></v-divider>
    </v-container>
</template>

<script setup>
    import { computed } from 'vue';

    const props = defineProps({
        title: String,
        tab: String,
        actionFunction: Function,
        search: {
            type: String,
            default: ''
        },
    });

    const emit = defineEmits(['update:search'])
    const searchModel = computed({
        get: () => props.search ?? '',
        set: (value) => emit('update:search', value)
    })
</script>