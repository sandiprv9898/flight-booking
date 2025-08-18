<template>
  <div class="bg-white rounded-lg border border-neutral-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-bold text-neutral-900">Flight Status</h2>
        <p class="text-neutral-600">Real-time flight information</p>
      </div>
      <Button variant="ghost" size="sm" @click="refreshStatus">
        <ArrowPathIcon class="w-4 h-4 mr-2" />
        Refresh
      </Button>
    </div>

    <!-- Flight Header -->
    <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg mb-6">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
          <span class="text-sm font-bold text-primary-600">{{ flight.airlineCode }}</span>
        </div>
        <div>
          <div class="font-semibold text-neutral-900">{{ flight.airline }} {{ flight.flightNumber }}</div>
          <div class="text-sm text-neutral-600">{{ flight.aircraft }}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm text-neutral-600">{{ formatDate(flight.departure.date) }}</div>
        <div :class="getStatusClasses(flight.status)" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
          <div :class="`w-2 h-2 rounded-full mr-2 ${getStatusDot(flight.status)}`"></div>
          {{ flight.status }}
        </div>
      </div>
    </div>

    <!-- Flight Progress -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-neutral-900">{{ flight.departure.time }}</div>
          <div class="text-sm font-medium text-neutral-700">{{ flight.origin.code }}</div>
          <div class="text-xs text-neutral-500">{{ flight.origin.city }}</div>
        </div>
        
        <div class="flex-1 mx-8">
          <div class="relative">
            <!-- Flight Path -->
            <div class="h-1 bg-neutral-200 rounded-full">
              <div 
                class="h-1 bg-primary-600 rounded-full transition-all duration-1000" 
                :style="{ width: `${flightProgress}%` }"
              ></div>
            </div>
            <!-- Plane Icon -->
            <div 
              class="absolute -top-2 transform -translate-x-1/2 transition-all duration-1000"
              :style="{ left: `${flightProgress}%` }"
            >
              <div class="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-white transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="text-center mt-4 text-sm text-neutral-600">
            {{ formatDuration(flight.duration) }} flight
          </div>
        </div>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-neutral-900">{{ flight.arrival.time }}</div>
          <div class="text-sm font-medium text-neutral-700">{{ flight.destination.code }}</div>
          <div class="text-xs text-neutral-500">{{ flight.destination.city }}</div>
        </div>
      </div>
    </div>

    <!-- Flight Details Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-4 bg-neutral-50 rounded-lg">
        <div class="text-sm text-neutral-600 mb-1">Gate</div>
        <div class="text-lg font-bold text-neutral-900">{{ flight.gate || 'TBD' }}</div>
      </div>
      <div class="text-center p-4 bg-neutral-50 rounded-lg">
        <div class="text-sm text-neutral-600 mb-1">Terminal</div>
        <div class="text-lg font-bold text-neutral-900">{{ flight.terminal || 'T1' }}</div>
      </div>
      <div class="text-center p-4 bg-neutral-50 rounded-lg">
        <div class="text-sm text-neutral-600 mb-1">Altitude</div>
        <div class="text-lg font-bold text-neutral-900">{{ flight.altitude || '--' }}</div>
      </div>
      <div class="text-center p-4 bg-neutral-50 rounded-lg">
        <div class="text-sm text-neutral-600 mb-1">Speed</div>
        <div class="text-lg font-bold text-neutral-900">{{ flight.speed || '--' }}</div>
      </div>
    </div>

    <!-- Status Updates -->
    <div class="mt-6">
      <h3 class="font-semibold text-neutral-900 mb-4">Recent Updates</h3>
      <div class="space-y-3">
        <div 
          v-for="update in flight.updates" 
          :key="update.id"
          class="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg"
        >
          <div class="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
          <div class="flex-1">
            <div class="text-sm font-medium text-neutral-900">{{ update.message }}</div>
            <div class="text-xs text-neutral-500">{{ formatTime(update.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 flex flex-wrap gap-3">
      <Button variant="primary" size="sm">
        <BellIcon class="w-4 h-4 mr-2" />
        Set Alerts
      </Button>
      <Button variant="secondary" size="sm">
        <ShareIcon class="w-4 h-4 mr-2" />
        Share Status
      </Button>
      <Button variant="secondary" size="sm">
        <MapIcon class="w-4 h-4 mr-2" />
        Flight Map
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from '@/components/ui/Button.vue'
import { 
  ArrowPathIcon, 
  BellIcon, 
  ShareIcon, 
  MapIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  flightId: {
    type: String,
    required: true
  }
})

// Mock flight data
const flight = ref({
  id: 'FL001',
  airline: 'British Airways',
  airlineCode: 'BA',
  flightNumber: 'BA178',
  aircraft: 'Boeing 777-300ER',
  origin: { code: 'JFK', city: 'New York' },
  destination: { code: 'LHR', city: 'London' },
  departure: { time: '08:30', date: '2024-03-15' },
  arrival: { time: '20:45', date: '2024-03-15' },
  duration: '7h 15m',
  status: 'On Time',
  gate: 'A12',
  terminal: 'T5',
  altitude: '35,000 ft',
  speed: '560 mph',
  updates: [
    {
      id: 1,
      message: 'Flight is on time for departure',
      timestamp: '2024-03-15T06:30:00Z'
    },
    {
      id: 2,
      message: 'Gate assignment confirmed - A12',
      timestamp: '2024-03-15T06:15:00Z'
    },
    {
      id: 3,
      message: 'Boarding will begin in 30 minutes',
      timestamp: '2024-03-15T08:00:00Z'
    }
  ]
})

const flightProgress = ref(0)

const getStatusClasses = (status) => {
  const classes = {
    'On Time': 'bg-success-50 text-success-700',
    'Delayed': 'bg-warning-50 text-warning-700',
    'Boarding': 'bg-primary-50 text-primary-700',
    'Departed': 'bg-primary-50 text-primary-700',
    'In Flight': 'bg-primary-50 text-primary-700',
    'Landed': 'bg-success-50 text-success-700',
    'Cancelled': 'bg-error-50 text-error-700'
  }
  return classes[status] || 'bg-neutral-50 text-neutral-700'
}

const getStatusDot = (status) => {
  const colors = {
    'On Time': 'bg-success-500',
    'Delayed': 'bg-warning-500',
    'Boarding': 'bg-primary-500',
    'Departed': 'bg-primary-500',
    'In Flight': 'bg-primary-500',
    'Landed': 'bg-success-500',
    'Cancelled': 'bg-error-500'
  }
  return colors[status] || 'bg-neutral-500'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDuration = (duration) => {
  return duration
}

const refreshStatus = () => {
  // Simulate status refresh
  console.log('Refreshing flight status...')
}

// Simulate flight progress
let progressInterval = null

onMounted(() => {
  // Simulate flight progress based on status
  if (flight.value.status === 'In Flight') {
    flightProgress.value = Math.random() * 60 + 20 // Random progress between 20-80%
  } else if (flight.value.status === 'Departed') {
    flightProgress.value = 15
  } else if (flight.value.status === 'Landed') {
    flightProgress.value = 100
  }

  // Update progress every 30 seconds for in-flight status
  if (flight.value.status === 'In Flight') {
    progressInterval = setInterval(() => {
      if (flightProgress.value < 95) {
        flightProgress.value += Math.random() * 2
      }
    }, 30000)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>