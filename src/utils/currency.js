// Currency conversion utilities and configuration

export const currencies = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1, position: 'before' },
  EUR: { symbol: '€', name: 'Euro', rate: 0.92, position: 'before' },
  GBP: { symbol: '£', name: 'British Pound', rate: 0.79, position: 'before' },
  JPY: { symbol: '¥', name: 'Japanese Yen', rate: 149.50, position: 'before' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', rate: 7.24, position: 'before' },
  INR: { symbol: '₹', name: 'Indian Rupee', rate: 83.12, position: 'before' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.36, position: 'before' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', rate: 1.52, position: 'before' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', rate: 1.34, position: 'before' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67, position: 'after' }
}

// Get exchange rates (in production, this would call an API)
export const getExchangeRate = async (from, to) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100))
  
  if (from === to) return 1
  
  const fromRate = currencies[from]?.rate || 1
  const toRate = currencies[to]?.rate || 1
  
  return toRate / fromRate
}

// Convert amount between currencies
export const convertCurrency = (amount, from, to) => {
  if (!amount || from === to) return amount
  
  const fromRate = currencies[from]?.rate || 1
  const toRate = currencies[to]?.rate || 1
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate
  return Math.round(usdAmount * toRate * 100) / 100
}

// Format currency with proper symbol and position
export const formatCurrency = (amount, currencyCode = 'USD', options = {}) => {
  const currency = currencies[currencyCode]
  if (!currency) return `${amount}`
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: options.decimals ?? 2,
    maximumFractionDigits: options.decimals ?? 2
  }).format(amount)
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount} ${currency.symbol}`
  }
}

// Format price range
export const formatPriceRange = (min, max, currencyCode = 'USD') => {
  if (min === max) {
    return formatCurrency(min, currencyCode)
  }
  return `${formatCurrency(min, currencyCode)} - ${formatCurrency(max, currencyCode)}`
}

// Get currency options for select dropdowns
export const getCurrencyOptions = () => {
  return Object.entries(currencies).map(([code, currency]) => ({
    value: code,
    label: `${code} - ${currency.name}`,
    symbol: currency.symbol
  }))
}

// Detect user's currency based on location (mock implementation)
export const detectUserCurrency = async () => {
  try {
    // In production, this would use geolocation API
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Simple mapping based on timezone
    if (timezone.includes('America')) return 'USD'
    if (timezone.includes('Europe/London')) return 'GBP'
    if (timezone.includes('Europe')) return 'EUR'
    if (timezone.includes('Asia/Tokyo')) return 'JPY'
    if (timezone.includes('Asia/Shanghai')) return 'CNY'
    if (timezone.includes('Asia/Kolkata')) return 'INR'
    if (timezone.includes('Asia/Dubai')) return 'AED'
    if (timezone.includes('Asia/Singapore')) return 'SGD'
    if (timezone.includes('Australia')) return 'AUD'
    if (timezone.includes('Canada')) return 'CAD'
    
    return 'USD' // Default
  } catch {
    return 'USD'
  }
}

// Currency conversion hook for Vue components
export const useCurrency = () => {
  const convert = (amount, from, to) => convertCurrency(amount, from, to)
  const format = (amount, code, options) => formatCurrency(amount, code, options)
  const getRate = async (from, to) => await getExchangeRate(from, to)
  
  return {
    currencies,
    convert,
    format,
    getRate,
    getCurrencyOptions
  }
}