<template>
  <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
    <div class="p-6 border-b border-neutral-200 bg-neutral-50">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-warning-600 rounded-lg flex items-center justify-center">
          <PencilSquareIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-neutral-900">Manage Your Booking</h2>
          <p class="text-sm text-neutral-600">Change or cancel your flight booking</p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Booking Information -->
      <div class="bg-neutral-50 rounded-lg p-4 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-neutral-900">{{ booking.flight.airline }} {{ booking.flight.flightNumber }}</h3>
            <p class="text-sm text-neutral-600">Booking Reference: {{ booking.bookingReference }}</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-neutral-600">{{ formatDate(booking.flight.departure.date) }}</div>
            <div class="font-medium">{{ booking.flight.departure.time }} → {{ booking.flight.arrival.time }}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-neutral-600">Route:</span>
            <span class="font-medium ml-1">{{ booking.flight.origin.code }} → {{ booking.flight.destination.code }}</span>
          </div>
          <div>
            <span class="text-neutral-600">Passengers:</span>
            <span class="font-medium ml-1">{{ booking.passengers.length }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Change Flight -->
        <div class="border border-neutral-200 rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-4">
            <ArrowPathIcon class="w-6 h-6 text-primary-600" />
            <h4 class="font-semibold text-neutral-900">Change Flight</h4>
          </div>
          
          <p class="text-sm text-neutral-600 mb-4">
            Modify your departure date, time, or destination
          </p>
          
          <div class="space-y-3 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-neutral-600">Change fee:</span>
              <span class="font-medium">${changeFee}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-600">Fare difference:</span>
              <span class="font-medium">From $0</span>
            </div>
          </div>
          
          <Button 
            variant="primary" 
            class="w-full"
            :loading="changing"
            @click="initializeFlightChange"
          >
            Change Flight
          </Button>
          
          <p class="text-xs text-neutral-500 mt-2">
            * Changes are subject to availability and fare rules
          </p>
        </div>

        <!-- Cancel Flight -->
        <div class="border border-neutral-200 rounded-lg p-6">
          <div class="flex items-center space-x-3 mb-4">
            <XCircleIcon class="w-6 h-6 text-error-600" />
            <h4 class="font-semibold text-neutral-900">Cancel Booking</h4>
          </div>
          
          <p class="text-sm text-neutral-600 mb-4">
            Cancel your booking and receive a refund
          </p>
          
          <div class="space-y-3 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-neutral-600">Cancellation fee:</span>
              <span class="font-medium">${cancellationFee}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-600">Refund amount:</span>
              <span class="font-medium text-success-600">${refundAmount}</span>
            </div>
          </div>
          
          <Button 
            variant="secondary" 
            class="w-full border-error-300 text-error-700 hover:bg-error-50"
            :loading="cancelling"
            @click="showCancelModal = true"
          >
            Cancel Booking
          </Button>
          
          <p class="text-xs text-neutral-500 mt-2">
            * Refund processed within 7-10 business days
          </p>
        </div>
      </div>

      <!-- Policy Information -->
      <div class="mt-8 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <h4 class="font-semibold text-primary-900 mb-2 flex items-center">
          <InformationCircleIcon class="w-5 h-5 mr-2" />
          Important Information
        </h4>
        <ul class="text-sm text-primary-800 space-y-1">
          <li>• Changes and cancellations are subject to airline policies</li>
          <li>• Fees may vary based on fare type and timing</li>
          <li>• Some tickets may be non-refundable</li>
          <li>• Changes within 24 hours of departure may incur additional fees</li>
        </ul>
      </div>
    </div>

    <!-- Cancellation Confirmation Modal -->
    <div 
      v-if="showCancelModal" 
      class="fixed inset-0 bg-neutral-600 bg-opacity-50 flex items-center justify-center z-50"
      @click="showCancelModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4" @click.stop>
        <div class="text-center">
          <ExclamationTriangleIcon class="w-16 h-16 text-error-600 mx-auto mb-4" />
          <h3 class="text-lg font-bold text-neutral-900 mb-2">Cancel Booking?</h3>
          <p class="text-neutral-600 mb-6">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          
          <div class="text-sm text-neutral-700 mb-6 p-3 bg-neutral-50 rounded">
            <div class="flex justify-between mb-1">
              <span>Original amount:</span>
              <span>${booking.pricing.total}</span>
            </div>
            <div class="flex justify-between mb-1">
              <span>Cancellation fee:</span>
              <span>-${cancellationFee}</span>
            </div>
            <div class="flex justify-between font-semibold border-t pt-1">
              <span>Refund amount:</span>
              <span class="text-success-600">${refundAmount}</span>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <Button 
              variant="secondary" 
              class="flex-1"
              @click="showCancelModal = false"
            >
              Keep Booking
            </Button>
            <Button 
              variant="primary" 
              class="flex-1 bg-error-600 hover:bg-error-700"
              :loading="cancelling"
              @click="confirmCancellation"
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import { 
  PencilSquareIcon,
  ArrowPathIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['booking-changed', 'booking-cancelled'])

const changing = ref(false)
const cancelling = ref(false)
const showCancelModal = ref(false)

// Calculate fees based on booking date and current date
const changeFee = computed(() => {
  const bookingDate = new Date(props.booking.createdAt)
  const departureDate = new Date(props.booking.flight.departure.date)
  const now = new Date()
  
  const daysUntilDeparture = Math.ceil((departureDate - now) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDeparture > 7) {
    return 50 // Low change fee for advance changes
  } else if (daysUntilDeparture > 1) {
    return 150 // Higher fee for last-minute changes
  } else {
    return 250 // Highest fee for same-day changes
  }
})

const cancellationFee = computed(() => {
  const departureDate = new Date(props.booking.flight.departure.date)
  const now = new Date()
  
  const daysUntilDeparture = Math.ceil((departureDate - now) / (1000 * 60 * 60 * 24))
  
  if (daysUntilDeparture > 7) {
    return 75 // Low cancellation fee
  } else if (daysUntilDeparture > 1) {
    return 200 // Higher fee for last-minute cancellation
  } else {
    return 300 // Highest fee for same-day cancellation
  }
})

const refundAmount = computed(() => {
  return Math.max(0, props.booking.pricing.total - cancellationFee.value)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const initializeFlightChange = () => {
  changing.value = true
  
  // Simulate navigation to change flow
  setTimeout(() => {
    changing.value = false
    alert('Flight change feature - Redirecting to search with change parameters...')
    // In a real app, this would navigate to a specialized change flow
    router.push({
      path: '/search',
      query: {
        change: 'true',
        bookingId: props.booking.id,
        origin: props.booking.flight.origin.code,
        destination: props.booking.flight.destination.code
      }
    })
  }, 1000)
}

const confirmCancellation = async () => {
  cancelling.value = true
  
  try {
    // Simulate API call for cancellation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Emit cancellation event
    emit('booking-cancelled', {
      bookingId: props.booking.id,
      refundAmount: refundAmount.value,
      cancellationFee: cancellationFee.value
    })
    
    showCancelModal.value = false
    
    alert(`Booking cancelled successfully! Refund of $${refundAmount.value} will be processed within 7-10 business days.`)
    
  } catch (error) {
    alert('Error cancelling booking. Please try again or contact support.')
  } finally {
    cancelling.value = false
  }
}
</script>