// WebSocket Service for Real-time Updates
import { io } from 'socket.io-client'
import { useBookingStore } from '@/store/booking'
import { useNotificationsStore } from '@/store/notifications'

class WebSocketService {
  constructor() {
    this.socket = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnected = false
    this.listeners = new Map()
    this.roomId = null
  }

  // Initialize WebSocket connection
  connect(url = 'http://localhost:5000') {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected')
      return
    }

    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: {
        token: localStorage.getItem('authToken') || null
      }
    })

    this.setupEventHandlers()
  }

  // Set up WebSocket event handlers
  setupEventHandlers() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket.id)
      this.isConnected = true
      this.reconnectAttempts = 0
      this.emit('user:connected', { userId: this.getUserId() })
      
      // Rejoin room if exists
      if (this.roomId) {
        this.joinRoom(this.roomId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.isConnected = false
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.socket.connect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.handleConnectionFailure()
      }
    })

    // Seat availability updates
    this.socket.on('seat:update', (data) => {
      this.handleSeatUpdate(data)
    })

    this.socket.on('seat:locked', (data) => {
      this.handleSeatLocked(data)
    })

    this.socket.on('seat:released', (data) => {
      this.handleSeatReleased(data)
    })

    // Flight updates
    this.socket.on('flight:statusUpdate', (data) => {
      this.handleFlightStatusUpdate(data)
    })

    this.socket.on('flight:priceUpdate', (data) => {
      this.handleFlightPriceUpdate(data)
    })

    this.socket.on('flight:availabilityUpdate', (data) => {
      this.handleFlightAvailabilityUpdate(data)
    })

    // Booking updates
    this.socket.on('booking:confirmed', (data) => {
      this.handleBookingConfirmed(data)
    })

    this.socket.on('booking:cancelled', (data) => {
      this.handleBookingCancelled(data)
    })

    this.socket.on('booking:modified', (data) => {
      this.handleBookingModified(data)
    })

    // Notifications
    this.socket.on('notification:push', (data) => {
      this.handleNotification(data)
    })

    // Price alerts
    this.socket.on('priceAlert:triggered', (data) => {
      this.handlePriceAlert(data)
    })

    // System messages
    this.socket.on('system:message', (data) => {
      this.handleSystemMessage(data)
    })

    // Error handling
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
      this.handleError(error)
    })
  }

  // Room management for seat selection
  joinRoom(roomId) {
    if (!this.isConnected) {
      console.warn('Cannot join room: WebSocket not connected')
      return
    }

    this.roomId = roomId
    this.emit('room:join', { roomId })
    console.log(`Joined room: ${roomId}`)
  }

  leaveRoom(roomId) {
    if (!this.isConnected) return

    this.emit('room:leave', { roomId })
    this.roomId = null
    console.log(`Left room: ${roomId}`)
  }

  // Seat management
  lockSeat(flightId, seatId, userId) {
    if (!this.isConnected) {
      console.warn('Cannot lock seat: WebSocket not connected')
      return Promise.reject('Not connected')
    }

    return new Promise((resolve, reject) => {
      this.emit('seat:lock', {
        flightId,
        seatId,
        userId,
        timestamp: Date.now()
      }, (response) => {
        if (response.success) {
          resolve(response.data)
        } else {
          reject(response.error)
        }
      })
    })
  }

  releaseSeat(flightId, seatId, userId) {
    if (!this.isConnected) {
      console.warn('Cannot release seat: WebSocket not connected')
      return
    }

    this.emit('seat:release', {
      flightId,
      seatId,
      userId,
      timestamp: Date.now()
    })
  }

  // Subscribe to flight updates
  subscribeToFlight(flightId) {
    if (!this.isConnected) {
      console.warn('Cannot subscribe to flight: WebSocket not connected')
      return
    }

    this.emit('flight:subscribe', { flightId })
    console.log(`Subscribed to flight: ${flightId}`)
  }

  unsubscribeFromFlight(flightId) {
    if (!this.isConnected) return

    this.emit('flight:unsubscribe', { flightId })
    console.log(`Unsubscribed from flight: ${flightId}`)
  }

  // Subscribe to price alerts
  subscribeToPriceAlert(origin, destination, targetPrice) {
    if (!this.isConnected) {
      console.warn('Cannot subscribe to price alert: WebSocket not connected')
      return Promise.reject('Not connected')
    }

    return new Promise((resolve, reject) => {
      this.emit('priceAlert:subscribe', {
        origin,
        destination,
        targetPrice,
        userId: this.getUserId()
      }, (response) => {
        if (response.success) {
          resolve(response.alertId)
        } else {
          reject(response.error)
        }
      })
    })
  }

  // Event handlers
  handleSeatUpdate(data) {
    console.log('Seat update received:', data)
    const bookingStore = useBookingStore()
    
    if (bookingStore.selectedFlight?.id === data.flightId) {
      bookingStore.updateSeatAvailability(data.seatId, data.status)
    }

    // Notify listeners
    this.notifyListeners('seat:update', data)
  }

  handleSeatLocked(data) {
    console.log('Seat locked:', data)
    const bookingStore = useBookingStore()
    
    if (bookingStore.selectedFlight?.id === data.flightId) {
      bookingStore.updateSeatStatus(data.seatId, 'locked', data.userId)
    }

    // Show notification if another user locked a seat you were viewing
    if (data.userId !== this.getUserId()) {
      const notificationsStore = useNotificationsStore()
      notificationsStore.addNotification({
        type: 'info',
        title: 'Seat Unavailable',
        message: `Seat ${data.seatNumber} has been selected by another passenger`,
        duration: 5000
      })
    }

    this.notifyListeners('seat:locked', data)
  }

  handleSeatReleased(data) {
    console.log('Seat released:', data)
    const bookingStore = useBookingStore()
    
    if (bookingStore.selectedFlight?.id === data.flightId) {
      bookingStore.updateSeatStatus(data.seatId, 'available')
    }

    // Show notification if a previously locked seat becomes available
    const notificationsStore = useNotificationsStore()
    notificationsStore.addNotification({
      type: 'success',
      title: 'Seat Available',
      message: `Seat ${data.seatNumber} is now available`,
      duration: 5000
    })

    this.notifyListeners('seat:released', data)
  }

  handleFlightStatusUpdate(data) {
    console.log('Flight status update:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: data.status === 'delayed' ? 'warning' : 'info',
      title: 'Flight Status Update',
      message: `Flight ${data.flightNumber} is now ${data.status}`,
      duration: 10000
    })

    this.notifyListeners('flight:statusUpdate', data)
  }

  handleFlightPriceUpdate(data) {
    console.log('Flight price update:', data)
    
    // Update price in booking store if viewing this flight
    const bookingStore = useBookingStore()
    if (bookingStore.selectedFlight?.id === data.flightId) {
      bookingStore.updateFlightPrice(data.newPrice)
    }

    this.notifyListeners('flight:priceUpdate', data)
  }

  handleFlightAvailabilityUpdate(data) {
    console.log('Flight availability update:', data)
    
    const notificationsStore = useNotificationsStore()
    if (data.seatsRemaining < 10) {
      notificationsStore.addNotification({
        type: 'warning',
        title: 'Limited Availability',
        message: `Only ${data.seatsRemaining} seats remaining on flight ${data.flightNumber}`,
        duration: 10000
      })
    }

    this.notifyListeners('flight:availabilityUpdate', data)
  }

  handleBookingConfirmed(data) {
    console.log('Booking confirmed:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'success',
      title: 'Booking Confirmed',
      message: `Your booking ${data.bookingReference} has been confirmed`,
      duration: 10000,
      persistent: true
    })

    this.notifyListeners('booking:confirmed', data)
  }

  handleBookingCancelled(data) {
    console.log('Booking cancelled:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'warning',
      title: 'Booking Cancelled',
      message: `Booking ${data.bookingReference} has been cancelled`,
      duration: 10000
    })

    this.notifyListeners('booking:cancelled', data)
  }

  handleBookingModified(data) {
    console.log('Booking modified:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'info',
      title: 'Booking Modified',
      message: `Your booking ${data.bookingReference} has been updated`,
      duration: 8000
    })

    this.notifyListeners('booking:modified', data)
  }

  handlePriceAlert(data) {
    console.log('Price alert triggered:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'success',
      title: 'Price Alert!',
      message: `${data.origin} to ${data.destination} is now $${data.currentPrice} (Target: $${data.targetPrice})`,
      duration: 15000,
      persistent: true,
      action: {
        label: 'Search Flights',
        handler: () => {
          window.location.href = `/search?origin=${data.origin}&destination=${data.destination}`
        }
      }
    })

    this.notifyListeners('priceAlert:triggered', data)
  }

  handleNotification(data) {
    console.log('Notification received:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      duration: data.duration || 8000,
      persistent: data.persistent || false
    })

    this.notifyListeners('notification:push', data)
  }

  handleSystemMessage(data) {
    console.log('System message:', data)
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: data.type || 'info',
      title: 'System Message',
      message: data.message,
      duration: data.duration || 10000
    })

    this.notifyListeners('system:message', data)
  }

  handleError(error) {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Connection Error',
      message: error.message || 'An error occurred with the real-time connection',
      duration: 10000
    })

    this.notifyListeners('error', error)
  }

  handleConnectionFailure() {
    const notificationsStore = useNotificationsStore()
    
    notificationsStore.addNotification({
      type: 'error',
      title: 'Connection Failed',
      message: 'Unable to establish real-time connection. Some features may be unavailable.',
      duration: 15000,
      persistent: true,
      action: {
        label: 'Retry',
        handler: () => {
          this.reconnect()
        }
      }
    })
  }

  // Event emitter wrapper
  emit(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn(`Cannot emit ${event}: WebSocket not connected`)
      return
    }

    if (callback) {
      this.socket.emit(event, data, callback)
    } else {
      this.socket.emit(event, data)
    }
  }

  // Add event listener
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(handler)

    // Also register with socket if connected
    if (this.socket) {
      this.socket.on(event, handler)
    }

    return () => this.off(event, handler)
  }

  // Remove event listener
  off(event, handler) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(handler)
    }

    if (this.socket) {
      this.socket.off(event, handler)
    }
  }

  // Notify all listeners for an event
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error)
        }
      })
    }
  }

  // Utility methods
  getUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.id || null
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // Reconnect manually
  reconnect() {
    if (this.isConnected) {
      console.log('Already connected')
      return
    }

    this.reconnectAttempts = 0
    this.connect()
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.roomId = null
      console.log('WebSocket disconnected manually')
    }
  }

  // Clean up resources
  destroy() {
    this.listeners.clear()
    this.disconnect()
  }
}

// Export singleton instance
const websocketService = new WebSocketService()

// Auto-connect on module load if in browser
if (typeof window !== 'undefined') {
  // Delay connection to allow stores to initialize
  setTimeout(() => {
    websocketService.connect()
  }, 1000)
}

export default websocketService