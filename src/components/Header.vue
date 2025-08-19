<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div class="flex items-center justify-between h-16 px-4 lg:px-6">
      <!-- Mobile menu button -->
      <button
        class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        @click="$emit('toggle-mobile-menu')"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>

      <!-- Page Title & Breadcrumbs -->
      <div class="flex-1 flex items-center space-x-4 lg:space-x-6">
        <!-- Breadcrumbs -->
        <nav class="hidden md:flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-2">
            <li>
              <router-link
                to="/"
                class="text-gray-400 hover:text-gray-500"
              >
                <HomeIcon class="h-5 w-5" />
              </router-link>
            </li>
            <li v-if="breadcrumbs.length > 0">
              <div class="flex items-center">
                <ChevronRightIcon class="h-5 w-5 text-gray-300 mx-2" />
                <span class="text-sm font-medium text-gray-900">
                  {{ currentPageTitle }}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <!-- Page Title (Mobile) -->
        <h1 class="md:hidden text-lg font-semibold text-gray-900">
          {{ currentPageTitle }}
        </h1>
      </div>

      <!-- Right side actions -->
      <div class="flex items-center space-x-4">
        <!-- Search Bar (Desktop) -->
        <div class="hidden lg:block relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search flights, bookings..."
            class="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        <!-- Workspace Switcher -->
        <WorkspaceSwitcher />

        <!-- Notifications -->
        <button
          class="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative"
          @click="toggleNotifications"
        >
          <BellIcon class="h-6 w-6" />
          <!-- Notification badge -->
          <span
            v-if="unreadNotifications > 0"
            class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
          </span>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button
            class="flex items-center space-x-3 p-2 text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            @click="toggleUserMenu"
          >
            <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <span class="hidden lg:block font-medium text-gray-700">
              {{ user?.firstName }}
            </span>
            <ChevronDownIcon class="hidden lg:block h-4 w-4 text-gray-400" />
          </button>

          <!-- User Menu Dropdown -->
          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40"
            @click="closeUserMenu"
          >
            <!-- User Info -->
            <div class="px-4 py-3 border-b border-gray-200">
              <p class="text-sm font-medium text-gray-900">
                {{ user?.firstName }} {{ user?.lastName }}
              </p>
              <p class="text-sm text-gray-500">
                {{ user?.email }}
              </p>
            </div>

            <!-- Menu Items -->
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-center">
                <UserIcon class="h-5 w-5 mr-3 text-gray-400" />
                Profile
              </div>
            </router-link>

            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-center">
                <Cog6ToothIcon class="h-5 w-5 mr-3 text-gray-400" />
                Settings
              </div>
            </a>


            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-center">
                <QuestionMarkCircleIcon class="h-5 w-5 mr-3 text-gray-400" />
                Help & Support
              </div>
            </a>

            <div class="border-t border-gray-200 my-1"></div>

            <button
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              @click="handleLogout"
            >
              <div class="flex items-center">
                <ArrowRightOnRectangleIcon class="h-5 w-5 mr-3 text-gray-400" />
                Sign out
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Search Bar -->
    <div class="lg:hidden px-4 pb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search flights, bookings..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
        />
      </div>
    </div>

    <!-- Notifications Panel -->
    <div
      v-if="isNotificationsOpen"
      class="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40"
    >
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Notifications</h3>
          <button
            class="text-sm text-primary-600 hover:text-primary-500"
            @click="markAllAsRead"
          >
            Mark all as read
          </button>
        </div>
      </div>
      
      <div class="max-h-80 overflow-y-auto">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="p-4 border-b border-gray-100 hover:bg-gray-50"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <div
                :class="[
                  'w-2 h-2 rounded-full mt-2',
                  notification.read ? 'bg-gray-300' : 'bg-primary-600'
                ]"
              ></div>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ notification.title }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ notification.message }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ notificationsStore.formatRelativeTime(notification.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t border-gray-200">
        <router-link
          to="/notifications"
          class="text-sm text-primary-600 hover:text-primary-500"
          @click="isNotificationsOpen = false"
        >
          View all notifications
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useNotificationsStore } from '@/store/notifications'
import WorkspaceSwitcher from './WorkspaceSwitcher.vue'
import {
  Bars3Icon,
  HomeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  UserIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

defineEmits(['toggle-mobile-menu'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const isUserMenuOpen = ref(false)
const isNotificationsOpen = ref(false)

const user = computed(() => authStore.user)

const userInitials = computed(() => {
  if (!user.value) return ''
  const firstName = user.value.firstName || ''
  const lastName = user.value.lastName || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
})

const currentPageTitle = computed(() => {
  const routeNames = {
    'home': 'Search Flights',
    'search': 'Search Results',
    'booking': 'Booking',
    'profile': 'Profile'
  }
  return routeNames[route.name] || 'FlightBook'
})

const breadcrumbs = computed(() => {
  // Generate breadcrumbs based on current route
  return []
})

// Use notifications from store
const notifications = computed(() => notificationsStore.notifications.slice(0, 5)) // Show only first 5 in dropdown
const unreadNotifications = computed(() => notificationsStore.unreadCount)

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isNotificationsOpen.value = false
}

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
  isUserMenuOpen.value = false
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const markAllAsRead = () => {
  notificationsStore.markAllAsRead()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isUserMenuOpen.value = false
    isNotificationsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // Initialize notifications when header mounts
  notificationsStore.initializeNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>