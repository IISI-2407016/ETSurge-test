<template>
  <div class="fixed right-0 top-20 z-9999">
    <v-slide-x-reverse-transition>
        <v-alert
          v-if="internal_visible"
          :text="message"
          title="提示"
          :type="type"
        ></v-alert>
    </v-slide-x-reverse-transition>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  modelValue: Boolean,
  message: String,
  type: {
    type: String,
    default: "error", //error、warning、info、success
  },
});
const emit = defineEmits(["update:modelValue"]);

const internal_visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// 監聽變化，當變為 true 時開始計時
watch(internal_visible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      internal_visible.value = false;
    }, 3000);
  }
});
</script>
