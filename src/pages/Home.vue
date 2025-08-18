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
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Search Flights</h1>
            <p class="mt-2 text-gray-600">Find and book your perfect flight</p>
          </div>

          <!-- Search Form -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <form class="space-y-6">
              <!-- Trip Type -->
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    type="radio"
                    value="round-trip"
                    v-model="searchForm.tripType"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">Round Trip</span>
                </label>
                <label class="flex items-center">
                  <input
                    type="radio"
                    value="one-way"
                    v-model="searchForm.tripType"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700">One Way</span>
                </label>
              </div>

              <!-- Origin and Destination -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  v-model="searchForm.origin"
                  label="From"
                  placeholder="Origin city or airport"
                  required
                />
                <Input
                  v-model="searchForm.destination"
                  label="To"
                  placeholder="Destination city or airport"
                  required
                />
              </div>

              <!-- Dates -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input
                  v-model="searchForm.departureDate"
                  type="date"
                  label="Departure Date"
                  required
                />
                <Input
                  v-if="searchForm.tripType === 'round-trip'"
                  v-model="searchForm.returnDate"
                  type="date"
                  label="Return Date"
                />
              </div>

              <!-- Passengers and Cabin -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Select
                  v-model="searchForm.passengers"
                  label="Passengers"
                  :options="passengerOptions"
                />
                <Select
                  v-model="searchForm.cabinClass"
                  label="Cabin Class"
                  :options="cabinOptions"
                />
              </div>

              <!-- Search Button -->
              <div class="flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  @click="handleSearch"
                  :loading="loading"
                  :disabled="loading"
                  class="px-12"
                >
                  <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
                  {{ loading ? 'Searching...' : 'Search Flights' }}
                </Button>
              </div>
            </form>
          </div>

          <!-- Recent Searches -->
          <div v-if="recentSearches.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h2>
            <div class="space-y-3">
              <div
                v-for="search in recentSearches"
                :key="search.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                @click="handleRecentSearch(search)"
              >
                <div class="flex items-center space-x-4">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">
                      {{ search.origin }} → {{ search.destination }}
                    </div>
                    <div class="text-gray-500">
                      {{ formatDate(search.departureDate) }} • {{ search.passengers }} passenger{{ search.passengers > 1 ? 's' : '' }} • {{ search.cabinClass }}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" @click.stop="handleRecentSearch(search)">
                  Search Again
                </Button>
              </div>
            </div>
          </div>

          <!-- Popular Destinations -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="destination in popularDestinations"
                :key="destination.code"
                class="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                @click="selectDestination(destination)"
              >
                <div class="text-2xl mb-2">{{ destination.flag }}</div>
                <div class="font-medium text-gray-900">{{ destination.city }}</div>
                <div class="text-sm text-gray-500">{{ destination.code }}</div>
                <div class="text-xs text-green-600 mt-1">from ${{ destination.price }}</div>
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
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const flightsStore = useFlightsStore()

const isMobileMenuOpen = ref(false)
const loading = ref(false)

const searchForm = ref({
  tripType: 'round-trip',
  origin: '',
  destination: '',
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
  if (!searchForm.value.origin || !searchForm.value.destination || !searchForm.value.departureDate) {
    alert('Please fill in all required fields')
    return
  }

  loading.value = true
  
  try {
    const searchCriteria = {
      ...searchForm.value,
      passengers: parseInt(searchForm.value.passengers)
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

const popularDestinations = ref([
  { code: 'LHR', city: 'London', flag: '🇬🇧', price: 450 },
  { code: 'CDG', city: 'Paris', flag: '🇫🇷', price: 380 },
  { code: 'NRT', city: 'Tokyo', flag: '🇯🇵', price: 850 },
  { code: 'DXB', city: 'Dubai', flag: '🇦🇪', price: 520 },
  { code: 'SYD', city: 'Sydney', flag: '🇦🇺', price: 920 },
  { code: 'FRA', city: 'Frankfurt', flag: '🇩🇪', price: 420 },
  { code: 'SIN', city: 'Singapore', flag: '🇸🇬', price: 780 },
  { code: 'YYZ', city: 'Toronto', flag: '🇨🇦', price: 340 }
])

const handleRecentSearch = async (search) => {
  searchForm.value = {
    tripType: search.tripType || 'round-trip',
    origin: search.origin,
    destination: search.destination,
    departureDate: search.departureDate,
    returnDate: search.returnDate || '',
    passengers: search.passengers.toString(),
    cabinClass: search.cabinClass || 'economy'
  }
  
  await handleSearch()
}

const selectDestination = (destination) => {
  searchForm.value.destination = destination.code
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
})
</script>