import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { currencies, convertCurrency, formatCurrency, getCurrencyOptions } from '@/utils/currency'

export const useCurrencyStore = defineStore('currency', () => {
  // State
  const currentCurrency = ref('USD')
  const baseCurrency = ref('USD') // All prices are stored in USD
  const exchangeRates = ref({})
  const lastUpdated = ref(null)

  // Getters
  const availableCurrencies = computed(() => getCurrencyOptions())
  const currentCurrencyInfo = computed(() => currencies[currentCurrency.value])
  
  const isBaseCurrency = computed(() => currentCurrency.value === baseCurrency.value)

  // Actions
  const setCurrency = (currencyCode) => {
    if (currencies[currencyCode]) {
      currentCurrency.value = currencyCode
      localStorage.setItem('selected_currency', currencyCode)
    }
  }

  const loadSavedCurrency = () => {
    const saved = localStorage.getItem('selected_currency')
    if (saved && currencies[saved]) {
      currentCurrency.value = saved
    }
  }

  const convertPrice = (price, fromCurrency = baseCurrency.value) => {
    return convertCurrency(price, fromCurrency, currentCurrency.value)
  }

  const formatPrice = (price, options = {}) => {
    const convertedPrice = convertPrice(price, options.fromCurrency)
    return formatCurrency(convertedPrice, currentCurrency.value, options)
  }

  const formatPriceWithOriginal = (price, originalCurrency = baseCurrency.value) => {
    if (currentCurrency.value === originalCurrency) {
      return formatPrice(price)
    }
    
    const convertedPrice = convertPrice(price, originalCurrency)
    const originalFormatted = formatCurrency(price, originalCurrency)
    const convertedFormatted = formatCurrency(convertedPrice, currentCurrency.value)
    
    return `${convertedFormatted} (${originalFormatted})`
  }

  const updateExchangeRates = async () => {
    try {
      // In production, this would fetch from a real API
      // For now, we use the static rates from currency.js
      const rates = {}
      
      for (const [code, currency] of Object.entries(currencies)) {
        rates[code] = currency.rate
      }
      
      exchangeRates.value = rates
      lastUpdated.value = new Date().toISOString()
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update exchange rates:', error)
      return { success: false, error: error.message }
    }
  }

  const getCurrencySymbol = (currencyCode = currentCurrency.value) => {
    return currencies[currencyCode]?.symbol || '$'
  }

  const initializeCurrency = async (userCurrency = null) => {
    // Load saved currency first
    loadSavedCurrency()
    
    // Use user's preferred currency if provided
    if (userCurrency && currencies[userCurrency]) {
      setCurrency(userCurrency)
    }
    
    // Update exchange rates
    await updateExchangeRates()
  }

  return {
    // State
    currentCurrency,
    baseCurrency,
    exchangeRates,
    lastUpdated,

    // Getters
    availableCurrencies,
    currentCurrencyInfo,
    isBaseCurrency,

    // Actions
    setCurrency,
    loadSavedCurrency,
    convertPrice,
    formatPrice,
    formatPriceWithOriginal,
    updateExchangeRates,
    getCurrencySymbol,
    initializeCurrency
  }
})