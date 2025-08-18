<template>
  <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
    <div class="p-6 border-b border-neutral-200 bg-primary-50">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <UserGroupIcon class="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-neutral-900">Group Booking</h2>
          <p class="text-sm text-neutral-600">Book for 10+ passengers and save</p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Group Booking Benefits -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">Group Booking Benefits</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-success-50 rounded-lg border border-success-200">
            <div class="w-12 h-12 bg-success-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <CurrencyDollarIcon class="w-6 h-6 text-success-600" />
            </div>
            <h4 class="font-semibold text-success-900 mb-2">Save 15-25%</h4>
            <p class="text-sm text-success-700">Special group discounts on fares</p>
          </div>
          <div class="text-center p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div class="w-12 h-12 bg-primary-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <CalendarDaysIcon class="w-6 h-6 text-primary-600" />
            </div>
            <h4 class="font-semibold text-primary-900 mb-2">Flexible Dates</h4>
            <p class="text-sm text-primary-700">Hold reservations without payment</p>
          </div>
          <div class="text-center p-4 bg-warning-50 rounded-lg border border-warning-200">
            <div class="w-12 h-12 bg-warning-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <PhoneIcon class="w-6 h-6 text-warning-600" />
            </div>
            <h4 class="font-semibold text-warning-900 mb-2">Dedicated Support</h4>
            <p class="text-sm text-warning-700">Personal group coordinator</p>
          </div>
        </div>
      </div>

      <!-- Group Request Form -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">Request Group Quote</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Contact Information -->
          <div class="space-y-4">
            <Input
              v-model="groupRequest.contactName"
              label="Contact Name"
              placeholder="Group organizer name"
              required
            />
            <Input
              v-model="groupRequest.email"
              type="email"
              label="Email Address"
              placeholder="contact@organization.com"
              required
            />
            <Input
              v-model="groupRequest.phone"
              type="tel"
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              required
            />
            <Input
              v-model="groupRequest.organization"
              label="Organization"
              placeholder="Company or group name"
            />
          </div>

          <!-- Travel Details -->
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="groupRequest.origin"
                label="From"
                placeholder="Origin airport"
                required
              />
              <Input
                v-model="groupRequest.destination"
                label="To"
                placeholder="Destination airport"
                required
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="groupRequest.departureDate"
                type="date"
                label="Departure Date"
                required
              />
              <Input
                v-model="groupRequest.returnDate"
                type="date"
                label="Return Date (if applicable)"
              />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <Input
                v-model="groupRequest.passengerCount"
                type="number"
                min="10"
                label="Number of Passengers"
                placeholder="10"
                required
              />
              <Select
                v-model="groupRequest.cabinClass"
                label="Preferred Class"
                :options="cabinOptions"
              />
            </div>
          </div>
        </div>

        <!-- Special Requirements -->
        <div class="mt-6">
          <label class="block text-sm font-medium text-neutral-700 mb-2">
            Special Requirements or Notes
          </label>
          <textarea
            v-model="groupRequest.notes"
            rows="4"
            class="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Any special needs, preferences, or additional information..."
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="mt-6">
          <Button
            variant="primary"
            size="lg"
            class="w-full md:w-auto px-8"
            :loading="submitting"
            @click="submitGroupRequest"
          >
            Request Group Quote
          </Button>
          <p class="text-sm text-neutral-600 mt-2">
            We'll respond within 24 hours with a custom quote for your group
          </p>
        </div>
      </div>

      <!-- Group Booking Guidelines -->
      <div class="bg-neutral-50 rounded-lg p-6">
        <h4 class="font-semibold text-neutral-900 mb-4 flex items-center">
          <InformationCircleIcon class="w-5 h-5 mr-2 text-primary-600" />
          Group Booking Guidelines
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
          <div>
            <h5 class="font-medium text-neutral-900 mb-2">Minimum Requirements</h5>
            <ul class="space-y-1">
              <li>• Minimum 10 passengers on same flight</li>
              <li>• Same departure and return dates</li>
              <li>• Advance booking (30+ days recommended)</li>
              <li>• Final passenger names required 14 days before departure</li>
            </ul>
          </div>
          <div>
            <h5 class="font-medium text-neutral-900 mb-2">Payment & Changes</h5>
            <ul class="space-y-1">
              <li>• Deposit required to secure group rates</li>
              <li>• Name changes permitted (fees may apply)</li>
              <li>• Flexible payment options available</li>
              <li>• Group cancellation policies vary by route</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import { 
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

const submitting = ref(false)

const groupRequest = ref({
  contactName: '',
  email: '',
  phone: '',
  organization: '',
  origin: '',
  destination: '',
  departureDate: '',
  returnDate: '',
  passengerCount: 10,
  cabinClass: 'economy',
  notes: ''
})

const cabinOptions = [
  { value: 'economy', label: 'Economy' },
  { value: 'premium', label: 'Premium Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' }
]

const submitGroupRequest = async () => {
  // Validate required fields
  const requiredFields = ['contactName', 'email', 'phone', 'origin', 'destination', 'departureDate', 'passengerCount']
  const missingFields = requiredFields.filter(field => !groupRequest.value[field])
  
  if (missingFields.length > 0) {
    alert('Please fill in all required fields')
    return
  }

  if (groupRequest.value.passengerCount < 10) {
    alert('Group bookings require a minimum of 10 passengers')
    return
  }

  submitting.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate reference number
    const refNumber = `GRP${Date.now().toString().slice(-6)}`
    
    // Show success message
    alert(`Group quote request submitted successfully!\n\nReference: ${refNumber}\n\nOur group travel specialists will contact you within 24 hours with a custom quote for your ${groupRequest.value.passengerCount} passengers.\n\nThank you for choosing FlightBook for your group travel needs!`)
    
    // Reset form
    Object.keys(groupRequest.value).forEach(key => {
      if (key === 'passengerCount') {
        groupRequest.value[key] = 10
      } else if (key === 'cabinClass') {
        groupRequest.value[key] = 'economy'
      } else {
        groupRequest.value[key] = ''
      }
    })
    
  } catch (error) {
    alert('Error submitting group request. Please try again or contact our support team.')
  } finally {
    submitting.value = false
  }
}
</script>