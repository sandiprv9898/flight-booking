<template>
  <teleport to="body">
    <transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="onBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50"></div>
        
        <!-- Modal Container -->
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="show"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div
                v-if="title || $slots.header"
                class="px-6 py-4 border-b border-gray-200"
              >
                <div class="flex items-center justify-between">
                  <h3
                    v-if="title"
                    class="text-lg font-medium text-gray-900"
                  >
                    {{ title }}
                  </h3>
                  <slot name="header" />
                  
                  <button
                    v-if="closable"
                    type="button"
                    class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    @click="close"
                  >
                    <XMarkIcon class="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <!-- Body -->
              <div class="px-6 py-4">
                <slot />
              </div>
              
              <!-- Footer -->
              <div
                v-if="$slots.footer"
                class="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg"
              >
                <slot name="footer" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'backdrop-click'])

const modalClasses = computed(() => {
  const base = 'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all'
  
  const sizes = {
    sm: 'sm:max-w-sm sm:w-full',
    md: 'sm:max-w-md sm:w-full',
    lg: 'sm:max-w-lg sm:w-full',
    xl: 'sm:max-w-xl sm:w-full'
  }
  
  return [base, sizes[props.size]].join(' ')
})

const close = () => {
  emit('close')
}

const onBackdropClick = () => {
  emit('backdrop-click')
  if (props.closeOnBackdrop) {
    close()
  }
}

// Prevent body scroll when modal is open
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>