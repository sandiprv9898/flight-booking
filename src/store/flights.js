import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCurrencyStore } from './currency'
import airportService from '@/services/airportService'
import liveDataService from '@/services/liveDataService'

export const useFlightsStore = defineStore('flights', () => {
  const currencyStore = useCurrencyStore()
  
  // State
  const flights = ref([])
  const searchCriteria = ref({})
  const loading = ref(false)
  const lastSearchTime = ref(null)
  const filters = ref({
    airline: '',
    stops: '',
    priceRange: [0, 5000],
    timeOfDay: '',
    duration: ''
  })
  const sortBy = ref('price')
  const searchResults = ref([])
  const selectedFlight = ref(null)
  const savedFlights = ref([])
  const priceAlerts = ref([])
  const searchHistory = ref([])
  const useLiveData = ref(true) // Toggle for live vs enhanced mock data

  // Computed
  const filteredFlights = computed(() => {
    let result = [...searchResults.value]

    // Apply filters
    if (filters.value.airline) {
      result = result.filter(flight => flight.airline.code === filters.value.airline)
    }

    if (filters.value.stops !== '') {
      const stopsFilter = filters.value.stops
      if (stopsFilter === '0') {
        result = result.filter(flight => flight.stops.length === 0)
      } else if (stopsFilter === '1') {
        result = result.filter(flight => flight.stops.length === 1)
      } else if (stopsFilter === '2+') {
        result = result.filter(flight => flight.stops.length >= 2)
      }
    }

    if (filters.value.priceRange) {
      const [min, max] = filters.value.priceRange
      result = result.filter(flight => 
        flight.price.total >= min && flight.price.total <= max
      )
    }

    if (filters.value.timeOfDay) {
      result = result.filter(flight => {
        const hour = new Date(flight.departure.time).getHours()
        switch (filters.value.timeOfDay) {
          case 'morning':
            return hour >= 6 && hour < 12
          case 'afternoon':
            return hour >= 12 && hour < 18
          case 'evening':
            return hour >= 18 && hour < 24
          default:
            return true
        }
      })
    }

    // Apply sorting
    switch (sortBy.value) {
      case 'price':
        result.sort((a, b) => a.price.total - b.price.total)
        break
      case 'duration':
        result.sort((a, b) => a.duration.total - b.duration.total)
        break
      case 'departure':
        result.sort((a, b) => new Date(a.departure.time) - new Date(b.departure.time))
        break
      case 'arrival':
        result.sort((a, b) => new Date(a.arrival.time) - new Date(b.arrival.time))
        break
      case 'airline':
        result.sort((a, b) => a.airline.name.localeCompare(b.airline.name))
        break
      default:
        break
    }

    return result
  })

  const availableAirlines = computed(() => {
    const airlines = new Map()
    searchResults.value.forEach(flight => {
      if (!airlines.has(flight.airline.code)) {
        airlines.set(flight.airline.code, {
          code: flight.airline.code,
          name: flight.airline.name
        })
      }
    })
    return Array.from(airlines.values())
  })

  const priceRange = computed(() => {
    if (searchResults.value.length === 0) return [0, 2000]
    const prices = searchResults.value.map(flight => flight.price.total)
    return [Math.min(...prices), Math.max(...prices)]
  })

  const flightsByPrice = computed(() => {
    const grouped = {
      budget: filteredFlights.value.filter(f => f.price.total < 500),
      economy: filteredFlights.value.filter(f => f.price.total >= 500 && f.price.total < 1000),
      premium: filteredFlights.value.filter(f => f.price.total >= 1000)
    }
    return grouped
  })

  const searchStats = computed(() => {
    return {
      total: searchResults.value.length,
      filtered: filteredFlights.value.length,
      airlines: availableAirlines.value.length,
      priceRange: priceRange.value,
      avgPrice: searchResults.value.length > 0 
        ? Math.round(searchResults.value.reduce((sum, f) => sum + f.price.total, 0) / searchResults.value.length)
        : 0
    }
  })

  // Actions
  const searchFlights = async (criteria) => {
    loading.value = true
    searchCriteria.value = { ...criteria }
    lastSearchTime.value = new Date().toISOString()

    try {
      let searchResults = []

      if (useLiveData.value) {
        try {
          // Try to get live flight data
          searchResults = await liveDataService.getLiveFlights({
            origin: criteria.origin,
            destination: criteria.destination,
            date: criteria.departureDate,
            passengers: criteria.passengers,
            cabinClass: criteria.cabinClass
          })

          console.log(`Found ${searchResults.length} live flights`)
        } catch (error) {
          console.warn('Live data unavailable, using enhanced mock data:', error.message)
          // Fallback to enhanced mock data from airport service
          searchResults = await airportService.searchFlights(criteria)
        }
      } else {
        // Use enhanced mock data from airport service
        searchResults = await airportService.searchFlights(criteria)
      }

      // Process search results
      const processedResults = processFlightResults(searchResults, criteria)
      
      // Store results
      if (criteria.tripType === 'round-trip' && searchResults.return) {
        searchResults.value = {
          outbound: processedResults.outbound || processedResults,
          return: processedResults.return || []
        }
      } else {
        searchResults.value = processedResults.outbound || processedResults
      }

      // Add to search history
      addToSearchHistory(criteria, searchResults.value.length || processedResults.length)

      // Reset filters to default
      resetFilters()

      return { 
        success: true, 
        count: Array.isArray(searchResults.value) ? searchResults.value.length : searchResults.value.outbound?.length || 0,
        isLive: searchResults.some ? searchResults.some(f => f.isLive) : false
      }
    } catch (error) {
      console.error('Flight search error:', error)
      return { 
        success: false, 
        error: error.message || 'Search failed. Please try again.' 
      }
    } finally {
      loading.value = false
    }
  }

  // Process and enhance flight results
  const processFlightResults = (results, criteria) => {
    if (Array.isArray(results)) {
      return results.map(flight => enhanceFlightData(flight, criteria))
    } else if (results.outbound) {
      return {
        outbound: results.outbound.map(flight => enhanceFlightData(flight, criteria)),
        return: results.return ? results.return.map(flight => enhanceFlightData(flight, criteria)) : undefined
      }
    }
    return []
  }

  // Enhance flight data with additional computed fields
  const enhanceFlightData = (flight, criteria) => {
    return {
      ...flight,
      // Add display fields
      departureTime: formatTime(flight.departure.time),
      arrivalTime: formatTime(flight.arrival.time),
      departureDate: formatDate(flight.departure.time),
      arrivalDate: formatDate(flight.arrival.time),
      
      // Price in selected currency
      displayPrice: currencyStore.convertPrice(flight.price.total),
      currencySymbol: currencyStore.getCurrencySymbol(),
      
      // Stops information
      stopsCount: flight.stops?.length || 0,
      stopsText: flight.stops?.length === 0 ? 'Non-stop' : 
                flight.stops?.length === 1 ? '1 stop' : 
                `${flight.stops.length} stops`,
      
      // Duration formatting
      durationText: flight.duration.formatted || formatDuration(flight.duration.total),
      
      // Booking class availability
      hasAvailability: (flight.availability?.[criteria.cabinClass] || 0) > (criteria.passengers?.adults || 1),
      
      // Price comparison
      isGoodDeal: flight.price.total < (flight.originalPrice || flight.price.total * 1.2),
      
      // Airline logo path
      airlineLogo: `/airlines/${flight.airline.code.toLowerCase()}.png`,
      
      // Time-based info
      isDepartureMorning: new Date(flight.departure.time).getHours() < 12,
      isDepartureEvening: new Date(flight.departure.time).getHours() >= 18,
      isRedEye: new Date(flight.departure.time).getHours() >= 22 || new Date(flight.arrival.time).getHours() <= 6,
      
      // Search metadata
      searchedAt: new Date().toISOString(),
      searchCriteria: criteria
    }
  }

  // Utility functions
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Flight selection and booking
  const selectFlight = (flight) => {
    selectedFlight.value = flight
  }

  // Saved flights management
  const addToSavedFlights = (flight) => {
    const existingIndex = savedFlights.value.findIndex(f => f.id === flight.id)
    if (existingIndex === -1) {
      savedFlights.value.push({
        ...flight,
        savedAt: new Date().toISOString(),
        savedPrice: flight.price.total
      })
      localStorage.setItem('saved_flights', JSON.stringify(savedFlights.value))
      return true
    }
    return false
  }

  const removeFromSavedFlights = (flightId) => {
    const index = savedFlights.value.findIndex(f => f.id === flightId)
    if (index > -1) {
      savedFlights.value.splice(index, 1)
      localStorage.setItem('saved_flights', JSON.stringify(savedFlights.value))
      return true
    }
    return false
  }

  // Price alerts
  const addPriceAlert = (flightId, targetPrice) => {
    const alert = {
      id: Date.now().toString(),
      flightId,
      targetPrice,
      createdAt: new Date().toISOString(),
      isActive: true
    }
    priceAlerts.value.push(alert)
    localStorage.setItem('price_alerts', JSON.stringify(priceAlerts.value))
    return alert
  }

  const checkPriceAlerts = async () => {
    // Check current prices against saved alerts
    for (const alert of priceAlerts.value) {
      if (!alert.isActive) continue

      try {
        // In a real implementation, this would check current prices
        const flight = searchResults.value.find(f => f.id === alert.flightId)
        if (flight && flight.price.total <= alert.targetPrice) {
          // Trigger price drop notification
          console.log(`Price Alert: Flight ${flight.flightNumber} dropped to $${flight.price.total}!`)
          
          // You could integrate with a notification service here
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Price Drop Alert!`, {
              body: `Flight ${flight.flightNumber} is now $${flight.price.total}`,
              icon: flight.airlineLogo
            })
          }
        }
      } catch (error) {
        console.error('Error checking price alert:', error)
      }
    }
  }

  // Search history
  const addToSearchHistory = (criteria, resultCount) => {
    const historyItem = {
      id: Date.now(),
      origin: criteria.origin,
      destination: criteria.destination,
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate,
      passengers: criteria.passengers,
      cabinClass: criteria.cabinClass,
      tripType: criteria.tripType,
      resultCount,
      searchedAt: new Date().toISOString()
    }
    
    // Add to beginning and keep only last 20 searches
    searchHistory.value.unshift(historyItem)
    searchHistory.value = searchHistory.value.slice(0, 20)
    
    // Also save to localStorage for persistence
    localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
  }

  const getRecentSearches = () => {
    return searchHistory.value.slice(0, 10)
  }

  // Filters and sorting
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const updateSort = (sortOption) => {
    sortBy.value = sortOption
  }

  const resetFilters = () => {
    filters.value = {
      airline: '',
      stops: '',
      priceRange: priceRange.value.length > 0 ? priceRange.value : [0, 5000],
      timeOfDay: '',
      duration: ''
    }
  }

  // Airport suggestions using real airport service
  const getAirportSuggestions = (query) => {
    return airportService.searchAirports(query, 8)
  }

  const getPopularAirports = () => {
    return airportService.getPopularAirports()
  }

  // Flight status tracking
  const getFlightStatus = async (flightNumber, date) => {
    try {
      return await airportService.getFlightStatus(flightNumber, date)
    } catch (error) {
      console.error('Error fetching flight status:', error)
      return null
    }
  }

  // Price tracking
  const trackFlightPrices = async (origin, destination, departureDate) => {
    try {
      return await airportService.trackPrices(origin, destination, departureDate)
    } catch (error) {
      console.error('Error tracking flight prices:', error)
      return null
    }
  }

  // Data management
  const initializeFlightsData = () => {
    // Load saved data from localStorage
    const savedFlightsData = localStorage.getItem('saved_flights')
    if (savedFlightsData) {
      savedFlights.value = JSON.parse(savedFlightsData)
    }

    const priceAlertsData = localStorage.getItem('price_alerts')
    if (priceAlertsData) {
      priceAlerts.value = JSON.parse(priceAlertsData)
    }

    const searchHistoryData = localStorage.getItem('search_history')
    if (searchHistoryData) {
      searchHistory.value = JSON.parse(searchHistoryData)
    }

    // Initialize periodic price checking
    setInterval(checkPriceAlerts, 5 * 60 * 1000) // Check every 5 minutes
  }

  const clearSearch = () => {
    searchResults.value = []
    selectedFlight.value = null
    resetFilters()
    sortBy.value = 'price'
  }

  const toggleDataSource = (useLive = true) => {
    useLiveData.value = useLive
    console.log(`Data source switched to: ${useLive ? 'Live Data' : 'Mock Data'}`)
  }

  return {
    // State
    flights,
    searchCriteria,
    searchResults,
    selectedFlight,
    loading,
    filters,
    sortBy,
    savedFlights,
    priceAlerts,
    searchHistory,
    useLiveData,

    // Getters
    filteredFlights,
    availableAirlines,
    priceRange,
    flightsByPrice,
    searchStats,

    // Actions
    searchFlights,
    selectFlight,
    addToSavedFlights,
    removeFromSavedFlights,
    addPriceAlert,
    checkPriceAlerts,
    addToSearchHistory,
    getRecentSearches,
    updateFilters,
    updateSort,
    resetFilters,
    getAirportSuggestions,
    getPopularAirports,
    getFlightStatus,
    trackFlightPrices,
    initializeFlightsData,
    clearSearch,
    toggleDataSource
  }
})