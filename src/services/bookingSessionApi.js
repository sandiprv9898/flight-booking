import { useAuthStore } from '@/store/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class BookingSessionAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1/booking-sessions`
  }

  // Get auth token if available
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

  // Create or update booking session
  async saveSession(sessionData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(sessionData)
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Save session error:', error)
      throw error
    }
  }

  // Get booking session
  async getSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}`, {
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Get session error:', error)
      throw error
    }
  }

  // Update booking step
  async updateStep(sessionId, currentStep) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}/step`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentStep })
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Update step error:', error)
      throw error
    }
  }

  // Reserve seats
  async reserveSeats(sessionId, seats) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}/seats`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ seats })
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Reserve seats error:', error)
      throw error
    }
  }

  // Extend seat reservation
  async extendSeatReservation(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}/seats/extend`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Extend seat reservation error:', error)
      throw error
    }
  }

  // Validate pricing
  async validatePricing(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}/validate-pricing`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Validate pricing error:', error)
      throw error
    }
  }

  // Complete booking session
  async completeSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}/complete`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Complete session error:', error)
      throw error
    }
  }

  // Cancel booking session
  async cancelSession(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/${sessionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      return this.handleResponse(response)
    } catch (error) {
      console.error('Cancel session error:', error)
      throw error
    }
  }
}

export const bookingSessionAPI = new BookingSessionAPI()
export default bookingSessionAPI