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
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Profile</h1>
            <p class="mt-2 text-gray-600">Manage your account and preferences</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Profile Form -->
            <div class="lg:col-span-2 space-y-6">
              <!-- Personal Information -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    v-model="profile.firstName"
                    label="First Name"
                    placeholder="Enter your first name"
                  />
                  <Input
                    v-model="profile.lastName"
                    label="Last Name"
                    placeholder="Enter your last name"
                  />
                  <Input
                    v-model="profile.email"
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                  />
                  <Input
                    v-model="profile.phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="Enter your phone number"
                  />
                  <Input
                    v-model="profile.dateOfBirth"
                    type="date"
                    label="Date of Birth"
                  />
                  <Select
                    v-model="profile.nationality"
                    label="Nationality"
                    :options="countryOptions"
                  />
                </div>
              </div>

              <!-- Travel Information -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Travel Information</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    v-model="profile.passportNumber"
                    label="Passport Number"
                    placeholder="Enter passport number"
                  />
                  <Input
                    v-model="profile.passportExpiry"
                    type="date"
                    label="Passport Expiry"
                  />
                </div>
              </div>

              <!-- Preferences -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    v-model="profile.currency"
                    label="Preferred Currency"
                    :options="currencyOptions"
                  />
                  <Select
                    v-model="profile.language"
                    label="Language"
                    :options="languageOptions"
                  />
                </div>
                
                <div class="mt-4 space-y-3">
                  <div class="flex items-center">
                    <input
                      id="notifications"
                      v-model="profile.notifications"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label for="notifications" class="ml-2 block text-sm text-gray-900">
                      Email notifications for bookings and updates
                    </label>
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="newsletter"
                      v-model="profile.newsletter"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label for="newsletter" class="ml-2 block text-sm text-gray-900">
                      Subscribe to newsletter for travel deals
                    </label>
                  </div>
                </div>
              </div>

              <!-- Save Button -->
              <div class="flex justify-end">
                <Button variant="primary" @click="saveProfile">
                  Save Changes
                </Button>
              </div>
            </div>

            <!-- Profile Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div class="text-center mb-6">
                  <div class="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl font-bold text-white">
                      {{ userInitials }}
                    </span>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ profile.firstName }} {{ profile.lastName }}
                  </h3>
                  <p class="text-gray-500">{{ profile.email }}</p>
                </div>

                <!-- Quick Stats -->
                <div class="space-y-4">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-2xl font-bold text-primary-600">12</div>
                    <div class="text-sm text-gray-500">Total Bookings</div>
                  </div>
                  
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-2xl font-bold text-primary-600">5</div>
                    <div class="text-sm text-gray-500">Countries Visited</div>
                  </div>
                  
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="text-2xl font-bold text-primary-600">24,500</div>
                    <div class="text-sm text-gray-500">Miles Traveled</div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="mt-6 space-y-2">
                  <Button variant="secondary" full-width>
                    View Booking History
                  </Button>
                  <Button variant="secondary" full-width>
                    Download Travel Report
                  </Button>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'

const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)

const profile = ref({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  dateOfBirth: authStore.user?.dateOfBirth || '',
  nationality: '',
  passportNumber: authStore.user?.passportNumber || '',
  passportExpiry: '',
  currency: authStore.user?.preferences?.currency || 'USD',
  language: authStore.user?.preferences?.language || 'en',
  notifications: authStore.user?.preferences?.notifications || false,
  newsletter: false
})

const userInitials = computed(() => {
  const firstName = profile.value.firstName || ''
  const lastName = profile.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' }
]

const currencyOptions = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' }
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' }
]

const saveProfile = () => {
  console.log('Saving profile:', profile.value)
  alert('Profile updated successfully!')
}
</script>