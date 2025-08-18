<template>
  <div class="space-y-6">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-neutral-900">Customize Your Flight</h2>
      <p class="text-neutral-600 mt-2">Add baggage, meals, and other extras to enhance your journey</p>
    </div>

    <!-- Baggage Selection -->
    <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div class="p-6 border-b border-neutral-200 bg-neutral-50">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.5 8.5c0-1.84 1.64-3.5 3.5-3.5s3.5 1.66 3.5 3.5c0 1.84-1.64 3.5-3.5 3.5s-3.5-1.66-3.5-3.5zm-2 8.5h11c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-11c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">Baggage</h3>
            <p class="text-sm text-neutral-600">Select your baggage options</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div
          v-for="passenger in passengers"
          :key="passenger.id"
          class="mb-6 last:mb-0"
        >
          <h4 class="font-medium text-neutral-900 mb-4">
            Passenger {{ passenger.id }}: {{ passenger.firstName }} {{ passenger.lastName }}
          </h4>

          <!-- Carry-on Baggage -->
          <div class="mb-4">
            <h5 class="text-sm font-medium text-neutral-700 mb-3">Carry-on Baggage</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                v-for="option in carryOnOptions"
                :key="option.id"
                :class="[
                  'border rounded-lg p-4 cursor-pointer transition-all',
                  selectedExtras.carryon[passenger.id] === option.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                ]"
                @click="selectCarryOn(passenger.id, option.id)"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium text-neutral-900">{{ option.name }}</span>
                  <span class="text-lg font-bold text-primary-600">${{ option.price }}</span>
                </div>
                <p class="text-sm text-neutral-600 mb-2">{{ option.description }}</p>
                <p class="text-xs text-neutral-500">{{ option.dimensions }}</p>
              </div>
            </div>
          </div>

          <!-- Checked Baggage -->
          <div class="mb-4">
            <h5 class="text-sm font-medium text-neutral-700 mb-3">Checked Baggage</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                v-for="option in checkedBaggageOptions"
                :key="option.id"
                :class="[
                  'border rounded-lg p-4 cursor-pointer transition-all',
                  selectedExtras.checked[passenger.id] === option.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                ]"
                @click="selectCheckedBaggage(passenger.id, option.id)"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium text-neutral-900">{{ option.name }}</span>
                  <span class="text-lg font-bold text-primary-600">${{ option.price }}</span>
                </div>
                <p class="text-sm text-neutral-600 mb-2">{{ option.description }}</p>
                <p class="text-xs text-neutral-500">{{ option.weight }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Meal Selection -->
    <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div class="p-6 border-b border-neutral-200 bg-neutral-50">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">Meals</h3>
            <p class="text-sm text-neutral-600">Choose your preferred meal options</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="meal in mealOptions"
            :key="meal.id"
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-all',
              selectedExtras.meal === meal.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            ]"
            @click="selectMeal(meal.id)"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-medium text-neutral-900">{{ meal.name }}</span>
              <span class="text-lg font-bold text-primary-600">${{ meal.price }}</span>
            </div>
            <p class="text-sm text-neutral-600 mb-2">{{ meal.description }}</p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in meal.tags"
                :key="tag"
                class="text-xs px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Travel Services -->
    <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div class="p-6 border-b border-neutral-200 bg-neutral-50">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">Travel Services</h3>
            <p class="text-sm text-neutral-600">Enhance your travel experience</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="service in travelServices"
            :key="service.id"
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-all',
              selectedExtras.services.includes(service.id)
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            ]"
            @click="toggleService(service.id)"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center space-x-2">
                <span class="font-medium text-neutral-900">{{ service.name }}</span>
                <CheckIcon
                  v-if="selectedExtras.services.includes(service.id)"
                  class="w-4 h-4 text-success-600"
                />
              </div>
              <span class="text-lg font-bold text-primary-600">${{ service.price }}</span>
            </div>
            <p class="text-sm text-neutral-600">{{ service.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Travel Insurance -->
    <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      <div class="p-6 border-b border-neutral-200 bg-neutral-50">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10.5V11.5C15.4,11.5 16,12.4 16,13V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V13C8,12.4 8.4,11.5 9,11.5V10.5C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,8.7 10.2,10.5V11.5H13.8V10.5C13.8,8.7 12.8,8.2 12,8.2Z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-neutral-900">Travel Insurance</h3>
            <p class="text-sm text-neutral-600">Protect your trip investment</p>
          </div>
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="insurance in insuranceOptions"
            :key="insurance.id"
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-all',
              selectedExtras.insurance === insurance.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300'
            ]"
            @click="selectInsurance(insurance.id)"
          >
            <div class="flex justify-between items-start mb-3">
              <span class="font-medium text-neutral-900">{{ insurance.name }}</span>
              <span class="text-lg font-bold text-primary-600">${{ insurance.price }}</span>
            </div>
            <ul class="text-sm text-neutral-600 space-y-1">
              <li
                v-for="feature in insurance.features"
                :key="feature"
                class="flex items-start space-x-2"
              >
                <CheckIcon class="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="bg-primary-50 rounded-lg border border-primary-200 p-6">
      <h3 class="font-semibold text-neutral-900 mb-4">Extras Summary</h3>
      <div class="space-y-2">
        <div v-for="item in selectedExtrasList" :key="item.name" class="flex justify-between">
          <span class="text-neutral-700">{{ item.name }}</span>
          <span class="font-medium text-neutral-900">${{ item.price }}</span>
        </div>
        <div class="border-t border-primary-200 pt-2 flex justify-between font-semibold">
          <span>Total Extras</span>
          <span class="text-primary-600">${{ extrasTotal }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  passengers: {
    type: Array,
    required: true
  }
})

const selectedExtras = ref({
  carryon: {}, // passengerId: optionId
  checked: {}, // passengerId: optionId
  meal: null,
  services: [],
  insurance: null
})

const carryOnOptions = [
  {
    id: 'basic_carryon',
    name: 'Basic Carry-on',
    price: 0,
    description: 'Included with your ticket',
    dimensions: '22" x 14" x 9" (8kg)'
  },
  {
    id: 'priority_carryon',
    name: 'Priority Carry-on',
    price: 25,
    description: 'Priority boarding + overhead bin guarantee',
    dimensions: '22" x 14" x 9" (10kg)'
  },
  {
    id: 'premium_carryon',
    name: 'Premium Carry-on',
    price: 45,
    description: 'Extra size allowance + premium boarding',
    dimensions: '24" x 16" x 10" (12kg)'
  }
]

const checkedBaggageOptions = [
  {
    id: 'no_checked',
    name: 'No Checked Baggage',
    price: 0,
    description: 'Carry-on only',
    weight: 'N/A'
  },
  {
    id: 'standard_checked',
    name: 'Standard Checked',
    price: 35,
    description: 'Standard checked baggage',
    weight: 'Up to 23kg (50lbs)'
  },
  {
    id: 'heavy_checked',
    name: 'Heavy Checked',
    price: 65,
    description: 'Extra weight allowance',
    weight: 'Up to 32kg (70lbs)'
  }
]

const mealOptions = [
  {
    id: 'standard_meal',
    name: 'Standard Meal',
    price: 0,
    description: 'Complimentary meal service',
    tags: ['Included']
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian Meal',
    price: 0,
    description: 'Vegetarian-friendly options',
    tags: ['Vegetarian', 'Free']
  },
  {
    id: 'vegan',
    name: 'Vegan Meal',
    price: 0,
    description: 'Plant-based meal options',
    tags: ['Vegan', 'Free']
  },
  {
    id: 'premium_meal',
    name: 'Premium Meal',
    price: 25,
    description: 'Gourmet meal with wine pairing',
    tags: ['Premium', 'Wine']
  },
  {
    id: 'kids_meal',
    name: 'Kids Meal',
    price: 0,
    description: 'Child-friendly meal options',
    tags: ['Kids', 'Free']
  }
]

const travelServices = [
  {
    id: 'wifi',
    name: 'In-flight Wi-Fi',
    price: 15,
    description: 'Full flight internet access'
  },
  {
    id: 'priority_boarding',
    name: 'Priority Boarding',
    price: 20,
    description: 'Board with Group 1'
  },
  {
    id: 'lounge_access',
    name: 'Airport Lounge',
    price: 45,
    description: 'Access to premium airport lounge'
  },
  {
    id: 'fast_track',
    name: 'Fast Track Security',
    price: 25,
    description: 'Skip regular security lines'
  }
]

const insuranceOptions = [
  {
    id: 'basic_insurance',
    name: 'Basic Protection',
    price: 45,
    features: [
      'Trip cancellation coverage up to $5,000',
      'Medical emergency coverage up to $25,000',
      'Baggage loss coverage up to $1,000'
    ]
  },
  {
    id: 'comprehensive_insurance',
    name: 'Comprehensive Protection',
    price: 85,
    features: [
      'Trip cancellation coverage up to $15,000',
      'Medical emergency coverage up to $100,000',
      'Baggage loss coverage up to $2,500',
      'Trip delay coverage up to $500',
      'Cancel for any reason (75% refund)'
    ]
  }
]

const selectCarryOn = (passengerId, optionId) => {
  selectedExtras.value.carryon[passengerId] = optionId
}

const selectCheckedBaggage = (passengerId, optionId) => {
  selectedExtras.value.checked[passengerId] = optionId
}

const selectMeal = (mealId) => {
  selectedExtras.value.meal = mealId
}

const toggleService = (serviceId) => {
  const index = selectedExtras.value.services.indexOf(serviceId)
  if (index > -1) {
    selectedExtras.value.services.splice(index, 1)
  } else {
    selectedExtras.value.services.push(serviceId)
  }
}

const selectInsurance = (insuranceId) => {
  selectedExtras.value.insurance = insuranceId
}

const selectedExtrasList = computed(() => {
  const list = []
  
  // Add baggage costs
  Object.values(selectedExtras.value.carryon).forEach(optionId => {
    const option = carryOnOptions.find(o => o.id === optionId)
    if (option && option.price > 0) {
      list.push({ name: option.name, price: option.price })
    }
  })
  
  Object.values(selectedExtras.value.checked).forEach(optionId => {
    const option = checkedBaggageOptions.find(o => o.id === optionId)
    if (option && option.price > 0) {
      list.push({ name: option.name, price: option.price })
    }
  })
  
  // Add meal cost
  if (selectedExtras.value.meal) {
    const meal = mealOptions.find(m => m.id === selectedExtras.value.meal)
    if (meal && meal.price > 0) {
      list.push({ name: meal.name, price: meal.price })
    }
  }
  
  // Add service costs
  selectedExtras.value.services.forEach(serviceId => {
    const service = travelServices.find(s => s.id === serviceId)
    if (service) {
      list.push({ name: service.name, price: service.price })
    }
  })
  
  // Add insurance cost
  if (selectedExtras.value.insurance) {
    const insurance = insuranceOptions.find(i => i.id === selectedExtras.value.insurance)
    if (insurance) {
      list.push({ name: insurance.name, price: insurance.price })
    }
  }
  
  return list
})

const extrasTotal = computed(() => {
  return selectedExtrasList.value.reduce((total, item) => total + item.price, 0)
})

defineExpose({
  selectedExtras,
  extrasTotal
})
</script>