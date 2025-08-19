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
          <div class="mb-12 text-center">
            <h1 class="text-5xl font-light text-neutral-900 mb-4">Book Your Flight</h1>
            <p class="text-xl text-neutral-500 font-light">Fast. Simple. Reliable.</p>
          </div>

          <!-- Search Form -->
          <div class="bg-white rounded-xl border border-neutral-300 p-6 mb-8 max-w-3xl mx-auto shadow-sm">
            <form class="space-y-5">
              <!-- Trip Type -->
              <div class="flex space-x-6 justify-center">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="round-trip"
                    v-model="searchForm.tripType"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-400"
                  />
                  <span class="ml-3 text-neutral-700 font-medium">Round Trip</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="one-way"
                    v-model="searchForm.tripType"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-400"
                  />
                  <span class="ml-3 text-neutral-700 font-medium">One Way</span>
                </label>
              </div>

              <!-- Origin and Destination -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AirportAutocomplete
                  v-model="searchForm.origin"
                  label="From"
                  placeholder="Origin city or airport"
                  required
                  @select="handleOriginSelect"
                />
                <AirportAutocomplete
                  v-model="searchForm.destination"
                  label="To"
                  placeholder="Destination city or airport"
                  required
                  @select="handleDestinationSelect"
                />
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  v-model="searchForm.departureDate"
                  type="date"
                  label="Departure"
                  required
                />
                <Input
                  v-if="searchForm.tripType === 'round-trip'"
                  v-model="searchForm.returnDate"
                  type="date"
                  label="Return"
                />
              </div>

              <!-- Passengers and Cabin -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  v-model="searchForm.passengers"
                  label="Passengers"
                  :options="passengerOptions"
                />
                <Select
                  v-model="searchForm.cabinClass"
                  label="Class"
                  :options="cabinOptions"
                />
              </div>

              <!-- Search Button -->
              <div class="flex justify-center pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  @click="handleSearch"
                  :loading="loading"
                  :disabled="loading"
                  class="px-16 py-3 text-lg font-medium"
                >
                  <MagnifyingGlassIcon class="h-5 w-5 mr-3" />
                  {{ loading ? 'Searching...' : 'Search Flights' }}
                </Button>
              </div>
            </form>
          </div>

          <!-- Recent Searches -->
          <div v-if="recentSearches.length > 0" class="bg-white rounded-lg border border-neutral-300 p-5 mb-6 max-w-3xl mx-auto shadow-sm">
            <h2 class="text-lg font-medium text-neutral-900 mb-3">Recent Searches</h2>
            <div class="space-y-2">
              <div
                v-for="search in recentSearches"
                :key="search.id"
                class="flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                @click="handleRecentSearch(search)"
              >
                <div class="flex items-center space-x-4">
                  <div class="text-sm">
                    <div class="font-medium text-neutral-900">
                      {{ typeof search.origin === 'string' ? search.origin : search.origin?.code || 'Unknown' }} → 
                      {{ typeof search.destination === 'string' ? search.destination : search.destination?.code || 'Unknown' }}
                    </div>
                    <div class="text-neutral-500 text-xs">
                      {{ formatDate(search.departureDate) }} • {{ search.passengers?.adults || search.passengers || 1 }} passenger{{ (search.passengers?.adults || search.passengers || 1) > 1 ? 's' : '' }} • {{ search.cabinClass }}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" @click.stop="handleRecentSearch(search)">
                  Search
                </Button>
              </div>
            </div>
          </div>

          <!-- Popular Destinations -->
          <div class="bg-white rounded-lg border border-neutral-300 p-5 max-w-3xl mx-auto shadow-sm">
            <h2 class="text-lg font-medium text-neutral-900 mb-4 text-center">Popular Destinations</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                v-for="destination in popularDestinations"
                :key="destination.code"
                class="text-center p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                @click="selectDestination(destination)"
              >
                <div class="text-3xl mb-2">{{ destination.flag }}</div>
                <div class="font-medium text-neutral-900">{{ destination.city }}</div>
                <div class="text-sm text-neutral-500">{{ destination.code }}</div>
                <div class="text-sm text-success-600 mt-1 font-medium">from ${{ destination.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFlightsStore } from '@/store/flights'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import AirportAutocomplete from '@/components/ui/AirportAutocomplete.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import airportService from '@/services/airportService'

const router = useRouter()
const flightsStore = useFlightsStore()

const isMobileMenuOpen = ref(false)
const loading = ref(false)

const searchForm = ref({
  tripType: 'round-trip',
  origin: null,
  destination: null,
  departureDate: '',
  returnDate: '',
  passengers: '1',
  cabinClass: 'economy'
})

const passengerOptions = [
  { value: '1', label: '1 Passenger' },
  { value: '2', label: '2 Passengers' },
  { value: '3', label: '3 Passengers' },
  { value: '4', label: '4 Passengers' },
  { value: '5', label: '5+ Passengers' }
]

const cabinOptions = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' }
]

const recentSearches = computed(() => {
  return flightsStore.getRecentSearches().slice(0, 5)
})

const handleSearch = async () => {
  // Validate form
  if (!searchForm.value.origin?.code || !searchForm.value.destination?.code || !searchForm.value.departureDate) {
    alert('Please fill in all required fields')
    return
  }

  loading.value = true
  
  try {
    const searchCriteria = {
      origin: searchForm.value.origin.code,
      destination: searchForm.value.destination.code,
      departureDate: searchForm.value.departureDate,
      returnDate: searchForm.value.returnDate,
      passengers: {
        adults: parseInt(searchForm.value.passengers),
        children: 0,
        infants: 0
      },
      cabinClass: searchForm.value.cabinClass,
      tripType: searchForm.value.tripType
    }
    
    const result = await flightsStore.searchFlights(searchCriteria)
    
    if (result.success) {
      router.push('/search')
    } else {
      alert(result.error || 'Search failed. Please try again.')
    }
  } catch (error) {
    console.error('Search error:', error)
    alert('Search failed. Please try again.')
  } finally {
    loading.value = false
  }
}

const popularDestinations = ref([])

// Country flags mapping
const countryFlags = {
  'United Kingdom': '🇬🇧',
  'France': '🇫🇷',
  'Japan': '🇯🇵',
  'United Arab Emirates': '🇦🇪',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'Singapore': '🇸🇬',
  'Canada': '🇨🇦',
  'United States': '🇺🇸',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱'
}

const handleRecentSearch = async (search) => {
  const originAirport = typeof search.origin === 'string' 
    ? airportService.getAirport(search.origin) 
    : search.origin

  const destinationAirport = typeof search.destination === 'string' 
    ? airportService.getAirport(search.destination) 
    : search.destination

  searchForm.value = {
    tripType: search.tripType || 'round-trip',
    origin: originAirport,
    destination: destinationAirport,
    departureDate: search.departureDate,
    returnDate: search.returnDate || '',
    passengers: search.passengers?.toString() || '1',
    cabinClass: search.cabinClass || 'economy'
  }
  
  await handleSearch()
}

const selectDestination = (destination) => {
  const airport = airportService.getAirport(destination.code)
  if (airport) {
    searchForm.value.destination = airport
  }
}

const handleOriginSelect = (airport) => {
  console.log('Origin selected:', airport)
}

const handleDestinationSelect = (airport) => {
  console.log('Destination selected:', airport)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  flightsStore.initializeFlightsData()
  
  // Set default departure date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  searchForm.value.departureDate = tomorrow.toISOString().split('T')[0]
  
  // Set default return date to 7 days from departure
  const returnDate = new Date(tomorrow)
  returnDate.setDate(returnDate.getDate() + 7)
  searchForm.value.returnDate = returnDate.toISOString().split('T')[0]

  // Initialize popular destinations with real data
  const popularAirports = airportService.getPopularAirports()
  popularDestinations.value = popularAirports.map(airport => ({
    ...airport,
    flag: countryFlags[airport.country] || '🌍',
    price: Math.floor(Math.random() * 800) + 200 // Random price for demo
  }))
})
</script>