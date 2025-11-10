<template>
  <div class="fixed top-50% left-50% z-50">
    <v-alert
      v-if="internal_visible"
      :text="message"
      title="提示"
      :type="type"
    ></v-alert>
  </div>
</template>

<script setup>
import { computed } from "vue";

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
</script>
