<template>
    <!-- 載入遮罩 -->
    <div 
        v-if="is_loading" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"
    >
        <div class="border-gray-300 h-8 w-8 animate-spin rounded-full border-4 border-t-blue-600">
        </div>
    </div>
</template>

<script setup>
    defineProps({
        is_loading: Boolean,
    });
</script>