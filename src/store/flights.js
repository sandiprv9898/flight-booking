import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Mock flight data
const mockFlights = [
  {
    id: 'FL001',
    airline: 'British Airways',
    airlineCode: 'BA',
    flightNumber: 'BA178',
    aircraft: 'Boeing 777-300ER',
    origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    destination: { code: 'LHR', name: 'London Heathrow', city: 'London' },
    departure: { time: '08:30', date: '2024-03-15' },
    arrival: { time: '20:45', date: '2024-03-15' },
    duration: '7h 15m',
    stops: 0,
    price: 845,
    originalPrice: 920,
    cabinClass: 'Economy',
    availableSeats: 47,
    baggage: { checked: '23kg', carry: '8kg' },
    amenities: ['WiFi', 'Entertainment', 'Meals'],
    features: ['Extra Legroom', 'Priority Boarding']
  },
  {
    id: 'FL002',
    airline: 'Virgin Atlantic',
    airlineCode: 'VS',
    flightNumber: 'VS003',
    aircraft: 'Airbus A350-1000',
    origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    destination: { code: 'LHR', name: 'London Heathrow', city: 'London' },
    departure: { time: '14:20', date: '2024-03-15' },
    arrival: { time: '02:35', date: '2024-03-16' },
    duration: '7h 15m',
    stops: 0,
    price: 920,
    originalPrice: 1050,
    cabinClass: 'Economy',
    availableSeats: 23,
    baggage: { checked: '23kg', carry: '10kg' },
    amenities: ['WiFi', 'Entertainment', 'Premium Meals', 'Bar'],
    features: ['Mood Lighting', 'Premium Economy Option']
  },
  {
    id: 'FL003',
    airline: 'American Airlines',
    airlineCode: 'AA',
    flightNumber: 'AA100',
    aircraft: 'Boeing 777-200ER',
    origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    destination: { code: 'LHR', name: 'London Heathrow', city: 'London' },
    departure: { time: '22:15', date: '2024-03-15' },
    arrival: { time: '10:30', date: '2024-03-16' },
    duration: '7h 15m',
    stops: 0,
    price: 780,
    originalPrice: 780,
    cabinClass: 'Economy',
    availableSeats: 89,
    baggage: { checked: '23kg', carry: '8kg' },
    amenities: ['WiFi', 'Entertainment'],
    features: ['Red Eye Special']
  },
  {
    id: 'FL004',
    airline: 'Delta Airlines',
    airlineCode: 'DL',
    flightNumber: 'DL201',
    aircraft: 'Airbus A330-900neo',
    origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    destination: { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
    departure: { time: '10:45', date: '2024-03-15' },
    arrival: { time: '00:15', date: '2024-03-16' },
    duration: '7h 30m',
    stops: 0,
    price: 695,
    originalPrice: 780,
    cabinClass: 'Economy',
    availableSeats: 156,
    baggage: { checked: '23kg', carry: '8kg' },
    amenities: ['WiFi', 'Entertainment', 'Meals'],
    features: ['Delta One Available', 'Sky Club Access']
  },
  {
    id: 'FL005',
    airline: 'Lufthansa',
    airlineCode: 'LH',
    flightNumber: 'LH441',
    aircraft: 'Airbus A380-800',
    origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
    destination: { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
    departure: { time: '16:30', date: '2024-03-15' },
    arrival: { time: '06:45', date: '2024-03-16' },
    duration: '7h 15m',
    stops: 0,
    price: 1120,
    originalPrice: 1120,
    cabinClass: 'Business',
    availableSeats: 12,
    baggage: { checked: '32kg', carry: '8kg' },
    amenities: ['WiFi', 'Premium Entertainment', 'Premium Meals', 'Lounge Access'],
    features: ['Lie-flat Seats', 'Priority Check-in', 'A380 Experience']
  }
]

// Mock airports data
const mockAirports = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'US' },
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'GB' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'US' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'AE' },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'SG' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'JP' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU' },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', country: 'CA' }
]

export const useFlightsStore = defineStore('flights', () => {
  // State
  const flights = ref([...mockFlights])
  const searchCriteria = ref({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    cabinClass: 'economy',
    tripType: 'round-trip'
  })
  const searchResults = ref([])
  const selectedFlight = ref(null)
  const loading = ref(false)
  const filters = ref({
    airline: '',
    stops: '',
    priceRange: [0, 2000],
    timeOfDay: '',
    duration: ''
  })
  const sortBy = ref('price')
  const savedFlights = ref([])
  const priceAlerts = ref([])

  // Getters
  const filteredFlights = computed(() => {
    let result = [...searchResults.value]

    // Apply filters
    if (filters.value.airline) {
      result = result.filter(flight => flight.airlineCode === filters.value.airline)
    }

    if (filters.value.stops !== '') {
      const stops = parseInt(filters.value.stops)
      result = result.filter(flight => flight.stops === stops)
    }

    if (filters.value.priceRange) {
      result = result.filter(flight => 
        flight.price >= filters.value.priceRange[0] && 
        flight.price <= filters.value.priceRange[1]
      )
    }

    if (filters.value.timeOfDay) {
      result = result.filter(flight => {
        const hour = parseInt(flight.departure.time.split(':')[0])
        switch (filters.value.timeOfDay) {
          case 'morning': return hour >= 6 && hour < 12
          case 'afternoon': return hour >= 12 && hour < 18
          case 'evening': return hour >= 18 && hour < 24
          case 'night': return hour >= 0 && hour < 6
          default: return true
        }
      })
    }

    // Apply sorting
    switch (sortBy.value) {
      case 'price':
        result.sort((a, b) => a.price - b.price)
        break
      case 'duration':
        result.sort((a, b) => {
          const aDuration = parseInt(a.duration.replace(/[^\d]/g, ''))
          const bDuration = parseInt(b.duration.replace(/[^\d]/g, ''))
          return aDuration - bDuration
        })
        break
      case 'departure':
        result.sort((a, b) => a.departure.time.localeCompare(b.departure.time))
        break
      case 'airline':
        result.sort((a, b) => a.airline.localeCompare(b.airline))
        break
      default:
        break
    }

    return result
  })

  const availableAirlines = computed(() => {
    const airlines = new Set(searchResults.value.map(flight => ({
      code: flight.airlineCode,
      name: flight.airline
    })))
    return Array.from(airlines)
  })

  const priceRange = computed(() => {
    if (searchResults.value.length === 0) return [0, 2000]
    const prices = searchResults.value.map(flight => flight.price)
    return [Math.min(...prices), Math.max(...prices)]
  })

  const flightsByPrice = computed(() => {
    const grouped = {
      budget: filteredFlights.value.filter(f => f.price < 500),
      economy: filteredFlights.value.filter(f => f.price >= 500 && f.price < 1000),
      premium: filteredFlights.value.filter(f => f.price >= 1000)
    }
    return grouped
  })

  // Actions
  const searchFlights = async (criteria) => {
    loading.value = true
    searchCriteria.value = { ...criteria }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock search logic - filter flights based on criteria
      let results = mockFlights.filter(flight => {
        const matchesRoute = flight.origin.code.includes(criteria.origin.toUpperCase()) &&
                           flight.destination.code.includes(criteria.destination.toUpperCase())
        
        const matchesDate = flight.departure.date === criteria.departureDate
        
        return matchesRoute && matchesDate
      })

      // Add some variety with price fluctuations
      results = results.map(flight => ({
        ...flight,
        price: Math.round(flight.price * (0.85 + Math.random() * 0.3)),
        availableSeats: Math.floor(Math.random() * 200) + 10
      }))

      searchResults.value = results
      
      // Add to recent searches (stored in localStorage)
      addToRecentSearches(criteria)

      return { success: true, count: results.length }
    } catch (error) {
      console.error('Flight search error:', error)
      return { success: false, error: 'Search failed' }
    } finally {
      loading.value = false
    }
  }

  const selectFlight = (flight) => {
    selectedFlight.value = flight
  }

  const addToSavedFlights = (flight) => {
    const existingIndex = savedFlights.value.findIndex(f => f.id === flight.id)
    if (existingIndex === -1) {
      savedFlights.value.push({
        ...flight,
        savedAt: new Date().toISOString(),
        savedPrice: flight.price
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

  const checkPriceAlerts = () => {
    // In a real app, this would check current prices against saved alerts
    priceAlerts.value.forEach(alert => {
      const flight = flights.value.find(f => f.id === alert.flightId)
      if (flight && flight.price <= alert.targetPrice) {
        // Trigger notification
        console.log(`Price alert: Flight ${flight.flightNumber} is now $${flight.price}`)
      }
    })
  }

  const addToRecentSearches = (criteria) => {
    const recent = JSON.parse(localStorage.getItem('recent_searches') || '[]')
    const newSearch = {
      id: Date.now(),
      ...criteria,
      searchedAt: new Date().toISOString()
    }
    
    // Add to beginning and keep only last 10
    recent.unshift(newSearch)
    const uniqueSearches = recent.slice(0, 10)
    
    localStorage.setItem('recent_searches', JSON.stringify(uniqueSearches))
  }

  const getRecentSearches = () => {
    return JSON.parse(localStorage.getItem('recent_searches') || '[]')
  }

  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const updateSort = (sortOption) => {
    sortBy.value = sortOption
  }

  const getAirportSuggestions = (query) => {
    if (!query || query.length < 2) return []
    
    return mockAirports.filter(airport =>
      airport.code.toLowerCase().includes(query.toLowerCase()) ||
      airport.name.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase())
    )
  }

  const initializeFlightsData = () => {
    const savedFlightsData = localStorage.getItem('saved_flights')
    if (savedFlightsData) {
      savedFlights.value = JSON.parse(savedFlightsData)
    }

    const priceAlertsData = localStorage.getItem('price_alerts')
    if (priceAlertsData) {
      priceAlerts.value = JSON.parse(priceAlertsData)
    }
  }

  const clearSearch = () => {
    searchResults.value = []
    selectedFlight.value = null
    filters.value = {
      airline: '',
      stops: '',
      priceRange: [0, 2000],
      timeOfDay: '',
      duration: ''
    }
    sortBy.value = 'price'
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

    // Getters
    filteredFlights,
    availableAirlines,
    priceRange,
    flightsByPrice,

    // Actions
    searchFlights,
    selectFlight,
    addToSavedFlights,
    removeFromSavedFlights,
    addPriceAlert,
    checkPriceAlerts,
    addToRecentSearches,
    getRecentSearches,
    updateFilters,
    updateSort,
    getAirportSuggestions,
    initializeFlightsData,
    clearSearch
  }
})