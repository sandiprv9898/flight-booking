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
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p class="mt-2 text-gray-600">Manage your flight bookings and travel history</p>
            </div>
            
            <div class="flex space-x-3">
              <Button variant="secondary" @click="exportBookings">
                <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" @click="$router.push('/')">
                <PlusIcon class="w-4 h-4 mr-2" />
                Book New Flight
              </Button>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div class="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              v-for="filter in filters"
              :key="filter.key"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeFilter === filter.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              ]"
              @click="activeFilter = filter.key"
            >
              {{ filter.label }}
              <span
                v-if="filter.count > 0"
                :class="[
                  'ml-2 px-2 py-1 text-xs rounded-full',
                  activeFilter === filter.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-200 text-gray-600'
                ]"
              >
                {{ filter.count }}
              </span>
            </button>
          </div>

          <!-- Bookings List -->
          <div v-if="filteredBookings.length > 0" class="space-y-6">
            <div
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <!-- Booking Header -->
              <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-4">
                    <div>
                      <div class="text-lg font-semibold text-gray-900">
                        {{ booking.flight.origin.city }} → {{ booking.flight.destination.city }}
                      </div>
                      <div class="text-sm text-gray-500">
                        Booking Reference: {{ booking.bookingReference }}
                      </div>
                    </div>
                    <div
                      :class="[
                        'px-3 py-1 rounded-full text-sm font-medium',
                        getStatusClasses(booking.status)
                      ]"
                    >
                      {{ getStatusLabel(booking.status) }}
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <div class="text-lg font-semibold text-gray-900">
                      ${{ booking.pricing.total.toLocaleString() }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ booking.passengers.length }} passenger{{ booking.passengers.length !== 1 ? 's' : '' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Booking Details -->
              <div class="px-6 py-4">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <!-- Flight Info -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Flight Details</h4>
                    <div class="space-y-1 text-sm text-gray-600">
                      <div class="flex items-center space-x-2">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                        <span>{{ booking.flight.airline }} {{ booking.flight.flightNumber }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <CalendarIcon class="w-4 h-4" />
                        <span>{{ formatDate(booking.flight.departure.date) }}</span>
                      </div>
                      <div class="flex items-center space-x-2">
                        <ClockIcon class="w-4 h-4" />
                        <span>{{ booking.flight.departure.time }} - {{ booking.flight.arrival.time }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Passengers -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Passengers</h4>
                    <div class="space-y-1 text-sm text-gray-600">
                      <div
                        v-for="(passenger, index) in booking.passengers"
                        :key="index"
                        class="flex items-center justify-between"
                      >
                        <span>{{ passenger.firstName }} {{ passenger.lastName }}</span>
                        <span v-if="booking.seats[index]" class="text-xs bg-gray-100 px-2 py-1 rounded">
                          {{ booking.seats[index].seatNumber }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Status & Actions -->
                  <div>
                    <h4 class="font-medium text-gray-900 mb-2">Actions</h4>
                    <div class="space-y-2">
                      <!-- Status-specific actions -->
                      <div v-if="booking.status === 'confirmed'">
                        <Button
                          v-if="canCheckIn(booking)"
                          variant="primary"
                          size="sm"
                          class="w-full mb-2"
                          @click="checkIn(booking)"
                        >
                          <UserIcon class="w-4 h-4 mr-2" />
                          Check In
                        </Button>
                        
                        <Button
                          v-if="canCancel(booking)"
                          variant="secondary"
                          size="sm"
                          class="w-full mb-2"
                          @click="showCancelModal(booking)"
                        >
                          <XCircleIcon class="w-4 h-4 mr-2" />
                          Cancel Booking
                        </Button>
                      </div>

                      <div class="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="viewBookingDetails(booking)"
                        >
                          <EyeIcon class="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          @click="downloadTicket(booking)"
                        >
                          <ArrowDownTrayIcon class="w-4 h-4 mr-1" />
                          Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ getEmptyStateTitle() }}
            </h3>
            <p class="text-gray-600 mb-6">
              {{ getEmptyStateMessage() }}
            </p>
            <Button variant="primary" @click="$router.push('/')">
              <PlusIcon class="w-4 h-4 mr-2" />
              Book Your First Flight
            </Button>
          </div>
        </div>
      </main>
    </div>

    <!-- Cancel Booking Modal -->
    <Modal
      :show="showCancel"
      title="Cancel Booking"
      @close="showCancel = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <ExclamationTriangleIcon class="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h4 class="font-medium text-yellow-800">Cancellation Policy</h4>
              <ul class="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Free cancellation up to 24 hours before departure</li>
                <li>• Cancellation fee may apply for last-minute changes</li>
                <li>• Refund processing takes 5-10 business days</li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="selectedBooking" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-2">Booking Summary</h4>
          <div class="text-sm text-gray-600 space-y-1">
            <div>Reference: {{ selectedBooking.bookingReference }}</div>
            <div>Flight: {{ selectedBooking.flight.airline }} {{ selectedBooking.flight.flightNumber }}</div>
            <div>Total Paid: ${{ selectedBooking.pricing.total.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <Button variant="secondary" @click="showCancel = false">
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            @click="confirmCancel"
            :loading="cancelLoading"
          >
            Cancel Booking
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/store/booking'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'
import {
  DocumentArrowDownIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const bookingStore = useBookingStore()

const isMobileMenuOpen = ref(false)
const activeFilter = ref('all')
const showCancel = ref(false)
const selectedBooking = ref(null)
const cancelLoading = ref(false)

const bookings = computed(() => bookingStore.bookings)

const filters = computed(() => [
  { key: 'all', label: 'All Bookings', count: bookings.value.length },
  { key: 'upcoming', label: 'Upcoming', count: upcomingBookings.value.length },
  { key: 'past', label: 'Past', count: pastBookings.value.length },
  { key: 'cancelled', label: 'Cancelled', count: cancelledBookings.value.length }
])

const upcomingBookings = computed(() => {
  const now = new Date()
  return bookings.value.filter(booking => {
    const departureDate = new Date(booking.flight.departure.date)
    return departureDate > now && booking.status !== 'cancelled'
  })
})

const pastBookings = computed(() => {
  const now = new Date()
  return bookings.value.filter(booking => {
    const departureDate = new Date(booking.flight.departure.date)
    return departureDate <= now && booking.status !== 'cancelled'
  })
})

const cancelledBookings = computed(() => {
  return bookings.value.filter(booking => booking.status === 'cancelled')
})

const filteredBookings = computed(() => {
  switch (activeFilter.value) {
    case 'upcoming': return upcomingBookings.value
    case 'past': return pastBookings.value
    case 'cancelled': return cancelledBookings.value
    default: return bookings.value
  }
})

const getStatusClasses = (status) => {
  const classes = {
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    pending: 'Pending'
  }
  return labels[status] || 'Unknown'
}

const canCheckIn = (booking) => {
  if (booking.status !== 'confirmed') return false
  
  const now = new Date()
  const departureDate = new Date(booking.flight.departure.date + ' ' + booking.flight.departure.time)
  const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60)
  
  return hoursUntilDeparture <= 24 && hoursUntilDeparture > 0
}

const canCancel = (booking) => {
  if (booking.status !== 'confirmed') return false
  
  const now = new Date()
  const departureDate = new Date(booking.flight.departure.date + ' ' + booking.flight.departure.time)
  const hoursUntilDeparture = (departureDate - now) / (1000 * 60 * 60)
  
  return hoursUntilDeparture > 24
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getEmptyStateTitle = () => {
  const titles = {
    all: 'No bookings yet',
    upcoming: 'No upcoming flights',
    past: 'No travel history',
    cancelled: 'No cancelled bookings'
  }
  return titles[activeFilter.value] || 'No bookings found'
}

const getEmptyStateMessage = () => {
  const messages = {
    all: 'Start your journey by booking your first flight with us.',
    upcoming: 'You have no upcoming flights. Book a new flight to start planning your next adventure.',
    past: 'Your completed flights will appear here.',
    cancelled: 'You have no cancelled bookings.'
  }
  return messages[activeFilter.value] || 'No bookings match your current filter.'
}

const checkIn = (booking) => {
  alert('Check-in feature coming soon! You will receive an email with check-in instructions 24 hours before departure.')
}

const showCancelModal = (booking) => {
  selectedBooking.value = booking
  showCancel.value = true
}

const confirmCancel = async () => {
  if (!selectedBooking.value) return
  
  cancelLoading.value = true
  
  try {
    await bookingStore.cancelBooking(selectedBooking.value.id)
    showCancel.value = false
    selectedBooking.value = null
    alert('Booking cancelled successfully. You will receive a confirmation email shortly.')
  } catch (error) {
    alert('Failed to cancel booking. Please try again.')
  } finally {
    cancelLoading.value = false
  }
}

const viewBookingDetails = (booking) => {
  // Navigate to detailed booking view
  router.push(`/booking-details/${booking.id}`)
}

const downloadTicket = (booking) => {
  // Generate and download ticket PDF
  alert('Ticket download feature coming soon! Your tickets have been sent to your email.')
}

const exportBookings = () => {
  // Export bookings as CSV/PDF
  alert('Export feature coming soon!')
}

onMounted(() => {
  bookingStore.getBookingHistory()
})
</script>