import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useSavedSearchesStore = defineStore('savedSearches', () => {
  // State
  const savedSearches = ref([])
  const priceAlerts = ref([])
  const searchHistory = ref([])
  const quickSearches = ref([])

  // Mock data for demonstration
  const mockSavedSearches = ref([
    {
      id: 'ss001',
      name: 'NYC to London',
      searchParams: {
        origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
        destination: { code: 'LHR', name: 'London Heathrow', city: 'London' },
        departureDate: '2024-04-15',
        returnDate: '2024-04-25',
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'economy',
        tripType: 'round-trip'
      },
      createdAt: '2024-03-10T10:30:00Z',
      lastSearched: '2024-03-15T14:20:00Z',
      searchCount: 8,
      priceAlert: {
        enabled: true,
        maxPrice: 800,
        currentPrice: 850,
        priceChange: 25,
        lastChecked: '2024-03-15T14:20:00Z'
      }
    },
    {
      id: 'ss002',
      name: 'Business Trip to Tokyo',
      searchParams: {
        origin: { code: 'SFO', name: 'San Francisco International', city: 'San Francisco' },
        destination: { code: 'NRT', name: 'Narita International', city: 'Tokyo' },
        departureDate: '2024-05-10',
        returnDate: null,
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'business',
        tripType: 'one-way'
      },
      createdAt: '2024-03-08T16:45:00Z',
      lastSearched: '2024-03-14T09:15:00Z',
      searchCount: 12,
      priceAlert: {
        enabled: true,
        maxPrice: 2500,
        currentPrice: 2350,
        priceChange: -150,
        lastChecked: '2024-03-14T09:15:00Z'
      }
    },
    {
      id: 'ss003',
      name: 'Family Vacation Europe',
      searchParams: {
        origin: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
        destination: { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
        departureDate: '2024-07-01',
        returnDate: '2024-07-15',
        passengers: { adults: 2, children: 2, infants: 0 },
        cabinClass: 'economy',
        tripType: 'round-trip'
      },
      createdAt: '2024-03-05T12:00:00Z',
      lastSearched: '2024-03-12T18:30:00Z',
      searchCount: 5,
      priceAlert: {
        enabled: false,
        maxPrice: null,
        currentPrice: 1240,
        priceChange: 0,
        lastChecked: '2024-03-12T18:30:00Z'
      }
    }
  ])

  const mockSearchHistory = ref([
    {
      id: 'sh001',
      searchParams: {
        origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
        destination: { code: 'LHR', name: 'London Heathrow', city: 'London' },
        departureDate: '2024-04-15',
        returnDate: '2024-04-25',
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'economy',
        tripType: 'round-trip'
      },
      searchedAt: '2024-03-15T14:20:00Z',
      resultsFound: 45,
      lowestPrice: 650,
      converted: false
    },
    {
      id: 'sh002',
      searchParams: {
        origin: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
        destination: { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
        departureDate: '2024-06-20',
        returnDate: null,
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'premium',
        tripType: 'one-way'
      },
      searchedAt: '2024-03-14T11:45:00Z',
      resultsFound: 23,
      lowestPrice: 1850,
      converted: false
    }
  ])

  // Quick searches for popular routes
  const popularQuickSearches = ref([
    {
      id: 'qs001',
      name: 'NYC ⇄ London',
      route: 'JFK-LHR',
      searchParams: {
        origin: { code: 'JFK', name: 'John F. Kennedy International', city: 'New York' },
        destination: { code: 'LHR', name: 'London Heathrow', city: 'London' },
        tripType: 'round-trip',
        cabinClass: 'economy'
      },
      popularity: 95
    },
    {
      id: 'qs002',
      name: 'LA ⇄ Tokyo',
      route: 'LAX-NRT',
      searchParams: {
        origin: { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
        destination: { code: 'NRT', name: 'Narita International', city: 'Tokyo' },
        tripType: 'round-trip',
        cabinClass: 'economy'
      },
      popularity: 88
    }
  ])

  // Getters
  const activeSavedSearches = computed(() => 
    savedSearches.value.filter(search => search.priceAlert?.enabled)
  )

  const inactiveSavedSearches = computed(() => 
    savedSearches.value.filter(search => !search.priceAlert?.enabled)
  )

  const recentSearches = computed(() => 
    searchHistory.value
      .sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt))
      .slice(0, 5)
  )

  const priceDropAlerts = computed(() =>
    savedSearches.value.filter(search => 
      search.priceAlert?.enabled && 
      search.priceAlert.priceChange < 0
    )
  )

  const searchesNeedingAttention = computed(() =>
    savedSearches.value.filter(search => {
      if (!search.priceAlert?.enabled) return false
      
      // Price dropped below alert threshold
      if (search.priceAlert.currentPrice <= search.priceAlert.maxPrice) return true
      
      // Haven't searched in over a week
      const lastSearched = new Date(search.lastSearched)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (lastSearched < weekAgo) return true
      
      return false
    })
  )

  // Actions
  const initializeSavedSearches = (userId) => {
    // Load saved searches for user
    const saved = localStorage.getItem(`saved_searches_${userId}`)
    if (saved) {
      savedSearches.value = JSON.parse(saved)
    } else {
      savedSearches.value = mockSavedSearches.value
    }

    // Load search history
    const history = localStorage.getItem(`search_history_${userId}`)
    if (history) {
      searchHistory.value = JSON.parse(history)
    } else {
      searchHistory.value = mockSearchHistory.value
    }

    quickSearches.value = popularQuickSearches.value
  }

  const saveSearch = (searchParams, name = null) => {
    const authStore = useAuthStore()
    if (!authStore.user) return { success: false, error: 'User not authenticated' }

    // Generate name if not provided
    if (!name) {
      const origin = searchParams.origin?.city || searchParams.origin?.code
      const destination = searchParams.destination?.city || searchParams.destination?.code
      const tripType = searchParams.tripType === 'round-trip' ? '⇄' : '→'
      name = `${origin} ${tripType} ${destination}`
    }

    // Check if similar search already exists
    const existingSearch = savedSearches.value.find(search => 
      search.searchParams.origin?.code === searchParams.origin?.code &&
      search.searchParams.destination?.code === searchParams.destination?.code &&
      search.searchParams.tripType === searchParams.tripType
    )

    if (existingSearch) {
      return { success: false, error: 'Similar search already saved' }
    }

    const newSearch = {
      id: `ss${Date.now()}`,
      name,
      searchParams: { ...searchParams },
      createdAt: new Date().toISOString(),
      lastSearched: new Date().toISOString(),
      searchCount: 1,
      priceAlert: {
        enabled: false,
        maxPrice: null,
        currentPrice: null,
        priceChange: 0,
        lastChecked: new Date().toISOString()
      }
    }

    savedSearches.value.unshift(newSearch)
    saveToPersistentStorage()

    return { success: true, search: newSearch }
  }

  const deleteSearch = (searchId) => {
    const index = savedSearches.value.findIndex(search => search.id === searchId)
    if (index !== -1) {
      savedSearches.value.splice(index, 1)
      saveToPersistentStorage()
      return { success: true }
    }
    return { success: false, error: 'Search not found' }
  }

  const updateSearch = (searchId, updates) => {
    const search = savedSearches.value.find(s => s.id === searchId)
    if (!search) return { success: false, error: 'Search not found' }

    Object.assign(search, updates)
    saveToPersistentStorage()

    return { success: true, search }
  }

  const setPriceAlert = (searchId, alertSettings) => {
    const search = savedSearches.value.find(s => s.id === searchId)
    if (!search) return { success: false, error: 'Search not found' }

    search.priceAlert = {
      ...search.priceAlert,
      ...alertSettings,
      lastChecked: new Date().toISOString()
    }

    saveToPersistentStorage()
    return { success: true, search }
  }

  const addToSearchHistory = (searchParams, results) => {
    const historyEntry = {
      id: `sh${Date.now()}`,
      searchParams: { ...searchParams },
      searchedAt: new Date().toISOString(),
      resultsFound: results?.length || 0,
      lowestPrice: results?.length > 0 ? Math.min(...results.map(r => r.price)) : null,
      converted: false
    }

    searchHistory.value.unshift(historyEntry)

    // Keep only last 100 searches
    if (searchHistory.value.length > 100) {
      searchHistory.value = searchHistory.value.slice(0, 100)
    }

    // Update search count for saved searches
    const matchingSavedSearch = savedSearches.value.find(search => 
      search.searchParams.origin?.code === searchParams.origin?.code &&
      search.searchParams.destination?.code === searchParams.destination?.code
    )

    if (matchingSavedSearch) {
      matchingSavedSearch.searchCount++
      matchingSavedSearch.lastSearched = new Date().toISOString()
    }

    saveToPersistentStorage()
  }

  const repeatSearch = (searchId) => {
    const search = savedSearches.value.find(s => s.id === searchId)
    if (!search) return null

    // Update last searched time and count
    search.lastSearched = new Date().toISOString()
    search.searchCount++
    saveToPersistentStorage()

    return search.searchParams
  }

  const getSearchSuggestions = (partial) => {
    // Return suggestions based on search history and saved searches
    const suggestions = []

    // From saved searches
    savedSearches.value
      .filter(search => 
        search.name.toLowerCase().includes(partial.toLowerCase()) ||
        search.searchParams.origin?.city?.toLowerCase().includes(partial.toLowerCase()) ||
        search.searchParams.destination?.city?.toLowerCase().includes(partial.toLowerCase())
      )
      .forEach(search => {
        suggestions.push({
          type: 'saved',
          id: search.id,
          text: search.name,
          searchParams: search.searchParams
        })
      })

    // From search history
    const uniqueRoutes = new Set()
    searchHistory.value.forEach(history => {
      const route = `${history.searchParams.origin?.code}-${history.searchParams.destination?.code}`
      if (!uniqueRoutes.has(route)) {
        uniqueRoutes.add(route)
        const origin = history.searchParams.origin?.city || history.searchParams.origin?.code
        const destination = history.searchParams.destination?.city || history.searchParams.destination?.code
        const text = `${origin} → ${destination}`
        
        if (text.toLowerCase().includes(partial.toLowerCase())) {
          suggestions.push({
            type: 'history',
            text,
            searchParams: history.searchParams
          })
        }
      }
    })

    return suggestions.slice(0, 10)
  }

  const simulatePriceCheck = async () => {
    // Import notifications store when needed
    const { useNotificationsStore } = await import('./notifications')
    const notificationsStore = useNotificationsStore()

    // Simulate checking prices for saved searches with alerts
    for (const search of activeSavedSearches.value) {
      // Simulate price fluctuation
      const currentPrice = search.priceAlert.currentPrice || 800
      const priceChange = Math.round((Math.random() - 0.5) * 200) // Random change ±$100
      const newPrice = Math.max(200, currentPrice + priceChange)
      
      const oldPrice = search.priceAlert.currentPrice
      search.priceAlert.currentPrice = newPrice
      search.priceAlert.priceChange = priceChange
      search.priceAlert.lastChecked = new Date().toISOString()

      // Generate notifications for significant price changes
      if (oldPrice && Math.abs(priceChange) > 50) {
        const route = `${search.searchParams.origin?.city || search.searchParams.origin?.code} → ${search.searchParams.destination?.city || search.searchParams.destination?.code}`
        
        if (priceChange < 0) {
          // Price dropped
          notificationsStore.addNotification({
            type: 'PRICE_DROP',
            title: `Price Alert - ${route}`,
            message: `Great news! The price has dropped by $${Math.abs(priceChange)}. New price: $${newPrice}`,
            actionable: true,
            actions: [
              { label: 'View Flights', action: 'view_flights', data: { searchId: search.id } },
              { label: 'Book Now', action: 'book_now', data: { searchId: search.id } }
            ],
            metadata: {
              searchId: search.id,
              oldPrice,
              newPrice,
              priceChange,
              route
            }
          })
        } else {
          // Price increased
          notificationsStore.addNotification({
            type: 'PRICE_INCREASE',
            title: `Price Alert - ${route}`,
            message: `Price has increased by $${priceChange}. Current price: $${newPrice}`,
            actionable: true,
            actions: [
              { label: 'View Flights', action: 'view_flights', data: { searchId: search.id } }
            ],
            metadata: {
              searchId: search.id,
              oldPrice,
              newPrice,
              priceChange,
              route
            }
          })
        }

        // Check if price dropped below alert threshold
        if (search.priceAlert.maxPrice && newPrice <= search.priceAlert.maxPrice) {
          notificationsStore.addNotification({
            type: 'PRICE_DROP',
            title: `Price Alert Triggered - ${route}`,
            message: `Price dropped below your alert threshold! Current price: $${newPrice} (Target: $${search.priceAlert.maxPrice})`,
            actionable: true,
            actions: [
              { label: 'View Flights', action: 'view_flights', data: { searchId: search.id } },
              { label: 'Book Now', action: 'book_now', data: { searchId: search.id } }
            ],
            metadata: {
              searchId: search.id,
              targetPrice: search.priceAlert.maxPrice,
              currentPrice: newPrice,
              route
            }
          })
        }
      }
    }
    
    saveToPersistentStorage()
  }

  const saveToPersistentStorage = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return

    localStorage.setItem(`saved_searches_${authStore.user.id}`, JSON.stringify(savedSearches.value))
    localStorage.setItem(`search_history_${authStore.user.id}`, JSON.stringify(searchHistory.value))
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    saveToPersistentStorage()
  }

  const exportSavedSearches = () => {
    const data = {
      savedSearches: savedSearches.value,
      searchHistory: searchHistory.value,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flight-searches-export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    // State
    savedSearches,
    priceAlerts,
    searchHistory,
    quickSearches,

    // Getters
    activeSavedSearches,
    inactiveSavedSearches,
    recentSearches,
    priceDropAlerts,
    searchesNeedingAttention,

    // Actions
    initializeSavedSearches,
    saveSearch,
    deleteSearch,
    updateSearch,
    setPriceAlert,
    addToSearchHistory,
    repeatSearch,
    getSearchSuggestions,
    simulatePriceCheck,
    saveToPersistentStorage,
    clearSearchHistory,
    exportSavedSearches
  }
})