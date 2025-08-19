import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bookingSessionAPI } from '@/services/bookingSessionApi'
import { completedBookingsAPI } from '@/services/completedBookingsApi'
import { useAuthStore } from './auth'

// Mock seat map data
const mockSeatMap = {
  aircraft: 'Boeing 777-300ER',
  totalSeats: 396,
  seatConfiguration: '3-3-3',
  sections: [
    {
      name: 'Business Class',
      rows: 8,
      seatsPerRow: 6,
      seatLayout: ['A', '', 'C', 'D', 'F', '', 'H'],
      basePrice: 250,
      features: ['Lie-flat', 'Priority boarding', 'Extra baggage']
    },
    {
      name: 'Premium Economy',
      rows: 6,
      seatsPerRow: 9,
      seatLayout: ['A', 'B', 'C', '', 'D', 'E', 'F', '', 'G', 'H', 'J'],
      basePrice: 120,
      features: ['Extra legroom', 'Priority boarding', 'Enhanced meals']
    },
    {
      name: 'Economy',
      rows: 35,
      seatsPerRow: 9,
      seatLayout: ['A', 'B', 'C', '', 'D', 'E', 'F', '', 'G', 'H', 'J'],
      basePrice: 0,
      features: ['Standard seat', 'Standard service']
    }
  ]
}

// Generate seat data
const generateSeats = () => {
  const seats = []
  let seatId = 1
  
  mockSeatMap.sections.forEach((section, sectionIndex) => {
    for (let row = 1; row <= section.rows; row++) {
      section.seatLayout.forEach((seatLetter, seatIndex) => {
        if (seatLetter) {
          const actualRow = sectionIndex === 0 ? row : 
                          sectionIndex === 1 ? row + 8 : 
                          row + 14
          
          seats.push({
            id: seatId++,
            row: actualRow,
            seat: seatLetter,
            seatNumber: `${actualRow}${seatLetter}`,
            section: section.name,
            price: section.basePrice,
            isAvailable: Math.random() > 0.3, // 70% seats available
            isSelected: false,
            isWindow: ['A', 'J'].includes(seatLetter),
            isAisle: ['C', 'D', 'G', 'H'].includes(seatLetter),
            features: section.features,
            type: section.name.toLowerCase().replace(' ', '_')
          })
        }
      })
    }
  })
  
  return seats
}

export const useBookingStore = defineStore('booking', () => {
  // State
  const currentStep = ref(1) // 1: Flight, 2: Seats, 3: Extras, 4: Passengers, 5: Payment, 6: Confirmation
  const selectedFlight = ref(null)
  const returnFlight = ref(null)
  const selectedSeats = ref([])
  const passengers = ref([])
  const contactInfo = ref({
    email: '',
    phone: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })
  const paymentInfo = ref({
    method: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  const bookingExtras = ref({
    meals: [],
    baggage: [],
    insurance: false,
    lounge: false,
    fastTrack: false,
    wifi: false
  })
  const promoCode = ref('')
  const appliedDiscount = ref(0)
  const bookings = ref([])
  const seatMap = ref(generateSeats())
  const seatLockTimer = ref(null)
  const seatLockExpiry = ref(null)
  const loading = ref(false)
  
  // Session management
  const sessionId = ref(null)
  const sessionExpiresAt = ref(null)
  const autoSaveEnabled = ref(true)
  const lastSavedAt = ref(null)
  const syncInProgress = ref(false)

  // Getters
  const totalSteps = computed(() => 6)
  
  const stepProgress = computed(() => (currentStep.value / totalSteps.value) * 100)

  const selectedSeatsCount = computed(() => selectedSeats.value.length)

  const baseFareTotal = computed(() => {
    if (!selectedFlight.value) return 0
    return selectedFlight.value.price * passengers.value.length
  })

  const seatsTotal = computed(() => {
    return selectedSeats.value.reduce((total, seat) => total + seat.price, 0)
  })

  const extrasTotal = computed(() => {
    let total = 0
    
    // Meals
    bookingExtras.value.meals.forEach(meal => {
      total += meal.price * passengers.value.length
    })
    
    // Baggage
    bookingExtras.value.baggage.forEach(bag => {
      total += bag.price
    })
    
    // Other extras
    if (bookingExtras.value.insurance) total += 45
    if (bookingExtras.value.lounge) total += 65 * passengers.value.length
    if (bookingExtras.value.fastTrack) total += 25 * passengers.value.length
    if (bookingExtras.value.wifi) total += 15
    
    return total
  })

  const taxesAndFees = computed(() => {
    return Math.round(baseFareTotal.value * 0.15) // 15% taxes and fees
  })

  const subtotal = computed(() => {
    return baseFareTotal.value + seatsTotal.value + extrasTotal.value + taxesAndFees.value
  })

  const totalPrice = computed(() => {
    return subtotal.value - appliedDiscount.value
  })

  const availableSeats = computed(() => {
    return seatMap.value.filter(seat => seat.isAvailable && !seat.isSelected)
  })

  const seatsBySection = computed(() => {
    const sections = {}
    seatMap.value.forEach(seat => {
      if (!sections[seat.section]) {
        sections[seat.section] = []
      }
      sections[seat.section].push(seat)
    })
    return sections
  })

  const currentBooking = computed(() => {
    return {
      id: `BK${Date.now()}`,
      flight: selectedFlight.value,
      returnFlight: returnFlight.value,
      seats: selectedSeats.value,
      passengers: passengers.value,
      contact: contactInfo.value,
      payment: paymentInfo.value,
      extras: bookingExtras.value,
      pricing: {
        baseFare: baseFareTotal.value,
        seats: seatsTotal.value,
        extras: extrasTotal.value,
        taxes: taxesAndFees.value,
        discount: appliedDiscount.value,
        total: totalPrice.value
      },
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  })

  const isStepComplete = computed(() => {
    return (step) => {
      switch (step) {
        case 1: return !!selectedFlight.value
        case 2: return selectedSeats.value.length === passengers.value.length
        case 3: return true // Extras are optional
        case 4: return passengers.value.every(p => p.firstName && p.lastName && p.dateOfBirth)
        case 5: return paymentInfo.value.cardNumber && paymentInfo.value.nameOnCard
        case 6: return true
        default: return false
      }
    }
  })

  // Actions
  const setCurrentStep = async (step) => {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step
      
      // Auto-save session when step changes
      if (autoSaveEnabled.value && sessionId.value) {
        try {
          await bookingSessionAPI.updateStep(sessionId.value, step)
        } catch (error) {
          console.warn('Failed to update step on server:', error.message)
        }
      }
      
      await saveSession()
    }
  }

  const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const setSelectedFlight = async (flight) => {
    selectedFlight.value = flight
    // Initialize passengers based on search criteria
    const passengerCount = flight.searchCriteria?.passengers || 1
    initializePassengers(passengerCount)
    
    // Auto-save when flight is selected
    await saveSession()
  }

  const initializePassengers = (count) => {
    passengers.value = Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      type: index === 0 ? 'adult' : 'adult', // First passenger is primary
      title: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      passportNumber: '',
      passportExpiry: '',
      specialRequests: [],
      frequentFlyer: {
        program: '',
        number: ''
      }
    }))
  }

  const selectSeat = async (seat) => {
    if (!seat.isAvailable || seat.isSelected) return false

    // Check if passenger limit reached
    if (selectedSeats.value.length >= passengers.value.length) {
      return false
    }

    // Mark seat as selected
    const seatIndex = seatMap.value.findIndex(s => s.id === seat.id)
    if (seatIndex > -1) {
      seatMap.value[seatIndex].isSelected = true
      selectedSeats.value.push({ ...seatMap.value[seatIndex] })
      
      // Start seat lock timer (15 minutes)
      startSeatLockTimer()
      
      // Try to reserve seat on server
      if (sessionId.value) {
        try {
          const seatsToReserve = selectedSeats.value.map(seat => ({
            seatId: seat.id,
            seatNumber: seat.seatNumber,
            section: seat.section,
            price: seat.price,
            isWindow: seat.isWindow,
            isAisle: seat.isAisle
          }))
          
          await bookingSessionAPI.reserveSeats(sessionId.value, seatsToReserve)
          console.log('✅ Seat reserved on server:', seat.seatNumber)
        } catch (error) {
          console.warn('⚠️ Failed to reserve seat on server:', error.message)
          
          if (error.message.includes('no longer available')) {
            // Seat is no longer available, revert selection
            seatMap.value[seatIndex].isSelected = false
            selectedSeats.value.pop()
            return false
          }
        }
      }
      
      // Auto-save session
      await saveSession()
      
      return true
    }
    
    return false
  }

  const deselectSeat = (seatId) => {
    // Remove from selected seats
    const selectedIndex = selectedSeats.value.findIndex(s => s.id === seatId)
    if (selectedIndex > -1) {
      selectedSeats.value.splice(selectedIndex, 1)
    }

    // Mark as unselected in seat map
    const seatIndex = seatMap.value.findIndex(s => s.id === seatId)
    if (seatIndex > -1) {
      seatMap.value[seatIndex].isSelected = false
    }

    // Clear timer if no seats selected
    if (selectedSeats.value.length === 0) {
      clearSeatLockTimer()
    }
  }

  const clearAllSeats = () => {
    // Clear all selected seats
    selectedSeats.value.forEach(seat => {
      const seatIndex = seatMap.value.findIndex(s => s.id === seat.id)
      if (seatIndex > -1) {
        seatMap.value[seatIndex].isSelected = false
      }
    })

    // Clear the selected seats array
    selectedSeats.value = []

    // Clear the seat lock timer
    clearSeatLockTimer()
  }

  const startSeatLockTimer = () => {
    clearSeatLockTimer()
    
    seatLockExpiry.value = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    
    seatLockTimer.value = setTimeout(() => {
      // Release seats after 15 minutes
      selectedSeats.value.forEach(seat => {
        deselectSeat(seat.id)
      })
      
      alert('Seat selection expired. Please select your seats again.')
    }, 15 * 60 * 1000)
  }

  const clearSeatLockTimer = () => {
    if (seatLockTimer.value) {
      clearTimeout(seatLockTimer.value)
      seatLockTimer.value = null
      seatLockExpiry.value = null
    }
  }

  const updatePassenger = (index, passengerData) => {
    if (passengers.value[index]) {
      passengers.value[index] = { ...passengers.value[index], ...passengerData }
    }
  }

  const updateContactInfo = (info) => {
    contactInfo.value = { ...contactInfo.value, ...info }
  }

  const updatePaymentInfo = (info) => {
    paymentInfo.value = { ...paymentInfo.value, ...info }
  }

  const updateBookingExtras = (extras) => {
    bookingExtras.value = { ...bookingExtras.value, ...extras }
  }

  const applyPromoCode = async (code) => {
    loading.value = true
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock promo codes
      const promoCodes = {
        'SAVE10': { discount: 0.10, type: 'percentage' },
        'SAVE50': { discount: 50, type: 'fixed' },
        'WELCOME': { discount: 0.15, type: 'percentage' },
        'STUDENT': { discount: 0.20, type: 'percentage' }
      }
      
      if (promoCodes[code.toUpperCase()]) {
        const promo = promoCodes[code.toUpperCase()]
        promoCode.value = code.toUpperCase()
        
        if (promo.type === 'percentage') {
          appliedDiscount.value = Math.round(subtotal.value * promo.discount)
        } else {
          appliedDiscount.value = promo.discount
        }
        
        return { success: true, message: `Promo code applied! You saved $${appliedDiscount.value}` }
      } else {
        return { success: false, message: 'Invalid promo code' }
      }
    } catch (error) {
      return { success: false, message: 'Error applying promo code' }
    } finally {
      loading.value = false
    }
  }

  const removePromoCode = () => {
    promoCode.value = ''
    appliedDiscount.value = 0
  }

  const completeBooking = async () => {
    loading.value = true
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const bookingReference = generateBookingReference()
      
      const bookingData = {
        bookingReference,
        flight: selectedFlight.value,
        returnFlight: returnFlight.value,
        seats: selectedSeats.value.map(seat => ({
          seatId: seat.id,
          seatNumber: seat.seatNumber,
          section: seat.section,
          price: seat.price,
          isWindow: seat.isWindow,
          isAisle: seat.isAisle
        })),
        passengers: passengers.value,
        contact: contactInfo.value,
        payment: {
          method: paymentInfo.value.method,
          cardLast4: paymentInfo.value.cardNumber?.slice(-4) || '',
          cardBrand: 'visa', // This would come from payment processor
          billingAddress: paymentInfo.value.billingAddress
        },
        extras: bookingExtras.value,
        pricing: {
          baseFare: baseFareTotal.value,
          seats: seatsTotal.value,
          extras: extrasTotal.value,
          taxes: taxesAndFees.value,
          discount: appliedDiscount.value,
          total: totalPrice.value
        },
        promoCode: promoCode.value,
        appliedDiscount: appliedDiscount.value,
        tickets: generateTickets(),
        status: 'confirmed',
        confirmedAt: new Date().toISOString()
      }
      
      // Save booking to backend
      const result = await completedBookingsAPI.completeBooking(sessionId.value, bookingData)
      const booking = result.booking
      
      // Clear seat lock timer
      clearSeatLockTimer()
      
      // Send booking confirmation notification
      try {
        const { useNotificationsStore } = await import('./notifications')
        const notificationsStore = useNotificationsStore()
        
        const flightNumber = selectedFlight.value?.flightNumber || 'N/A'
        const destination = selectedFlight.value?.destination?.city || selectedFlight.value?.destination?.code || 'destination'
        const departureDate = selectedFlight.value?.departureTime ? new Date(selectedFlight.value.departureTime).toLocaleDateString() : 'N/A'
        
        notificationsStore.addNotification({
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          message: `Your flight booking ${booking.bookingReference} to ${destination} has been confirmed. Check-in opens 24 hours before departure.`,
          actionable: true,
          actions: [
            { label: 'View Booking', action: 'view_booking', data: { bookingReference: booking.bookingReference } },
            { label: 'Add to Calendar', action: 'add_calendar', data: { bookingReference: booking.bookingReference } }
          ],
          metadata: {
            bookingId: booking.bookingId,
            bookingReference: booking.bookingReference,
            flightNumber,
            destination,
            departureDate
          }
        })

        // Add loyalty points notification
        const pointsEarned = Math.floor(totalPrice.value * 0.1) // 10% of price as points
        notificationsStore.addNotification({
          type: 'LOYALTY_POINTS',
          title: 'Points Earned',
          message: `You earned ${pointsEarned} loyalty points from your booking to ${destination}!`,
          actionable: true,
          actions: [
            { label: 'View Points', action: 'view_loyalty', data: {} }
          ],
          metadata: {
            pointsEarned,
            bookingReference: booking.bookingReference
          }
        })
      } catch (error) {
        console.log('Could not send notifications:', error)
      }
      
      // Move to confirmation step
      currentStep.value = 6
      
      return { success: true, booking }
    } catch (error) {
      console.error('Booking completion failed:', error)
      return { success: false, error: error.message || 'Booking failed. Please try again.' }
    } finally {
      loading.value = false
    }
  }

  const generateBookingReference = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const generateTickets = () => {
    return passengers.value.map((passenger, index) => ({
      ticketNumber: `${Date.now()}${index}`,
      passenger: passenger,
      seat: selectedSeats.value[index],
      barcode: generateBarcode(),
      qrCode: generateQRCode()
    }))
  }

  const generateBarcode = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 5)
  }

  const generateQRCode = () => {
    return `FB-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`
  }

  const getBookingHistory = async (limit = 20, offset = 0) => {
    try {
      loading.value = true
      const result = await completedBookingsAPI.getBookingHistory(limit, offset)
      
      // Update local bookings array for reactivity
      if (offset === 0) {
        bookings.value = result.bookings
      } else {
        bookings.value.push(...result.bookings)
      }
      
      return {
        bookings: result.bookings,
        pagination: result.pagination
      }
    } catch (error) {
      console.error('Failed to get booking history:', error)
      
      // Show user notification
      try {
        const { useNotificationsStore } = await import('./notifications')
        const notificationsStore = useNotificationsStore()
        
        notificationsStore.addNotification({
          type: 'LOAD_ERROR',
          title: 'Connection Issue',
          message: 'Unable to load your booking history. Please check your connection.',
          actionable: true,
          actions: [
            { label: 'Retry', action: 'retry_history_load', data: { limit, offset } }
          ]
        })
      } catch (notifError) {
        console.warn('Could not show notification:', notifError)
      }
      
      return { bookings: [], pagination: { total: 0, hasMore: false } }
    } finally {
      loading.value = false
    }
  }

  const cancelBooking = async (bookingReference) => {
    try {
      loading.value = true
      const result = await completedBookingsAPI.cancelBooking(bookingReference)
      
      // Update local bookings array
      const bookingIndex = bookings.value.findIndex(b => b.bookingReference === bookingReference)
      if (bookingIndex > -1) {
        bookings.value[bookingIndex].status = 'cancelled'
        bookings.value[bookingIndex].cancelledAt = result.booking.cancelledAt
      }
      
      // Send cancellation notification
      try {
        const { useNotificationsStore } = await import('./notifications')
        const notificationsStore = useNotificationsStore()
        
        notificationsStore.addNotification({
          type: 'BOOKING_CANCELLED',
          title: 'Booking Cancelled',
          message: `Your booking ${bookingReference} has been cancelled. Refund will be processed within 3-5 business days.`,
          actionable: true,
          actions: [
            { label: 'View Booking', action: 'view_booking', data: { bookingReference } }
          ],
          metadata: {
            bookingReference
          }
        })
      } catch (error) {
        console.log('Could not send notification:', error)
      }
      
      return { success: true, booking: result.booking }
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      
      // Show user notification
      try {
        const { useNotificationsStore } = await import('./notifications')
        const notificationsStore = useNotificationsStore()
        
        notificationsStore.addNotification({
          type: 'CANCEL_ERROR',
          title: 'Cancellation Failed',
          message: error.message || 'Unable to cancel booking. Please try again or contact support.',
          actionable: true,
          actions: [
            { label: 'Retry', action: 'retry_cancel', data: { bookingReference } }
          ]
        })
      } catch (notifError) {
        console.warn('Could not show notification:', notifError)
      }
      
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const resetBooking = () => {
    currentStep.value = 1
    selectedFlight.value = null
    returnFlight.value = null
    selectedSeats.value = []
    passengers.value = []
    contactInfo.value = {
      email: '',
      phone: '',
      emergencyContact: { name: '', phone: '', relationship: '' }
    }
    paymentInfo.value = {
      method: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      billingAddress: { street: '', city: '', state: '', zipCode: '', country: '' }
    }
    bookingExtras.value = {
      meals: [],
      baggage: [],
      insurance: false,
      lounge: false,
      fastTrack: false,
      wifi: false
    }
    promoCode.value = ''
    appliedDiscount.value = 0
    seatMap.value = generateSeats()
    clearSeatLockTimer()
  }

  const initializeBookingData = async () => {
    // Load booking history from backend instead of localStorage
    try {
      await getBookingHistory(10, 0) // Load first 10 bookings
      console.log('✅ Booking data initialized from backend')
    } catch (error) {
      console.warn('⚠️ Failed to initialize booking data:', error.message)
      // Set empty bookings array as fallback
      bookings.value = []
    }
  }

  // Session Management Functions
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getSessionData = () => {
    return {
      sessionId: sessionId.value,
      currentStep: currentStep.value,
      selectedFlight: selectedFlight.value,
      selectedSeats: selectedSeats.value.map(seat => ({
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        section: seat.section,
        price: seat.price,
        isWindow: seat.isWindow,
        isAisle: seat.isAisle
      })),
      passengers: passengers.value,
      contactInfo: contactInfo.value,
      paymentInfo: {
        ...paymentInfo.value,
        // Never send actual payment details to server
        cardNumber: '',
        cvv: '',
        cardLast4: paymentInfo.value.cardNumber ? paymentInfo.value.cardNumber.slice(-4) : '',
      },
      bookingExtras: bookingExtras.value,
      pricing: {
        baseFare: baseFareTotal.value,
        seats: seatsTotal.value,
        extras: extrasTotal.value,
        taxes: taxesAndFees.value,
        discount: appliedDiscount.value,
        total: totalPrice.value,
        lastUpdated: new Date().toISOString()
      },
      promoCode: promoCode.value,
      appliedDiscount: appliedDiscount.value
    }
  }

  const saveSession = async (forceSync = false) => {
    if (syncInProgress.value && !forceSync) return

    try {
      syncInProgress.value = true

      if (!sessionId.value) {
        sessionId.value = generateSessionId()
      }

      const sessionData = getSessionData()
      
      // Save only to backend - no localStorage
      const result = await bookingSessionAPI.saveSession(sessionData)
      sessionExpiresAt.value = result.session?.expiresAt
      lastSavedAt.value = new Date().toISOString()
      
      console.log('✅ Booking session saved to backend:', result.session?.sessionId)

    } catch (error) {
      console.error('❌ Failed to save booking session:', error)
      
      // Show user notification for network issues
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        // Import notifications store dynamically
        try {
          const { useNotificationsStore } = await import('./notifications')
          const notificationsStore = useNotificationsStore()
          
          notificationsStore.addNotification({
            type: 'NETWORK_ERROR',
            title: 'Connection Issue',
            message: 'Unable to save your progress. Please check your connection and try again.',
            actionable: true,
            actions: [
              { label: 'Retry Save', action: 'retry_save', data: { sessionId: sessionId.value } }
            ]
          })
        } catch (notifError) {
          console.warn('Could not show notification:', notifError)
        }
      }
      
      throw error // Re-throw to let calling code handle
    } finally {
      syncInProgress.value = false
    }
  }

  const loadSession = async (sessionIdToLoad = null) => {
    try {
      loading.value = true
      
      // Try to get session ID from URL parameter or provided parameter
      const targetSessionId = sessionIdToLoad || 
                             new URLSearchParams(window.location.search).get('sessionId') ||
                             sessionId.value

      if (!targetSessionId) {
        console.log('📝 No session ID provided, starting fresh')
        return false
      }

      console.log('🔄 Loading booking session from backend:', targetSessionId)

      // Load only from backend server
      const result = await bookingSessionAPI.getSession(targetSessionId)
      const session = result.session

      if (!session) {
        console.log('❌ Session not found on server')
        return false
      }

      // Restore session data
      sessionId.value = session.sessionId
      currentStep.value = session.currentStep || 1
      selectedFlight.value = session.selectedFlight
      passengers.value = session.passengers || []
      contactInfo.value = session.contactInfo || contactInfo.value
      bookingExtras.value = session.bookingExtras || bookingExtras.value
      promoCode.value = session.promoCode || ''
      appliedDiscount.value = session.appliedDiscount || 0
      sessionExpiresAt.value = session.expiresAt

      // Restore selected seats if not expired
      if (session.selectedSeats && session.selectedSeats.length > 0) {
        const validSeats = session.selectedSeats.filter(seat => 
          new Date(seat.expiresAt) > new Date()
        )
        
        if (validSeats.length > 0) {
          // Restore seats in local seat map
          selectedSeats.value = validSeats.map(seat => {
            const localSeat = seatMap.value.find(s => s.id === seat.seatId)
            if (localSeat) {
              localSeat.isSelected = true
              return { ...localSeat, ...seat }
            }
            return seat
          })
        } else {
          console.log('⏰ All selected seats have expired')
          // Show notification about expired seats
          try {
            const { useNotificationsStore } = await import('./notifications')
            const notificationsStore = useNotificationsStore()
            
            notificationsStore.addNotification({
              type: 'SEATS_EXPIRED',
              title: 'Seats Expired',
              message: 'Your previously selected seats have expired. Please select new seats.',
              actionable: true,
              actions: [
                { label: 'Select Seats', action: 'goto_step', data: { step: 2 } }
              ]
            })
          } catch (notifError) {
            console.warn('Could not show notification:', notifError)
          }
        }
      }

      // Initialize passengers if flight is selected
      if (selectedFlight.value && passengers.value.length === 0) {
        const passengerCount = selectedFlight.value.searchCriteria?.passengers || 1
        initializePassengers(passengerCount)
      }

      console.log('✅ Session restored from backend:', {
        sessionId: sessionId.value,
        step: currentStep.value,
        flight: selectedFlight.value?.flightNumber,
        seats: selectedSeats.value.length,
        passengers: passengers.value.length,
        expiresAt: sessionExpiresAt.value
      })

      return true

    } catch (error) {
      console.error('❌ Failed to load session from backend:', error)
      
      // Show user-friendly error
      if (error.message.includes('Network error') || error.message.includes('fetch')) {
        try {
          const { useNotificationsStore } = await import('./notifications')
          const notificationsStore = useNotificationsStore()
          
          notificationsStore.addNotification({
            type: 'LOAD_ERROR',
            title: 'Connection Issue',
            message: 'Unable to load your booking session. Please check your connection.',
            actionable: true,
            actions: [
              { label: 'Retry Load', action: 'retry_load', data: { sessionId: targetSessionId } },
              { label: 'Start Over', action: 'start_fresh', data: {} }
            ]
          })
        } catch (notifError) {
          console.warn('Could not show notification:', notifError)
        }
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  const validateCurrentSession = async () => {
    if (!sessionId.value) return

    try {
      // Check seat availability and pricing
      const result = await bookingSessionAPI.validatePricing(sessionId.value)
      
      if (result.hasChanges && result.priceChanges.length > 0) {
        // Handle price changes
        result.priceChanges.forEach(change => {
          console.log('💰 Price change detected:', change)
          
          // Update pricing in UI
          if (change.type === 'flight' && selectedFlight.value) {
            selectedFlight.value.price = change.newPrice
          }
        })

        // Show user notification about price changes
        const { useNotificationsStore } = await import('./notifications')
        const notificationsStore = useNotificationsStore()
        
        notificationsStore.addNotification({
          type: 'PRICE_UPDATE',
          title: 'Price Update',
          message: `Flight prices have been updated. Your new total is $${result.pricing.total}`,
          actionable: true,
          actions: [
            { label: 'Review Changes', action: 'review_pricing', data: { changes: result.priceChanges } }
          ]
        })

        return { hasChanges: true, changes: result.priceChanges }
      }

      return { hasChanges: false }
      
    } catch (error) {
      console.error('❌ Session validation failed:', error)
      return { hasChanges: false, error }
    }
  }

  const extendSession = async () => {
    if (!sessionId.value) return

    try {
      await bookingSessionAPI.extendSeatReservation(sessionId.value)
      console.log('✅ Session extended')
      
      // Update local expiry time
      if (seatLockExpiry.value) {
        seatLockExpiry.value = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      }

    } catch (error) {
      console.error('❌ Failed to extend session:', error)
    }
  }

  const clearSession = async () => {
    if (sessionId.value) {
      try {
        await bookingSessionAPI.cancelSession(sessionId.value)
        console.log('✅ Session cancelled on backend')
      } catch (error) {
        console.log('⚠️ Failed to cancel server session:', error.message)
      }
    }

    // Clear local state only
    sessionId.value = null
    sessionExpiresAt.value = null
    lastSavedAt.value = null
    
    console.log('🗑️ Session cleared')
  }

  return {
    // State
    currentStep,
    selectedFlight,
    returnFlight,
    selectedSeats,
    passengers,
    contactInfo,
    paymentInfo,
    bookingExtras,
    promoCode,
    appliedDiscount,
    bookings,
    seatMap,
    seatLockExpiry,
    loading,
    
    // Session management state
    sessionId,
    sessionExpiresAt,
    autoSaveEnabled,
    lastSavedAt,
    syncInProgress,

    // Getters
    totalSteps,
    stepProgress,
    selectedSeatsCount,
    baseFareTotal,
    seatsTotal,
    extrasTotal,
    taxesAndFees,
    subtotal,
    totalPrice,
    availableSeats,
    seatsBySection,
    currentBooking,
    isStepComplete,

    // Actions
    setCurrentStep,
    nextStep,
    previousStep,
    setSelectedFlight,
    initializePassengers,
    selectSeat,
    deselectSeat,
    clearAllSeats,
    startSeatLockTimer,
    clearSeatLockTimer,
    updatePassenger,
    updateContactInfo,
    updatePaymentInfo,
    updateBookingExtras,
    applyPromoCode,
    removePromoCode,
    completeBooking,
    getBookingHistory,
    cancelBooking,
    resetBooking,
    initializeBookingData,
    
    // Session management actions
    saveSession,
    loadSession,
    validateCurrentSession,
    extendSession,
    clearSession
  }
})