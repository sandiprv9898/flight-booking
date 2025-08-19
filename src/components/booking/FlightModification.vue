<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Modify Your Booking</h1>
        <div class="text-sm text-gray-500">
          Booking Reference: <span class="font-mono font-medium">{{ booking.bookingReference }}</span>
        </div>
      </div>
      
      <!-- Current Booking Summary -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-medium text-blue-900 mb-2">Current Booking</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-blue-700">Flight:</span>
            <span class="ml-2 font-medium">{{ booking.flight.flightNumber }}</span>
          </div>
          <div>
            <span class="text-blue-700">Route:</span>
            <span class="ml-2 font-medium">{{ booking.flight.origin.code }} → {{ booking.flight.destination.code }}</span>
          </div>
          <div>
            <span class="text-blue-700">Date:</span>
            <span class="ml-2 font-medium">{{ formatDate(booking.flight.departure.time) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modification Options -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Modification Form -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-6">What would you like to change?</h2>
          
          <!-- Modification Type Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">Modification Type</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="option in modificationOptions"
                :key="option.type"
                @click="selectModificationType(option.type)"
                :class="[
                  'p-4 border rounded-lg text-left transition-colors',
                  selectedModificationType === option.type
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
                :disabled="!option.available"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <div class="font-medium">{{ option.title }}</div>
                    <div class="text-sm text-gray-500">{{ option.description }}</div>
                    <div v-if="option.fee > 0" class="text-sm font-medium text-green-600 mt-1">
                      Fee: ${{ option.fee }}
                    </div>
                  </div>
                  <div v-if="!option.available" class="text-xs text-red-500">
                    Not Available
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Flight Change Form -->
          <div v-if="selectedModificationType === 'flight'" class="space-y-6">
            <h3 class="text-md font-medium text-gray-900">Search for Alternative Flights</h3>
            
            <!-- Search Form -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                <input
                  v-model="newFlightSearch.departureDate"
                  type="date"
                  :min="minDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @change="searchAlternativeFlights"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <select
                  v-model="newFlightSearch.timePreference"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  @change="searchAlternativeFlights"
                >
                  <option value="">Any Time</option>
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 12AM)</option>
                </select>
              </div>
            </div>

            <!-- Alternative Flights -->
            <div v-if="alternativeFlights.length > 0" class="space-y-3">
              <h4 class="font-medium text-gray-900">Available Alternative Flights</h4>
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div
                  v-for="flight in alternativeFlights"
                  :key="flight.id"
                  @click="selectAlternativeFlight(flight)"
                  :class="[
                    'p-4 border rounded-lg cursor-pointer transition-colors',
                    selectedAlternativeFlight?.id === flight.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-4 mb-2">
                        <div class="font-medium">{{ flight.flightNumber }}</div>
                        <div class="text-sm text-gray-500">{{ flight.airline.name }}</div>
                        <div class="text-sm text-gray-500">{{ flight.duration.formatted }}</div>
                      </div>
                      <div class="flex items-center gap-6 text-sm">
                        <div>
                          <div class="font-medium">{{ formatTime(flight.departure.time) }}</div>
                          <div class="text-gray-500">{{ flight.origin.code }}</div>
                        </div>
                        <div class="flex-1 text-center">
                          <div class="text-xs text-gray-400">
                            {{ flight.stops.length === 0 ? 'Direct' : `${flight.stops.length} stop(s)` }}
                          </div>
                        </div>
                        <div>
                          <div class="font-medium">{{ formatTime(flight.arrival.time) }}</div>
                          <div class="text-gray-500">{{ flight.destination.code }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-medium text-lg">${{ flight.price.total }}</div>
                      <div v-if="flight.priceDifference !== 0" class="text-sm">
                        <span v-if="flight.priceDifference > 0" class="text-red-600">
                          +${{ flight.priceDifference }} more
                        </span>
                        <span v-else class="text-green-600">
                          ${{ Math.abs(flight.priceDifference) }} less
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-else-if="loadingAlternatives" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p class="text-gray-500 mt-2">Searching for alternative flights...</p>
            </div>

            <!-- No Alternatives -->
            <div v-else-if="searchAttempted && alternativeFlights.length === 0" class="text-center py-8">
              <p class="text-gray-500">No alternative flights found for the selected criteria.</p>
            </div>
          </div>

          <!-- Date Change Form -->
          <div v-if="selectedModificationType === 'date'" class="space-y-4">
            <h3 class="text-md font-medium text-gray-900">Change Travel Date</h3>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">New Departure Date</label>
              <input
                v-model="newDate"
                type="date"
                :min="minDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div v-if="newDate" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p class="text-sm text-yellow-800">
                <strong>Note:</strong> Changing your travel date may affect flight availability and pricing. 
                We'll search for the same flight on your new date.
              </p>
            </div>
          </div>

          <!-- Seat Change Form -->
          <div v-if="selectedModificationType === 'seat'" class="space-y-4">
            <h3 class="text-md font-medium text-gray-900">Change Seat Selection</h3>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-medium text-blue-900 mb-2">Current Seats</h4>
              <div class="space-y-1">
                <div v-for="seat in booking.seats" :key="seat.id" class="text-sm">
                  <span class="font-medium">{{ seat.passengerName }}:</span>
                  <span class="ml-2">Seat {{ seat.seatNumber }} ({{ seat.class }})</span>
                </div>
              </div>
            </div>

            <button
              @click="openSeatMap"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Seat Map
            </button>
          </div>

          <!-- Passenger Info Change -->
          <div v-if="selectedModificationType === 'passenger'" class="space-y-4">
            <h3 class="text-md font-medium text-gray-900">Update Passenger Information</h3>
            
            <div class="space-y-4">
              <div v-for="(passenger, index) in editablePassengers" :key="passenger.id" 
                   class="border border-gray-200 rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">Passenger {{ index + 1 }}</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      v-model="passenger.firstName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      v-model="passenger.lastName"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div class="mt-2 text-xs text-gray-500">
                  <strong>Note:</strong> Name changes may require additional verification and fees.
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="selectedModificationType" class="flex gap-3 pt-6 border-t">
            <button
              @click="resetForm"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="previewChanges"
              :disabled="!canPreview"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
            >
              Preview Changes
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Sidebar -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Modification Summary</h3>
          
          <div v-if="!selectedModificationType" class="text-sm text-gray-500">
            Select a modification type to see pricing details.
          </div>
          
          <div v-else class="space-y-4">
            <!-- Selected Modification -->
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Selected Change</h4>
              <div class="text-sm">
                {{ modificationOptions.find(opt => opt.type === selectedModificationType)?.title }}
              </div>
            </div>

            <!-- Fees Breakdown -->
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-2">Fees</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Modification Fee</span>
                  <span>${{ getModificationFee() }}</span>
                </div>
                <div v-if="priceDifference !== 0" class="flex justify-between">
                  <span>Price Difference</span>
                  <span :class="priceDifference > 0 ? 'text-red-600' : 'text-green-600'">
                    {{ priceDifference > 0 ? '+' : '' }}${{ priceDifference }}
                  </span>
                </div>
                <div class="border-t pt-2 flex justify-between font-medium">
                  <span>Total Additional Cost</span>
                  <span>${{ getTotalCost() }}</span>
                </div>
              </div>
            </div>

            <!-- Important Notes -->
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-2">Important Notes</h4>
              <ul class="text-xs text-gray-600 space-y-1">
                <li>• Changes are subject to availability</li>
                <li>• Modification fees are non-refundable</li>
                <li>• New booking terms apply</li>
                <li v-if="selectedModificationType === 'flight'">• Seat selection may be reset</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modification Preview Modal -->
    <teleport to="body">
      <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal content for preview -->
          <ModificationPreview
            :booking="booking"
            :modificationType="selectedModificationType"
            :changes="pendingChanges"
            :totalCost="getTotalCost()"
            @confirm="confirmModification"
            @cancel="showPreview = false"
          />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/store/booking'
import { useNotificationsStore } from '@/store/notifications'
import airportService from '@/services/airportService'
import ModificationPreview from './ModificationPreview.vue'

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const notificationsStore = useNotificationsStore()

// Reactive data
const booking = ref({})
const selectedModificationType = ref('')
const newFlightSearch = ref({
  departureDate: '',
  timePreference: ''
})
const newDate = ref('')
const editablePassengers = ref([])
const alternativeFlights = ref([])
const selectedAlternativeFlight = ref(null)
const loadingAlternatives = ref(false)
const searchAttempted = ref(false)
const showPreview = ref(false)
const pendingChanges = ref({})

// Computed properties
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const modificationOptions = computed(() => [
  {
    type: 'flight',
    title: 'Change Flight',
    description: 'Switch to a different flight',
    fee: 75,
    available: booking.value.changeable !== false
  },
  {
    type: 'date',
    title: 'Change Date',
    description: 'Travel on a different date',
    fee: 50,
    available: booking.value.changeable !== false
  },
  {
    type: 'seat',
    title: 'Change Seats',
    description: 'Select different seats',
    fee: 25,
    available: true
  },
  {
    type: 'passenger',
    title: 'Update Passenger Info',
    description: 'Correct passenger details',
    fee: 100,
    available: true
  }
])

const priceDifference = computed(() => {
  if (selectedModificationType.value === 'flight' && selectedAlternativeFlight.value) {
    return selectedAlternativeFlight.value.priceDifference || 0
  }
  return 0
})

const canPreview = computed(() => {
  switch (selectedModificationType.value) {
    case 'flight':
      return selectedAlternativeFlight.value !== null
    case 'date':
      return newDate.value !== ''
    case 'seat':
      return true // Seat selection is handled separately
    case 'passenger':
      return editablePassengers.value.some(p => 
        p.firstName !== p.originalFirstName || p.lastName !== p.originalLastName
      )
    default:
      return false
  }
})

// Methods
const selectModificationType = (type) => {
  selectedModificationType.value = type
  resetSearchData()
  
  if (type === 'passenger') {
    editablePassengers.value = booking.value.passengers.map(p => ({
      ...p,
      originalFirstName: p.firstName,
      originalLastName: p.lastName
    }))
  }
}

const resetForm = () => {
  selectedModificationType.value = ''
  resetSearchData()
}

const resetSearchData = () => {
  newFlightSearch.value = { departureDate: '', timePreference: '' }
  newDate.value = ''
  alternativeFlights.value = []
  selectedAlternativeFlight.value = null
  searchAttempted.value = false
  pendingChanges.value = {}
}

const searchAlternativeFlights = async () => {
  if (!newFlightSearch.value.departureDate) return
  
  loadingAlternatives.value = true
  searchAttempted.value = true
  
  try {
    // Search for flights on the new date
    const searchParams = {
      origin: booking.value.flight.origin.code,
      destination: booking.value.flight.destination.code,
      departureDate: newFlightSearch.value.departureDate,
      passengers: {
        adults: booking.value.passengers.filter(p => p.type === 'adult').length,
        children: booking.value.passengers.filter(p => p.type === 'child').length
      },
      cabinClass: booking.value.flight.cabinClass
    }
    
    const results = await airportService.searchFlights(searchParams)
    
    // Calculate price differences
    alternativeFlights.value = results.outbound.map(flight => ({
      ...flight,
      priceDifference: flight.price.total - booking.value.flight.price.total
    }))
    
    // Filter by time preference if specified
    if (newFlightSearch.value.timePreference) {
      alternativeFlights.value = alternativeFlights.value.filter(flight => {
        const hour = new Date(flight.departure.time).getHours()
        switch (newFlightSearch.value.timePreference) {
          case 'morning': return hour >= 6 && hour < 12
          case 'afternoon': return hour >= 12 && hour < 18
          case 'evening': return hour >= 18 && hour < 24
          default: return true
        }
      })
    }
    
  } catch (error) {
    console.error('Error searching alternative flights:', error)
    notificationsStore.addNotification({
      type: 'error',
      title: 'Search Error',
      message: 'Unable to search for alternative flights. Please try again.'
    })
  } finally {
    loadingAlternatives.value = false
  }
}

const selectAlternativeFlight = (flight) => {
  selectedAlternativeFlight.value = flight
}

const openSeatMap = () => {
  // Navigate to seat selection with modification context
  router.push({
    name: 'SeatSelection',
    params: { bookingId: booking.value.id },
    query: { mode: 'modification' }
  })
}

const getModificationFee = () => {
  const option = modificationOptions.value.find(opt => opt.type === selectedModificationType.value)
  return option?.fee || 0
}

const getTotalCost = () => {
  return getModificationFee() + Math.max(0, priceDifference.value)
}

const previewChanges = () => {
  // Prepare changes object
  switch (selectedModificationType.value) {
    case 'flight':
      pendingChanges.value = {
        type: 'flight',
        newFlight: selectedAlternativeFlight.value,
        oldFlight: booking.value.flight
      }
      break
    case 'date':
      pendingChanges.value = {
        type: 'date',
        newDate: newDate.value,
        oldDate: booking.value.flight.departure.time.split('T')[0]
      }
      break
    case 'passenger':
      pendingChanges.value = {
        type: 'passenger',
        passengers: editablePassengers.value.map(p => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          changed: p.firstName !== p.originalFirstName || p.lastName !== p.originalLastName
        }))
      }
      break
  }
  
  showPreview.value = true
}

const confirmModification = async (paymentMethod) => {
  try {
    // Process modification
    const modificationData = {
      bookingId: booking.value.id,
      type: selectedModificationType.value,
      changes: pendingChanges.value,
      fee: getModificationFee(),
      priceDifference: priceDifference.value,
      totalCost: getTotalCost(),
      paymentMethod
    }
    
    // In real app, send to API
    console.log('Processing modification:', modificationData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    notificationsStore.addNotification({
      type: 'success',
      title: 'Booking Modified',
      message: 'Your booking has been successfully modified.',
      duration: 10000
    })
    
    // Redirect to booking details
    router.push(`/booking-history/${booking.value.id}`)
    
  } catch (error) {
    console.error('Error processing modification:', error)
    notificationsStore.addNotification({
      type: 'error',
      title: 'Modification Failed',
      message: 'Unable to process your modification. Please try again.'
    })
  }
}

// Utility methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Load booking data
onMounted(async () => {
  const bookingId = route.params.bookingId
  
  try {
    // In real app, fetch from API
    booking.value = bookingStore.getBookingById(bookingId) || {
      id: bookingId,
      bookingReference: 'ABC123',
      status: 'confirmed',
      bookingDate: '2024-01-15T10:00:00Z',
      flight: {
        id: 'flight-1',
        flightNumber: 'AA1234',
        airline: { name: 'American Airlines', code: 'AA' },
        origin: { code: 'JFK', city: 'New York', name: 'John F. Kennedy International' },
        destination: { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International' },
        departure: { time: '2024-02-15T14:30:00Z' },
        arrival: { time: '2024-02-15T17:45:00Z' },
        duration: { formatted: '6h 15m' },
        cabinClass: 'economy',
        price: { total: 450 },
        stops: []
      },
      passengers: [
        { id: 1, firstName: 'John', lastName: 'Doe', type: 'adult' }
      ],
      seats: [
        { id: 1, seatNumber: '12A', class: 'economy', passengerId: 1, passengerName: 'John Doe' }
      ],
      changeable: true
    }
    
    if (!booking.value) {
      throw new Error('Booking not found')
    }
  } catch (error) {
    console.error('Error loading booking:', error)
    notificationsStore.addNotification({
      type: 'error',
      title: 'Booking Not Found',
      message: 'Unable to load booking details.'
    })
    router.push('/booking-history')
  }
})
</script>