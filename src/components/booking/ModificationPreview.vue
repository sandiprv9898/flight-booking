<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Review Your Changes</h2>
      <button
        @click="$emit('cancel')"
        class="text-gray-400 hover:text-gray-500"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Changes Summary -->
    <div class="space-y-6">
      <!-- Flight Change Preview -->
      <div v-if="modificationType === 'flight'" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Flight Change</h3>
        
        <!-- Current Flight -->
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 class="font-medium text-red-800 mb-2">Current Flight (Will be cancelled)</h4>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div class="text-red-700">Flight</div>
              <div class="font-medium">{{ changes.oldFlight.flightNumber }}</div>
            </div>
            <div>
              <div class="text-red-700">Departure</div>
              <div class="font-medium">{{ formatDateTime(changes.oldFlight.departure.time) }}</div>
            </div>
            <div>
              <div class="text-red-700">Price</div>
              <div class="font-medium">${{ changes.oldFlight.price.total }}</div>
            </div>
          </div>
        </div>
        
        <!-- New Flight -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 class="font-medium text-green-800 mb-2">New Flight</h4>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div class="text-green-700">Flight</div>
              <div class="font-medium">{{ changes.newFlight.flightNumber }}</div>
            </div>
            <div>
              <div class="text-green-700">Departure</div>
              <div class="font-medium">{{ formatDateTime(changes.newFlight.departure.time) }}</div>
            </div>
            <div>
              <div class="text-green-700">Price</div>
              <div class="font-medium">${{ changes.newFlight.price.total }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Change Preview -->
      <div v-if="modificationType === 'date'" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Date Change</h3>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="text-blue-700">Current Date</div>
              <div class="font-medium">{{ formatDate(changes.oldDate) }}</div>
            </div>
            <div>
              <div class="text-blue-700">New Date</div>
              <div class="font-medium">{{ formatDate(changes.newDate) }}</div>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-sm text-yellow-800">
            <strong>Note:</strong> We'll search for the same flight on your new travel date. 
            If not available, we'll find the closest alternative.
          </p>
        </div>
      </div>

      <!-- Passenger Info Change Preview -->
      <div v-if="modificationType === 'passenger'" class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900">Passenger Information Changes</h3>
        
        <div class="space-y-3">
          <div
            v-for="passenger in changes.passengers.filter(p => p.changed)"
            :key="passenger.id"
            class="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h4 class="font-medium text-blue-800 mb-2">Passenger {{ passenger.id }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div class="text-blue-700">Current Name</div>
                <div class="font-medium">{{ getOriginalName(passenger.id) }}</div>
              </div>
              <div>
                <div class="text-blue-700">New Name</div>
                <div class="font-medium">{{ passenger.firstName }} {{ passenger.lastName }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p class="text-sm text-yellow-800">
            <strong>Important:</strong> Name changes may require additional verification. 
            Please ensure names match your travel documents exactly.
          </p>
        </div>
      </div>

      <!-- Cost Breakdown -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Cost Breakdown</h3>
        
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>Modification Fee</span>
              <span>${{ getModificationFee() }}</span>
            </div>
            
            <div v-if="getPriceDifference() !== 0" class="flex justify-between">
              <span>Price Difference</span>
              <span :class="getPriceDifference() > 0 ? 'text-red-600' : 'text-green-600'">
                {{ getPriceDifference() > 0 ? '+' : '' }}${{ Math.abs(getPriceDifference()) }}
              </span>
            </div>
            
            <div v-if="getPriceDifference() < 0" class="flex justify-between text-green-600">
              <span>Refund Amount</span>
              <span>${{ Math.abs(getPriceDifference()) }}</span>
            </div>
            
            <div class="border-t pt-2 flex justify-between font-medium text-lg">
              <span>Total {{ totalCost > 0 ? 'Additional Cost' : 'Refund' }}</span>
              <span :class="totalCost > 0 ? 'text-red-600' : 'text-green-600'">
                {{ totalCost > 0 ? '$' + totalCost : '$' + Math.abs(totalCost) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Method Selection (if cost > 0) -->
      <div v-if="totalCost > 0" class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        
        <div class="space-y-3">
          <label
            v-for="method in paymentMethods"
            :key="method.id"
            class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
            :class="selectedPaymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <input
              v-model="selectedPaymentMethod"
              :value="method.id"
              type="radio"
              class="text-blue-600 focus:ring-blue-500"
            />
            <div class="ml-3 flex-1">
              <div class="font-medium">{{ method.name }}</div>
              <div class="text-sm text-gray-500">{{ method.description }}</div>
            </div>
            <div v-if="method.icon" class="text-2xl">{{ method.icon }}</div>
          </label>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
        
        <div class="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
          <div class="flex items-start">
            <input
              v-model="agreedToTerms"
              type="checkbox"
              class="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <label class="ml-2 text-gray-700">
              I understand that modification fees are non-refundable and that the new booking 
              is subject to the airline's current terms and conditions.
            </label>
          </div>
          
          <div class="flex items-start">
            <input
              v-model="agreedToCancellation"
              type="checkbox"
              class="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <label class="ml-2 text-gray-700">
              I understand that my original booking will be cancelled and cannot be restored.
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 mt-8 pt-6 border-t">
      <button
        @click="$emit('cancel')"
        class="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      
      <button
        @click="confirmChanges"
        :disabled="!canConfirm"
        :class="[
          'flex-1 px-4 py-2 rounded-lg transition-colors',
          canConfirm
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        ]"
      >
        <span v-if="processing" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
        <span v-else>
          Confirm Changes ({{ totalCost > 0 ? '$' + totalCost : 'Free' }})
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  },
  modificationType: {
    type: String,
    required: true
  },
  changes: {
    type: Object,
    required: true
  },
  totalCost: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// Reactive data
const selectedPaymentMethod = ref('card')
const agreedToTerms = ref(false)
const agreedToCancellation = ref(false)
const processing = ref(false)

// Payment methods
const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳'
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    description: 'Apple Pay, Google Pay, PayPal',
    icon: '📱'
  }
]

// Computed properties
const canConfirm = computed(() => {
  if (props.totalCost > 0) {
    return agreedToTerms.value && agreedToCancellation.value && selectedPaymentMethod.value
  }
  return agreedToTerms.value && agreedToCancellation.value
})

// Methods
const getModificationFee = () => {
  const fees = {
    flight: 75,
    date: 50,
    seat: 25,
    passenger: 100
  }
  return fees[props.modificationType] || 0
}

const getPriceDifference = () => {
  if (props.modificationType === 'flight' && props.changes.newFlight) {
    return props.changes.newFlight.price.total - props.changes.oldFlight.price.total
  }
  return 0
}

const getOriginalName = (passengerId) => {
  const passenger = props.booking.passengers.find(p => p.id === passengerId)
  return passenger ? `${passenger.firstName} ${passenger.lastName}` : 'Unknown'
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return `${date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })} ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })}`
}

const confirmChanges = async () => {
  if (!canConfirm.value) return
  
  processing.value = true
  
  try {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const paymentMethod = props.totalCost > 0 ? selectedPaymentMethod.value : null
    emit('confirm', paymentMethod)
  } catch (error) {
    console.error('Error confirming changes:', error)
  } finally {
    processing.value = false
  }
}
</script>