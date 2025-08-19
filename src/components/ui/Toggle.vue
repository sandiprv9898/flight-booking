<template>
  <button
    :class="[
      'relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
      modelValue
        ? 'bg-primary-600'
        : 'bg-gray-200'
    ]"
    @click="toggle"
  >
    <span class="sr-only">Toggle</span>
    <span
      :class="[
        'inline-block w-4 h-4 transform bg-white rounded-full transition-transform',
        modelValue ? 'translate-x-6' : 'translate-x-1'
      ]"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>