<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Notifications</h2>
        <p class="text-gray-600">
          Stay updated with flight alerts, booking changes, and more
        </p>
      </div>
      <div class="flex items-center space-x-3">
        <div class="flex items-center space-x-2">
          <div 
            class="w-3 h-3 rounded-full"
            :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
          ></div>
          <span class="text-sm text-gray-600">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="showPreferences = true"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H12V2.5L19 9Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total</p>
            <p class="text-xl font-bold text-gray-900">{{ notifications.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Unread</p>
            <p class="text-xl font-bold text-gray-900">{{ unreadCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Priority</p>
            <p class="text-xl font-bold text-gray-900">{{ priorityNotifications.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Actionable</p>
            <p class="text-xl font-bold text-gray-900">{{ actionableNotifications.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="flex items-center justify-between bg-gray-50 rounded-lg p-4">
      <div class="flex items-center space-x-4">
        <select
          v-model="filterType"
          class="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
        >
          <option value="all">All Notifications</option>
          <option value="unread">Unread Only</option>
          <option value="priority">High Priority</option>
          <option value="actionable">Actionable</option>
        </select>

        <select
          v-model="sortOrder"
          class="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">By Priority</option>
        </select>
      </div>

      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="markAllAsRead"
          :disabled="unreadCount === 0"
        >
          Mark All Read
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="clearAllNotifications"
          class="text-red-600 hover:text-red-700"
        >
          Clear All
        </Button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="space-y-3">
      <div v-if="filteredNotifications.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-5a7.97 7.97 0 01-5.36-2.05A7.97 7.97 0 018 12.64V17H3l5 5 5-5H8V12.64A5.98 5.98 0 0010.36 7 5.98 5.98 0 0012.64 8V3l5 5-5 5v-5a3.98 3.98 0 01-2.83 1.17A3.98 3.98 0 017.17 9a3.98 3.98 0 01-1.17 2.83A3.98 3.98 0 0112 16V17z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
        <p class="text-gray-600">You're all caught up! We'll notify you when something important happens.</p>
      </div>

      <div
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all duration-200 hover:shadow-md"
        :class="[
          getNotificationBorderColor(notification.type),
          notification.read ? 'opacity-75' : ''
        ]"
      >
        <div class="flex items-start space-x-4">
          <!-- Icon -->
          <div 
            class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
            :class="getNotificationIconBg(notification.type)"
          >
            {{ getNotificationIcon(notification.type) }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-900">
                {{ notification.title }}
              </h4>
              <div class="flex items-center space-x-2 ml-4">
                <span class="text-xs text-gray-500 whitespace-nowrap">
                  {{ formatRelativeTime(notification.timestamp) }}
                </span>
                <div class="flex items-center space-x-1">
                  <button
                    @click="markAsRead(notification.id)"
                    v-if="!notification.read"
                    class="text-blue-600 hover:text-blue-700 text-xs"
                  >
                    Mark read
                  </button>
                  <button
                    @click="deleteNotification(notification.id)"
                    class="text-red-600 hover:text-red-700"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <p class="text-sm text-gray-600 mb-3">
              {{ notification.message }}
            </p>

            <!-- Actions -->
            <div v-if="notification.actions && notification.actions.length > 0" class="flex items-center space-x-2">
              <Button
                v-for="action in notification.actions"
                :key="action.action"
                size="sm"
                variant="outline"
                @click="handleNotificationAction(notification.id, action.action, action.data)"
                class="text-xs"
              >
                {{ action.label }}
              </Button>
            </div>

            <!-- Priority Badge -->
            <div
              v-if="getNotificationPriority(notification.type) === 'high'"
              class="inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
            >
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2L13.09,8.26L22,9L14.74,14.74L16.61,22L12,18.27L7.39,22L9.26,14.74L2,9L10.91,8.26L12,2Z"/>
              </svg>
              High Priority
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMoreNotifications" class="text-center py-4">
      <Button
        variant="outline"
        @click="loadMoreNotifications"
        :loading="loadingMore"
      >
        Load More Notifications
      </Button>
    </div>

    <!-- Preferences Modal -->
    <Modal v-if="showPreferences" @close="showPreferences = false" size="lg">
      <template #header>
        <h2 class="text-xl font-bold text-gray-900">Notification Preferences</h2>
      </template>

      <div class="space-y-6">
        <!-- Notification Types -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Price Alerts</label>
                <p class="text-sm text-gray-500">Get notified when flight prices change</p>
              </div>
              <Toggle
                v-model="localPreferences.priceAlerts"
                @update:modelValue="updatePreference('priceAlerts', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Booking Updates</label>
                <p class="text-sm text-gray-500">Flight changes, confirmations, and reminders</p>
              </div>
              <Toggle
                v-model="localPreferences.bookingUpdates"
                @update:modelValue="updatePreference('bookingUpdates', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Promotions</label>
                <p class="text-sm text-gray-500">Special offers and deals</p>
              </div>
              <Toggle
                v-model="localPreferences.promotions"
                @update:modelValue="updatePreference('promotions', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">System Updates</label>
                <p class="text-sm text-gray-500">Maintenance, new features, and system news</p>
              </div>
              <Toggle
                v-model="localPreferences.systemUpdates"
                @update:modelValue="updatePreference('systemUpdates', $event)"
              />
            </div>
          </div>
        </div>

        <!-- Delivery Methods -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Browser Notifications</label>
                <p class="text-sm text-gray-500">Show notifications in your browser</p>
              </div>
              <Toggle
                v-model="localPreferences.pushNotifications"
                @update:modelValue="updatePreference('pushNotifications', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Email Notifications</label>
                <p class="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Toggle
                v-model="localPreferences.emailNotifications"
                @update:modelValue="updatePreference('emailNotifications', $event)"
              />
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Sound Alerts</label>
                <p class="text-sm text-gray-500">Play sound when notifications arrive</p>
              </div>
              <Toggle
                v-model="localPreferences.soundEnabled"
                @update:modelValue="updatePreference('soundEnabled', $event)"
              />
            </div>
          </div>
        </div>

        <!-- Test Notifications -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Notifications</h3>
          <div class="flex items-center space-x-3">
            <Button
              size="sm"
              @click="sendTestNotification('PRICE_DROP')"
            >
              Test Price Alert
            </Button>
            <Button
              size="sm"
              @click="sendTestNotification('BOOKING_CONFIRMED')"
            >
              Test Booking Update
            </Button>
            <Button
              size="sm"
              @click="requestNotificationPermission"
            >
              Request Browser Permission
            </Button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <Button variant="outline" @click="showPreferences = false">Close</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '@/store/notifications'
import Button from './ui/Button.vue'
import Modal from './ui/Modal.vue'
import Toggle from './ui/Toggle.vue'

const router = useRouter()
const notificationsStore = useNotificationsStore()

// State
const showPreferences = ref(false)
const filterType = ref('all')
const sortOrder = ref('newest')
const loadingMore = ref(false)
const displayLimit = ref(20)

// Local preferences for immediate UI updates
const localPreferences = ref({ ...notificationsStore.preferences })

// Computed
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const isConnected = computed(() => notificationsStore.isConnected)
const priorityNotifications = computed(() => notificationsStore.priorityNotifications)
const actionableNotifications = computed(() => notificationsStore.actionableNotifications)

const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  // Apply filters
  switch (filterType.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read)
      break
    case 'priority':
      filtered = filtered.filter(n => notificationsStore.notificationTypes[n.type]?.priority === 'high')
      break
    case 'actionable':
      filtered = filtered.filter(n => n.actionable)
      break
  }

  // Apply sorting
  switch (sortOrder.value) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      break
    case 'priority':
      filtered.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        const aPriority = priorityOrder[notificationsStore.notificationTypes[a.type]?.priority] || 0
        const bPriority = priorityOrder[notificationsStore.notificationTypes[b.type]?.priority] || 0
        if (aPriority !== bPriority) return bPriority - aPriority
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
      break
    default: // newest
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  return filtered.slice(0, displayLimit.value)
})

const hasMoreNotifications = computed(() => {
  let totalFiltered = [...notifications.value]

  switch (filterType.value) {
    case 'unread':
      totalFiltered = totalFiltered.filter(n => !n.read)
      break
    case 'priority':
      totalFiltered = totalFiltered.filter(n => notificationsStore.notificationTypes[n.type]?.priority === 'high')
      break
    case 'actionable':
      totalFiltered = totalFiltered.filter(n => n.actionable)
      break
  }

  return totalFiltered.length > displayLimit.value
})

// Methods
const getNotificationIcon = (type) => {
  return notificationsStore.notificationTypes[type]?.icon || '📢'
}

const getNotificationBorderColor = (type) => {
  const colors = {
    'green': 'border-l-green-500',
    'red': 'border-l-red-500',
    'blue': 'border-l-blue-500',
    'orange': 'border-l-orange-500',
    'purple': 'border-l-purple-500',
    'gold': 'border-l-yellow-500'
  }
  const color = notificationsStore.notificationTypes[type]?.color || 'blue'
  return colors[color] || 'border-l-gray-300'
}

const getNotificationIconBg = (type) => {
  const colors = {
    'green': 'bg-green-100 text-green-600',
    'red': 'bg-red-100 text-red-600',
    'blue': 'bg-blue-100 text-blue-600',
    'orange': 'bg-orange-100 text-orange-600',
    'purple': 'bg-purple-100 text-purple-600',
    'gold': 'bg-yellow-100 text-yellow-600'
  }
  const color = notificationsStore.notificationTypes[type]?.color || 'blue'
  return colors[color] || 'bg-gray-100 text-gray-600'
}

const getNotificationPriority = (type) => {
  return notificationsStore.notificationTypes[type]?.priority || 'medium'
}

const markAsRead = (notificationId) => {
  notificationsStore.markAsRead(notificationId)
}

const markAllAsRead = () => {
  if (confirm('Mark all notifications as read?')) {
    notificationsStore.markAllAsRead()
  }
}

const deleteNotification = (notificationId) => {
  notificationsStore.deleteNotification(notificationId)
}

const clearAllNotifications = () => {
  if (confirm('Clear all notifications? This action cannot be undone.')) {
    notificationsStore.clearAllNotifications()
  }
}

const handleNotificationAction = async (notificationId, actionType, actionData) => {
  const result = notificationsStore.executeNotificationAction(notificationId, actionType, actionData)
  
  if (result) {
    switch (result.type) {
      case 'navigate':
        router.push({ path: result.route, query: result.query })
        break
      case 'modal':
        // Handle modal opening
        console.log('Open modal:', result.component, result.data)
        break
      case 'download':
        // Handle file download
        console.log('Download file:', result.file, result.data)
        break
    }
  }
}

const loadMoreNotifications = () => {
  loadingMore.value = true
  setTimeout(() => {
    displayLimit.value += 20
    loadingMore.value = false
  }, 500)
}

const updatePreference = (key, value) => {
  localPreferences.value[key] = value
  notificationsStore.updatePreferences({ [key]: value })
}

const sendTestNotification = (type) => {
  const testNotifications = {
    PRICE_DROP: {
      type: 'PRICE_DROP',
      title: 'Test Price Alert',
      message: 'This is a test notification for price alerts. The price for NYC to London has dropped!',
      actionable: true,
      actions: [{ label: 'View Deal', action: 'view_flights', data: {} }]
    },
    BOOKING_CONFIRMED: {
      type: 'BOOKING_CONFIRMED',
      title: 'Test Booking Confirmation',
      message: 'This is a test booking confirmation notification.',
      actionable: true,
      actions: [{ label: 'View Booking', action: 'view_booking', data: {} }]
    }
  }

  if (testNotifications[type]) {
    notificationsStore.addNotification(testNotifications[type])
  }
}

const requestNotificationPermission = async () => {
  const granted = await notificationsStore.requestNotificationPermission()
  if (granted) {
    notificationsStore.addNotification({
      type: 'SYSTEM_UPDATE',
      title: 'Browser Notifications Enabled',
      message: 'You will now receive browser notifications for important updates.',
    })
  }
}

const formatRelativeTime = (timestamp) => {
  return notificationsStore.formatRelativeTime(timestamp)
}

onMounted(() => {
  notificationsStore.initializeNotifications()
})
</script>