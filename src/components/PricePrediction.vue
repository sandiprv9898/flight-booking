<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Price Predictions</h2>
        <p class="text-gray-600">AI-powered flight price forecasting and recommendations</p>
      </div>
      <Button 
        variant="outline"
        @click="refreshPredictions"
        :loading="loading"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </Button>
    </div>

    <!-- Search Form for Predictions -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Get Price Prediction</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
          <Input
            v-model="searchForm.origin"
            placeholder="Origin city"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
          <Input
            v-model="searchForm.destination"
            placeholder="Destination city"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
          <Input
            v-model="searchForm.departureDate"
            type="date"
          />
        </div>
        <div class="flex items-end">
          <Button @click="generatePrediction" class="w-full">
            Predict Prices
          </Button>
        </div>
      </div>
    </div>

    <!-- Current Prediction -->
    <div v-if="currentPrediction" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            {{ searchForm.origin }} → {{ searchForm.destination }}
          </h3>
          <p class="text-gray-600">
            Departure: {{ formatDate(searchForm.departureDate) }}
          </p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-500">Current Price</div>
          <div class="text-2xl font-bold text-gray-900">
            ${{ currentPrediction.currentPrice }}
          </div>
        </div>
      </div>

      <!-- Price Trend -->
      <div v-if="currentPrediction.trend" class="mb-6">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <div 
              class="w-3 h-3 rounded-full"
              :class="getTrendColor(currentPrediction.trend.trend)"
            ></div>
            <span class="font-medium text-gray-900 capitalize">
              {{ currentPrediction.trend.trend }} Trend
            </span>
          </div>
          <div class="text-sm text-gray-600">
            {{ Math.abs(currentPrediction.trend.changePercent) }}% 
            {{ currentPrediction.trend.trend === 'increasing' ? 'increase' : 'decrease' }} 
            recently
          </div>
          <div class="text-sm text-gray-500">
            {{ currentPrediction.trend.confidence }}% confidence
          </div>
        </div>
      </div>

      <!-- Recommendation -->
      <div v-if="currentPrediction.recommendation" class="mb-6">
        <div 
          class="p-4 rounded-lg border"
          :class="getRecommendationStyle(currentPrediction.recommendation.action)"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <component 
                :is="getRecommendationIcon(currentPrediction.recommendation.action)" 
                class="w-6 h-6"
              />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold capitalize mb-1">
                {{ currentPrediction.recommendation.action.replace('_', ' ') }}
              </h4>
              <p class="text-sm">{{ currentPrediction.recommendation.reason }}</p>
              <div v-if="currentPrediction.recommendation.bestTime" class="mt-2 text-sm font-medium">
                Best time to book: {{ formatDate(currentPrediction.recommendation.bestTime) }}
              </div>
              <div v-if="currentPrediction.recommendation.potentialSavings > 0" class="mt-1 text-sm">
                Potential savings: ${{ currentPrediction.recommendation.potentialSavings }}
              </div>
            </div>
            <div class="flex-shrink-0 text-right">
              <div class="text-xs text-gray-500">Confidence</div>
              <div class="font-semibold">{{ currentPrediction.recommendation.confidence }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Price Chart -->
      <div class="mb-6">
        <h4 class="font-medium text-gray-900 mb-3">30-Day Price Forecast</h4>
        <div class="h-64 bg-gray-50 rounded-lg p-4">
          <div class="space-y-2">
            <div 
              v-for="(prediction, index) in currentPrediction.predictions.slice(0, 10)" 
              :key="prediction.date"
              class="flex items-center justify-between text-sm"
            >
              <div class="flex items-center space-x-3">
                <div class="w-20 text-gray-600">
                  {{ formatShortDate(prediction.date) }}
                </div>
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getPriceBarColor(prediction.price, currentPrediction.currentPrice)"
                    :style="{ width: `${Math.min(100, (prediction.confidence / 100) * 100)}%` }"
                  ></div>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <span class="font-medium text-gray-900">
                  ${{ prediction.price }}
                </span>
                <span 
                  class="text-xs px-2 py-1 rounded-full"
                  :class="prediction.confidence > 80 ? 'bg-green-100 text-green-800' : 
                          prediction.confidence > 60 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'"
                >
                  {{ prediction.confidence }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Historical Prices -->
      <div v-if="priceHistory.length > 0">
        <h4 class="font-medium text-gray-900 mb-3">Price History (Last 30 Days)</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="price in priceHistory.slice(-8)" 
            :key="price.date"
            class="text-center p-3 bg-gray-50 rounded-lg"
          >
            <div class="text-sm text-gray-500">{{ formatShortDate(price.date) }}</div>
            <div class="text-lg font-semibold text-gray-900">${{ price.price }}</div>
            <div class="text-xs text-gray-500">
              {{ price.daysUntilDeparture }} days out
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights Tabs -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="tab in insightTabs"
            :key="tab.id"
            @click="activeInsightTab = tab.id"
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
            :class="activeInsightTab === tab.id 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Seasonal Insights -->
        <div v-if="activeInsightTab === 'seasonal'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Seasonal Price Patterns</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="insight in seasonalInsights" 
              :key="insight.period"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <h4 class="font-medium text-gray-900">{{ insight.period }}</h4>
              <p class="text-2xl font-bold text-gray-900 mt-2">${{ insight.avgPrice }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ insight.description }}</p>
              <p 
                v-if="insight.savings !== 0"
                :class="insight.savings > 0 ? 'text-green-600' : 'text-red-600'"
                class="text-sm mt-2"
              >
                {{ insight.savings > 0 ? `Save $${insight.savings}` : `+$${Math.abs(insight.savings)}` }}
              </p>
            </div>
          </div>
        </div>

        <!-- Day of Week Insights -->
        <div v-if="activeInsightTab === 'dayofweek'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Best Days to Fly</h3>
          <div class="space-y-3">
            <div 
              v-for="day in dayOfWeekInsights" 
              :key="day.day"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center space-x-4">
                <div class="w-20 font-medium text-gray-900">{{ day.day }}</div>
                <div class="text-2xl font-bold text-gray-900">${{ day.avgPrice }}</div>
                <span 
                  class="text-sm px-2 py-1 rounded-full"
                  :class="day.savings > 0 ? 'bg-green-100 text-green-800' :
                          day.savings < 0 ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'"
                >
                  {{ day.savings > 0 ? `Save $${day.savings}` : day.savings < 0 ? `+$${Math.abs(day.savings)}` : 'Average' }}
                </span>
              </div>
              <div class="text-sm text-gray-600">{{ day.recommendation }}</div>
            </div>
          </div>
        </div>

        <!-- Booking Window Insights -->
        <div v-if="activeInsightTab === 'booking'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Best Time to Book</h3>
          <div class="space-y-3">
            <div 
              v-for="window in bookingWindowInsights" 
              :key="window.window"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="font-medium text-gray-900">{{ window.window }}</h4>
                <span class="text-2xl font-bold text-gray-900">${{ window.avgPrice }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ window.description }}</p>
            </div>
          </div>
        </div>

        <!-- Market Insights -->
        <div v-if="activeInsightTab === 'market'" class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Market Intelligence</h3>
          <div class="space-y-4">
            <div 
              v-for="insight in marketInsights" 
              :key="insight.type"
              class="p-4 border border-gray-200 rounded-lg"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <h4 class="font-medium text-gray-900">{{ insight.title }}</h4>
                    <span 
                      class="text-xs px-2 py-1 rounded-full"
                      :class="insight.impact === 'positive' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'"
                    >
                      {{ insight.impact === 'positive' ? '↓ Lower Prices' : '↑ Higher Prices' }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ insight.description }}</p>
                </div>
                <div class="text-right ml-4">
                  <div class="text-sm text-gray-500">Confidence</div>
                  <div class="font-semibold text-gray-900">{{ insight.confidence }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePricePredictionStore } from '@/store/pricePrediction'
import Button from './ui/Button.vue'
import Input from './ui/Input.vue'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  EyeIcon 
} from '@heroicons/vue/24/outline'

const predictionStore = usePricePredictionStore()

// State
const loading = ref(false)
const searchForm = ref({
  origin: 'JFK',
  destination: 'LHR', 
  departureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
})
const currentPrediction = ref(null)
const activeInsightTab = ref('seasonal')

const insightTabs = [
  { id: 'seasonal', name: 'Seasonal Trends' },
  { id: 'dayofweek', name: 'Day of Week' },
  { id: 'booking', name: 'Booking Window' },
  { id: 'market', name: 'Market Intelligence' }
]

// Computed
const priceHistory = computed(() => {
  if (!currentPrediction.value) return []
  const route = `${searchForm.value.origin}-${searchForm.value.destination}`
  return predictionStore.getPriceHistory(route, searchForm.value.departureDate)
})

const seasonalInsights = computed(() => {
  const route = `${searchForm.value.origin}-${searchForm.value.destination}`
  return predictionStore.getSeasonalInsights(route)
})

const dayOfWeekInsights = computed(() => {
  const route = `${searchForm.value.origin}-${searchForm.value.destination}`
  return predictionStore.getDayOfWeekInsights(route)
})

const bookingWindowInsights = computed(() => {
  const route = `${searchForm.value.origin}-${searchForm.value.destination}`
  return predictionStore.getBookingWindowInsights(route)
})

const marketInsights = computed(() => predictionStore.generateMarketInsights())

// Methods
const generatePrediction = async () => {
  loading.value = true
  try {
    const route = `${searchForm.value.origin}-${searchForm.value.destination}`
    currentPrediction.value = predictionStore.generatePrediction(route, searchForm.value.departureDate)
  } finally {
    loading.value = false
  }
}

const refreshPredictions = async () => {
  if (!currentPrediction.value) return
  
  loading.value = true
  try {
    const route = `${searchForm.value.origin}-${searchForm.value.destination}`
    currentPrediction.value = await predictionStore.updatePrediction(route, searchForm.value.departureDate)
  } finally {
    loading.value = false
  }
}

const getTrendColor = (trend) => {
  switch (trend) {
    case 'increasing': return 'bg-red-500'
    case 'decreasing': return 'bg-green-500'
    default: return 'bg-yellow-500'
  }
}

const getRecommendationIcon = (action) => {
  switch (action) {
    case 'book_now': return CheckCircleIcon
    case 'book_soon': return ExclamationTriangleIcon
    case 'wait': return ClockIcon
    default: return EyeIcon
  }
}

const getRecommendationStyle = (action) => {
  switch (action) {
    case 'book_now':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'book_soon':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    case 'wait':
      return 'bg-blue-50 border-blue-200 text-blue-800'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800'
  }
}

const getPriceBarColor = (price, currentPrice) => {
  if (price < currentPrice * 0.9) return 'bg-green-500'
  if (price > currentPrice * 1.1) return 'bg-red-500'
  return 'bg-blue-500'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // Generate initial prediction
  generatePrediction()
})
</script>