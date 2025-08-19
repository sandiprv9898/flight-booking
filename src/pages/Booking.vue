<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar
      :is-mobile-menu-open="isMobileMenuOpen"
      @close-mobile-menu="isMobileMenuOpen = false"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen" />
      
      <!-- Booking Stepper -->
      <BookingStepper />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <!-- Session Status -->
          <SessionStatus />
          
          <!-- Step 1: Flight Selection -->
          <div v-if="currentStep === 1">
            <div class="mb-6">
              <h1 class="text-2xl font-bold text-gray-900">Select Your Flight</h1>
              <p class="text-gray-600">Choose the perfect flight for your journey</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Flight Options -->
              <div class="lg:col-span-2 space-y-4">
                <div
                  v-for="flight in mockFlights"
                  :key="flight.id"
                  :class="[
                    'bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all duration-200',
                    selectedFlight?.id === flight.id 
                      ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  ]"
                  @click="selectFlight(flight)"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span class="text-sm font-bold text-gray-600">{{ flight.airlineCode }}</span>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ flight.airline }} {{ flight.flightNumber }}</div>
                        <div class="text-sm text-gray-500">
                          {{ flight.origin.code }} → {{ flight.destination.code }} • 
                          {{ flight.departure.time }} - {{ flight.arrival.time }}
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          Duration: {{ flight.duration }} • {{ flight.stops === 0 ? 'Nonstop' : `${flight.stops} stops` }}
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xl font-bold text-gray-900">${{ flight.price }}</div>
                      <div class="text-sm text-gray-500">per person</div>
                      <div class="text-xs text-green-600 mt-1">{{ flight.availableSeats }} seats left</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selection Summary -->
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Flight Summary</h2>
                  
                  <div v-if="selectedFlight" class="space-y-3">
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                      <div class="text-lg font-medium text-gray-900">{{ selectedFlight.airline }}</div>
                      <div class="text-sm text-gray-600">{{ selectedFlight.flightNumber }}</div>
                    </div>
                    
                    <div class="space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Route:</span>
                        <span class="font-medium">{{ selectedFlight.origin.code }} → {{ selectedFlight.destination.code }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Date:</span>
                        <span class="font-medium">{{ formatDate(selectedFlight.departure.date) }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Time:</span>
                        <span class="font-medium">{{ selectedFlight.departure.time }} - {{ selectedFlight.arrival.time }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Duration:</span>
                        <span class="font-medium">{{ selectedFlight.duration }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Price:</span>
                        <span class="font-medium text-lg">${{ selectedFlight.price }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="text-center text-gray-500 py-8">
                    Select a flight to continue
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Seat Selection -->
          <div v-if="currentStep === 2">
            <div class="mb-6">
              <h1 class="text-2xl font-bold text-gray-900">Choose Your Seats</h1>
              <p class="text-gray-600">Select seats for all {{ passengers.length }} passenger{{ passengers.length !== 1 ? 's' : '' }}</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Seat Map -->
              <div class="lg:col-span-2">
                <SeatMap />
              </div>

              <!-- Seat Selection Summary -->
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 class="text-lg font-semibold text-gray-900 mb-4">Selection Summary</h2>
                  
                  <!-- Selected Flight Info -->
                  <div v-if="selectedFlight" class="mb-6">
                    <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span class="text-sm font-bold text-gray-600">{{ selectedFlight.airlineCode }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">{{ selectedFlight.airline }}</div>
                        <div class="text-sm text-gray-600">{{ selectedFlight.flightNumber }}</div>
                        <div class="text-xs text-gray-500">
                          {{ selectedFlight.origin.code }} → {{ selectedFlight.destination.code }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="mt-4 space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Date:</span>
                        <span class="font-medium">{{ formatDate(selectedFlight.departure.date) }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Time:</span>
                        <span class="font-medium">{{ selectedFlight.departure.time }} - {{ selectedFlight.arrival.time }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Duration:</span>
                        <span class="font-medium">{{ selectedFlight.duration }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Seat Selection Progress -->
                  <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">Seats Selected</span>
                      <span class="text-sm text-gray-500">{{ selectedSeats.length }}/{{ passengers.length }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${(selectedSeats.length / passengers.length) * 100}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- Selected Seats List -->
                  <div class="space-y-3">
                    <div v-if="selectedSeats.length === 0" class="text-center py-6">
                      <div class="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                      </div>
                      <p class="text-sm text-gray-500">No seats selected yet</p>
                      <p class="text-xs text-gray-400 mt-1">Click on available seats to select</p>
                    </div>

                    <div v-else>
                      <h3 class="text-sm font-medium text-gray-900 mb-3">Selected Seats</h3>
                      <div class="space-y-2">
                        <div 
                          v-for="(seat, index) in selectedSeats"
                          :key="seat.id"
                          class="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div class="flex-1">
                            <div class="font-medium text-blue-900">
                              Passenger {{ index + 1 }}
                            </div>
                            <div class="text-sm text-blue-700">
                              Seat {{ seat.seatNumber }} • {{ seat.section }}
                            </div>
                            <div class="text-xs text-gray-600">
                              {{ seat.isWindow ? 'Window' : seat.isAisle ? 'Aisle' : 'Middle' }} seat
                            </div>
                          </div>
                          <div class="text-right">
                            <div v-if="seat.price > 0" class="text-sm font-medium text-green-600">
                              +${{ seat.price }}
                            </div>
                            <div v-else class="text-sm text-gray-500">
                              Included
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Pricing Summary -->
                  <div v-if="selectedSeats.length > 0" class="mt-6 pt-4 border-t border-gray-200">
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span class="text-gray-600">Base Fare ({{ passengers.length }})</span>
                        <span>${{ baseFareTotal }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Seat Selection</span>
                        <span>${{ seatsTotal }}</span>
                      </div>
                      <div class="border-t pt-2 flex justify-between font-semibold">
                        <span>Subtotal</span>
                        <span>${{ baseFareTotal + seatsTotal }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Passenger Information -->
          <div v-if="currentStep === 3">
            <div class="mb-6">
              <h1 class="text-2xl font-bold text-gray-900">Passenger Information</h1>
              <p class="text-gray-600">Enter details for all passengers</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2 space-y-6">
                <!-- Passengers -->
                <div
                  v-for="(passenger, index) in passengers"
                  :key="index"
                  class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 class="text-lg font-medium text-gray-900 mb-4">
                    Passenger {{ index + 1 }}
                    <span v-if="selectedSeats[index]" class="ml-2 text-sm text-gray-600">
                      (Seat {{ selectedSeats[index].seatNumber }})
                    </span>
                  </h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      v-model="passenger.firstName"
                      label="First Name"
                      placeholder="Enter first name"
                      required
                    />
                    <Input
                      v-model="passenger.lastName"
                      label="Last Name"
                      placeholder="Enter last name"
                      required
                    />
                    <Input
                      v-model="passenger.dateOfBirth"
                      type="date"
                      label="Date of Birth"
                      required
                    />
                    <Select
                      v-model="passenger.gender"
                      label="Gender"
                      :options="genderOptions"
                      required
                    />
                    <Input
                      v-model="passenger.nationality"
                      label="Nationality"
                      placeholder="Enter nationality"
                      required
                    />
                    <Input
                      v-model="passenger.passportNumber"
                      label="Passport Number"
                      placeholder="Enter passport number"
                      required
                    />
                  </div>
                </div>

                <!-- Contact Information -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      v-model="contactInfo.email"
                      type="email"
                      label="Email Address"
                      placeholder="Enter email address"
                      required
                    />
                    <Input
                      v-model="contactInfo.phone"
                      type="tel"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                  
                  <div class="space-y-4">
                    <div class="text-center p-3 bg-gray-50 rounded-lg">
                      <div class="font-medium">{{ selectedFlight?.airline }}</div>
                      <div class="text-sm text-gray-600">{{ selectedFlight?.flightNumber }}</div>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span>Base Fare ({{ passengers.length }})</span>
                        <span>${{ baseFareTotal }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Seat Selection</span>
                        <span>${{ seatsTotal }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span>${{ taxesAndFees }}</span>
                      </div>
                      <div class="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${{ totalPrice }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 4: Payment -->
          <div v-if="currentStep === 4">
            <div class="mb-6">
              <h1 class="text-2xl font-bold text-gray-900">Payment</h1>
              <p class="text-gray-600">Complete your booking with secure payment</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-2">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                  
                  <div class="space-y-4">
                    <Input
                      v-model="paymentInfo.cardNumber"
                      label="Card Number"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                    <div class="grid grid-cols-2 gap-4">
                      <Input
                        v-model="paymentInfo.expiryDate"
                        label="Expiry Date"
                        placeholder="MM/YY"
                        required
                      />
                      <Input
                        v-model="paymentInfo.cvv"
                        label="CVV"
                        placeholder="123"
                        required
                      />
                    </div>
                    <Input
                      v-model="paymentInfo.nameOnCard"
                      label="Name on Card"
                      placeholder="Enter name as on card"
                      required
                    />
                  </div>
                  
                  <!-- Promo Code -->
                  <div class="mt-6 pt-6 border-t border-gray-200">
                    <div class="flex space-x-2">
                      <Input
                        v-model="promoCode"
                        placeholder="Enter promo code"
                        class="flex-1"
                      />
                      <Button variant="secondary" @click="applyPromo">
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Final Summary -->
              <div class="lg:col-span-1">
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Final Summary</h3>
                  
                  <div class="space-y-4">
                    <div class="text-center p-3 bg-primary-50 rounded-lg">
                      <div class="font-medium text-primary-900">{{ selectedFlight?.airline }}</div>
                      <div class="text-sm text-primary-700">{{ selectedFlight?.flightNumber }}</div>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                      <div class="flex justify-between">
                        <span>Base Fare ({{ passengers.length }})</span>
                        <span>${{ baseFareTotal }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Seat Selection</span>
                        <span>${{ seatsTotal }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span>${{ taxesAndFees }}</span>
                      </div>
                      <div v-if="appliedDiscount > 0" class="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${{ appliedDiscount }}</span>
                      </div>
                      <div class="border-t pt-2 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${{ totalPrice }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Confirmation -->
          <div v-if="currentStep === 5">
            <div class="text-center py-12">
              <div class="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircleIcon class="w-12 h-12 text-green-600" />
              </div>
              
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p class="text-gray-600 mb-8">Your flight has been successfully booked</p>
              
              <div class="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900 mb-2">{{ selectedFlight?.airline }}</div>
                  <div class="text-gray-600 mb-4">{{ selectedFlight?.flightNumber }}</div>
                  <div class="text-2xl font-bold text-primary-600 mb-2">Booking Reference</div>
                  <div class="text-xl font-mono bg-gray-50 p-3 rounded">{{ bookingReference }}</div>
                </div>
              </div>
              
              <div class="flex justify-center space-x-4">
                <Button variant="secondary" @click="downloadTickets">
                  Download Tickets
                </Button>
                <Button variant="primary" @click="viewBookings">
                  View My Bookings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/store/booking'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import BookingStepper from '@/components/booking/BookingStepper.vue'
import SeatMap from '@/components/booking/SeatMap.vue'
import SessionStatus from '@/components/booking/SessionStatus.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const bookingStore = useBookingStore()

const isMobileMenuOpen = ref(false)
const promoCode = ref('')
const bookingReference = ref('')

// Mock flights for selection
const mockFlights = ref([
  {
    id: 'FL001',
    airline: 'British Airways',
    airlineCode: 'BA',
    flightNumber: 'BA178',
    origin: { code: 'JFK', city: 'New York' },
    destination: { code: 'LHR', city: 'London' },
    departure: { time: '08:30', date: '2024-03-15' },
    arrival: { time: '20:45', date: '2024-03-15' },
    duration: '7h 15m',
    stops: 0,
    price: 845,
    availableSeats: 47
  },
  {
    id: 'FL002',
    airline: 'Virgin Atlantic',
    airlineCode: 'VS',
    flightNumber: 'VS003',
    origin: { code: 'JFK', city: 'New York' },
    destination: { code: 'LHR', city: 'London' },
    departure: { time: '14:20', date: '2024-03-15' },
    arrival: { time: '02:35', date: '2024-03-16' },
    duration: '7h 15m',
    stops: 0,
    price: 920,
    availableSeats: 23
  },
  {
    id: 'FL003',
    airline: 'American Airlines',
    airlineCode: 'AA',
    flightNumber: 'AA100',
    origin: { code: 'JFK', city: 'New York' },
    destination: { code: 'LHR', city: 'London' },
    departure: { time: '22:15', date: '2024-03-15' },
    arrival: { time: '10:30', date: '2024-03-16' },
    duration: '7h 15m',
    stops: 0,
    price: 780,
    availableSeats: 89
  }
])

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

// Computed properties from store
const currentStep = computed(() => bookingStore.currentStep)
const selectedFlight = computed(() => bookingStore.selectedFlight)
const selectedSeats = computed(() => bookingStore.selectedSeats)
const passengers = computed(() => bookingStore.passengers)
const contactInfo = computed(() => bookingStore.contactInfo)
const paymentInfo = computed(() => bookingStore.paymentInfo)
const baseFareTotal = computed(() => bookingStore.baseFareTotal)
const seatsTotal = computed(() => bookingStore.seatsTotal)
const taxesAndFees = computed(() => bookingStore.taxesAndFees)
const appliedDiscount = computed(() => bookingStore.appliedDiscount)
const totalPrice = computed(() => bookingStore.totalPrice)

const selectFlight = (flight) => {
  bookingStore.setSelectedFlight(flight)
}

const applyPromo = async () => {
  if (promoCode.value.trim()) {
    const result = await bookingStore.applyPromoCode(promoCode.value)
    if (result.success) {
      alert(result.message)
    } else {
      alert(result.message)
    }
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const downloadTickets = () => {
  alert('Tickets downloaded! Check your email for the tickets.')
}

const viewBookings = () => {
  router.push('/booking-history')
}

onMounted(async () => {
  // Initialize booking data
  await bookingStore.initializeBookingData()
  
  // Load existing session if available
  try {
    const sessionLoaded = await bookingStore.loadSession()
    if (sessionLoaded) {
      console.log('📋 Booking session restored from step:', bookingStore.currentStep)
      
      // Validate session data (pricing, seat availability)
      const validation = await bookingStore.validateCurrentSession()
      if (validation.hasChanges) {
        console.log('⚠️ Session data updated:', validation.changes)
      }
    } else {
      console.log('🆕 Starting new booking session')
    }
  } catch (error) {
    console.error('❌ Failed to load session:', error)
  }
  
  // Generate booking reference for confirmation step
  if (currentStep.value === 6) {
    bookingReference.value = `FB${Date.now().toString().slice(-6)}`
  }
  
  // Auto-save session periodically
  const autoSaveInterval = setInterval(async () => {
    if (bookingStore.autoSaveEnabled && bookingStore.sessionId) {
      try {
        await bookingStore.saveSession()
        console.log('💾 Auto-saved session')
      } catch (error) {
        console.warn('⚠️ Auto-save failed:', error.message)
      }
    }
  }, 30000) // Every 30 seconds
  
  // Cleanup on unmount
  window.addEventListener('beforeunload', async (e) => {
    if (bookingStore.sessionId && !bookingStore.syncInProgress) {
      await bookingStore.saveSession(true) // Force sync
    }
  })
  
  // Cleanup interval on component unmount
  onUnmounted(() => {
    clearInterval(autoSaveInterval)
  })
})
</script>