<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Create your account</h2>
      <p class="mt-2 text-sm text-gray-600">
        Join us and start booking your flights
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="flex items-center">
      <div
        v-for="step in 3"
        :key="step"
        class="flex items-center"
      >
        <div
          :class="[
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
            step <= currentStep
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-500'
          ]"
        >
          {{ step }}
        </div>
        <div
          v-if="step < 3"
          :class="[
            'h-0.5 w-16 mx-2',
            step < currentStep ? 'bg-primary-600' : 'bg-gray-200'
          ]"
        />
      </div>
    </div>

    <Alert
      v-if="error"
      type="error"
      :message="error"
      dismissible
      @dismiss="error = ''"
    />

    <!-- Step 1: Personal Information -->
    <div v-if="currentStep === 1" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Personal Information</h3>
      
      <div class="grid grid-cols-2 gap-4">
        <Input
          v-model="form.step1.firstName"
          label="First Name"
          placeholder="Enter your first name"
          required
          :error="errors.firstName"
        />
        
        <Input
          v-model="form.step1.lastName"
          label="Last Name"
          placeholder="Enter your last name"
          required
          :error="errors.lastName"
        />
      </div>

      <Input
        v-model="form.step1.email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        required
        autocomplete="email"
        :error="errors.email"
      />

      <Input
        v-model="form.step1.phone"
        type="tel"
        label="Phone Number"
        placeholder="Enter your phone number"
        required
        :error="errors.phone"
      />

      <Input
        v-model="form.step1.password"
        type="password"
        label="Password"
        placeholder="Create a password"
        required
        autocomplete="new-password"
        :error="errors.password"
        help-text="Password must be at least 8 characters"
      />

      <Input
        v-model="form.step1.confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        autocomplete="new-password"
        :error="errors.confirmPassword"
      />
    </div>

    <!-- Step 2: Travel Information -->
    <div v-if="currentStep === 2" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Travel Information</h3>
      <p class="text-sm text-gray-600">This information helps us serve you better (optional)</p>

      <Input
        v-model="form.step2.dateOfBirth"
        type="date"
        label="Date of Birth"
        :error="errors.dateOfBirth"
      />

      <Input
        v-model="form.step2.passportNumber"
        label="Passport Number"
        placeholder="Enter your passport number"
        :error="errors.passportNumber"
      />

      <Select
        v-model="form.step2.nationality"
        label="Nationality"
        placeholder="Select your nationality"
        :options="countryOptions"
        :error="errors.nationality"
      />

      <Input
        v-model="form.step2.passportExpiry"
        type="date"
        label="Passport Expiry Date"
        :error="errors.passportExpiry"
      />
    </div>

    <!-- Step 3: Preferences -->
    <div v-if="currentStep === 3" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-900">Preferences</h3>
      
      <Select
        v-model="form.step3.currency"
        label="Preferred Currency"
        :options="currencyOptions"
        :error="errors.currency"
      />

      <Select
        v-model="form.step3.language"
        label="Language"
        :options="languageOptions"
        :error="errors.language"
      />

      <Select
        v-model="form.step3.timezone"
        label="Time Zone"
        :options="timezoneOptions"
        :error="errors.timezone"
      />

      <div class="space-y-3">
        <div class="flex items-center">
          <input
            id="notifications"
            v-model="form.step3.notifications"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="notifications" class="ml-2 block text-sm text-gray-900">
            Receive booking notifications and updates
          </label>
        </div>

        <div class="flex items-center">
          <input
            id="newsletter"
            v-model="form.step3.newsletter"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="newsletter" class="ml-2 block text-sm text-gray-900">
            Subscribe to newsletter for travel deals
          </label>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between pt-4">
      <Button
        v-if="currentStep > 1"
        variant="secondary"
        @click="previousStep"
      >
        Previous
      </Button>
      <div v-else></div>

      <Button
        v-if="currentStep < 3"
        variant="primary"
        @click="nextStep"
        :disabled="!isCurrentStepValid"
      >
        Next
      </Button>

      <Button
        v-else
        variant="primary"
        @click="handleSubmit"
        :loading="loading"
        :disabled="!isCurrentStepValid"
      >
        Create Account
      </Button>
    </div>

    <p class="text-center text-sm text-gray-600">
      Already have an account?
      <button
        type="button"
        class="font-medium text-primary-600 hover:text-primary-500"
        @click="$emit('switch-mode', 'login')"
      >
        Sign in
      </button>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Alert from '@/components/ui/Alert.vue'

defineEmits(['switch-mode'])

const authStore = useAuthStore()
const router = useRouter()

const currentStep = ref(1)
const error = ref('')
const errors = ref({})

const form = ref({
  step1: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  },
  step2: {
    dateOfBirth: '',
    passportNumber: '',
    nationality: '',
    passportExpiry: ''
  },
  step3: {
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York',
    notifications: true,
    newsletter: false
  }
})

const loading = computed(() => authStore.loading)

// Options data
const countryOptions = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' }
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
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' }
]

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London Time' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Europe/Berlin', label: 'Central European Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Asia/Shanghai', label: 'China Standard Time' }
]

const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) {
    return form.value.step1.firstName &&
           form.value.step1.lastName &&
           form.value.step1.email &&
           form.value.step1.password &&
           form.value.step1.confirmPassword &&
           form.value.step1.phone &&
           !errors.value.firstName &&
           !errors.value.lastName &&
           !errors.value.email &&
           !errors.value.password &&
           !errors.value.confirmPassword &&
           !errors.value.phone
  }
  if (currentStep.value === 2) {
    return true // Step 2 is optional
  }
  if (currentStep.value === 3) {
    return form.value.step3.currency && form.value.step3.language && form.value.step3.timezone
  }
  return false
})

const validateStep1 = () => {
  errors.value = {}

  if (!form.value.step1.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }

  if (!form.value.step1.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  }

  if (!form.value.step1.email) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.value.step1.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!form.value.step1.phone.trim()) {
    errors.value.phone = 'Phone number is required'
  }

  if (!form.value.step1.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.step1.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }

  if (!form.value.step1.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
  } else if (form.value.step1.password !== form.value.step1.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (currentStep.value === 1 && !validateStep1()) {
    return
  }
  
  if (currentStep.value < 3) {
    currentStep.value++
    errors.value = {}
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    errors.value = {}
  }
}

const handleSubmit = async () => {
  authStore.updateRegistrationData('step1', form.value.step1)
  authStore.updateRegistrationData('step2', form.value.step2)
  authStore.updateRegistrationData('step3', form.value.step3)

  const result = await authStore.register()

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Registration failed. Please try again.'
  }
}
</script>