import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  const setCurrentStep = (step) => {
    if (step >= 1 && step <= totalSteps.value) {
      currentStep.value = step
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

  const setSelectedFlight = (flight) => {
    selectedFlight.value = flight
    // Initialize passengers based on search criteria
    const passengerCount = flight.searchCriteria?.passengers || 1
    initializePassengers(passengerCount)
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

  const selectSeat = (seat) => {
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
      
      const booking = {
        ...currentBooking.value,
        id: `FB${Date.now().toString().slice(-6)}`,
        bookingReference: generateBookingReference(),
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        tickets: generateTickets()
      }
      
      bookings.value.push(booking)
      localStorage.setItem('user_bookings', JSON.stringify(bookings.value))
      
      // Clear seat lock timer
      clearSeatLockTimer()
      
      // Move to confirmation step
      currentStep.value = 6
      
      return { success: true, booking }
    } catch (error) {
      return { success: false, error: 'Booking failed. Please try again.' }
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

  const getBookingHistory = () => {
    const storedBookings = localStorage.getItem('user_bookings')
    if (storedBookings) {
      bookings.value = JSON.parse(storedBookings)
    }
    return bookings.value
  }

  const cancelBooking = async (bookingId) => {
    const bookingIndex = bookings.value.findIndex(b => b.id === bookingId)
    if (bookingIndex > -1) {
      bookings.value[bookingIndex].status = 'cancelled'
      bookings.value[bookingIndex].cancelledAt = new Date().toISOString()
      localStorage.setItem('user_bookings', JSON.stringify(bookings.value))
      return true
    }
    return false
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

  const initializeBookingData = () => {
    const storedBookings = localStorage.getItem('user_bookings')
    if (storedBookings) {
      bookings.value = JSON.parse(storedBookings)
    }
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
    initializeBookingData
  }
})