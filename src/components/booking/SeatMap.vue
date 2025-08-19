<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Select Your Seats</h2>
        <p class="text-sm text-gray-600">
          {{ selectedSeatsCount }}/{{ totalPassengers }} seats selected
          <span v-if="lockExpiry" class="ml-2 text-red-600">
            • Expires: {{ formatTimeRemaining }}
          </span>
        </p>
      </div>
      
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Selected</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-gray-300 rounded"></div>
          <span>Occupied</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Premium</span>
        </div>
      </div>
    </div>

    <!-- Aircraft Layout -->
    <div class="bg-gray-50 rounded-lg p-6 mb-6 overflow-x-auto">
      <div class="text-center mb-6">
        <div class="inline-flex items-center space-x-2 text-sm text-gray-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <span>{{ aircraft }} • {{ totalSeats }} seats</span>
        </div>
      </div>

      <!-- Airplane Shape Container -->
      <div class="relative bg-white rounded-full mx-auto" style="width: 280px; min-height: 600px;">
        
        <!-- Aircraft Nose -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-blue-100 rounded-t-full flex items-end justify-center pb-2">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l8 20h-16l8-20z"/>
          </svg>
        </div>

        <!-- Business Class Section -->
        <div v-if="businessSeats.length > 0" class="pt-24 pb-6 px-8">
          <div class="text-center mb-3">
            <div class="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">BUSINESS</div>
          </div>
          <div class="space-y-3">
            <div 
              v-for="row in getBusinessRows" 
              :key="`business-row-${row.rowNumber}`"
              class="flex justify-center items-center space-x-4"
            >
              <!-- Left Side Seats -->
              <div class="flex space-x-1">
                <div
                  v-for="seat in row.leftSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'business')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
              
              <!-- Aisle -->
              <div class="w-6 h-8 flex items-center justify-center">
                <div class="w-full h-0.5 bg-gray-300 rounded"></div>
              </div>
              
              <!-- Right Side Seats -->
              <div class="flex space-x-1">
                <div
                  v-for="seat in row.rightSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'business')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Economy Section -->
        <div v-if="premiumSeats.length > 0" class="py-6 px-6 border-t border-gray-200">
          <div class="text-center mb-3">
            <div class="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">PREMIUM</div>
          </div>
          <div class="space-y-2">
            <div 
              v-for="row in getPremiumRows" 
              :key="`premium-row-${row.rowNumber}`"
              class="flex justify-center items-center space-x-3"
            >
              <!-- Left Side Seats -->
              <div class="flex space-x-1">
                <div
                  v-for="seat in row.leftSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'premium')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
              
              <!-- Aisle -->
              <div class="w-4 h-6 flex items-center justify-center">
                <div class="w-full h-0.5 bg-gray-300 rounded"></div>
              </div>
              
              <!-- Right Side Seats -->
              <div class="flex space-x-1">
                <div
                  v-for="seat in row.rightSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'premium')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Economy Class Section -->
        <div v-if="economySeats.length > 0" class="py-6 px-4 border-t border-gray-200">
          <div class="text-center mb-3">
            <div class="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">ECONOMY</div>
          </div>
          <div class="space-y-1 max-h-80 overflow-y-auto">
            <div 
              v-for="row in getEconomyRows" 
              :key="`economy-row-${row.rowNumber}`"
              class="flex justify-center items-center space-x-2"
            >
              <!-- Left Side Seats (ABC) -->
              <div class="flex space-x-0.5">
                <div
                  v-for="seat in row.leftSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'economy')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
              
              <!-- Left Aisle -->
              <div class="w-3 h-5 flex items-center justify-center">
                <div class="w-full h-0.5 bg-gray-300 rounded"></div>
              </div>
              
              <!-- Middle Seats (DEF) -->
              <div class="flex space-x-0.5">
                <div
                  v-for="seat in row.middleSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'economy')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
              
              <!-- Right Aisle -->
              <div class="w-3 h-5 flex items-center justify-center">
                <div class="w-full h-0.5 bg-gray-300 rounded"></div>
              </div>
              
              <!-- Right Side Seats (GHJ) -->
              <div class="flex space-x-0.5">
                <div
                  v-for="seat in row.rightSeats"
                  :key="seat.id"
                  :class="getSeatClasses(seat, 'economy')"
                  @click="handleSeatClick(seat)"
                  @mouseenter="showSeatTooltip(seat, $event)"
                  @mouseleave="hideSeatTooltip"
                  :title="seat.seatNumber"
                >
                  {{ seat.seatNumber.slice(-1) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aircraft Tail -->
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-gray-100 rounded-b-full flex items-start justify-center pt-3">
          <div class="w-8 h-8 bg-gray-300 rounded-sm"></div>
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div v-if="selectedSeats.length > 0" class="flex items-center justify-between bg-blue-50 rounded-lg p-4">
      <div class="flex items-center space-x-4">
        <div class="text-sm font-medium text-blue-900">
          {{ selectedSeats.length }}/{{ totalPassengers }} seats selected
        </div>
        <div v-if="seatsTotal > 0" class="text-sm text-green-600">
          Extra fees: ${{ seatsTotal }}
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          v-if="selectedSeats.length > 0"
          class="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded border border-red-200 hover:bg-red-50"
          @click="clearAllSeats"
        >
          Clear All
        </button>
        <div v-if="selectedSeats.length === totalPassengers" class="text-sm text-green-600 font-medium">
          ✓ All seats selected
        </div>
      </div>
    </div>

    <!-- Seat Tooltip -->
    <div
      v-if="tooltip.show"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      class="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none"
    >
      <div class="font-medium">{{ tooltip.seat?.seatNumber }}</div>
      <div>{{ tooltip.seat?.section }}</div>
      <div v-if="tooltip.seat?.price > 0" class="text-green-400">
        +${{ tooltip.seat?.price }}
      </div>
      <div class="text-gray-300 mt-1">
        {{ tooltip.seat?.isWindow ? 'Window seat' : tooltip.seat?.isAisle ? 'Aisle seat' : 'Middle seat' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useBookingStore } from '@/store/booking'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const bookingStore = useBookingStore()

const tooltip = ref({
  show: false,
  seat: null,
  x: 0,
  y: 0
})

const timeRemaining = ref(0)
const timer = ref(null)

// Computed properties
const selectedSeats = computed(() => bookingStore.selectedSeats)
const selectedSeatsCount = computed(() => bookingStore.selectedSeatsCount)
const totalPassengers = computed(() => bookingStore.passengers.length)
const seatsBySection = computed(() => bookingStore.seatsBySection)
const lockExpiry = computed(() => bookingStore.seatLockExpiry)
const seatsTotal = computed(() => bookingStore.seatsTotal)

const aircraft = computed(() => 'Boeing 777-300ER')
const totalSeats = computed(() => bookingStore.seatMap.length)

// Seat sections
const businessSeats = computed(() => seatsBySection.value['Business Class'] || [])
const premiumSeats = computed(() => seatsBySection.value['Premium Economy'] || [])
const economySeats = computed(() => seatsBySection.value['Economy'] || [])

// Row organization for airplane shape
const getBusinessRows = computed(() => {
  if (!businessSeats.value.length) return []
  
  const rows = {}
  businessSeats.value.forEach(seat => {
    const rowNumber = parseInt(seat.seatNumber.slice(0, -1))
    const seatLetter = seat.seatNumber.slice(-1)
    
    if (!rows[rowNumber]) {
      rows[rowNumber] = { rowNumber, leftSeats: [], rightSeats: [] }
    }
    
    if (['A', 'C'].includes(seatLetter)) {
      rows[rowNumber].leftSeats.push(seat)
    } else if (['D', 'F'].includes(seatLetter)) {
      rows[rowNumber].rightSeats.push(seat)
    }
  })
  
  // Sort seats within each row
  Object.values(rows).forEach(row => {
    row.leftSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
    row.rightSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
  })
  
  return Object.values(rows).sort((a, b) => a.rowNumber - b.rowNumber)
})

const getPremiumRows = computed(() => {
  if (!premiumSeats.value.length) return []
  
  const rows = {}
  premiumSeats.value.forEach(seat => {
    const rowNumber = parseInt(seat.seatNumber.slice(0, -1))
    const seatLetter = seat.seatNumber.slice(-1)
    
    if (!rows[rowNumber]) {
      rows[rowNumber] = { rowNumber, leftSeats: [], rightSeats: [] }
    }
    
    if (['A', 'B', 'C'].includes(seatLetter)) {
      rows[rowNumber].leftSeats.push(seat)
    } else if (['D', 'E', 'F'].includes(seatLetter)) {
      rows[rowNumber].rightSeats.push(seat)
    }
  })
  
  // Sort seats within each row
  Object.values(rows).forEach(row => {
    row.leftSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
    row.rightSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
  })
  
  return Object.values(rows).sort((a, b) => a.rowNumber - b.rowNumber)
})

const getEconomyRows = computed(() => {
  if (!economySeats.value.length) return []
  
  const rows = {}
  economySeats.value.forEach(seat => {
    const rowNumber = parseInt(seat.seatNumber.slice(0, -1))
    const seatLetter = seat.seatNumber.slice(-1)
    
    if (!rows[rowNumber]) {
      rows[rowNumber] = { rowNumber, leftSeats: [], middleSeats: [], rightSeats: [] }
    }
    
    if (['A', 'B', 'C'].includes(seatLetter)) {
      rows[rowNumber].leftSeats.push(seat)
    } else if (['D', 'E', 'F'].includes(seatLetter)) {
      rows[rowNumber].middleSeats.push(seat)
    } else if (['G', 'H', 'J'].includes(seatLetter)) {
      rows[rowNumber].rightSeats.push(seat)
    }
  })
  
  // Sort seats within each row
  Object.values(rows).forEach(row => {
    row.leftSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
    row.middleSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
    row.rightSeats.sort((a, b) => a.seatNumber.slice(-1).localeCompare(b.seatNumber.slice(-1)))
  })
  
  return Object.values(rows).sort((a, b) => a.rowNumber - b.rowNumber)
})

const formatTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
const getSeatClasses = (seat, seatType = 'economy') => {
  let sizeClass = ''
  
  // Different sizes for different cabin classes
  switch (seatType) {
    case 'business':
      sizeClass = 'w-8 h-8 text-xs font-bold'
      break
    case 'premium':
      sizeClass = 'w-7 h-7 text-xs'
      break
    case 'economy':
      sizeClass = 'w-6 h-6 text-xs'
      break
    default:
      sizeClass = 'w-6 h-6 text-xs'
  }
  
  const base = `${sizeClass} rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center relative hover:transform hover:scale-110`
  
  if (!seat.isAvailable) {
    return `${base} bg-gray-300 border-gray-400 cursor-not-allowed text-gray-500`
  }
  
  if (seat.isSelected) {
    return `${base} bg-blue-500 border-blue-600 text-white shadow-lg`
  }
  
  if (seat.price > 0) {
    return `${base} bg-yellow-100 border-yellow-400 hover:bg-yellow-200 text-gray-900 shadow-sm`
  }
  
  return `${base} bg-green-100 border-green-400 hover:bg-green-200 text-gray-900 shadow-sm`
}

const handleSeatClick = (seat) => {
  if (!seat.isAvailable) return
  
  if (seat.isSelected) {
    removeSeat(seat.id)
  } else {
    if (selectedSeats.value.length < totalPassengers.value) {
      bookingStore.selectSeat(seat)
    }
  }
}

const removeSeat = (seatId) => {
  bookingStore.deselectSeat(seatId)
}

const clearAllSeats = () => {
  bookingStore.clearAllSeats()
}

const showSeatTooltip = (seat, event) => {
  tooltip.value = {
    show: true,
    seat: seat,
    x: event.clientX + 10,
    y: event.clientY - 10
  }
}

const hideSeatTooltip = () => {
  tooltip.value.show = false
}

const updateTimer = () => {
  if (lockExpiry.value) {
    const now = new Date()
    const expiry = new Date(lockExpiry.value)
    const diff = Math.max(0, Math.floor((expiry - now) / 1000))
    
    timeRemaining.value = diff
    
    if (diff === 0) {
      clearInterval(timer.value)
    }
  }
}

onMounted(() => {
  // Start timer to update remaining time
  timer.value = setInterval(updateTimer, 1000)
  updateTimer()
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
/* Custom scrollbar for seat map */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>