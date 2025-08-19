import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePricePredictionStore = defineStore('pricePrediction', () => {
  // State
  const priceHistory = ref({})
  const predictions = ref({})
  const trendAnalysis = ref({})
  const seasonalData = ref({})
  const marketInsights = ref([])

  // Price prediction models
  const predictionModels = {
    linear: (prices) => {
      if (prices.length < 2) return null
      
      // Simple linear regression
      const n = prices.length
      const x = prices.map((_, i) => i)
      const y = prices.map(p => p.price)
      
      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
      const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n
      
      return { slope, intercept }
    },

    seasonal: (prices, days = 30) => {
      // Analyze seasonal patterns
      const seasonalFactors = {}
      const currentDate = new Date()
      
      // Group prices by day of week and month
      prices.forEach(price => {
        const date = new Date(price.date)
        const dayOfWeek = date.getDay()
        const month = date.getMonth()
        
        if (!seasonalFactors[dayOfWeek]) seasonalFactors[dayOfWeek] = []
        if (!seasonalFactors[`month_${month}`]) seasonalFactors[`month_${month}`] = []
        
        seasonalFactors[dayOfWeek].push(price.price)
        seasonalFactors[`month_${month}`].push(price.price)
      })
      
      return seasonalFactors
    },

    bookingWindow: (prices, departureDate) => {
      // Analyze how prices change based on booking window
      const departure = new Date(departureDate)
      const bookingWindows = {
        '1-7': [], '8-14': [], '15-30': [], '31-60': [], '60+': []
      }
      
      prices.forEach(price => {
        const priceDate = new Date(price.date)
        const daysUntilDeparture = Math.floor((departure - priceDate) / (1000 * 60 * 60 * 24))
        
        if (daysUntilDeparture <= 7) bookingWindows['1-7'].push(price.price)
        else if (daysUntilDeparture <= 14) bookingWindows['8-14'].push(price.price)
        else if (daysUntilDeparture <= 30) bookingWindows['15-30'].push(price.price)
        else if (daysUntilDeparture <= 60) bookingWindows['31-60'].push(price.price)
        else bookingWindows['60+'].push(price.price)
      })
      
      return bookingWindows
    }
  }

  // Mock historical price data generator
  const generateMockPriceHistory = (route, departureDate, days = 90) => {
    const prices = []
    const basePrice = getBasePriceForRoute(route)
    const departure = new Date(departureDate)
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Calculate price based on various factors
      let price = basePrice
      
      // Days until departure factor
      const daysUntilDeparture = Math.floor((departure - date) / (1000 * 60 * 60 * 24))
      if (daysUntilDeparture <= 7) price *= 1.4
      else if (daysUntilDeparture <= 14) price *= 1.2
      else if (daysUntilDeparture <= 30) price *= 1.1
      else if (daysUntilDeparture >= 60) price *= 0.85
      
      // Day of week factor
      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) price *= 1.15 // Weekend
      if (dayOfWeek === 2 || dayOfWeek === 3) price *= 0.95 // Tuesday/Wednesday
      
      // Seasonal factor
      const month = date.getMonth()
      if (month >= 5 && month <= 7) price *= 1.3 // Summer peak
      if (month === 11 || month === 0) price *= 1.25 // Holiday season
      
      // Add some randomness
      price *= (0.9 + Math.random() * 0.2)
      
      prices.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        daysUntilDeparture
      })
    }
    
    return prices
  }

  const getBasePriceForRoute = (route) => {
    const basePrices = {
      'JFK-LHR': 650, 'LHR-JFK': 650,
      'LAX-NRT': 850, 'NRT-LAX': 850,
      'JFK-CDG': 700, 'CDG-JFK': 700,
      'SFO-LHR': 750, 'LHR-SFO': 750,
      'MIA-MAD': 600, 'MAD-MIA': 600,
      'LAX-SYD': 1200, 'SYD-LAX': 1200,
      'JFK-FCO': 680, 'FCO-JFK': 680,
      'ORD-FRA': 720, 'FRA-ORD': 720
    }
    
    return basePrices[route] || 500
  }

  // Getters
  const getPriceHistory = (route, departureDate) => {
    const key = `${route}-${departureDate}`
    if (!priceHistory.value[key]) {
      priceHistory.value[key] = generateMockPriceHistory(route, departureDate)
    }
    return priceHistory.value[key]
  }

  const getCurrentPriceTrend = (route, departureDate) => {
    const history = getPriceHistory(route, departureDate)
    if (history.length < 7) return null
    
    const recent = history.slice(-7)
    const older = history.slice(-14, -7)
    
    const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, p) => sum + p.price, 0) / older.length : recentAvg
    
    const change = recentAvg - olderAvg
    const changePercent = (change / olderAvg) * 100
    
    return {
      trend: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      currentPrice: recent[recent.length - 1]?.price,
      recentAvg: Math.round(recentAvg),
      confidence: Math.min(95, 60 + history.length)
    }
  }

  // Actions
  const generatePrediction = (route, departureDate, currentPrice = null) => {
    const key = `${route}-${departureDate}`
    const history = getPriceHistory(route, departureDate)
    
    if (history.length === 0) return null
    
    const trend = getCurrentPriceTrend(route, departureDate)
    const linear = predictionModels.linear(history)
    const seasonal = predictionModels.seasonal(history)
    const bookingWindow = predictionModels.bookingWindow(history, departureDate)
    
    // Generate predictions for next 30 days
    const futurePredictions = []
    const basePrice = currentPrice || history[history.length - 1]?.price || getBasePriceForRoute(route)
    
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + i)
      
      let predictedPrice = basePrice
      
      // Apply trend
      if (linear && trend) {
        const trendFactor = trend.trend === 'increasing' ? 1.02 : trend.trend === 'decreasing' ? 0.98 : 1
        predictedPrice *= Math.pow(trendFactor, i)
      }
      
      // Apply seasonal factors
      const dayOfWeek = futureDate.getDay()
      const month = futureDate.getMonth()
      
      if (seasonal[dayOfWeek]) {
        const dayFactor = seasonal[dayOfWeek].reduce((a, b) => a + b, 0) / seasonal[dayOfWeek].length
        const avgPrice = history.reduce((a, b) => a + b.price, 0) / history.length
        predictedPrice *= (dayFactor / avgPrice)
      }
      
      // Booking window factor
      const departure = new Date(departureDate)
      const daysUntilDeparture = Math.floor((departure - futureDate) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDeparture <= 7) predictedPrice *= 1.3
      else if (daysUntilDeparture <= 14) predictedPrice *= 1.15
      else if (daysUntilDeparture <= 30) predictedPrice *= 1.05
      else if (daysUntilDeparture >= 60) predictedPrice *= 0.9
      
      // Add confidence interval
      const variance = Math.sqrt(history.reduce((sum, p) => sum + Math.pow(p.price - basePrice, 2), 0) / history.length)
      const confidenceInterval = variance * 0.5
      
      futurePredictions.push({
        date: futureDate.toISOString().split('T')[0],
        price: Math.round(predictedPrice),
        confidence: Math.max(30, Math.min(95, 90 - i * 2)),
        lowerBound: Math.round(predictedPrice - confidenceInterval),
        upperBound: Math.round(predictedPrice + confidenceInterval),
        daysUntilDeparture
      })
    }
    
    const prediction = {
      route,
      departureDate,
      currentPrice: basePrice,
      trend,
      predictions: futurePredictions,
      recommendation: generateRecommendation(trend, futurePredictions, departureDate),
      confidence: trend?.confidence || 70,
      lastUpdated: new Date().toISOString()
    }
    
    predictions.value[key] = prediction
    return prediction
  }

  const generateRecommendation = (trend, predictions, departureDate) => {
    if (!trend || !predictions.length) return null
    
    const departure = new Date(departureDate)
    const today = new Date()
    const daysUntilDeparture = Math.floor((departure - today) / (1000 * 60 * 60 * 24))
    
    // Find the best price in predictions
    const bestPrice = Math.min(...predictions.map(p => p.price))
    const bestPriceDay = predictions.find(p => p.price === bestPrice)
    
    let recommendation = {
      action: 'wait',
      confidence: trend.confidence,
      reason: '',
      bestTime: null,
      potentialSavings: 0
    }
    
    // Decision logic
    if (daysUntilDeparture <= 7) {
      recommendation.action = 'book_now'
      recommendation.reason = 'Prices typically increase significantly in the final week before departure'
    } else if (trend.trend === 'increasing' && trend.changePercent > 5) {
      recommendation.action = 'book_soon'
      recommendation.reason = `Prices are rising rapidly (${trend.changePercent.toFixed(1)}% increase recently)`
    } else if (trend.trend === 'decreasing') {
      recommendation.action = 'wait'
      recommendation.reason = `Prices are dropping. Best predicted price is $${bestPrice} on ${bestPriceDay?.date}`
      recommendation.bestTime = bestPriceDay?.date
      recommendation.potentialSavings = trend.currentPrice - bestPrice
    } else if (daysUntilDeparture > 60) {
      recommendation.action = 'wait'
      recommendation.reason = 'Booking window is optimal 2-8 weeks before departure'
    } else if (daysUntilDeparture >= 14 && daysUntilDeparture <= 56) {
      recommendation.action = 'book_now'
      recommendation.reason = 'You are in the optimal booking window (2-8 weeks before departure)'
    } else {
      recommendation.action = 'monitor'
      recommendation.reason = 'Prices are stable. Continue monitoring for better deals'
    }
    
    return recommendation
  }

  const getSeasonalInsights = (route) => {
    const insights = []
    const basePrice = getBasePriceForRoute(route)
    
    // Mock seasonal data
    const seasonalFactors = {
      'Peak Summer (Jun-Aug)': { factor: 1.4, description: 'Highest demand period' },
      'Holiday Season (Dec-Jan)': { factor: 1.3, description: 'Holiday travel premium' },
      'Spring (Mar-May)': { factor: 1.1, description: 'Moderate demand' },
      'Fall (Sep-Nov)': { factor: 0.9, description: 'Shoulder season deals' }
    }
    
    Object.entries(seasonalFactors).forEach(([season, data]) => {
      insights.push({
        period: season,
        avgPrice: Math.round(basePrice * data.factor),
        savings: Math.round(basePrice - (basePrice * data.factor)),
        description: data.description
      })
    })
    
    return insights
  }

  const getDayOfWeekInsights = (route) => {
    const basePrice = getBasePriceForRoute(route)
    const days = [
      { name: 'Sunday', factor: 1.15 },
      { name: 'Monday', factor: 1.05 },
      { name: 'Tuesday', factor: 0.95 },
      { name: 'Wednesday', factor: 0.92 },
      { name: 'Thursday', factor: 0.98 },
      { name: 'Friday', factor: 1.12 },
      { name: 'Saturday', factor: 1.18 }
    ]
    
    return days.map(day => ({
      day: day.name,
      avgPrice: Math.round(basePrice * day.factor),
      savings: Math.round(basePrice - (basePrice * day.factor)),
      recommendation: day.factor < 1 ? 'Best day to fly' : day.factor > 1.1 ? 'Avoid if possible' : 'Average pricing'
    }))
  }

  const getBookingWindowInsights = (route) => {
    const basePrice = getBasePriceForRoute(route)
    
    return [
      {
        window: '8+ weeks before',
        avgPrice: Math.round(basePrice * 0.85),
        description: 'Early bird pricing, but limited availability'
      },
      {
        window: '6-8 weeks before',
        avgPrice: Math.round(basePrice * 0.9),
        description: 'Good balance of price and availability'
      },
      {
        window: '2-6 weeks before',
        avgPrice: Math.round(basePrice),
        description: 'Optimal booking window - best prices'
      },
      {
        window: '1-2 weeks before',
        avgPrice: Math.round(basePrice * 1.2),
        description: 'Prices start rising significantly'
      },
      {
        window: 'Less than 1 week',
        avgPrice: Math.round(basePrice * 1.5),
        description: 'Last-minute premium pricing'
      }
    ]
  }

  const generateMarketInsights = () => {
    return [
      {
        type: 'fuel_prices',
        title: 'Fuel Cost Impact',
        description: 'Rising fuel costs may increase ticket prices by 8-12% over the next quarter',
        impact: 'negative',
        confidence: 75
      },
      {
        type: 'demand',
        title: 'Summer Travel Demand',
        description: 'Leisure travel demand expected to increase 25% for summer 2024',
        impact: 'negative',
        confidence: 85
      },
      {
        type: 'capacity',
        title: 'Route Capacity Changes',
        description: 'Airlines adding 15% more capacity on popular routes',
        impact: 'positive',
        confidence: 70
      },
      {
        type: 'competition',
        title: 'New Carrier Entry',
        description: 'Budget carrier launching services may reduce prices by 10-15%',
        impact: 'positive',
        confidence: 60
      }
    ]
  }

  const updatePrediction = async (route, departureDate) => {
    // Simulate API call to update prediction
    await new Promise(resolve => setTimeout(resolve, 1000))
    return generatePrediction(route, departureDate)
  }

  const trackPricePoint = (route, departureDate, price) => {
    const key = `${route}-${departureDate}`
    if (!priceHistory.value[key]) {
      priceHistory.value[key] = []
    }
    
    priceHistory.value[key].push({
      date: new Date().toISOString().split('T')[0],
      price,
      daysUntilDeparture: Math.floor((new Date(departureDate) - new Date()) / (1000 * 60 * 60 * 24))
    })
    
    // Regenerate prediction with new data
    return generatePrediction(route, departureDate, price)
  }

  return {
    // State
    priceHistory,
    predictions,
    trendAnalysis,
    seasonalData,
    marketInsights,

    // Getters
    getPriceHistory,
    getCurrentPriceTrend,

    // Actions
    generatePrediction,
    generateRecommendation,
    getSeasonalInsights,
    getDayOfWeekInsights,
    getBookingWindowInsights,
    generateMarketInsights,
    updatePrediction,
    trackPricePoint
  }
})