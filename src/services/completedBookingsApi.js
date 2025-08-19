import { useAuthStore } from '@/store/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class CompletedBookingsAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1/completed-bookings`
  }

  // Get auth token
  getAuthHeaders() {
    const authStore = useAuthStore()
    const headers = {
      'Content-Type': 'application/json'
    }
    
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return headers
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json()
  }

  // Complete booking from session
  async completeBooking(sessionId, bookingData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          sessionId,
          ...bookingData
        })
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Complete booking error:', error)
      throw error
    }
  }

  // Get user's booking history
  async getBookingHistory(limit = 20, offset = 0) {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })

      const response = await fetch(`${this.baseURL}/history?${queryParams}`, {
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Get booking history error:', error)
      throw error
    }
  }

  // Get specific booking by reference
  async getBooking(bookingReference) {
    try {
      const response = await fetch(`${this.baseURL}/${bookingReference}`, {
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Get booking error:', error)
      throw error
    }
  }

  // Cancel booking
  async cancelBooking(bookingReference) {
    try {
      const response = await fetch(`${this.baseURL}/${bookingReference}/cancel`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Cancel booking error:', error)
      throw error
    }
  }

  // Check in for flight
  async checkIn(bookingReference) {
    try {
      const response = await fetch(`${this.baseURL}/${bookingReference}/checkin`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Check-in error:', error)
      throw error
    }
  }
}

export const completedBookingsAPI = new CompletedBookingsAPI()
export default completedBookingsAPI