<template>
  <div class="relative">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <input
        ref="inputRef"
        type="text"
        :value="displayValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        :class="[
          'block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'text-sm transition-colors duration-200',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        ]"
        :disabled="disabled"
        :required="required"
      />
      
      <!-- Clear button -->
      <button
        v-if="displayValue && !disabled"
        @click="clearSelection"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        type="button"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="showDropdown && (searchResults.length > 0 || popularAirports.length > 0)"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="py-2">
        <div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Search Results
        </div>
        <button
          v-for="(airport, index) in searchResults"
          :key="airport.code"
          @click="selectAirport(airport)"
          :class="[
            'w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors',
            selectedIndex === index ? 'bg-primary-50' : ''
          ]"
          type="button"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-primary-600">{{ airport.code }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ airport.displayName }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ airport.subtitle }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-xs text-gray-400 ml-2">
              {{ airport.country }}
            </div>
          </div>
        </button>
      </div>

      <!-- Popular Airports (shown when no search results) -->
      <div v-else-if="popularAirports.length > 0" class="py-2">
        <div class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Popular Destinations
        </div>
        <button
          v-for="(airport, index) in popularAirports"
          :key="airport.code"
          @click="selectAirport(airport)"
          :class="[
            'w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors',
            selectedIndex === index ? 'bg-primary-50' : ''
          ]"
          type="button"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-blue-600">{{ airport.code }}</span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ airport.city }}, {{ airport.country }}
                  </p>
                  <p class="text-xs text-gray-500 truncate">
                    {{ airport.name }}
                  </p>
                </div>
              </div>
            </div>
            <div class="text-xs text-primary-600 font-medium ml-2">
              {{ airport.code }}
            </div>
          </div>
        </button>
      </div>

      <!-- No results -->
      <div v-if="searchQuery && searchResults.length === 0" class="py-4 px-3 text-center text-gray-500 text-sm">
        No airports found for "{{ searchQuery }}"
      </div>
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-xs text-red-600">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import airportService from '@/services/airportService'

const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search airports...'
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const inputRef = ref(null)
const searchQuery = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(-1)
const searchResults = ref([])
const popularAirports = ref([])

// Display value in input field
const displayValue = computed(() => {
  if (typeof props.modelValue === 'object' && props.modelValue?.code) {
    return `${props.modelValue.city}, ${props.modelValue.country} (${props.modelValue.code})`
  }
  if (typeof props.modelValue === 'string' && props.modelValue) {
    // If it's a code, try to find the airport
    const airport = airportService.getAirport(props.modelValue)
    if (airport) {
      return `${airport.city}, ${airport.country} (${airport.code})`
    }
    return props.modelValue
  }
  return searchQuery.value
})

// Handle input changes
const handleInput = (event) => {
  const value = event.target.value
  searchQuery.value = value
  
  if (value.length >= 2) {
    searchResults.value = airportService.searchAirports(value, 8)
    showDropdown.value = true
  } else {
    searchResults.value = []
    showDropdown.value = value.length === 0 // Show popular airports when empty
  }
  
  selectedIndex.value = -1
}

// Handle focus
const handleFocus = () => {
  if (searchQuery.value.length === 0) {
    popularAirports.value = airportService.getPopularAirports()
  }
  showDropdown.value = true
}

// Handle blur with delay to allow clicks on dropdown
const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false
    selectedIndex.value = -1
  }, 200)
}

// Handle keyboard navigation
const handleKeydown = (event) => {
  if (!showDropdown.value) return
  
  const totalItems = searchResults.value.length || popularAirports.value.length
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = selectedIndex.value < totalItems - 1 ? selectedIndex.value + 1 : 0
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : totalItems - 1
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        const airport = searchResults.value.length > 0 
          ? searchResults.value[selectedIndex.value]
          : popularAirports.value[selectedIndex.value]
        selectAirport(airport)
      }
      break
    case 'Escape':
      showDropdown.value = false
      selectedIndex.value = -1
      inputRef.value?.blur()
      break
  }
}

// Select airport
const selectAirport = (airport) => {
  const airportData = {
    code: airport.code,
    name: airport.name,
    city: airport.city,
    country: airport.country,
    coordinates: airport.coordinates,
    timezone: airport.timezone
  }
  
  emit('update:modelValue', airportData)
  emit('select', airportData)
  
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = -1
}

// Clear selection
const clearSelection = () => {
  emit('update:modelValue', '')
  searchQuery.value = ''
  showDropdown.value = false
  selectedIndex.value = -1
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// Watch for external model changes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
  }
})

// Initialize popular airports on mount
onMounted(() => {
  popularAirports.value = airportService.getPopularAirports()
})

// Click outside handler
const handleClickOutside = (event) => {
  if (!inputRef.value?.contains(event.target)) {
    showDropdown.value = false
    selectedIndex.value = -1
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>