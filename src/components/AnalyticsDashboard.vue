<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Travel Analytics</h2>
      <p class="text-gray-600">Insights into your travel patterns and preferences</p>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Flights</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalBookingsCount }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H12V2.5L19 9Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Spent</p>
            <p class="text-2xl font-bold text-gray-900">${{ totalAmountSpent.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,11A1,1 0 0,0 13,12A1,1 0 0,0 12,13A1,1 0 0,0 11,12A1,1 0 0,0 12,11M12.5,2C17,2 20.75,5.75 20.75,10.25C20.75,15.6 16.39,21.74 12.53,21.93C12.36,21.96 12.18,21.96 12,21.96C11.82,21.96 11.64,21.95 11.47,21.93C7.61,21.74 3.25,15.6 3.25,10.25C3.25,5.75 7,2 11.5,2H12.5Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Miles Traveled</p>
            <p class="text-2xl font-bold text-gray-900">{{ totalMilesFlown.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"/>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Avg. Booking</p>
            <p class="text-2xl font-bold text-gray-900">${{ averageBookingValue }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Booking Trends Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
        <div class="space-y-3">
          <div 
            v-for="trend in bookingTrends" 
            :key="trend.month"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-gray-600">{{ trend.month }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(trend.count / Math.max(...bookingTrends.map(t => t.count))) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-6">{{ trend.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Spending Trends Chart -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
        <div class="space-y-3">
          <div 
            v-for="spend in spendingTrends" 
            :key="spend.month"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-gray-600">{{ spend.month }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${(spend.amount / Math.max(...spendingTrends.map(s => s.amount))) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-16">${{ spend.amount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences and Insights -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Favorite Airlines -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Favorite Airlines</h3>
        <div class="space-y-3">
          <div 
            v-for="airline in favoriteAirlines.slice(0, 5)" 
            :key="airline.airline"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-gray-700">{{ airline.airline }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-1.5">
                <div 
                  class="bg-blue-500 h-1.5 rounded-full"
                  :style="{ width: `${(airline.count / favoriteAirlines[0]?.count || 1) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-6">{{ airline.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Popular Routes -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Popular Routes</h3>
        <div class="space-y-3">
          <div 
            v-for="route in popularRoutes.slice(0, 5)" 
            :key="route.route"
            class="flex items-center justify-between"
          >
            <span class="text-sm text-gray-700 font-mono">{{ route.route }}</span>
            <div class="flex items-center space-x-2">
              <div class="w-20 bg-gray-200 rounded-full h-1.5">
                <div 
                  class="bg-purple-500 h-1.5 rounded-full"
                  :style="{ width: `${(route.count / popularRoutes[0]?.count || 1) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-900 w-6">{{ route.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sustainability Metrics -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Sustainability</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Carbon Footprint</span>
            <span class="text-sm font-medium text-gray-900">{{ sustainabilityMetrics.totalCarbon }} tons CO₂</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Avg. per Trip</span>
            <span class="text-sm font-medium text-gray-900">{{ sustainabilityMetrics.averagePerTrip }} tons</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Trees to Plant</span>
            <span class="text-sm font-medium text-green-600">{{ sustainabilityMetrics.treesPlanted }}</span>
          </div>
          <div class="mt-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">Eco-Friendly Score</span>
              <span class="text-sm font-medium text-gray-900">
                {{ sustainabilityMetrics.ecoFriendlyScore.toFixed(1) }}/5
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-green-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(sustainabilityMetrics.ecoFriendlyScore / 5) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights and Recommendations -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Personal Insights</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="insight in personalInsights" 
          :key="insight.type"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <div :class="getInsightIconClass(insight.type)" class="w-8 h-8 rounded-lg flex items-center justify-center">
                <component :is="getInsightIcon(insight.type)" class="w-4 h-4" />
              </div>
            </div>
            <div class="flex-1">
              <h4 class="font-medium text-gray-900">{{ insight.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ insight.message }}</p>
              <button 
                v-if="insight.action"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                {{ insight.action }} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Booking Behavior</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-primary-600">{{ conversionRate }}%</div>
          <div class="text-sm text-gray-600 mt-1">Search to Booking Rate</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-green-600">{{ averageBookingTime }}m</div>
          <div class="text-sm text-gray-600 mt-1">Avg. Booking Time</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600">{{ yearOverYearGrowth.spendingGrowth }}%</div>
          <div class="text-sm text-gray-600 mt-1">YoY Spending Growth</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAnalyticsStore } from '@/store/analytics'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  TrophyIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const analyticsStore = useAnalyticsStore()

// Computed properties
const totalBookingsCount = computed(() => analyticsStore.totalBookingsCount)
const totalAmountSpent = computed(() => analyticsStore.totalAmountSpent)
const averageBookingValue = computed(() => analyticsStore.averageBookingValue)
const totalMilesFlown = computed(() => analyticsStore.totalMilesFlown)
const favoriteAirlines = computed(() => analyticsStore.favoriteAirlines)
const popularRoutes = computed(() => analyticsStore.popularRoutes)
const bookingTrends = computed(() => analyticsStore.bookingTrends)
const spendingTrends = computed(() => analyticsStore.spendingTrends)
const averageBookingTime = computed(() => analyticsStore.averageBookingTime)
const conversionRate = computed(() => analyticsStore.conversionRate)
const sustainabilityMetrics = computed(() => analyticsStore.sustainabilityMetrics)
const yearOverYearGrowth = computed(() => analyticsStore.yearOverYearGrowth)

const personalInsights = computed(() => analyticsStore.generateInsights())

// Methods
const getInsightIcon = (type) => {
  const icons = {
    frequency: ChartBarIcon,
    spending: CurrencyDollarIcon,
    preference: TrophyIcon,
    environmental: GlobeAltIcon,
    performance: SparklesIcon
  }
  return icons[type] || ExclamationTriangleIcon
}

const getInsightIconClass = (type) => {
  const classes = {
    frequency: 'bg-blue-100 text-blue-600',
    spending: 'bg-green-100 text-green-600',
    preference: 'bg-yellow-100 text-yellow-600',
    environmental: 'bg-emerald-100 text-emerald-600',
    performance: 'bg-purple-100 text-purple-600'
  }
  return classes[type] || 'bg-gray-100 text-gray-600'
}
</script>