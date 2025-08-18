<template>
  <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
    <div class="p-6 border-b border-neutral-200 bg-primary-50">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-neutral-900">Mobile Check-in</h2>
          <p class="text-sm text-neutral-600">Complete your check-in and get your boarding pass</p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Flight Info -->
      <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg mb-6">
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <span class="text-sm font-bold text-primary-600">{{ booking.flight.airlineCode }}</span>
          </div>
          <div>
            <div class="font-semibold text-neutral-900">{{ booking.flight.airline }} {{ booking.flight.flightNumber }}</div>
            <div class="text-sm text-neutral-600">{{ formatDate(booking.flight.departure.date) }}</div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-medium text-neutral-900">{{ booking.flight.departure.time }}</div>
          <div class="text-sm text-neutral-600">{{ booking.flight.origin.code }} → {{ booking.flight.destination.code }}</div>
        </div>
      </div>

      <!-- Check-in Steps -->
      <div v-if="!isCheckedIn" class="space-y-6">
        <!-- Seat Selection -->
        <div class="border border-neutral-200 rounded-lg p-4">
          <h3 class="font-semibold text-neutral-900 mb-4">Confirm Your Seats</h3>
          <div class="space-y-2">
            <div 
              v-for="(passenger, index) in booking.passengers" 
              :key="index"
              class="flex items-center justify-between p-3 bg-neutral-50 rounded"
            >
              <div>
                <div class="font-medium text-neutral-900">{{ passenger.firstName }} {{ passenger.lastName }}</div>
                <div class="text-sm text-neutral-600">{{ passenger.type }}</div>
              </div>
              <div class="flex items-center space-x-3">
                <span class="font-medium text-neutral-900">Seat {{ booking.seats[index]?.seatNumber || 'Not selected' }}</span>
                <Button variant="ghost" size="sm" @click="changeSeat(index)">
                  Change
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Travel Documents -->
        <div class="border border-neutral-200 rounded-lg p-4">
          <h3 class="font-semibold text-neutral-900 mb-4">Travel Documents</h3>
          <div class="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-4">
            <div class="flex items-start space-x-3">
              <ExclamationTriangleIcon class="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <div class="font-medium text-warning-800">Document Verification Required</div>
                <div class="text-sm text-warning-700 mt-1">
                  Please ensure your travel documents are ready for inspection at the gate.
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-3">
            <div v-for="(passenger, index) in booking.passengers" :key="index" class="flex items-center space-x-3">
              <CheckCircleIcon class="w-5 h-5 text-success-600" />
              <div>
                <div class="font-medium text-neutral-900">{{ passenger.firstName }} {{ passenger.lastName }}</div>
                <div class="text-sm text-neutral-600">Passport: {{ passenger.passportNumber }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Check-in Button -->
        <Button 
          variant="primary" 
          size="lg" 
          class="w-full"
          :loading="checkingIn"
          @click="completeCheckIn"
        >
          Complete Check-in
        </Button>
      </div>

      <!-- Boarding Pass -->
      <div v-else class="space-y-6">
        <div class="text-center">
          <div class="w-16 h-16 bg-success-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircleIcon class="w-10 h-10 text-success-600" />
          </div>
          <h3 class="text-lg font-bold text-neutral-900 mb-2">Check-in Complete!</h3>
          <p class="text-neutral-600">Your boarding passes are ready</p>
        </div>

        <!-- Boarding Passes -->
        <div class="space-y-4">
          <div 
            v-for="(passenger, index) in booking.passengers" 
            :key="index"
            class="border border-neutral-200 rounded-lg overflow-hidden"
          >
            <!-- Boarding Pass Header -->
            <div class="bg-primary-600 text-white p-4">
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-bold text-lg">{{ booking.flight.airline }}</div>
                  <div class="text-sm opacity-90">{{ booking.flight.flightNumber }}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold">{{ booking.flight.departure.time }}</div>
                  <div class="text-sm opacity-90">{{ formatDate(booking.flight.departure.date) }}</div>
                </div>
              </div>
            </div>

            <!-- Boarding Pass Body -->
            <div class="p-4 bg-white">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div class="text-xs text-neutral-500 uppercase">Passenger</div>
                  <div class="font-bold text-neutral-900">{{ passenger.firstName }} {{ passenger.lastName }}</div>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 uppercase">Seat</div>
                  <div class="font-bold text-neutral-900">{{ booking.seats[index]?.seatNumber }}</div>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 uppercase">From</div>
                  <div class="font-bold text-neutral-900">{{ booking.flight.origin.code }}</div>
                  <div class="text-xs text-neutral-600">{{ booking.flight.origin.city }}</div>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 uppercase">To</div>
                  <div class="font-bold text-neutral-900">{{ booking.flight.destination.code }}</div>
                  <div class="text-xs text-neutral-600">{{ booking.flight.destination.city }}</div>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 uppercase">Gate</div>
                  <div class="font-bold text-neutral-900">A{{ Math.floor(Math.random() * 30) + 1 }}</div>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 uppercase">Boarding</div>
                  <div class="font-bold text-neutral-900">{{ getEarlierTime(booking.flight.departure.time) }}</div>
                </div>
              </div>

              <!-- QR Code -->
              <div class="text-center py-4 border-t border-neutral-200">
                <div class="w-24 h-24 bg-neutral-900 mx-auto mb-2 rounded flex items-center justify-center">
                  <div class="grid grid-cols-8 gap-px w-20 h-20">
                    <div 
                      v-for="n in 64" 
                      :key="n" 
                      :class="Math.random() > 0.5 ? 'bg-white' : 'bg-neutral-900'"
                      class="w-full h-full"
                    ></div>
                  </div>
                </div>
                <div class="text-xs text-neutral-500">Scan at gate for boarding</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="p-4 bg-neutral-50 border-t border-neutral-200">
              <div class="flex space-x-2">
                <Button variant="secondary" size="sm" class="flex-1" @click="addToWallet">
                  <WalletIcon class="w-4 h-4 mr-2" />
                  Add to Wallet
                </Button>
                <Button variant="secondary" size="sm" class="flex-1" @click="downloadPDF">
                  <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="secondary" size="sm" class="flex-1" @click="shareBoardingPass">
                  <ShareIcon class="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Info -->
        <div class="bg-primary-50 rounded-lg p-4">
          <h4 class="font-semibold text-primary-900 mb-2">Important Information</h4>
          <ul class="text-sm text-primary-800 space-y-1">
            <li>• Arrive at the airport at least 2 hours before departure</li>
            <li>• Have your boarding pass and valid ID ready</li>
            <li>• Boarding begins 45 minutes before departure</li>
            <li>• Gate may change - check airport monitors</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon,
  DocumentArrowDownIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
})

const isCheckedIn = ref(false)
const checkingIn = ref(false)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })
}

const getEarlierTime = (timeString) => {
  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours) - 1, parseInt(minutes))
  return date.toTimeString().slice(0, 5)
}

const changeSeat = (passengerIndex) => {
  alert(`Seat change for passenger ${passengerIndex + 1} - Feature coming soon!`)
}

const completeCheckIn = async () => {
  checkingIn.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  isCheckedIn.value = true
  checkingIn.value = false
}

const addToWallet = () => {
  alert('Adding to digital wallet - Feature coming soon!')
}

const downloadPDF = () => {
  alert('Downloading boarding pass PDF - Feature coming soon!')
}

const shareBoardingPass = () => {
  alert('Sharing boarding pass - Feature coming soon!')
}
</script>