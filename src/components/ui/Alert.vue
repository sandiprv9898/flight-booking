<template>
  <div
    v-if="show"
    :class="alertClasses"
    role="alert"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <CheckCircleIcon
          v-if="type === 'success'"
          class="h-5 w-5"
        />
        <InformationCircleIcon
          v-else-if="type === 'info'"
          class="h-5 w-5"
        />
        <ExclamationTriangleIcon
          v-else-if="type === 'warning'"
          class="h-5 w-5"
        />
        <XCircleIcon
          v-else-if="type === 'error'"
          class="h-5 w-5"
        />
      </div>
      
      <div class="ml-3 flex-1">
        <h3
          v-if="title"
          :class="titleClasses"
        >
          {{ title }}
        </h3>
        
        <div :class="messageClasses">
          <slot>
            {{ message }}
          </slot>
        </div>
      </div>
      
      <div
        v-if="dismissible"
        class="ml-auto pl-3"
      >
        <button
          type="button"
          :class="closeButtonClasses"
          @click="dismiss"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: value => ['success', 'info', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  dismissible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['dismiss'])

const show = ref(true)

const alertClasses = computed(() => {
  const base = 'rounded-md p-4'
  
  const variants = {
    success: 'bg-green-50 text-green-800',
    info: 'bg-blue-50 text-blue-800',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-800'
  }
  
  return [base, variants[props.type]].join(' ')
})

const titleClasses = computed(() => {
  const variants = {
    success: 'text-green-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
    error: 'text-red-800'
  }
  
  return ['text-sm font-medium', variants[props.type]].join(' ')
})

const messageClasses = computed(() => {
  const base = 'text-sm'
  const variants = {
    success: 'text-green-700',
    info: 'text-blue-700',
    warning: 'text-yellow-700',
    error: 'text-red-700'
  }
  
  const spacing = props.title ? 'mt-1' : ''
  
  return [base, variants[props.type], spacing].join(' ')
})

const closeButtonClasses = computed(() => {
  const base = 'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    success: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600',
    info: 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600',
    warning: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600',
    error: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
  }
  
  return [base, variants[props.type]].join(' ')
})

const dismiss = () => {
  show.value = false
  emit('dismiss')
}
</script>