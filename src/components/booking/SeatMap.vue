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
    <div class="bg-gray-50 rounded-lg p-4 mb-6">
      <div class="text-center mb-4">
        <div class="inline-flex items-center space-x-2 text-sm text-gray-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <span>{{ aircraft }} • {{ totalSeats }} seats</span>
        </div>
      </div>

      <!-- Seat Sections -->
      <div class="space-y-8">
        <!-- Business Class -->
        <div v-if="businessSeats.length > 0" class="border-b border-gray-200 pb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-gray-900">Business Class</h3>
            <span class="text-sm text-gray-600">Lie-flat seats • Extra legroom</span>
          </div>
          <div class="grid gap-1" :style="{ gridTemplateColumns: businessGridTemplate }">
            <div
              v-for="seat in businessSeats"
              :key="seat.id"
              :class="getSeatClasses(seat)"
              @click="handleSeatClick(seat)"
              @mouseenter="showSeatTooltip(seat, $event)"
              @mouseleave="hideSeatTooltip"
            >
              <div class="text-xs font-medium">{{ seat.seatNumber }}</div>
              <div v-if="seat.price > 0" class="text-xs text-green-600">+${{ seat.price }}</div>
            </div>
          </div>
        </div>

        <!-- Premium Economy -->
        <div v-if="premiumSeats.length > 0" class="border-b border-gray-200 pb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-gray-900">Premium Economy</h3>
            <span class="text-sm text-gray-600">Extra legroom • Enhanced service</span>
          </div>
          <div class="grid gap-1" :style="{ gridTemplateColumns: economyGridTemplate }">
            <div
              v-for="seat in premiumSeats"
              :key="seat.id"
              :class="getSeatClasses(seat)"
              @click="handleSeatClick(seat)"
              @mouseenter="showSeatTooltip(seat, $event)"
              @mouseleave="hideSeatTooltip"
            >
              <div class="text-xs font-medium">{{ seat.seatNumber }}</div>
              <div v-if="seat.price > 0" class="text-xs text-green-600">+${{ seat.price }}</div>
            </div>
          </div>
        </div>

        <!-- Economy Class -->
        <div v-if="economySeats.length > 0">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-medium text-gray-900">Economy Class</h3>
            <span class="text-sm text-gray-600">Standard seats</span>
          </div>
          <div class="grid gap-1 max-h-96 overflow-y-auto" :style="{ gridTemplateColumns: economyGridTemplate }">
            <div
              v-for="seat in economySeats"
              :key="seat.id"
              :class="getSeatClasses(seat)"
              @click="handleSeatClick(seat)"
              @mouseenter="showSeatTooltip(seat, $event)"
              @mouseleave="hideSeatTooltip"
            >
              <div class="text-xs font-medium">{{ seat.seatNumber }}</div>
              <div v-if="seat.price > 0" class="text-xs text-green-600">+${{ seat.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Seats Summary -->
    <div v-if="selectedSeats.length > 0" class="bg-blue-50 rounded-lg p-4">
      <h3 class="font-medium text-blue-900 mb-3">Selected Seats</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="(seat, index) in selectedSeats"
          :key="seat.id"
          class="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200"
        >
          <div>
            <div class="font-medium text-gray-900">
              Passenger {{ index + 1 }}
            </div>
            <div class="text-sm text-gray-600">
              Seat {{ seat.seatNumber }} • {{ seat.section }}
            </div>
            <div v-if="seat.price > 0" class="text-sm text-green-600">
              +${{ seat.price }}
            </div>
          </div>
          <button
            class="text-red-600 hover:text-red-700 p-1"
            @click="removeSeat(seat.id)"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
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

const aircraft = computed(() => 'Boeing 777-300ER')
const totalSeats = computed(() => bookingStore.seatMap.length)

// Seat sections
const businessSeats = computed(() => seatsBySection.value['Business Class'] || [])
const premiumSeats = computed(() => seatsBySection.value['Premium Economy'] || [])
const economySeats = computed(() => seatsBySection.value['Economy'] || [])

// Grid templates for different sections
const businessGridTemplate = computed(() => {
  return 'repeat(7, 1fr)' // Business: A _ C D F _ H
})

const economyGridTemplate = computed(() => {
  return 'repeat(11, 1fr)' // Economy: A B C _ D E F _ G H J
})

const formatTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
const getSeatClasses = (seat) => {
  const base = 'w-8 h-8 m-0.5 rounded border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-xs relative'
  
  if (!seat.isAvailable) {
    return `${base} bg-gray-300 border-gray-400 cursor-not-allowed`
  }
  
  if (seat.isSelected) {
    return `${base} bg-blue-500 border-blue-600 text-white hover:bg-blue-600`
  }
  
  if (seat.price > 0) {
    return `${base} bg-yellow-100 border-yellow-400 hover:bg-yellow-200 text-gray-900`
  }
  
  return `${base} bg-green-100 border-green-400 hover:bg-green-200 text-gray-900`
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