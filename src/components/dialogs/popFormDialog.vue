<template>
    <div>
        <v-dialog v-model="show_user_edit" max-width="350">
            <v-card class="pb-2">
                <v-card-actions class="justify-space-between">
                    <v-card-title>
                        {{ title }}
                    </v-card-title>
                    <v-btn
                        icon
                        color="grey-lighten-1"
                        class="position-absolute top-0 right-0 ma-2"
                        @click="show_user_edit = false"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-actions>

                <v-card-text>
                    <v-form ref="form_info">
                        <template v-for="(item, index) in formData" :key="index">
                            <!-- Text Field -->
                            <v-text-field
                                v-if="item.component === 'text-field'"
                                v-model="formModel[item.key]"
                                :rules="item.rules"
                                :type="item?.show_ref ? (item.show_ref.value ? 'text' : 'password') : item.type"
                                :label="item.label"
                                :append-inner-icon="item.show_ref ? (item.show_ref.value ? 'mdi-eye' : 'mdi-eye-off') : undefined"
                                @click:append-inner="item.show_ref && (item.show_ref.value = !item.show_ref.value)"
                            />
                            <!-- Select -->
                            <multi-select-with-all
                                v-if="item.component === 'select'"
                                v-model="formModel[item.key]"
                                :item="item.options"
                                :label="item.label"
                                :rules="item.rules"
                            >
                            </multi-select-with-all>
                        </template>
                    </v-form>
                </v-card-text>
        
                <v-card-actions class="pr-6">
                    <v-spacer />
                    <v-btn v-if="resetModel" color="teal" variant="flat" @click="reset_form">清空</v-btn>
                    <v-btn color="green" variant="elevated" @click="confirm(formModel)">
                        確認送出
                    </v-btn>
                    <v-btn color="red-darken-1" variant="elevated" @click="show_user_edit = false">
                        取消
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <alert-message-dialog 
            v-model="alert_store.show_alert_dialog"
            :message="alert_store.alert_message"
            :type="alert_store.alert_type"
        />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { use_alert_store } from '../../stores/alert.js';
import alertMessageDialog from './alertMessageDialog.vue';
import multiSelectWithAll from '../multiSelectWithAll.vue';

// 定義 props
// formData format example: 
// [{ key: id, label: name, rules: 欄位規則陣列, type: 欄位類型, show_ref: ref控制密碼顯示與否 }]
const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    formData: {
        type: Array,
        default: () => ([])
    },
    formModel: {
        type: Object,
        default: () => ({})
    },
    modelValue: {
        type: Boolean,
        default: false
    },
    resetModel: {
        type: Boolean,
        default: true
    }
})

// 定義 emits
const emit = defineEmits(['update:modelValue', 'confirm'])

const alert_store = use_alert_store()
const form_info = ref(null)

const show_user_edit = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const confirm = async (form_model) => {
    const { valid } = await form_info.value?.validate()
    if (!valid) {
        alert_store.show_alert('表格資料填寫不正確', 'warning')
        return
    }

    emit('confirm', form_model, form_model.type)
    show_user_edit.value = false
}

const reset_form = () => {
    Object.keys(props.formModel).forEach(key => {
        if (key === 'id') return
        props.formModel[key] = ''
    })
}
</script>
