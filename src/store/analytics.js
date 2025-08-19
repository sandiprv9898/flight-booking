import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State
  const userMetrics = ref({
    totalBookings: 0,
    totalSpent: 0,
    totalMiles: 0,
    averageBookingValue: 0,
    preferredDestinations: [],
    preferredAirlines: [],
    bookingsByMonth: [],
    savingsFromDeals: 0,
    carbonFootprint: 0,
    memberSince: null
  })

  const bookingAnalytics = ref({
    searchToBookingRate: 0,
    averageSearchTime: 0,
    popularRoutes: [],
    seasonalTrends: [],
    priceAlertsSaved: 0,
    abandonedBookings: 0,
    deviceUsage: {
      desktop: 0,
      mobile: 0,
      tablet: 0
    }
  })

  const performanceMetrics = ref({
    pageLoadTimes: [],
    searchResponseTimes: [],
    bookingCompletionTime: 0,
    errorRates: [],
    userSatisfactionScore: 0
  })

  // Mock data for demonstration
  const mockUserData = ref({
    bookings: [
      {
        id: 'BK001',
        date: '2024-03-15',
        route: 'JFK-LHR',
        airline: 'British Airways',
        amount: 845,
        miles: 3500,
        carbon: 1.2,
        bookingTime: 8, // minutes
        searchCount: 5
      },
      {
        id: 'BK002',
        date: '2024-02-20',
        route: 'LAX-NRT',
        airline: 'Japan Airlines',
        amount: 1250,
        miles: 5800,
        carbon: 2.1,
        bookingTime: 12,
        searchCount: 8
      },
      {
        id: 'BK003',
        date: '2024-01-10',
        route: 'MIA-CDG',
        airline: 'Air France',
        amount: 720,
        miles: 4200,
        carbon: 1.8,
        bookingTime: 6,
        searchCount: 3
      },
      {
        id: 'BK004',
        date: '2023-12-05',
        route: 'SFO-LHR',
        airline: 'Virgin Atlantic',
        amount: 920,
        miles: 5400,
        carbon: 2.3,
        bookingTime: 15,
        searchCount: 12
      },
      {
        id: 'BK005',
        date: '2023-11-18',
        route: 'JFK-FCO',
        airline: 'Alitalia',
        amount: 680,
        miles: 4100,
        carbon: 1.6,
        bookingTime: 9,
        searchCount: 6
      }
    ],
    searches: [
      { date: '2024-03-20', route: 'JFK-LHR', converted: false },
      { date: '2024-03-18', route: 'LAX-SYD', converted: false },
      { date: '2024-03-15', route: 'JFK-LHR', converted: true },
      { date: '2024-03-12', route: 'MIA-MAD', converted: false },
      { date: '2024-03-10', route: 'ORD-FRA', converted: false }
    ]
  })

  // Getters
  const totalBookingsCount = computed(() => mockUserData.value.bookings.length)
  
  const totalAmountSpent = computed(() => 
    mockUserData.value.bookings.reduce((sum, booking) => sum + booking.amount, 0)
  )
  
  const averageBookingValue = computed(() => 
    totalBookingsCount.value > 0 ? Math.round(totalAmountSpent.value / totalBookingsCount.value) : 0
  )
  
  const totalMilesFlown = computed(() => 
    mockUserData.value.bookings.reduce((sum, booking) => sum + booking.miles, 0)
  )
  
  const totalCarbonFootprint = computed(() => 
    mockUserData.value.bookings.reduce((sum, booking) => sum + booking.carbon, 0)
  )

  const favoriteAirlines = computed(() => {
    const airlines = {}
    mockUserData.value.bookings.forEach(booking => {
      airlines[booking.airline] = (airlines[booking.airline] || 0) + 1
    })
    
    return Object.entries(airlines)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([airline, count]) => ({ airline, count }))
  })

  const popularRoutes = computed(() => {
    const routes = {}
    mockUserData.value.bookings.forEach(booking => {
      routes[booking.route] = (routes[booking.route] || 0) + 1
    })
    
    return Object.entries(routes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }))
  })

  const bookingTrends = computed(() => {
    const trends = {}
    mockUserData.value.bookings.forEach(booking => {
      const month = new Date(booking.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      trends[month] = (trends[month] || 0) + 1
    })
    
    return Object.entries(trends)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, count }))
  })

  const spendingTrends = computed(() => {
    const trends = {}
    mockUserData.value.bookings.forEach(booking => {
      const month = new Date(booking.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      trends[month] = (trends[month] || 0) + booking.amount
    })
    
    return Object.entries(trends)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, amount]) => ({ month, amount }))
  })

  const averageBookingTime = computed(() => {
    const totalTime = mockUserData.value.bookings.reduce((sum, booking) => sum + booking.bookingTime, 0)
    return totalBookingsCount.value > 0 ? Math.round(totalTime / totalBookingsCount.value) : 0
  })

  const conversionRate = computed(() => {
    const totalSearches = mockUserData.value.searches.length
    const convertedSearches = mockUserData.value.searches.filter(search => search.converted).length
    return totalSearches > 0 ? Math.round((convertedSearches / totalSearches) * 100) : 0
  })

  const sustainabilityMetrics = computed(() => {
    const avgCarbon = totalCarbonFootprint.value / totalBookingsCount.value || 0
    const totalOffset = totalCarbonFootprint.value * 0.1 // Assume 10% carbon offset
    
    return {
      totalCarbon: Math.round(totalCarbonFootprint.value * 100) / 100,
      averagePerTrip: Math.round(avgCarbon * 100) / 100,
      carbonOffset: Math.round(totalOffset * 100) / 100,
      treesPlanted: Math.round(totalOffset * 50), // 1 ton CO2 = ~50 trees
      ecoFriendlyScore: Math.max(1, Math.min(5, 5 - (avgCarbon / 0.5))) // Scale 1-5
    }
  })

  const yearOverYearGrowth = computed(() => {
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1
    
    const currentYearBookings = mockUserData.value.bookings.filter(
      booking => new Date(booking.date).getFullYear() === currentYear
    )
    
    const lastYearBookings = mockUserData.value.bookings.filter(
      booking => new Date(booking.date).getFullYear() === lastYear
    )
    
    const currentYearSpent = currentYearBookings.reduce((sum, b) => sum + b.amount, 0)
    const lastYearSpent = lastYearBookings.reduce((sum, b) => sum + b.amount, 0)
    
    return {
      bookingsGrowth: lastYearBookings.length > 0 ? 
        Math.round(((currentYearBookings.length - lastYearBookings.length) / lastYearBookings.length) * 100) : 0,
      spendingGrowth: lastYearSpent > 0 ? 
        Math.round(((currentYearSpent - lastYearSpent) / lastYearSpent) * 100) : 0
    }
  })

  // Actions
  const initializeAnalytics = (userId) => {
    // In a real app, this would load from API
    calculateUserMetrics()
  }

  const calculateUserMetrics = () => {
    userMetrics.value = {
      totalBookings: totalBookingsCount.value,
      totalSpent: totalAmountSpent.value,
      totalMiles: totalMilesFlown.value,
      averageBookingValue: averageBookingValue.value,
      preferredDestinations: popularRoutes.value,
      preferredAirlines: favoriteAirlines.value,
      bookingsByMonth: bookingTrends.value,
      savingsFromDeals: Math.round(totalAmountSpent.value * 0.15), // Assume 15% savings
      carbonFootprint: totalCarbonFootprint.value,
      memberSince: '2023-01-15'
    }
  }

  const trackSearchEvent = (searchParams) => {
    // Track search behavior
    mockUserData.value.searches.unshift({
      date: new Date().toISOString().split('T')[0],
      route: `${searchParams.origin}-${searchParams.destination}`,
      converted: false,
      timestamp: Date.now()
    })
  }

  const trackBookingEvent = (bookingData) => {
    // Mark latest search as converted
    if (mockUserData.value.searches.length > 0) {
      mockUserData.value.searches[0].converted = true
    }

    // Add booking to history
    mockUserData.value.bookings.unshift({
      ...bookingData,
      date: new Date().toISOString().split('T')[0],
      bookingTime: Math.round(Math.random() * 15) + 3, // Random 3-18 minutes
      searchCount: Math.round(Math.random() * 10) + 1
    })

    // Recalculate metrics
    calculateUserMetrics()
  }

  const getTopDestinations = (limit = 5) => {
    return popularRoutes.value.slice(0, limit)
  }

  const getSpendingInsights = () => {
    const avgMonthlySpend = totalAmountSpent.value / Math.max(1, bookingTrends.value.length)
    const peakSpendingMonth = spendingTrends.value.reduce((max, month) => 
      month.amount > max.amount ? month : max, { month: 'N/A', amount: 0 }
    )
    
    return {
      averageMonthlySpend: Math.round(avgMonthlySpend),
      peakSpendingMonth: peakSpendingMonth.month,
      peakSpendingAmount: peakSpendingMonth.amount,
      projectedYearlySpend: Math.round(avgMonthlySpend * 12)
    }
  }

  const generateInsights = () => {
    const insights = []
    
    // Booking frequency insight
    if (totalBookingsCount.value > 3) {
      insights.push({
        type: 'frequency',
        title: 'Frequent Traveler',
        message: `You've made ${totalBookingsCount.value} bookings! Consider our premium membership for exclusive benefits.`,
        action: 'View Premium Plans'
      })
    }
    
    // Spending insight
    if (averageBookingValue.value > 800) {
      insights.push({
        type: 'spending',
        title: 'High-Value Traveler',
        message: `Your average booking value is $${averageBookingValue.value}. Unlock lounge access with our Gold tier.`,
        action: 'Upgrade Membership'
      })
    }
    
    // Route preference insight
    if (favoriteAirlines.value.length > 0) {
      const topAirline = favoriteAirlines.value[0]
      insights.push({
        type: 'preference',
        title: 'Airline Loyalty',
        message: `You've booked ${topAirline.count} flights with ${topAirline.airline}. Check out their loyalty program.`,
        action: 'Learn More'
      })
    }
    
    // Environmental insight
    const sustainability = sustainabilityMetrics.value
    if (sustainability.ecoFriendlyScore < 3) {
      insights.push({
        type: 'environmental',
        title: 'Carbon Footprint',
        message: `Your carbon footprint is ${sustainability.totalCarbon} tons CO2. Consider carbon offset programs.`,
        action: 'Offset Carbon'
      })
    }
    
    return insights
  }

  return {
    // State
    userMetrics,
    bookingAnalytics,
    performanceMetrics,
    mockUserData,

    // Getters
    totalBookingsCount,
    totalAmountSpent,
    averageBookingValue,
    totalMilesFlown,
    totalCarbonFootprint,
    favoriteAirlines,
    popularRoutes,
    bookingTrends,
    spendingTrends,
    averageBookingTime,
    conversionRate,
    sustainabilityMetrics,
    yearOverYearGrowth,

    // Actions
    initializeAnalytics,
    calculateUserMetrics,
    trackSearchEvent,
    trackBookingEvent,
    getTopDestinations,
    getSpendingInsights,
    generateInsights
  }
})