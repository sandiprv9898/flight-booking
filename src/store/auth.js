import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { detectUserCurrency } from '@/utils/currency'

// Mock data for development
const mockUsers = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    passportNumber: 'A12345678',
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: true
    }
  },
  {
    id: 2,
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1987654321',
    dateOfBirth: '1985-05-15',
    preferences: {
      currency: 'EUR',
      language: 'en',
      notifications: false
    }
  }
]

const mockWorkspaces = [
  {
    id: 1,
    name: 'Personal Travel',
    isDefault: true,
    userId: 1,
    settings: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York'
    }
  },
  {
    id: 2,
    name: 'Business Travel',
    isDefault: false,
    userId: 1,
    settings: {
      currency: 'USD',
      language: 'en',
      timezone: 'America/New_York'
    }
  },
  {
    id: 3,
    name: 'Personal Travel',
    isDefault: true,
    userId: 2,
    settings: {
      currency: 'EUR',
      language: 'en',
      timezone: 'Europe/London'
    }
  }
]

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const currentWorkspace = ref(null)
  const authMode = ref('login') // 'login', 'register', 'forgot'
  const registrationStep = ref(1)
  const loading = ref(false)
  const error = ref('')

  // Registration form data
  const registrationData = ref({
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

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const userWorkspaces = computed(() => {
    if (!user.value) return []
    return mockWorkspaces.filter(ws => ws.userId === user.value.id)
  })
  const defaultWorkspace = computed(() => {
    return userWorkspaces.value.find(ws => ws.isDefault)
  })

  // Actions
  const login = async (credentials) => {
    loading.value = true
    error.value = ''

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const foundUser = mockUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      )

      if (!foundUser) {
        throw new Error('Invalid email or password')
      }

      // Set user and default workspace
      user.value = foundUser
      currentWorkspace.value = mockWorkspaces.find(
        ws => ws.userId === foundUser.id && ws.isDefault
      )

      // Store in localStorage for persistence
      localStorage.setItem('auth_user', JSON.stringify(foundUser))
      localStorage.setItem('current_workspace', JSON.stringify(currentWorkspace.value))

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const register = async () => {
    loading.value = true
    error.value = ''

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create new user
      const newUser = {
        id: Date.now(),
        email: registrationData.value.step1.email,
        firstName: registrationData.value.step1.firstName,
        lastName: registrationData.value.step1.lastName,
        phone: registrationData.value.step1.phone,
        dateOfBirth: registrationData.value.step2.dateOfBirth,
        passportNumber: registrationData.value.step2.passportNumber,
        preferences: {
          currency: registrationData.value.step3.currency,
          language: registrationData.value.step3.language,
          notifications: registrationData.value.step3.notifications
        }
      }

      // Create default workspace
      const newWorkspace = {
        id: Date.now(),
        name: 'Personal Travel',
        isDefault: true,
        userId: newUser.id,
        settings: {
          currency: registrationData.value.step3.currency,
          language: registrationData.value.step3.language,
          timezone: registrationData.value.step3.timezone
        }
      }

      // Add to mock data (in real app, this would be API calls)
      mockUsers.push(newUser)
      mockWorkspaces.push(newWorkspace)

      // Set current user and workspace
      user.value = newUser
      currentWorkspace.value = newWorkspace

      // Store in localStorage
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      localStorage.setItem('current_workspace', JSON.stringify(newWorkspace))

      // Reset registration data
      resetRegistrationData()

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email) => {
    loading.value = true
    error.value = ''

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const foundUser = mockUsers.find(u => u.email === email)
      if (!foundUser) {
        throw new Error('No account found with this email address')
      }

      // In real app, this would send reset email
      return { success: true, message: 'Password reset email sent' }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const socialLogin = async (provider) => {
    loading.value = true
    error.value = ''

    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Create mock social user
      const socialUser = {
        id: Date.now(),
        email: `user@${provider}.com`,
        firstName: 'Social',
        lastName: 'User',
        provider: provider,
        preferences: {
          currency: 'USD',
          language: 'en',
          notifications: true
        }
      }

      const newWorkspace = {
        id: Date.now(),
        name: 'Personal Travel',
        isDefault: true,
        userId: socialUser.id,
        settings: {
          currency: 'USD',
          language: 'en',
          timezone: 'America/New_York'
        }
      }

      mockUsers.push(socialUser)
      mockWorkspaces.push(newWorkspace)

      user.value = socialUser
      currentWorkspace.value = newWorkspace

      localStorage.setItem('auth_user', JSON.stringify(socialUser))
      localStorage.setItem('current_workspace', JSON.stringify(newWorkspace))

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    currentWorkspace.value = null
    localStorage.removeItem('auth_user')
    localStorage.removeItem('current_workspace')
    resetRegistrationData()
  }

  const switchWorkspace = (workspaceId) => {
    const workspace = userWorkspaces.value.find(ws => ws.id === workspaceId)
    if (workspace) {
      currentWorkspace.value = workspace
      localStorage.setItem('current_workspace', JSON.stringify(workspace))
    }
  }

  const setAuthMode = (mode) => {
    authMode.value = mode
    error.value = ''
  }

  const setRegistrationStep = (step) => {
    registrationStep.value = step
  }

  const updateRegistrationData = (step, data) => {
    registrationData.value[step] = { ...registrationData.value[step], ...data }
  }

  const resetRegistrationData = () => {
    registrationStep.value = 1
    registrationData.value = {
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
    }
  }

  const initializeAuth = async () => {
    // Check for stored auth data on app initialization
    const storedUser = localStorage.getItem('auth_user')
    const storedWorkspace = localStorage.getItem('current_workspace')

    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }

    if (storedWorkspace) {
      currentWorkspace.value = JSON.parse(storedWorkspace)
    }

    // Detect and set user's currency if not already set
    if (!storedUser && !registrationData.value.step3.currency) {
      try {
        const detectedCurrency = await detectUserCurrency()
        registrationData.value.step3.currency = detectedCurrency
      } catch {
        registrationData.value.step3.currency = 'USD'
      }
    }
  }

  return {
    // State
    user,
    currentWorkspace,
    authMode,
    registrationStep,
    registrationData,
    loading,
    error,

    // Getters
    isAuthenticated,
    userWorkspaces,
    defaultWorkspace,

    // Actions
    login,
    register,
    forgotPassword,
    socialLogin,
    logout,
    switchWorkspace,
    setAuthMode,
    setRegistrationStep,
    updateRegistrationData,
    resetRegistrationData,
    initializeAuth
  }
})