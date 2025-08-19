import { io } from 'socket.io-client'

/**
 * Real-time Notification Service
 * Handles Socket.IO connections, push notifications, and notification management
 */

class NotificationService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectTimeout = null
    this.isConnected = false
    this.eventListeners = new Map()
    this.messageQueue = []
  }

  /**
   * Initialize the notification service
   */
  async init(userId, serverUrl = null) {
    this.userId = userId
    this.serverUrl = serverUrl || this.getServerUrl()
    
    // Request notification permission
    await this.requestNotificationPermission()
    
    // Connect to Socket.IO server
    this.connect()
    
    // Register service worker for push notifications
    await this.registerServiceWorker()
  }

  /**
   * Get server URL based on environment
   */
  getServerUrl() {
    if (process.env.NODE_ENV === 'development') {
      // Connect to backend server during development
      return 'http://localhost:5000'
    } else {
      // Production server URL
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
      const host = window.location.host
      return `${protocol}//api.${host}`
    }
  }

  /**
   * Connect to Socket.IO server
   */
  connect() {
    if (this.socket && this.socket.connected) {
      return
    }

    try {
      // Get auth token for authentication
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      this.socket = io(this.serverUrl, {
        auth: {
          token: token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        timeout: 10000
      })
      
      this.socket.on('connect', this.handleConnect.bind(this))
      this.socket.on('disconnect', this.handleDisconnect.bind(this))
      this.socket.on('connect_error', this.handleError.bind(this))
      this.socket.on('notification', this.handleNotification.bind(this))
      this.socket.on('price_alert', this.handlePriceAlert.bind(this))
      this.socket.on('booking_update', this.handleBookingUpdate.bind(this))
      this.socket.on('flight_status', this.handleFlightStatus.bind(this))
      
    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error)
      this.handleReconnect()
    }
  }

  /**
   * Handle Socket.IO connection
   */
  handleConnect() {
    console.log('Socket.IO connected')
    this.isConnected = true
    this.reconnectAttempts = 0
    
    // Send queued messages
    this.flushMessageQueue()
    
    // Emit connection event
    this.emit('connected', { timestamp: new Date() })
    
    // Join user room for notifications
    if (this.userId) {
      this.socket.emit('join_user_room', this.userId)
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'notification':
          this.handleNotification(data.payload)
          break
        case 'price_alert':
          this.handlePriceAlert(data.payload)
          break
        case 'booking_update':
          this.handleBookingUpdate(data.payload)
          break
        case 'flight_status':
          this.handleFlightStatus(data.payload)
          break
        case 'heartbeat':
          this.handleHeartbeat(data.payload)
          break
        case 'auth_response':
          this.handleAuthResponse(data.payload)
          break
        default:
          console.log('Unknown message type:', data.type)
      }
      
      // Emit raw message event
      this.emit('message', data)
      
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Handle Socket.IO disconnection
   */
  handleDisconnect(reason) {
    console.log('Socket.IO disconnected:', reason)
    this.isConnected = false
    
    this.emit('disconnected', { 
      reason,
      timestamp: new Date()
    })
    
    // Socket.IO handles reconnection automatically
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error('WebSocket error:', error)
    this.emit('error', { error, timestamp: new Date() })
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect_failed', { attempts: this.reconnectAttempts })
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
    
    console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`)
    
    this.reconnectTimeout = setTimeout(() => {
      this.emit('reconnecting', { 
        attempt: this.reconnectAttempts, 
        delay,
        timestamp: new Date()
      })
      this.connect()
    }, delay)
  }

  /**
   * Send message through Socket.IO
   */
  send(event, payload) {
    const message = {
      payload,
      timestamp: new Date().toISOString(),
      userId: this.userId
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit(event, message)
    } else {
      // Queue message for later
      this.messageQueue.push({ event, message })
    }
  }

  /**
   * Flush queued messages
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { event, message } = this.messageQueue.shift()
      if (this.socket && this.socket.connected) {
        this.socket.emit(event, message)
      }
    }
  }

  /**
   * Handle incoming notifications
   */
  async handleNotification(notification) {
    // Import notifications store dynamically to avoid circular dependencies
    const { useNotificationsStore } = await import('../store/notifications')
    const notificationsStore = useNotificationsStore()
    
    // Add notification to store
    notificationsStore.addNotification(notification)
    
    // Show browser notification if enabled
    if (notificationsStore.preferences.pushNotifications) {
      this.showBrowserNotification(notification)
    }
    
    // Emit notification event
    this.emit('notification', notification)
  }

  /**
   * Handle price alerts
   */
  async handlePriceAlert(alert) {
    const { useNotificationsStore } = await import('../store/notifications')
    const notificationsStore = useNotificationsStore()
    
    const notification = {
      type: alert.priceChange < 0 ? 'PRICE_DROP' : 'PRICE_INCREASE',
      title: `Price Alert - ${alert.route}`,
      message: alert.priceChange < 0 
        ? `Great news! Price dropped by $${Math.abs(alert.priceChange)} to $${alert.newPrice}`
        : `Price increased by $${alert.priceChange} to $${alert.newPrice}`,
      actionable: true,
      actions: [
        { label: 'View Flights', action: 'view_flights', data: alert.searchParams }
      ],
      metadata: alert
    }
    
    notificationsStore.addNotification(notification)
    this.emit('price_alert', alert)
  }

  /**
   * Handle booking updates
   */
  async handleBookingUpdate(update) {
    const { useNotificationsStore } = await import('../store/notifications')
    const notificationsStore = useNotificationsStore()
    
    let notificationType = 'BOOKING_CONFIRMED'
    let title = 'Booking Update'
    let message = update.message
    
    switch (update.type) {
      case 'confirmed':
        notificationType = 'BOOKING_CONFIRMED'
        title = 'Booking Confirmed'
        break
      case 'cancelled':
        notificationType = 'BOOKING_CANCELLED'
        title = 'Booking Cancelled'
        break
      case 'check_in_available':
        notificationType = 'CHECK_IN_REMINDER'
        title = 'Check-in Available'
        break
      case 'flight_delayed':
        notificationType = 'FLIGHT_DELAYED'
        title = 'Flight Delay Notice'
        break
      case 'gate_change':
        notificationType = 'GATE_CHANGE'
        title = 'Gate Change Notice'
        break
    }
    
    const notification = {
      type: notificationType,
      title,
      message,
      actionable: true,
      actions: [
        { label: 'View Booking', action: 'view_booking', data: { bookingId: update.bookingId } }
      ],
      metadata: update
    }
    
    notificationsStore.addNotification(notification)
    this.emit('booking_update', update)
  }

  /**
   * Handle flight status updates
   */
  async handleFlightStatus(status) {
    const { useNotificationsStore } = await import('../store/notifications')
    const notificationsStore = useNotificationsStore()
    
    if (status.status === 'delayed' || status.status === 'cancelled') {
      const notification = {
        type: status.status === 'delayed' ? 'FLIGHT_DELAYED' : 'BOOKING_CANCELLED',
        title: status.status === 'delayed' ? 'Flight Delayed' : 'Flight Cancelled',
        message: status.message,
        actionable: true,
        actions: [
          { label: 'View Details', action: 'view_flight_status', data: status }
        ],
        metadata: status
      }
      
      notificationsStore.addNotification(notification)
    }
    
    this.emit('flight_status', status)
  }

  /**
   * Handle heartbeat response
   */
  handleHeartbeat(data) {
    // Update connection status if needed
    this.emit('heartbeat', data)
  }

  /**
   * Handle authentication response
   */
  handleAuthResponse(response) {
    if (response.success) {
      console.log('WebSocket authentication successful')
    } else {
      console.error('WebSocket authentication failed:', response.error)
    }
    
    this.emit('auth_response', response)
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.png',
        tag: notification.id,
        requireInteraction: notification.type === 'BOOKING_CONFIRMED' || notification.type === 'PRICE_DROP'
      })

      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        
        // Handle notification click action
        if (notification.actions && notification.actions.length > 0) {
          this.emit('notification_click', {
            notification,
            action: notification.actions[0]
          })
        }
      }

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.type !== 'BOOKING_CONFIRMED' && notification.type !== 'FLIGHT_DELAYED') {
        setTimeout(() => browserNotification.close(), 5000)
      }
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  /**
   * Register service worker for push notifications
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-notifications.js')
        console.log('Service Worker registered:', registration)
        
        // Subscribe to push notifications
        await this.subscribeToPush(registration)
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(registration) {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.VUE_APP_VAPID_PUBLIC_KEY
      })
      
      // Send subscription to server
      this.send('push_subscription', {
        subscription: subscription.toJSON(),
        userId: this.userId
      })
      
    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Event listener error:', error)
        }
      })
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.isConnected = false
    this.reconnectAttempts = 0
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      socketConnected: this.socket ? this.socket.connected : false
    }
  }
}

// Export singleton instance
export default new NotificationService()