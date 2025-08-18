<template>
  <div class="bg-white border-b border-gray-200 sticky top-16 z-20 px-4 py-4">
    <div class="max-w-7xl mx-auto">
      <!-- Progress Bar -->
      <div class="mb-4">
        <div class="bg-gray-200 rounded-full h-2">
          <div 
            class="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Steps -->
      <div class="flex items-center justify-between">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="flex items-center"
          :class="{ 'flex-1': index < steps.length - 1 }"
        >
          <!-- Step Circle -->
          <div class="flex items-center">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                getStepClasses(step.id)
              ]"
            >
              <CheckIcon
                v-if="step.id < currentStep"
                class="w-4 h-4"
              />
              <span v-else>{{ step.id }}</span>
            </div>
            
            <!-- Step Label -->
            <div class="ml-3">
              <div 
                :class="[
                  'text-sm font-medium transition-colors duration-200',
                  step.id === currentStep ? 'text-primary-600' : 
                  step.id < currentStep ? 'text-green-600' : 'text-gray-500'
                ]"
              >
                {{ step.title }}
              </div>
              <div 
                :class="[
                  'text-xs transition-colors duration-200',
                  step.id === currentStep ? 'text-primary-500' : 
                  step.id < currentStep ? 'text-green-500' : 'text-gray-400'
                ]"
              >
                {{ step.description }}
              </div>
            </div>
          </div>

          <!-- Connector Line -->
          <div
            v-if="index < steps.length - 1"
            :class="[
              'flex-1 h-0.5 mx-4 transition-colors duration-200',
              step.id < currentStep ? 'bg-green-600' : 'bg-gray-200'
            ]"
          ></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-6">
        <Button
          v-if="currentStep > 1"
          variant="secondary"
          @click="previousStep"
          :disabled="loading"
        >
          <ChevronLeftIcon class="w-4 h-4 mr-2" />
          Back
        </Button>
        <div v-else></div>

        <div class="flex space-x-3">
          <!-- Save Progress -->
          <Button
            v-if="currentStep > 1 && currentStep < 6"
            variant="ghost"
            @click="saveProgress"
          >
            <BookmarkIcon class="w-4 h-4 mr-2" />
            Save Progress
          </Button>

          <!-- Next/Complete Button -->
          <Button
            v-if="currentStep < 6"
            variant="primary"
            @click="nextStep"
            :disabled="!canProceed || loading"
            :loading="loading"
          >
            {{ currentStep === 5 ? 'Complete Booking' : 'Continue' }}
            <ChevronRightIcon v-if="currentStep < 5" class="w-4 h-4 ml-2" />
          </Button>

          <!-- Book Another Flight -->
          <Button
            v-if="currentStep === 6"
            variant="primary"
            @click="startNewBooking"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Book Another Flight
          </Button>
        </div>
      </div>

      <!-- Step-specific Info -->
      <div v-if="showStepInfo" class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex items-start space-x-3">
          <InformationCircleIcon class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm">
            <div class="font-medium text-blue-900">{{ currentStepInfo.title }}</div>
            <div class="text-blue-700 mt-1">{{ currentStepInfo.description }}</div>
            <ul v-if="currentStepInfo.tips" class="mt-2 space-y-1">
              <li
                v-for="tip in currentStepInfo.tips"
                :key="tip"
                class="flex items-start space-x-2"
              >
                <div class="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span class="text-blue-600">{{ tip }}</span>
              </li>
            </ul>
          </div>
          <button
            class="text-blue-400 hover:text-blue-600 ml-auto"
            @click="showStepInfo = false"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/store/booking'
import Button from '@/components/ui/Button.vue'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  PlusIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const bookingStore = useBookingStore()

const showStepInfo = ref(true)

const steps = [
  {
    id: 1,
    title: 'Select Flight',
    description: 'Choose your preferred flight'
  },
  {
    id: 2,
    title: 'Choose Seats',
    description: 'Pick your seats'
  },
  {
    id: 3,
    title: 'Extras',
    description: 'Baggage & services'
  },
  {
    id: 4,
    title: 'Passenger Info',
    description: 'Enter passenger details'
  },
  {
    id: 5,
    title: 'Payment',
    description: 'Complete your booking'
  },
  {
    id: 6,
    title: 'Confirmation',
    description: 'Booking complete'
  }
]

const currentStep = computed(() => bookingStore.currentStep)
const progress = computed(() => bookingStore.stepProgress)
const loading = computed(() => bookingStore.loading)

const canProceed = computed(() => {
  return bookingStore.isStepComplete(currentStep.value)
})

const currentStepInfo = computed(() => {
  const stepInfo = {
    1: {
      title: 'Select Your Flight',
      description: 'Choose the flight that best fits your schedule and budget.',
      tips: [
        'Compare prices, departure times, and airlines',
        'Check baggage allowances and amenities',
        'Consider layovers and total travel time'
      ]
    },
    2: {
      title: 'Choose Your Seats',
      description: 'Select seats for all passengers. Some seats may have additional fees.',
      tips: [
        'Window seats offer great views',
        'Aisle seats provide easy access',
        'Premium seats offer extra legroom',
        'Seats are held for 15 minutes'
      ]
    },
    3: {
      title: 'Add Extras & Services',
      description: 'Customize your flight with baggage, meals, and travel services.',
      tips: [
        'Add checked baggage to avoid airport fees',
        'Select meals for dietary preferences',
        'Consider travel insurance for protection',
        'Priority boarding saves time at the gate'
      ]
    },
    4: {
      title: 'Enter Passenger Information',
      description: 'Provide accurate details for all passengers as they appear on ID documents.',
      tips: [
        'Names must match passport or ID exactly',
        'Double-check spelling and dates',
        'Add frequent flyer numbers for benefits'
      ]
    },
    5: {
      title: 'Complete Your Payment',
      description: 'Review your booking details and complete the payment.',
      tips: [
        'Review all details carefully',
        'Check total price and included services',
        'Payment is secure and encrypted'
      ]
    },
    6: {
      title: 'Booking Confirmed!',
      description: 'Your flight has been successfully booked.',
      tips: [
        'Save your booking confirmation',
        'Check-in online 24 hours before departure',
        'Arrive at airport 2-3 hours early for international flights'
      ]
    }
  }
  
  return stepInfo[currentStep.value] || stepInfo[1]
})

const getStepClasses = (stepId) => {
  if (stepId < currentStep.value) {
    return 'bg-green-600 text-white'
  } else if (stepId === currentStep.value) {
    return 'bg-primary-600 text-white'
  } else {
    return 'bg-gray-200 text-gray-500'
  }
}

const nextStep = async () => {
  if (currentStep.value === 5) {
    // Complete booking
    const result = await bookingStore.completeBooking()
    if (!result.success) {
      alert(result.error)
    }
  } else {
    bookingStore.nextStep()
  }
}

const previousStep = () => {
  bookingStore.previousStep()
}

const saveProgress = () => {
  // Save current booking progress to localStorage
  const progressData = {
    step: currentStep.value,
    flight: bookingStore.selectedFlight,
    seats: bookingStore.selectedSeats,
    passengers: bookingStore.passengers,
    contact: bookingStore.contactInfo,
    savedAt: new Date().toISOString()
  }
  
  localStorage.setItem('booking_progress', JSON.stringify(progressData))
  
  // Show confirmation
  alert('Booking progress saved! You can continue later.')
}

const startNewBooking = () => {
  bookingStore.resetBooking()
  router.push('/')
}

// Watch for step changes to show info
watch(currentStep, () => {
  showStepInfo.value = true
}, { immediate: true })
</script>