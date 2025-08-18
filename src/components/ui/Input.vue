<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="updateValue"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <!-- Password toggle button -->
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
        @click="togglePasswordVisibility"
      >
        <EyeIcon v-if="showPassword" class="h-5 w-5 text-gray-400" />
        <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
      </button>
    </div>
    
    <!-- Error message -->
    <p
      v-if="error"
      class="mt-1 text-sm text-red-600"
    >
      {{ error }}
    </p>
    
    <!-- Help text -->
    <p
      v-if="helpText && !error"
      class="mt-1 text-sm text-gray-500"
    >
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  autocomplete: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputRef = ref(null)
const showPassword = ref(false)

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)

const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

const inputClasses = computed(() => {
  const base = 'block w-full h-10 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200'
  const normal = 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
  const error = 'border-red-300 focus:border-red-500 focus:ring-red-500'
  const disabled = 'bg-gray-50 cursor-not-allowed'
  
  return [
    base,
    props.error ? error : normal,
    props.disabled ? disabled : 'bg-white'
  ].join(' ')
})

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Focus method for parent components
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>