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
                  class="px-12"
                >
                  <MagnifyingGlassIcon class="h-5 w-5 mr-2" />
                  Search Flights
                </Button>
              </div>
            </form>
          </div>

          <!-- Recent Searches -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h2>
            <div class="space-y-3">
              <div
                v-for="search in recentSearches"
                :key="search.id"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div class="flex items-center space-x-4">
                  <div class="text-sm">
                    <div class="font-medium text-gray-900">
                      {{ search.origin }} → {{ search.destination }}
                    </div>
                    <div class="text-gray-500">
                      {{ search.departureDate }} • {{ search.passengers }} passenger{{ search.passengers > 1 ? 's' : '' }}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Search Again
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const isMobileMenuOpen = ref(false)

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

const recentSearches = ref([
  {
    id: 1,
    origin: 'NYC',
    destination: 'LON',
    departureDate: '2024-03-15',
    passengers: 2
  },
  {
    id: 2,
    origin: 'LAX',
    destination: 'PAR',
    departureDate: '2024-04-20',
    passengers: 1
  }
])

const handleSearch = () => {
  console.log('Search form:', searchForm.value)
  router.push('/search')
}
</script>