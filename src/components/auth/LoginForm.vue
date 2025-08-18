<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Welcome back</h2>
      <p class="mt-2 text-sm text-gray-600">
        Sign in to your account to continue
      </p>
    </div>

    <Alert
      v-if="error"
      type="error"
      :message="error"
      dismissible
      @dismiss="error = ''"
    />

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <Input
        v-model="form.email"
        type="email"
        label="Email address"
        placeholder="Enter your email"
        required
        autocomplete="email"
        :error="errors.email"
      />

      <Input
        v-model="form.password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        required
        autocomplete="current-password"
        :error="errors.password"
      />

      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <input
            id="remember-me"
            v-model="form.rememberMe"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <button
          type="button"
          class="text-sm text-primary-600 hover:text-primary-500"
          @click="$emit('switch-mode', 'forgot')"
        >
          Forgot your password?
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="!isFormValid"
        full-width
      >
        Sign in
      </Button>
    </form>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3">
        <Button
          variant="social"
          @click="handleSocialLogin('google')"
          :loading="socialLoading === 'google'"
        >
          <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>

        <Button
          variant="social"
          @click="handleSocialLogin('apple')"
          :loading="socialLoading === 'apple'"
        >
          <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </Button>
      </div>
    </div>

    <p class="text-center text-sm text-gray-600">
      Don't have an account?
      <button
        type="button"
        class="font-medium text-primary-600 hover:text-primary-500"
        @click="$emit('switch-mode', 'register')"
      >
        Sign up
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
import Alert from '@/components/ui/Alert.vue'

defineEmits(['switch-mode'])

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref({
  email: '',
  password: ''
})

const error = ref('')
const socialLoading = ref('')

const loading = computed(() => authStore.loading)

const isFormValid = computed(() => {
  return form.value.email && form.value.password && !errors.value.email && !errors.value.password
})

const validateForm = () => {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password
  })

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Login failed. Please try again.'
  }
}

const handleSocialLogin = async (provider) => {
  socialLoading.value = provider
  const result = await authStore.socialLogin(provider)
  socialLoading.value = ''

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || `${provider} login failed. Please try again.`
  }
}
</script>