<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar
      :is-mobile-menu-open="isMobileMenuOpen"
      @close-mobile-menu="isMobileMenuOpen = false"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen" />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-neutral-900 mb-2">Flight Status</h1>
            <p class="text-neutral-600">Track your flight in real-time</p>
          </div>

          <!-- Flight Search -->
          <div class="bg-white rounded-lg border border-neutral-300 p-6 mb-8 shadow-sm">
            <h2 class="text-lg font-medium text-neutral-900 mb-4">Search Flight Status</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                v-model="searchQuery.flightNumber"
                label="Flight Number"
                placeholder="e.g. BA178"
              />
              <Input
                v-model="searchQuery.airline"
                label="Airline"
                placeholder="e.g. British Airways"
              />
              <Input
                v-model="searchQuery.date"
                type="date"
                label="Date"
                :value="todayDate"
              />
              <div class="flex items-end">
                <Button 
                  variant="primary" 
                  class="w-full"
                  @click="searchFlight"
                  :loading="searching"
                >
                  <MagnifyingGlassIcon class="w-4 h-4 mr-2" />
                  Search Flight
                </Button>
              </div>
            </div>
          </div>

          <!-- Flight Status Results -->
          <div v-if="currentFlight" class="mb-8">
            <FlightStatus :flight-id="currentFlight.id" />
          </div>

          <!-- Recent Flight Statuses -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Popular Routes -->
            <div class="bg-white rounded-lg border border-neutral-300 p-6 shadow-sm">
              <h3 class="text-lg font-medium text-neutral-900 mb-4">Popular Routes</h3>
              <div class="space-y-3">
                <div 
                  v-for="route in popularRoutes" 
                  :key="route.id"
                  class="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  @click="selectRoute(route)"
                >
                  <div>
                    <div class="font-medium text-neutral-900">{{ route.origin }} → {{ route.destination }}</div>
                    <div class="text-sm text-neutral-600">{{ route.airline }} • {{ route.flights }} flights today</div>
                  </div>
                  <ChevronRightIcon class="w-5 h-5 text-neutral-400" />
                </div>
              </div>
            </div>

            <!-- Flight Alerts -->
            <div class="bg-white rounded-lg border border-neutral-300 p-6 shadow-sm">
              <h3 class="text-lg font-medium text-neutral-900 mb-4">Flight Alerts</h3>
              <div v-if="flightAlerts.length === 0" class="text-center py-8 text-neutral-500">
                <BellIcon class="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p>No flight alerts set</p>
                <Button variant="secondary" size="sm" class="mt-3" @click="setupAlerts">
                  Set Up Alerts
                </Button>
              </div>
              <div v-else class="space-y-3">
                <div 
                  v-for="alert in flightAlerts" 
                  :key="alert.id"
                  class="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                >
                  <div>
                    <div class="font-medium text-neutral-900">{{ alert.flightNumber }}</div>
                    <div class="text-sm text-neutral-600">{{ alert.route }} • {{ alert.date }}</div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div :class="getAlertStatusClass(alert.status)" class="w-2 h-2 rounded-full"></div>
                    <span class="text-sm text-neutral-600">{{ alert.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Airport Information -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white rounded-lg border border-neutral-300 p-6 shadow-sm text-center">
              <ClockIcon class="w-8 h-8 mx-auto mb-3 text-primary-600" />
              <h4 class="font-medium text-neutral-900 mb-2">On-Time Performance</h4>
              <div class="text-2xl font-bold text-success-600">87%</div>
              <p class="text-sm text-neutral-600">Today's average</p>
            </div>
            <div class="bg-white rounded-lg border border-neutral-300 p-6 shadow-sm text-center">
              <CloudIcon class="w-8 h-8 mx-auto mb-3 text-primary-600" />
              <h4 class="font-medium text-neutral-900 mb-2">Weather Delays</h4>
              <div class="text-2xl font-bold text-warning-600">12</div>
              <p class="text-sm text-neutral-600">Flights affected</p>
            </div>
            <div class="bg-white rounded-lg border border-neutral-300 p-6 shadow-sm text-center">
              <ExclamationTriangleIcon class="w-8 h-8 mx-auto mb-3 text-primary-600" />
              <h4 class="font-medium text-neutral-900 mb-2">Active Alerts</h4>
              <div class="text-2xl font-bold text-error-600">3</div>
              <p class="text-sm text-neutral-600">System-wide</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import FlightStatus from '@/components/FlightStatus.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  BellIcon,
  ClockIcon,
  CloudIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

const isMobileMenuOpen = ref(false)
const searching = ref(false)
const currentFlight = ref(null)
const todayDate = ref('')

const searchQuery = ref({
  flightNumber: '',
  airline: '',
  date: ''
})

const popularRoutes = ref([
  { 
    id: 1, 
    origin: 'JFK', 
    destination: 'LHR', 
    airline: 'British Airways', 
    flights: 8 
  },
  { 
    id: 2, 
    origin: 'LAX', 
    destination: 'NRT', 
    airline: 'Japan Airlines', 
    flights: 6 
  },
  { 
    id: 3, 
    origin: 'DFW', 
    destination: 'CDG', 
    airline: 'Air France', 
    flights: 4 
  },
  { 
    id: 4, 
    origin: 'SFO', 
    destination: 'FRA', 
    airline: 'Lufthansa', 
    flights: 5 
  }
])

const flightAlerts = ref([])

const searchFlight = async () => {
  if (!searchQuery.value.flightNumber.trim()) {
    alert('Please enter a flight number')
    return
  }

  searching.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock flight data
    currentFlight.value = {
      id: 'FL001',
      flightNumber: searchQuery.value.flightNumber.toUpperCase(),
      airline: searchQuery.value.airline || 'British Airways',
      status: 'On Time'
    }
    
  } catch (error) {
    alert('Error searching for flight. Please try again.')
  } finally {
    searching.value = false
  }
}

const selectRoute = (route) => {
  searchQuery.value.flightNumber = `${route.airline.split(' ')[0].substring(0, 2).toUpperCase()}123`
  searchQuery.value.airline = route.airline
  searchFlight()
}

const setupAlerts = () => {
  alert('Flight alert setup - Feature coming soon!')
}

const getAlertStatusClass = (status) => {
  const classes = {
    'On Time': 'bg-success-500',
    'Delayed': 'bg-warning-500',
    'Cancelled': 'bg-error-500'
  }
  return classes[status] || 'bg-neutral-500'
}

onMounted(() => {
  // Set today's date
  const today = new Date()
  todayDate.value = today.toISOString().split('T')[0]
  searchQuery.value.date = todayDate.value
  
  // Load any existing flight alerts (mock)
  flightAlerts.value = []
})
</script>