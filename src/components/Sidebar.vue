<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Mobile menu overlay -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="closeMobileMenu"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
    </div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <span class="text-lg font-bold text-gray-900">FlightBook</span>
        </div>

        <!-- Mobile close button -->
        <button
          class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          @click="closeMobileMenu"
        >
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <!-- Search Flights -->
        <router-link
          to="/"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'home' }"
        >
          <MagnifyingGlassIcon class="nav-icon" />
          <span>Search Flights</span>
        </router-link>

        <!-- Search Results -->
        <router-link
          to="/search"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'search' }"
        >
          <ListBulletIcon class="nav-icon" />
          <span>Search Results</span>
        </router-link>

        <!-- Booking -->
        <router-link
          to="/booking"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'booking' }"
        >
          <TicketIcon class="nav-icon" />
          <span>Booking</span>
        </router-link>

        <!-- Divider -->
        <div class="border-t border-gray-200 my-4"></div>

        <!-- My Bookings -->
        <router-link
          to="/booking-history"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'booking-history' }"
        >
          <CalendarDaysIcon class="nav-icon" />
          <span>My Bookings</span>
          <span class="ml-auto bg-primary-100 text-primary-600 text-xs font-medium px-2 py-1 rounded-full">{{ bookingCount }}</span>
        </router-link>

        <!-- Saved Flights -->
        <a href="#" class="nav-item">
          <HeartIcon class="nav-icon" />
          <span>Saved Flights</span>
          <span class="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">{{ savedFlightCount }}</span>
        </a>

        <!-- Flight Status -->
        <router-link
          to="/flight-status"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'flight-status' }"
        >
          <ClockIcon class="nav-icon" />
          <span>Flight Status</span>
        </router-link>

        <!-- Travel History -->
        <router-link
          to="/booking-history"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'booking-history' }"
        >
          <CalendarDaysIcon class="nav-icon" />
          <span>Travel History</span>
        </router-link>

        <!-- Divider -->
        <div class="border-t border-gray-200 my-4"></div>

        <!-- Workspace Management -->
        <div class="px-3 py-2">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Workspace
          </h3>
        </div>

        <!-- Current Workspace Info -->
        <div class="nav-item bg-gray-50 border border-gray-200">
          <BuildingOfficeIcon class="nav-icon text-primary-600" />
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900">
              {{ currentWorkspace?.name || 'Personal Travel' }}
            </div>
            <div class="text-xs text-gray-500">
              {{ userWorkspaces.length }} workspace{{ userWorkspaces.length !== 1 ? 's' : '' }}
            </div>
          </div>
          <ChevronUpDownIcon class="h-4 w-4 text-gray-400" />
        </div>

        <!-- Workspace Settings -->
        <a href="#" class="nav-item">
          <CogIcon class="nav-icon" />
          <span>Workspace Settings</span>
        </a>

        <!-- Divider -->
        <div class="border-t border-gray-200 my-4"></div>

        <!-- Profile -->
        <router-link
          to="/profile"
          class="nav-item"
          :class="{ 'nav-item-active': $route.name === 'profile' }"
        >
          <UserIcon class="nav-icon" />
          <span>Profile</span>
        </router-link>

        <!-- Settings -->
        <a href="#" class="nav-item">
          <Cog6ToothIcon class="nav-icon" />
          <span>Settings</span>
        </a>

        <!-- Help & Support -->
        <a href="#" class="nav-item">
          <QuestionMarkCircleIcon class="nav-icon" />
          <span>Help & Support</span>
        </a>
      </nav>

      <!-- User Profile Section -->
      <div class="flex-shrink-0 border-t border-gray-200 p-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium text-white">
              {{ userInitials }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ user?.firstName }} {{ user?.lastName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ user?.email }}
            </p>
          </div>
          <button
            class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            @click="handleLogout"
            title="Sign out"
          >
            <ArrowRightOnRectangleIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useBookingStore } from '@/store/booking'
import { useFlightsStore } from '@/store/flights'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ListBulletIcon,
  TicketIcon,
  CalendarDaysIcon,
  HeartIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChevronUpDownIcon,
  CogIcon,
  UserIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  isMobileMenuOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close-mobile-menu'])

const authStore = useAuthStore()
const bookingStore = useBookingStore()
const flightsStore = useFlightsStore()
const router = useRouter()

const user = computed(() => authStore.user)
const currentWorkspace = computed(() => authStore.currentWorkspace)
const userWorkspaces = computed(() => authStore.userWorkspaces)

const bookingCount = computed(() => {
  return bookingStore.bookings.filter(b => b.status !== 'cancelled').length
})

const savedFlightCount = computed(() => {
  return flightsStore.savedFlights.length
})

const userInitials = computed(() => {
  if (!user.value) return ''
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

const closeMobileMenu = () => {
  emit('close-mobile-menu')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}
</script>

<style scoped>
.nav-item {
  @apply flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200;
}

.nav-item-active {
  @apply bg-primary-50 text-primary-700 border-r-2 border-primary-700;
}

.nav-icon {
  @apply h-5 w-5 mr-3 flex-shrink-0;
}
</style>