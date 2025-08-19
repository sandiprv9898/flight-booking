import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const isConnected = ref(false)
  const preferences = ref({
    priceAlerts: true,
    bookingUpdates: true,
    promotions: true,
    systemUpdates: true,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true
  })

  // WebSocket connection
  let ws = null
  let reconnectTimeout = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5

  // Notification types and their configurations
  const notificationTypes = {
    PRICE_DROP: {
      icon: '💰',
      color: 'green',
      priority: 'high',
      persistent: true
    },
    PRICE_INCREASE: {
      icon: '📈',
      color: 'red',
      priority: 'medium',
      persistent: false
    },
    BOOKING_CONFIRMED: {
      icon: '✅',
      color: 'green',
      priority: 'high',
      persistent: true
    },
    BOOKING_CANCELLED: {
      icon: '❌',
      color: 'red',
      priority: 'high',
      persistent: true
    },
    CHECK_IN_REMINDER: {
      icon: '🎫',
      color: 'blue',
      priority: 'medium',
      persistent: false
    },
    FLIGHT_DELAYED: {
      icon: '⏰',
      color: 'orange',
      priority: 'high',
      persistent: true
    },
    GATE_CHANGE: {
      icon: '🚪',
      color: 'orange',
      priority: 'high',
      persistent: true
    },
    PROMOTION: {
      icon: '🎉',
      color: 'purple',
      priority: 'low',
      persistent: false
    },
    SYSTEM_UPDATE: {
      icon: '🔧',
      color: 'blue',
      priority: 'low',
      persistent: false
    },
    LOYALTY_POINTS: {
      icon: '⭐',
      color: 'gold',
      priority: 'medium',
      persistent: false
    }
  }

  // Mock data for demonstration
  const mockNotifications = ref([
    {
      id: 'n001',
      type: 'PRICE_DROP',
      title: 'Price Alert - NYC to London',
      message: 'Great news! The price for your saved search has dropped by $150. New price: $650',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      read: false,
      actionable: true,
      actions: [
        { label: 'View Flights', action: 'view_flights', data: { route: 'JFK-LHR' } },
        { label: 'Book Now', action: 'book_now', data: { searchId: 'ss001' } }
      ],
      metadata: {
        searchId: 'ss001',
        oldPrice: 800,
        newPrice: 650,
        route: 'JFK-LHR'
      }
    },
    {
      id: 'n002',
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmation',
      message: 'Your flight booking AA1234 to New York has been confirmed. Check-in opens 24 hours before departure.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      read: false,
      actionable: true,
      actions: [
        { label: 'View Booking', action: 'view_booking', data: { bookingId: 'BK001' } },
        { label: 'Add to Calendar', action: 'add_calendar', data: { bookingId: 'BK001' } }
      ],
      metadata: {
        bookingId: 'BK001',
        flightNumber: 'AA1234',
        destination: 'New York'
      }
    },
    {
      id: 'n003',
      type: 'CHECK_IN_REMINDER',
      title: 'Check-in Available',
      message: 'Check-in is now open for your flight AA1234 departing tomorrow at 3:30 PM.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      read: true,
      actionable: true,
      actions: [
        { label: 'Check In', action: 'check_in', data: { bookingId: 'BK001' } }
      ],
      metadata: {
        bookingId: 'BK001',
        flightNumber: 'AA1234'
      }
    },
    {
      id: 'n004',
      type: 'LOYALTY_POINTS',
      title: 'Points Earned',
      message: 'You earned 1,250 loyalty points from your recent booking! You are now 750 points away from Silver status.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      read: false,
      actionable: true,
      actions: [
        { label: 'View Points', action: 'view_loyalty', data: {} }
      ],
      metadata: {
        pointsEarned: 1250,
        totalPoints: 2750,
        nextTier: 'Silver'
      }
    },
    {
      id: 'n005',
      type: 'PROMOTION',
      title: 'Weekend Flash Sale',
      message: '30% off all flights to Europe! Limited time offer expires in 2 days.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      read: true,
      actionable: true,
      actions: [
        { label: 'Browse Deals', action: 'view_deals', data: { category: 'europe' } }
      ],
      metadata: {
        discount: 30,
        region: 'Europe',
        expiresIn: '2 days'
      }
    }
  ])

  // Computed properties
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read)
  )

  const priorityNotifications = computed(() =>
    notifications.value
      .filter(n => !n.read && notificationTypes[n.type]?.priority === 'high')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  )

  const actionableNotifications = computed(() =>
    notifications.value.filter(n => n.actionable && !n.read)
  )

  const notificationsByType = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      const type = notification.type
      if (!grouped[type]) grouped[type] = []
      grouped[type].push(notification)
    })
    return grouped
  })

  // WebSocket connection management
  const connectWebSocket = async () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    try {
      // Import notification service
      const notificationService = (await import('../services/notificationService')).default
      
      // Initialize real-time service
      await notificationService.init(authStore.user.id)
      
      // Set up event listeners
      notificationService.on('connected', () => {
        isConnected.value = true
        reconnectAttempts = 0
      })
      
      notificationService.on('disconnected', () => {
        isConnected.value = false
      })
      
      notificationService.on('reconnecting', (data) => {
        reconnectAttempts = data.attempt
      })
      
      notificationService.on('notification', (notification) => {
        // Notification is already added by the service
        // This event can be used for additional processing
      })
      
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      // Fallback to simulation for demo
      simulateWebSocketConnection()
    }
  }

  const simulateWebSocketConnection = () => {
    isConnected.value = true
    reconnectAttempts = 0
    
    // Simulate receiving real-time notifications
    const simulateNotification = () => {
      if (Math.random() < 0.3) { // 30% chance every interval
        generateRandomNotification()
      }
    }

    // Simulate periodic notifications
    const notificationInterval = setInterval(simulateNotification, 30000) // Every 30 seconds

    // Cleanup interval when store is destroyed
    window.addEventListener('beforeunload', () => {
      clearInterval(notificationInterval)
    })
  }

  const handleReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000) // Exponential backoff

    reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting... Attempt ${reconnectAttempts}`)
      connectWebSocket()
    }, delay)
  }

  const disconnectWebSocket = async () => {
    try {
      // Import and disconnect from notification service
      const notificationService = (await import('../services/notificationService')).default
      notificationService.disconnect()
    } catch (error) {
      console.error('Error disconnecting from notification service:', error)
    }
    
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
    }
    isConnected.value = false
  }

  // Notification management
  const addNotification = (notificationData) => {
    const notification = {
      id: `n${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      actionable: false,
      actions: [],
      metadata: {},
      ...notificationData
    }

    notifications.value.unshift(notification)
    unreadCount.value++

    // Play sound if enabled
    if (preferences.value.soundEnabled) {
      playNotificationSound(notification.type)
    }

    // Show browser notification if supported and enabled
    if (preferences.value.pushNotifications && 'Notification' in window) {
      showBrowserNotification(notification)
    }

    // Auto-dismiss non-persistent notifications
    if (!notificationTypes[notification.type]?.persistent) {
      setTimeout(() => {
        markAsRead(notification.id)
      }, 10000) // Auto-dismiss after 10 seconds
    }

    return notification
  }

  const markAsRead = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
      saveToPersistentStorage()
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      notification.read = true
    })
    unreadCount.value = 0
    saveToPersistentStorage()
  }

  const deleteNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = notifications.value[index]
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
      saveToPersistentStorage()
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
    saveToPersistentStorage()
  }

  const executeNotificationAction = (notificationId, actionType, actionData = {}) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (!notification) return

    // Mark as read when action is taken
    markAsRead(notificationId)

    // Handle different action types
    switch (actionType) {
      case 'view_flights':
        return { type: 'navigate', route: '/search', query: actionData }
      case 'book_now':
        return { type: 'navigate', route: '/search', query: actionData }
      case 'view_booking':
        return { type: 'navigate', route: '/bookings', query: { id: actionData.bookingId } }
      case 'check_in':
        return { type: 'modal', component: 'CheckInModal', data: actionData }
      case 'add_calendar':
        return { type: 'download', file: 'calendar_event.ics', data: actionData }
      case 'view_loyalty':
        return { type: 'navigate', route: '/profile', query: { tab: 'loyalty' } }
      case 'view_deals':
        return { type: 'navigate', route: '/deals', query: actionData }
      default:
        console.log('Unknown action type:', actionType)
    }
  }

  // Notification generation helpers
  const generateRandomNotification = () => {
    const types = Object.keys(notificationTypes)
    const randomType = types[Math.floor(Math.random() * types.length)]
    
    const mockData = {
      PRICE_DROP: {
        title: 'Price Alert - Miami to Madrid',
        message: `Price dropped by $${Math.floor(Math.random() * 200 + 50)}! New price: $${Math.floor(Math.random() * 500 + 400)}`,
        actionable: true,
        actions: [
          { label: 'View Flights', action: 'view_flights', data: { route: 'MIA-MAD' } }
        ]
      },
      FLIGHT_DELAYED: {
        title: 'Flight Delay Notice',
        message: `Your flight UA${Math.floor(Math.random() * 9999)} is delayed by ${Math.floor(Math.random() * 120 + 30)} minutes`,
        actionable: true,
        actions: [
          { label: 'View Booking', action: 'view_booking', data: { bookingId: 'BK002' } }
        ]
      },
      LOYALTY_POINTS: {
        title: 'Points Earned',
        message: `You earned ${Math.floor(Math.random() * 1000 + 500)} loyalty points!`,
        actionable: true,
        actions: [
          { label: 'View Points', action: 'view_loyalty', data: {} }
        ]
      }
    }

    if (mockData[randomType]) {
      addNotification({
        type: randomType,
        ...mockData[randomType]
      })
    }
  }

  const playNotificationSound = (type) => {
    if (!preferences.value.soundEnabled) return
    
    try {
      const audio = new Audio('/sounds/notification.mp3') // You'd need to add this file
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play failures (common in browsers with autoplay restrictions)
      })
    } catch (error) {
      console.log('Could not play notification sound:', error)
    }
  }

  const showBrowserNotification = (notification) => {
    if (Notification.permission !== 'granted') return

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/icon-192.png', // You'd need to add this file
      tag: notification.id,
      requireInteraction: notificationTypes[notification.type]?.persistent
    })

    browserNotification.onclick = () => {
      window.focus()
      if (notification.actions.length > 0) {
        executeNotificationAction(
          notification.id, 
          notification.actions[0].action, 
          notification.actions[0].data
        )
      }
      browserNotification.close()
    }

    // Auto-close after 5 seconds for non-persistent notifications
    if (!notificationTypes[notification.type]?.persistent) {
      setTimeout(() => browserNotification.close(), 5000)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Preferences management
  const updatePreferences = (newPreferences) => {
    preferences.value = { ...preferences.value, ...newPreferences }
    saveToPersistentStorage()
  }

  const saveToPersistentStorage = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    const data = {
      notifications: notifications.value,
      preferences: preferences.value,
      unreadCount: unreadCount.value
    }

    localStorage.setItem(`notifications_${authStore.user.id}`, JSON.stringify(data))
  }

  const loadFromPersistentStorage = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    const saved = localStorage.getItem(`notifications_${authStore.user.id}`)
    if (saved) {
      const data = JSON.parse(saved)
      notifications.value = data.notifications || []
      preferences.value = { ...preferences.value, ...data.preferences }
      unreadCount.value = data.unreadCount || 0
    } else {
      // Load mock data for demo
      notifications.value = [...mockNotifications.value]
      unreadCount.value = notifications.value.filter(n => !n.read).length
    }
  }

  const initializeNotifications = () => {
    loadFromPersistentStorage()
    connectWebSocket()
  }

  const formatRelativeTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return time.toLocaleDateString()
  }

  return {
    // State
    notifications,
    unreadCount,
    isConnected,
    preferences,
    notificationTypes,

    // Computed
    unreadNotifications,
    priorityNotifications,
    actionableNotifications,
    notificationsByType,

    // Actions
    initializeNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    executeNotificationAction,
    updatePreferences,
    requestNotificationPermission,
    connectWebSocket,
    disconnectWebSocket,
    formatRelativeTime,
    generateRandomNotification
  }
})