<template>
    <div class="fixed bottom-5">
        <v-sheet 
            border rounded elevation="1" 
            class="pa-3 px-10 z-10 d-flex justify-center"
        >
            <v-btn
                v-for="(func, index) in function_list"
                :key="index"
                class="mx-3"
                color="secondary"
            >
                {{ func }}
            </v-btn>
        </v-sheet>
    </div>
</template>

<script setup>
    import { ref } from 'vue'

    const function_list = ref([
        "傳送水位",
        "傳送颱風期間圖檔",
        "傳送颱風期間圖檔(不包含表格)",
        "傳送非颱風期間圖檔"
    ]);
</script>