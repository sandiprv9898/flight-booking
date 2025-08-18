<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar
      :is-mobile-menu-open="isMobileMenuOpen"
      @close-mobile-menu="isMobileMenuOpen = false"
    />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header @toggle-mobile-menu="isMobileMenuOpen = !isMobileMenuOpen" />
      
      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Booking Details</h1>
            <p class="text-gray-600">Complete your flight booking</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Booking Form -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Flight Summary -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Selected Flight</h2>
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span class="text-sm font-bold text-gray-600">BA</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">British Airways BA 178</div>
                      <div class="text-sm text-gray-500">JFK → LHR • 08:30 - 20:45</div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-gray-900">$845</div>
                    <div class="text-sm text-gray-500">per person</div>
                  </div>
                </div>
              </div>

              <!-- Passenger Information -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Passenger Information</h2>
                <div class="space-y-6">
                  <div
                    v-for="(passenger, index) in passengers"
                    :key="index"
                    class="border border-gray-200 rounded-lg p-4"
                  >
                    <h3 class="font-medium text-gray-900 mb-4">
                      Passenger {{ index + 1 }}
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        v-model="passenger.firstName"
                        label="First Name"
                        placeholder="Enter first name"
                        required
                      />
                      <Input
                        v-model="passenger.lastName"
                        label="Last Name"
                        placeholder="Enter last name"
                        required
                      />
                      <Input
                        v-model="passenger.dateOfBirth"
                        type="date"
                        label="Date of Birth"
                        required
                      />
                      <Select
                        v-model="passenger.gender"
                        label="Gender"
                        :options="genderOptions"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    v-model="contact.email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter email address"
                    required
                  />
                  <Input
                    v-model="contact.phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <!-- Payment Information -->
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
                <div class="space-y-4">
                  <Input
                    v-model="payment.cardNumber"
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <div class="grid grid-cols-2 gap-4">
                    <Input
                      v-model="payment.expiryDate"
                      label="Expiry Date"
                      placeholder="MM/YY"
                      required
                    />
                    <Input
                      v-model="payment.cvv"
                      label="CVV"
                      placeholder="123"
                      required
                    />
                  </div>
                  <Input
                    v-model="payment.nameOnCard"
                    label="Name on Card"
                    placeholder="Enter name as on card"
                    required
                  />
                </div>
              </div>

              <!-- Book Button -->
              <div class="flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  @click="handleBooking"
                  class="px-12"
                >
                  Complete Booking
                </Button>
              </div>
            </div>

            <!-- Price Summary Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
                
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Flight (2 passengers)</span>
                    <span class="font-medium">$1,690</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-600">Taxes & Fees</span>
                    <span class="font-medium">$240</span>
                  </div>
                  
                  <div class="border-t border-gray-200 pt-3">
                    <div class="flex justify-between">
                      <span class="text-lg font-semibold text-gray-900">Total</span>
                      <span class="text-lg font-semibold text-gray-900">$1,930</span>
                    </div>
                  </div>
                </div>

                <!-- Promo Code -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <div class="flex space-x-2">
                    <Input
                      v-model="promoCode"
                      placeholder="Promo code"
                      class="flex-1"
                    />
                    <Button variant="secondary">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'

const router = useRouter()

const isMobileMenuOpen = ref(false)
const promoCode = ref('')

const passengers = ref([
  {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
  },
  {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: ''
  }
])

const contact = ref({
  email: '',
  phone: ''
})

const payment = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  nameOnCard: ''
})

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

const handleBooking = () => {
  console.log('Booking data:', {
    passengers: passengers.value,
    contact: contact.value,
    payment: payment.value
  })
  
  // In a real app, this would process the payment
  alert('Booking completed successfully!')
}
</script>