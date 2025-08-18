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
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Search Results</h1>
            <p class="text-gray-600">{{ formatSearchSummary() }}</p>
            <p v-if="flights.length > 0" class="text-sm text-green-600 mt-1">
              {{ flights.length }} flight{{ flights.length !== 1 ? 's' : '' }} found
            </p>
          </div>

          <!-- Filters -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                v-model="filters.airline"
                label="Airline"
                :options="airlineOptions"
              />
              <Select
                v-model="filters.stops"
                label="Stops"
                :options="stopOptions"
              />
              <Select
                v-model="filters.price"
                label="Price Range"
                :options="priceOptions"
              />
              <Select
                v-model="filters.time"
                label="Departure Time"
                :options="timeOptions"
              />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="flights.length === 0" class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
            <p class="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <Button variant="primary" @click="router.push('/')">
              New Search
            </Button>
          </div>

          <!-- Results -->
          <div v-else class="space-y-4">
            <div
              v-for="flight in flights"
              :key="flight.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-6">
                  <!-- Airline Logo -->
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-bold text-gray-600">{{ flight.airlineCode }}</span>
                  </div>

                  <!-- Flight Details -->
                  <div class="flex-1">
                    <div class="flex items-center space-x-4 mb-2">
                      <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">{{ flight.departure.time }}</div>
                        <div class="text-sm text-gray-500">{{ flight.origin.code }}</div>
                      </div>
                      
                      <div class="flex items-center space-x-2 flex-1">
                        <div class="h-0.5 bg-gray-300 flex-1"></div>
                        <div class="text-sm text-gray-500">{{ flight.duration }}</div>
                        <div class="h-0.5 bg-gray-300 flex-1"></div>
                      </div>
                      
                      <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">{{ flight.arrival.time }}</div>
                        <div class="text-sm text-gray-500">{{ flight.destination.code }}</div>
                      </div>
                    </div>
                    
                    <div class="text-sm text-gray-500">
                      {{ flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}` }}
                    </div>
                  </div>
                </div>

                <!-- Price and Select -->
                <div class="text-right">
                  <div class="text-2xl font-bold text-gray-900 mb-1">
                    ${{ flight.price }}
                  </div>
                  <div class="text-sm text-gray-500 mb-3">per person</div>
                  <Button variant="primary" @click="selectFlight(flight)">
                    Select
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightsStore } from '@/store/flights'
import { useBookingStore } from '@/store/booking'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'

const router = useRouter()
const flightsStore = useFlightsStore()
const bookingStore = useBookingStore()

const isMobileMenuOpen = ref(false)

const filters = ref({
  airline: '',
  stops: '',
  price: '',
  time: ''
})

const airlineOptions = [
  { value: '', label: 'All Airlines' },
  { value: 'BA', label: 'British Airways' },
  { value: 'VS', label: 'Virgin Atlantic' },
  { value: 'AA', label: 'American Airlines' }
]

const stopOptions = [
  { value: '', label: 'Any Stops' },
  { value: '0', label: 'Non-stop' },
  { value: '1', label: '1 Stop' },
  { value: '2+', label: '2+ Stops' }
]

const priceOptions = [
  { value: '', label: 'Any Price' },
  { value: '0-500', label: '$0 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000+', label: '$1,000+' }
]

const timeOptions = [
  { value: '', label: 'Any Time' },
  { value: 'morning', label: 'Morning (6AM - 12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
  { value: 'evening', label: 'Evening (6PM - 12AM)' }
]

// Computed properties from store
const flights = computed(() => flightsStore.filteredFlights)
const searchCriteria = computed(() => flightsStore.searchCriteria)
const loading = computed(() => flightsStore.loading)
const availableAirlines = computed(() => flightsStore.availableAirlines)

// Dynamic options based on search results
const airlineOptions = computed(() => [
  { value: '', label: 'All Airlines' },
  ...availableAirlines.value.map(airline => ({
    value: airline.code,
    label: airline.name
  }))
])

const selectFlight = (flight) => {
  bookingStore.setSelectedFlight(flight)
  router.push('/booking')
}

const updateFilters = () => {
  const filterObj = {}
  
  if (filters.value.airline) filterObj.airline = filters.value.airline
  if (filters.value.stops !== '') filterObj.stops = filters.value.stops
  if (filters.value.price) {
    const [min, max] = filters.value.price.includes('-') 
      ? filters.value.price.split('-').map(Number)
      : [parseInt(filters.value.price.replace('+', '')), 99999]
    filterObj.priceRange = [min, max || 99999]
  }
  if (filters.value.time) filterObj.timeOfDay = filters.value.time
  
  flightsStore.updateFilters(filterObj)
}

const formatSearchSummary = () => {
  if (!searchCriteria.value.origin) return 'No search criteria'
  
  return `${searchCriteria.value.origin} → ${searchCriteria.value.destination} • ${formatDate(searchCriteria.value.departureDate)} • ${searchCriteria.value.passengers} passenger${searchCriteria.value.passengers > 1 ? 's' : ''}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Watch for filter changes
watch(filters, updateFilters, { deep: true })

onMounted(() => {
  // Initialize flights data if not already loaded
  if (flights.value.length === 0) {
    // If no search results, redirect to home
    router.push('/')
  }
})
</script>