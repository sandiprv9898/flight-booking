import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/pages/Auth.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/Search.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/booking',
      name: 'booking',
      component: () => import('@/pages/Booking.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/pages/Profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/booking-history',
      name: 'booking-history',
      component: () => import('@/pages/BookingHistory.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/booking-details/:id',
      name: 'booking-details',
      component: () => import('@/pages/BookingHistory.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'auth' })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router