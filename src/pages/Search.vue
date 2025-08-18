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
            <p class="text-gray-600">NYC → LON • Mar 15, 2024 • 2 passengers</p>
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

          <!-- Results -->
          <div class="space-y-4">
            <div
              v-for="flight in flights"
              :key="flight.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-6">
                  <!-- Airline Logo -->
                  <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-bold text-gray-600">{{ flight.airline }}</span>
                  </div>

                  <!-- Flight Details -->
                  <div class="flex-1">
                    <div class="flex items-center space-x-4 mb-2">
                      <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">{{ flight.departure.time }}</div>
                        <div class="text-sm text-gray-500">{{ flight.departure.airport }}</div>
                      </div>
                      
                      <div class="flex items-center space-x-2 flex-1">
                        <div class="h-0.5 bg-gray-300 flex-1"></div>
                        <div class="text-sm text-gray-500">{{ flight.duration }}</div>
                        <div class="h-0.5 bg-gray-300 flex-1"></div>
                      </div>
                      
                      <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">{{ flight.arrival.time }}</div>
                        <div class="text-sm text-gray-500">{{ flight.arrival.airport }}</div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Select from '@/components/ui/Select.vue'

const router = useRouter()

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

const flights = ref([
  {
    id: 1,
    airline: 'BA',
    departure: { time: '08:30', airport: 'JFK' },
    arrival: { time: '20:45', airport: 'LHR' },
    duration: '7h 15m',
    stops: 0,
    price: 845
  },
  {
    id: 2,
    airline: 'VS',
    departure: { time: '14:20', airport: 'JFK' },
    arrival: { time: '02:35', airport: 'LHR' },
    duration: '7h 15m',
    stops: 0,
    price: 920
  },
  {
    id: 3,
    airline: 'AA',
    departure: { time: '22:15', airport: 'JFK' },
    arrival: { time: '10:30', airport: 'LHR' },
    duration: '7h 15m',
    stops: 0,
    price: 780
  }
])

const selectFlight = (flight) => {
  console.log('Selected flight:', flight)
  router.push('/booking')
}
</script>