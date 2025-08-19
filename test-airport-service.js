// Quick test script to verify airport service functionality
import airportService from './src/services/airportService.js'

console.log('🛫 Testing Airport Service...\n')

// Test 1: Get airport by code
console.log('Test 1: Get JFK airport details')
const jfk = airportService.getAirport('JFK')
console.log(jfk)
console.log('')

// Test 2: Search airports
console.log('Test 2: Search for "London" airports')
const londonAirports = airportService.searchAirports('London')
console.log(londonAirports)
console.log('')

// Test 3: Get popular airports
console.log('Test 3: Popular airports')
const popular = airportService.getPopularAirports()
console.log(popular.slice(0, 3)) // Show first 3
console.log('')

// Test 4: Mock flight search
console.log('Test 4: Mock flight search (JFK to LHR)')
try {
  const flightResults = await airportService.searchFlights({
    origin: 'JFK',
    destination: 'LHR',
    departureDate: '2024-12-25',
    passengers: { adults: 2, children: 0 },
    cabinClass: 'economy'
  })
  
  console.log(`Found ${flightResults.outbound?.length || 0} flights`)
  if (flightResults.outbound?.length > 0) {
    console.log('Sample flight:', {
      airline: flightResults.outbound[0].airline.name,
      flightNumber: flightResults.outbound[0].flightNumber,
      price: flightResults.outbound[0].price.total,
      departure: flightResults.outbound[0].departure.time,
      duration: flightResults.outbound[0].duration.formatted
    })
  }
} catch (error) {
  console.log('Flight search test failed:', error.message)
}

console.log('\n✅ Airport service tests completed!')