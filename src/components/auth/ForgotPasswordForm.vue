<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Reset your password</h2>
      <p class="mt-2 text-sm text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>
    </div>

    <Alert
      v-if="error"
      type="error"
      :message="error"
      dismissible
      @dismiss="error = ''"
    />

    <Alert
      v-if="success"
      type="success"
      :message="success"
      dismissible
      @dismiss="success = ''"
    />

    <form v-if="!success" @submit.prevent="handleSubmit" class="space-y-4">
      <Input
        v-model="form.email"
        type="email"
        label="Email address"
        placeholder="Enter your email address"
        required
        autocomplete="email"
        :error="errors.email"
      />

      <Button
        type="submit"
        variant="primary"
        :loading="loading"
        :disabled="!isFormValid"
        full-width
      >
        Send reset link
      </Button>
    </form>

    <div class="text-center">
      <button
        type="button"
        class="text-sm text-primary-600 hover:text-primary-500"
        @click="$emit('switch-mode', 'login')"
      >
        ← Back to sign in
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Alert from '@/components/ui/Alert.vue'

defineEmits(['switch-mode'])

const authStore = useAuthStore()

const form = ref({
  email: ''
})

const errors = ref({
  email: ''
})

const error = ref('')
const success = ref('')

const loading = computed(() => authStore.loading)

const isFormValid = computed(() => {
  return form.value.email && !errors.value.email
})

const validateForm = () => {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const result = await authStore.forgotPassword(form.value.email)

  if (result.success) {
    success.value = result.message || 'Password reset email sent successfully!'
    form.value.email = ''
  } else {
    error.value = result.error || 'Failed to send reset email. Please try again.'
  }
}
</script>