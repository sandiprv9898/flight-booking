<template>
  <div class="min-h-screen flex">
    <!-- Left Marketing Panel (60%) -->
    <div class="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10">
        <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div class="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
        <!-- Logo -->
        <div class="mb-12">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <span class="text-2xl font-bold">FlightBook</span>
          </div>
        </div>

        <!-- Main Heading -->
        <div class="mb-8">
          <h1 class="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Your Journey Starts Here
          </h1>
          <p class="text-xl text-blue-100 leading-relaxed">
            Book flights with confidence. Manage your travel across multiple workspaces. 
            Experience seamless booking in 10 languages with real-time pricing.
          </p>
        </div>

        <!-- Feature List -->
        <div class="space-y-4 mb-12">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-lg">Multi-workspace travel management</span>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-lg">Real-time seat selection & pricing</span>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-lg">Multi-currency & international support</span>
          </div>
          
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
            <span class="text-lg">Secure payment processing</span>
          </div>
        </div>

        <!-- Testimonial -->
        <div class="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
          <p class="text-lg italic mb-4">
            "FlightBook has revolutionized how our team manages business travel. 
            The workspace feature lets us separate personal and business bookings perfectly."
          </p>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium">JS</span>
            </div>
            <div>
              <p class="font-medium">Sarah Johnson</p>
              <p class="text-sm text-blue-100">Travel Manager, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Auth Panel (40%) -->
    <div class="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden mb-8 text-center">
          <div class="inline-flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">FlightBook</span>
          </div>
        </div>

        <!-- Auth Forms -->
        <div class="bg-white">
          <LoginForm
            v-if="authMode === 'login'"
            @switch-mode="setAuthMode"
          />
          
          <RegisterForm
            v-else-if="authMode === 'register'"
            @switch-mode="setAuthMode"
          />
          
          <ForgotPasswordForm
            v-else-if="authMode === 'forgot'"
            @switch-mode="setAuthMode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'

const authStore = useAuthStore()

const authMode = computed(() => authStore.authMode)

const setAuthMode = (mode) => {
  authStore.setAuthMode(mode)
}
</script>