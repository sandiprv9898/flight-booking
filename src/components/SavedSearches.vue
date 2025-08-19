<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Saved Searches</h2>
        <p class="text-gray-600">Manage your saved flight searches and price alerts</p>
      </div>
      <div class="flex items-center space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          @click="exportSearches"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          @click="showCreateModal = true"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Save New Search
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Total Saved</p>
            <p class="text-xl font-bold text-gray-900">{{ savedSearches.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H12V2.5L19 9Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Active Alerts</p>
            <p class="text-xl font-bold text-gray-900">{{ activeSavedSearches.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 9V3.5L18.5 9M6 2C4.89 2 4 2.89 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2H6Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Price Drops</p>
            <p class="text-xl font-bold text-gray-900">{{ priceDropAlerts.length }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 6C9.8 6 8 7.8 8 10S9.8 14 12 14 16 12.2 16 10 14.2 6 12 6M21 16.5C21 14.6 17.9 13 12 13S3 14.6 3 16.5V18H21V16.5Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">Recent Searches</p>
            <p class="text-xl font-bold text-gray-900">{{ recentSearches.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Alerts Section -->
    <div v-if="searchesNeedingAttention.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Price Alerts</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>{{ searchesNeedingAttention.length }} of your saved searches need attention - prices may have dropped!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Saved Searches List -->
    <div class="space-y-4">
      <div v-if="savedSearches.length === 0" class="text-center py-12">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No saved searches</h3>
        <p class="text-gray-600 mb-4">Save your frequent searches to track prices and get alerts</p>
        <Button @click="showCreateModal = true">Create Your First Saved Search</Button>
      </div>

      <div 
        v-for="search in savedSearches" 
        :key="search.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <h3 class="text-lg font-semibold text-gray-900">{{ search.name }}</h3>
              <span 
                v-if="search.priceAlert?.enabled"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="search.priceAlert.priceChange < 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'"
              >
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H12V2.5L19 9Z"/>
                </svg>
                Alert Active
              </span>
            </div>
            
            <div class="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span>{{ search.searchParams.origin?.city }} → {{ search.searchParams.destination?.city }}</span>
              <span>{{ formatDate(search.searchParams.departureDate) }}</span>
              <span v-if="search.searchParams.returnDate">- {{ formatDate(search.searchParams.returnDate) }}</span>
              <span>{{ search.searchParams.passengers?.adults || 1 }} passenger(s)</span>
              <span class="capitalize">{{ search.searchParams.cabinClass }}</span>
            </div>

            <div class="flex items-center space-x-6 text-sm">
              <div>
                <span class="text-gray-500">Searched:</span>
                <span class="font-medium text-gray-900 ml-1">{{ search.searchCount }} times</span>
              </div>
              <div>
                <span class="text-gray-500">Last:</span>
                <span class="font-medium text-gray-900 ml-1">{{ formatRelativeDate(search.lastSearched) }}</span>
              </div>
              <div v-if="search.priceAlert?.currentPrice">
                <span class="text-gray-500">Price:</span>
                <span class="font-medium text-gray-900 ml-1">${{ search.priceAlert.currentPrice }}</span>
                <span 
                  v-if="search.priceAlert.priceChange !== 0"
                  :class="search.priceAlert.priceChange < 0 ? 'text-green-600' : 'text-red-600'"
                  class="ml-1"
                >
                  ({{ search.priceAlert.priceChange > 0 ? '+' : '' }}${{ search.priceAlert.priceChange }})
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              @click="repeatSearch(search)"
              class="flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              @click="editSearch(search)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>

            <Button
              variant="outline"
              size="sm"
              @click="deleteSearch(search.id)"
              class="text-red-600 hover:text-red-700"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>

        <!-- Price Alert Settings -->
        <div v-if="search.priceAlert?.enabled" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H12V2.5L19 9Z"/>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Price Alert Active</p>
                <p class="text-sm text-gray-600">
                  Alert me when price drops below ${{ search.priceAlert.maxPrice }}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="togglePriceAlert(search)"
            >
              Turn Off
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Search Modal -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false" size="lg">
      <template #header>
        <h2 class="text-xl font-bold text-gray-900">
          {{ editingSearch ? 'Edit Saved Search' : 'Save New Search' }}
        </h2>
      </template>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search Name</label>
          <Input
            v-model="newSearchName"
            placeholder="e.g., Business Trip to Tokyo"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
            <Input
              v-model="newSearchParams.origin"
              placeholder="Origin city or airport"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
            <Input
              v-model="newSearchParams.destination"
              placeholder="Destination city or airport"
            />
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="enablePriceAlert"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            >
            <span class="ml-2 text-sm text-gray-700">Enable price alerts</span>
          </label>
        </div>

        <div v-if="enablePriceAlert" class="p-4 bg-blue-50 rounded-lg">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Alert me when price drops below:
          </label>
          <div class="flex items-center space-x-2">
            <span class="text-gray-500">$</span>
            <Input
              v-model.number="alertMaxPrice"
              type="number"
              placeholder="500"
              class="w-24"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <Button variant="outline" @click="showCreateModal = false">Cancel</Button>
          <Button @click="saveNewSearch">
            {{ editingSearch ? 'Update Search' : 'Save Search' }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSavedSearchesStore } from '@/store/savedSearches'
import Button from './ui/Button.vue'
import Input from './ui/Input.vue'
import Modal from './ui/Modal.vue'

const router = useRouter()
const savedSearchesStore = useSavedSearchesStore()

// State
const showCreateModal = ref(false)
const editingSearch = ref(null)
const newSearchName = ref('')
const newSearchParams = ref({
  origin: '',
  destination: ''
})
const enablePriceAlert = ref(false)
const alertMaxPrice = ref(500)

// Computed
const savedSearches = computed(() => savedSearchesStore.savedSearches)
const activeSavedSearches = computed(() => savedSearchesStore.activeSavedSearches)
const recentSearches = computed(() => savedSearchesStore.recentSearches)
const priceDropAlerts = computed(() => savedSearchesStore.priceDropAlerts)
const searchesNeedingAttention = computed(() => savedSearchesStore.searchesNeedingAttention)

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatRelativeDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
  return formatDate(dateString)
}

const repeatSearch = (search) => {
  const searchParams = savedSearchesStore.repeatSearch(search.id)
  if (searchParams) {
    // Navigate to search with parameters
    router.push({ 
      name: 'search',
      query: {
        from: searchParams.origin?.code,
        to: searchParams.destination?.code,
        departure: searchParams.departureDate,
        return: searchParams.returnDate,
        passengers: searchParams.passengers?.adults || 1,
        class: searchParams.cabinClass
      }
    })
  }
}

const editSearch = (search) => {
  editingSearch.value = search
  newSearchName.value = search.name
  newSearchParams.value = {
    origin: search.searchParams.origin?.city || search.searchParams.origin?.code,
    destination: search.searchParams.destination?.city || search.searchParams.destination?.code
  }
  enablePriceAlert.value = search.priceAlert?.enabled || false
  alertMaxPrice.value = search.priceAlert?.maxPrice || 500
  showCreateModal.value = true
}

const deleteSearch = (searchId) => {
  if (confirm('Are you sure you want to delete this saved search?')) {
    savedSearchesStore.deleteSearch(searchId)
  }
}

const togglePriceAlert = (search) => {
  savedSearchesStore.setPriceAlert(search.id, {
    ...search.priceAlert,
    enabled: !search.priceAlert.enabled
  })
}

const saveNewSearch = () => {
  const searchParams = {
    origin: { city: newSearchParams.value.origin },
    destination: { city: newSearchParams.value.destination },
    tripType: 'round-trip',
    cabinClass: 'economy'
  }

  if (editingSearch.value) {
    // Update existing search
    savedSearchesStore.updateSearch(editingSearch.value.id, {
      name: newSearchName.value,
      searchParams
    })
    
    if (enablePriceAlert.value) {
      savedSearchesStore.setPriceAlert(editingSearch.value.id, {
        enabled: true,
        maxPrice: alertMaxPrice.value
      })
    }
  } else {
    // Create new search
    const result = savedSearchesStore.saveSearch(searchParams, newSearchName.value)
    
    if (result.success && enablePriceAlert.value) {
      savedSearchesStore.setPriceAlert(result.search.id, {
        enabled: true,
        maxPrice: alertMaxPrice.value
      })
    }
  }

  // Reset form
  showCreateModal.value = false
  editingSearch.value = null
  newSearchName.value = ''
  newSearchParams.value = { origin: '', destination: '' }
  enablePriceAlert.value = false
  alertMaxPrice.value = 500
}

const exportSearches = () => {
  savedSearchesStore.exportSavedSearches()
}

onMounted(() => {
  // Simulate price check on component mount
  savedSearchesStore.simulatePriceCheck()
})
</script>