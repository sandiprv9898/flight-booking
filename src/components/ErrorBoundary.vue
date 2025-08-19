<template>
  <div v-if="hasError" class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
      <!-- Error Icon -->
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <!-- Error Message -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ errorTitle }}
        </h1>
        <p class="text-gray-600">
          {{ errorMessage }}
        </p>
      </div>

      <!-- Error Details (Development Only) -->
      <div v-if="isDevelopment && errorDetails" class="mb-6">
        <details class="bg-gray-100 rounded-lg p-4">
          <summary class="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
            Technical Details
          </summary>
          <div class="mt-4 space-y-2">
            <div v-if="errorDetails.componentName" class="text-sm">
              <span class="font-medium">Component:</span> {{ errorDetails.componentName }}
            </div>
            <div v-if="errorDetails.errorInfo" class="text-sm">
              <span class="font-medium">Error:</span> {{ errorDetails.errorInfo }}
            </div>
            <div v-if="errorDetails.stack" class="text-xs mt-2">
              <pre class="bg-gray-200 p-2 rounded overflow-x-auto">{{ errorDetails.stack }}</pre>
            </div>
          </div>
        </details>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="handleReload"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reload Page
        </button>
        
        <button
          @click="handleGoHome"
          class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go Home
        </button>
      </div>

      <!-- Report Link -->
      <div class="mt-6 text-center">
        <button
          @click="handleReport"
          class="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Report this issue
        </button>
      </div>
    </div>
  </div>

  <!-- Normal slot content when no error -->
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  fallback: {
    type: Boolean,
    default: true
  },
  onError: {
    type: Function,
    default: null
  }
})

const router = useRouter()
const hasError = ref(false)
const errorDetails = ref(null)

// Check if in development mode
const isDevelopment = computed(() => import.meta.env.DEV)

// Error messages based on error type
const errorTitle = computed(() => {
  if (errorDetails.value?.type) {
    const errorTitles = {
      network: 'Connection Problem',
      auth: 'Authentication Error',
      permission: 'Access Denied',
      validation: 'Invalid Data',
      payment: 'Payment Error',
      booking: 'Booking Error',
      default: 'Something went wrong'
    }
    return errorTitles[errorDetails.value.type] || errorTitles.default
  }
  return 'Something went wrong'
})

const errorMessage = computed(() => {
  if (errorDetails.value?.message) {
    return errorDetails.value.message
  }
  
  if (errorDetails.value?.type) {
    const errorMessages = {
      network: 'Please check your internet connection and try again.',
      auth: 'Please log in to continue.',
      permission: 'You don\'t have permission to access this resource.',
      validation: 'Please check your input and try again.',
      payment: 'There was an issue processing your payment. Please try again.',
      booking: 'Unable to complete your booking. Please try again.',
      default: 'We encountered an unexpected error. Please try again.'
    }
    return errorMessages[errorDetails.value.type] || errorMessages.default
  }
  
  return 'We encountered an unexpected error. Please try again.'
})

// Error handler
onErrorCaptured((error, instance, info) => {
  console.error('Error caught by boundary:', error)
  
  hasError.value = true
  
  // Extract error details
  errorDetails.value = {
    errorInfo: error.message || error.toString(),
    componentName: instance?.$options.name || 'Unknown Component',
    stack: isDevelopment.value ? error.stack : null,
    type: detectErrorType(error),
    message: getErrorMessage(error)
  }
  
  // Log to error tracking service in production
  if (!isDevelopment.value) {
    logErrorToService(error, instance, info)
  }
  
  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error, instance, info)
  }
  
  // Prevent the error from propagating
  return false
})

// Detect error type based on error object
function detectErrorType(error) {
  const message = error.message?.toLowerCase() || ''
  const name = error.name?.toLowerCase() || ''
  
  if (message.includes('network') || message.includes('fetch') || name.includes('network')) {
    return 'network'
  }
  if (message.includes('auth') || message.includes('unauthorized') || error.status === 401) {
    return 'auth'
  }
  if (message.includes('permission') || message.includes('forbidden') || error.status === 403) {
    return 'permission'
  }
  if (message.includes('validation') || message.includes('invalid') || error.status === 422) {
    return 'validation'
  }
  if (message.includes('payment') || message.includes('stripe') || message.includes('card')) {
    return 'payment'
  }
  if (message.includes('booking') || message.includes('seat') || message.includes('flight')) {
    return 'booking'
  }
  
  return 'default'
}

// Get user-friendly error message
function getErrorMessage(error) {
  // Check for custom error message
  if (error.userMessage) {
    return error.userMessage
  }
  
  // Check for API error response
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  // Return null to use default message based on type
  return null
}

// Log error to external service (e.g., Sentry, LogRocket)
function logErrorToService(error, instance, info) {
  // In production, send to error tracking service
  const errorPayload = {
    message: error.message,
    stack: error.stack,
    component: instance?.$options.name,
    info: info,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    user: getUserInfo()
  }
  
  // Example: Send to error tracking endpoint
  fetch('/api/errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(errorPayload)
  }).catch(err => {
    console.error('Failed to log error:', err)
  })
}

// Get user info for error logging
function getUserInfo() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return {
      id: user.id,
      email: user.email
    }
  } catch {
    return null
  }
}

// Action handlers
function handleReload() {
  window.location.reload()
}

function handleGoHome() {
  hasError.value = false
  errorDetails.value = null
  router.push('/')
}

function handleReport() {
  // Create error report
  const report = {
    title: errorTitle.value,
    message: errorMessage.value,
    details: errorDetails.value,
    url: window.location.href,
    timestamp: new Date().toISOString()
  }
  
  // In production, open support ticket or email
  if (isDevelopment.value) {
    console.log('Error Report:', report)
    alert('Error report logged to console (development mode)')
  } else {
    // Open email client with pre-filled error report
    const subject = encodeURIComponent(`Error Report: ${errorTitle.value}`)
    const body = encodeURIComponent(`
Error Report
------------
Title: ${report.title}
Message: ${report.message}
URL: ${report.url}
Time: ${report.timestamp}

Please describe what you were doing when this error occurred:
[Your description here]
    `)
    
    window.location.href = `mailto:support@flightbooking.com?subject=${subject}&body=${body}`
  }
}

// Reset error state (can be called from parent)
function reset() {
  hasError.value = false
  errorDetails.value = null
}

// Expose reset method to parent
defineExpose({
  reset
})
</script>