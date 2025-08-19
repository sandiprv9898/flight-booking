// Global Error Handler Utility
import { useNotificationsStore } from '@/store/notifications'
import router from '@/router'

class ErrorHandler {
  constructor() {
    this.errorQueue = []
    this.maxRetries = 3
    this.retryDelay = 1000
    this.setupGlobalHandlers()
  }

  // Set up global error handlers
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.handleError(event.reason, 'promise')
      event.preventDefault()
    })

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      this.handleError(event.error, 'global')
      event.preventDefault()
    })

    // Handle Vue errors
    if (window.app) {
      window.app.config.errorHandler = (error, instance, info) => {
        console.error('Vue error:', error)
        this.handleError(error, 'vue', { instance, info })
      }
    }
  }

  // Main error handler
  handleError(error, source = 'unknown', context = {}) {
    const errorInfo = this.parseError(error)
    
    // Add to error queue
    this.errorQueue.push({
      ...errorInfo,
      source,
      context,
      timestamp: Date.now()
    })

    // Handle based on error type
    switch (errorInfo.type) {
      case 'network':
        this.handleNetworkError(errorInfo)
        break
      case 'auth':
        this.handleAuthError(errorInfo)
        break
      case 'validation':
        this.handleValidationError(errorInfo)
        break
      case 'payment':
        this.handlePaymentError(errorInfo)
        break
      case 'booking':
        this.handleBookingError(errorInfo)
        break
      case 'rate_limit':
        this.handleRateLimitError(errorInfo)
        break
      default:
        this.handleGenericError(errorInfo)
    }

    // Log to monitoring service
    this.logError(errorInfo)
  }

  // Parse error to extract useful information
  parseError(error) {
    const errorInfo = {
      message: '',
      type: 'unknown',
      code: null,
      status: null,
      details: {},
      stack: null,
      retryable: false
    }

    // Handle different error formats
    if (error.response) {
      // Axios error
      errorInfo.status = error.response.status
      errorInfo.message = error.response.data?.message || error.message
      errorInfo.code = error.response.data?.code
      errorInfo.details = error.response.data?.details || {}
      errorInfo.type = this.getErrorType(error.response.status, error.response.data)
      errorInfo.retryable = this.isRetryable(error.response.status)
    } else if (error.request) {
      // Network error
      errorInfo.type = 'network'
      errorInfo.message = 'Network error. Please check your connection.'
      errorInfo.retryable = true
    } else if (error.message) {
      // Regular error
      errorInfo.message = error.message
      errorInfo.type = this.detectErrorType(error)
      errorInfo.stack = error.stack
    } else if (typeof error === 'string') {
      // String error
      errorInfo.message = error
    } else {
      // Unknown error format
      errorInfo.message = 'An unexpected error occurred'
    }

    return errorInfo
  }

  // Detect error type from error object
  detectErrorType(error) {
    const message = (error.message || '').toLowerCase()
    const name = (error.name || '').toLowerCase()

    if (message.includes('network') || name.includes('network')) return 'network'
    if (message.includes('auth') || message.includes('unauthorized')) return 'auth'
    if (message.includes('validation') || message.includes('invalid')) return 'validation'
    if (message.includes('payment') || message.includes('stripe')) return 'payment'
    if (message.includes('booking') || message.includes('flight')) return 'booking'
    if (message.includes('rate limit') || message.includes('too many')) return 'rate_limit'
    
    return 'unknown'
  }

  // Get error type from HTTP status
  getErrorType(status, data) {
    if (status === 401) return 'auth'
    if (status === 403) return 'permission'
    if (status === 404) return 'not_found'
    if (status === 422) return 'validation'
    if (status === 429) return 'rate_limit'
    if (status >= 500) return 'server'
    if (data?.type) return data.type
    
    return 'unknown'
  }

  // Check if error is retryable
  isRetryable(status) {
    return [408, 429, 500, 502, 503, 504].includes(status)
  }

  // Handle network errors
  handleNetworkError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Connection Problem',
      message: errorInfo.message || 'Please check your internet connection and try again.',
      duration: 10000,
      action: errorInfo.retryable ? {
        label: 'Retry',
        handler: () => this.retry(errorInfo)
      } : null
    })
  }

  // Handle authentication errors
  handleAuthError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Authentication Required',
      message: 'Please log in to continue.',
      duration: 10000
    })

    // Clear auth and redirect to login
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    router.push('/auth')
  }

  // Handle validation errors
  handleValidationError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    
    // Show validation errors
    if (errorInfo.details.errors) {
      Object.entries(errorInfo.details.errors).forEach(([field, messages]) => {
        notificationsStore.addNotification({
          type: 'error',
          title: 'Validation Error',
          message: `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`,
          duration: 8000
        })
      })
    } else {
      notificationsStore.addNotification({
        type: 'error',
        title: 'Invalid Input',
        message: errorInfo.message || 'Please check your input and try again.',
        duration: 8000
      })
    }
  }

  // Handle payment errors
  handlePaymentError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Payment Failed',
      message: errorInfo.message || 'There was an issue processing your payment. Please try again.',
      duration: 15000,
      persistent: true,
      action: {
        label: 'Contact Support',
        handler: () => window.open('/support', '_blank')
      }
    })
  }

  // Handle booking errors
  handleBookingError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Booking Error',
      message: errorInfo.message || 'Unable to complete your booking. Please try again.',
      duration: 10000,
      action: {
        label: 'Try Again',
        handler: () => window.location.reload()
      }
    })
  }

  // Handle rate limit errors
  handleRateLimitError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    const retryAfter = errorInfo.details.retryAfter || 60
    
    notificationsStore.addNotification({
      type: 'warning',
      title: 'Too Many Requests',
      message: `Please wait ${retryAfter} seconds before trying again.`,
      duration: retryAfter * 1000,
      persistent: true
    })
  }

  // Handle generic errors
  handleGenericError(errorInfo) {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Error',
      message: errorInfo.message || 'An unexpected error occurred. Please try again.',
      duration: 8000
    })
  }

  // Retry failed operation
  async retry(errorInfo, attempt = 1) {
    if (attempt > this.maxRetries) {
      console.error('Max retries exceeded for:', errorInfo)
      return
    }

    // Wait before retrying (exponential backoff)
    const delay = this.retryDelay * Math.pow(2, attempt - 1)
    await new Promise(resolve => setTimeout(resolve, delay))

    // Retry the operation
    if (errorInfo.context.retryHandler) {
      try {
        await errorInfo.context.retryHandler()
      } catch (error) {
        console.error(`Retry attempt ${attempt} failed:`, error)
        this.retry(errorInfo, attempt + 1)
      }
    }
  }

  // Log error to monitoring service
  logError(errorInfo) {
    // In production, send to error monitoring service
    if (import.meta.env.PROD) {
      const payload = {
        ...errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        user: this.getUserInfo()
      }

      // Send to monitoring endpoint
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.error('Failed to log error to monitoring service:', err)
      })
    } else {
      // In development, just log to console
      console.group('Error Handler')
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
  }

  // Get user information for error logging
  getUserInfo() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return {
        id: user.id,
        email: user.email,
        workspace: user.workspace
      }
    } catch {
      return null
    }
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = []
  }

  // Get recent errors
  getRecentErrors(limit = 10) {
    return this.errorQueue.slice(-limit)
  }

  // Check if there are any critical errors
  hasCriticalErrors() {
    return this.errorQueue.some(error => 
      ['auth', 'payment', 'server'].includes(error.type)
    )
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler()

// Export for use in API interceptors
export const handleApiError = (error) => {
  errorHandler.handleError(error, 'api')
  return Promise.reject(error)
}

// Export for use in async operations
export const handleAsyncError = async (operation, context = {}) => {
  try {
    return await operation()
  } catch (error) {
    errorHandler.handleError(error, 'async', context)
    throw error
  }
}

// Export singleton instance
export default errorHandler