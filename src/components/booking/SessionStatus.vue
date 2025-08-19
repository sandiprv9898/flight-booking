<template>
  <div v-if="sessionId || showOfflineMode" class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div :class="statusIconClass">
          <svg v-if="isOnline && sessionId" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <svg v-else-if="isOnline && syncInProgress" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <div>
          <div class="text-sm font-medium text-gray-900">
            {{ statusText }}
          </div>
          <div v-if="sessionId && lastSavedAt" class="text-xs text-gray-500">
            Last saved: {{ formatLastSaved }}
          </div>
          <div v-else-if="!isOnline" class="text-xs text-orange-600">
            Connection lost - please check your network
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <!-- Session expiry countdown -->
        <div v-if="sessionExpiresAt && timeUntilExpiry > 0" class="text-xs text-gray-500">
          Expires: {{ formatTimeRemaining }}
        </div>
        
        <!-- Manual actions -->
        <button
          v-if="sessionId && !syncInProgress"
          @click="extendSession"
          :disabled="!canExtend"
          class="text-xs px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          title="Extend session by 15 minutes"
        >
          Extend
        </button>
        
        <button
          @click="saveNow"
          :disabled="syncInProgress"
          class="text-xs px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-md disabled:opacity-50"
        >
          {{ syncInProgress ? 'Saving...' : 'Save Now' }}
        </button>
      </div>
    </div>

    <!-- Session recovery banner -->
    <div v-if="hasUnsavedChanges" class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <div class="flex items-center justify-between">
        <div class="text-sm text-yellow-800">
          ⚠️ You have unsaved changes that will be lost if you leave this page.
        </div>
        <button
          @click="saveNow"
          class="text-sm px-3 py-1 bg-yellow-200 text-yellow-800 hover:bg-yellow-300 rounded-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useBookingStore } from '@/store/booking'

const bookingStore = useBookingStore()

// Local state
const isOnline = ref(navigator.onLine)
const showOfflineMode = ref(false)

// Computed properties
const sessionId = computed(() => bookingStore.sessionId)
const sessionExpiresAt = computed(() => bookingStore.sessionExpiresAt)
const lastSavedAt = computed(() => bookingStore.lastSavedAt)
const syncInProgress = computed(() => bookingStore.syncInProgress)

const timeUntilExpiry = computed(() => {
  if (!sessionExpiresAt.value) return 0
  return Math.max(0, Math.floor((new Date(sessionExpiresAt.value) - new Date()) / 1000))
})

const canExtend = computed(() => {
  return sessionId.value && timeUntilExpiry.value > 0 && timeUntilExpiry.value < 900 // Less than 15 minutes
})

const hasUnsavedChanges = computed(() => {
  if (!lastSavedAt.value) return false
  const lastSaved = new Date(lastSavedAt.value)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return lastSaved < fiveMinutesAgo
})

const statusIconClass = computed(() => {
  const base = "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
  
  if (!isOnline.value) {
    return `${base} bg-orange-100 text-orange-600`
  }
  
  if (syncInProgress.value) {
    return `${base} bg-blue-100 text-blue-600`
  }
  
  if (sessionId.value) {
    return `${base} bg-green-100 text-green-600`
  }
  
  return `${base} bg-gray-100 text-gray-600`
})

const statusText = computed(() => {
  if (!isOnline.value) {
    return "Offline Mode"
  }
  
  if (syncInProgress.value) {
    return "Syncing..."
  }
  
  if (sessionId.value) {
    return "Session Active"
  }
  
  return "Ready to Save"
})

const formatLastSaved = computed(() => {
  if (!lastSavedAt.value) return ""
  
  const now = new Date()
  const saved = new Date(lastSavedAt.value)
  const diffMinutes = Math.floor((now - saved) / 60000)
  
  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  return saved.toLocaleDateString()
})

const formatTimeRemaining = computed(() => {
  const seconds = timeUntilExpiry.value
  if (seconds <= 0) return "Expired"
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${seconds}s`
})

// Methods
const saveNow = async () => {
  try {
    await bookingStore.saveSession(true) // Force sync
    console.log('💾 Manual save completed')
  } catch (error) {
    console.error('❌ Manual save failed:', error)
  }
}

const extendSession = async () => {
  try {
    await bookingStore.extendSession()
    console.log('⏰ Session extended')
  } catch (error) {
    console.error('❌ Failed to extend session:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Monitor online/offline status
  const handleOnline = () => {
    isOnline.value = true
    showOfflineMode.value = false
    console.log('🌐 Back online')
  }
  
  const handleOffline = () => {
    isOnline.value = false
    showOfflineMode.value = true
    console.log('📱 Connection lost')
  }
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Show session status after a delay if there's a session
  setTimeout(() => {
    if (sessionId.value || !isOnline.value) {
      showOfflineMode.value = true
    }
  }, 2000)
  
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
})
</script>