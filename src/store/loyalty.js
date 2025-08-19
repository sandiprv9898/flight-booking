import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

// Loyalty tiers configuration
export const loyaltyTiers = {
  bronze: {
    name: 'Bronze',
    minPoints: 0,
    color: '#CD7F32',
    benefits: [
      'Earn 1 point per $1 spent',
      'Birthday bonus: 500 points',
      'Access to member-only deals'
    ],
    multiplier: 1,
    icon: '🥉'
  },
  silver: {
    name: 'Silver',
    minPoints: 25000,
    color: '#C0C0C0',
    benefits: [
      'Earn 1.25 points per $1 spent',
      'Priority check-in',
      'Free seat selection',
      'Birthday bonus: 1000 points',
      '10% discount on extras'
    ],
    multiplier: 1.25,
    icon: '🥈'
  },
  gold: {
    name: 'Gold',
    minPoints: 50000,
    color: '#FFD700',
    benefits: [
      'Earn 1.5 points per $1 spent',
      'Priority boarding',
      'Free baggage upgrade',
      'Access to premium lounges',
      'Birthday bonus: 2000 points',
      '15% discount on extras'
    ],
    multiplier: 1.5,
    icon: '🥇'
  },
  platinum: {
    name: 'Platinum',
    minPoints: 100000,
    color: '#E5E4E2',
    benefits: [
      'Earn 2 points per $1 spent',
      'Complimentary upgrades (subject to availability)',
      'Free lounge access worldwide',
      'Dedicated customer service',
      'Birthday bonus: 5000 points',
      '25% discount on extras'
    ],
    multiplier: 2,
    icon: '💎'
  }
}

// Points earning activities
export const pointsActivities = {
  flight: { base: 100, multiplier: 'distance' }, // 100 points per 1000 miles
  booking: { base: 50, multiplier: 'amount' }, // 1 point per $1
  review: { base: 100, limit: 5 }, // 100 points per review, max 5 per month
  referral: { base: 5000, limit: 10 }, // 5000 points per referral, max 10 per year
  birthday: { base: 500 }, // Annual birthday bonus
  newsletter: { base: 100 }, // One-time signup bonus
  socialShare: { base: 25, limit: 10 } // 25 points per share, max 10 per month
}

export const useLoyaltyStore = defineStore('loyalty', () => {
  // State
  const userPoints = ref(0)
  const lifetimePoints = ref(0)
  const currentTier = ref('bronze')
  const pointsHistory = ref([])
  const achievements = ref([])
  const availableRewards = ref([])

  // Mock rewards catalog
  const rewardsCatalog = ref([
    {
      id: 'upgrade-premium',
      name: 'Premium Economy Upgrade',
      description: 'Upgrade to premium economy on your next flight',
      points: 15000,
      category: 'upgrades',
      image: '✈️',
      validity: 12 // months
    },
    {
      id: 'lounge-access',
      name: 'Airport Lounge Access',
      description: 'Single-use lounge access at participating airports',
      points: 8000,
      category: 'experiences',
      image: '🏢',
      validity: 6
    },
    {
      id: 'free-baggage',
      name: 'Free Checked Bag',
      description: 'One free checked bag on your next flight',
      points: 5000,
      category: 'services',
      image: '🧳',
      validity: 12
    },
    {
      id: 'priority-boarding',
      name: 'Priority Boarding',
      description: 'Board early on your next flight',
      points: 3000,
      category: 'services',
      image: '🎫',
      validity: 6
    },
    {
      id: 'meal-voucher',
      name: 'Airport Meal Voucher',
      description: '$25 meal voucher at participating airport restaurants',
      points: 2500,
      category: 'dining',
      image: '🍽️',
      validity: 12
    },
    {
      id: 'gift-card-100',
      name: '$100 Travel Gift Card',
      description: 'Use towards any booking or travel expenses',
      points: 12000,
      category: 'vouchers',
      image: '💳',
      validity: 24
    }
  ])

  // Getters
  const currentTierInfo = computed(() => loyaltyTiers[currentTier.value])
  
  const nextTier = computed(() => {
    const tiers = Object.entries(loyaltyTiers)
    const currentIndex = tiers.findIndex(([key]) => key === currentTier.value)
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  })

  const pointsToNextTier = computed(() => {
    if (!nextTier.value) return 0
    return nextTier.value[1].minPoints - userPoints.value
  })

  const tierProgress = computed(() => {
    if (!nextTier.value) return 100
    
    const current = currentTierInfo.value.minPoints
    const next = nextTier.value[1].minPoints
    const progress = userPoints.value - current
    const total = next - current
    
    return Math.min(100, Math.max(0, (progress / total) * 100))
  })

  const affordableRewards = computed(() => {
    return rewardsCatalog.value.filter(reward => reward.points <= userPoints.value)
  })

  const recentActivity = computed(() => {
    return pointsHistory.value
      .slice(0, 10)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // Actions
  const initializeLoyalty = (userId) => {
    // Load user's loyalty data (mock implementation)
    const savedData = localStorage.getItem(`loyalty_${userId}`)
    
    if (savedData) {
      const data = JSON.parse(savedData)
      userPoints.value = data.points || 0
      lifetimePoints.value = data.lifetimePoints || 0
      currentTier.value = data.tier || 'bronze'
      pointsHistory.value = data.history || []
      achievements.value = data.achievements || []
    } else {
      // New user - award welcome bonus
      awardPoints(1000, 'Welcome Bonus', 'signup')
    }
    
    updateTierStatus()
  }

  const awardPoints = (points, description, activity, metadata = {}) => {
    const tierMultiplier = currentTierInfo.value.multiplier
    const finalPoints = Math.round(points * tierMultiplier)
    
    userPoints.value += finalPoints
    lifetimePoints.value += finalPoints
    
    // Add to history
    pointsHistory.value.unshift({
      id: Date.now(),
      points: finalPoints,
      description,
      activity,
      date: new Date().toISOString(),
      metadata
    })
    
    updateTierStatus()
    checkAchievements()
    saveLoyaltyData()
    
    return finalPoints
  }

  const redeemReward = (rewardId) => {
    const reward = rewardsCatalog.value.find(r => r.id === rewardId)
    
    if (!reward) {
      return { success: false, error: 'Reward not found' }
    }
    
    if (userPoints.value < reward.points) {
      return { success: false, error: 'Insufficient points' }
    }
    
    userPoints.value -= reward.points
    
    // Add to history
    pointsHistory.value.unshift({
      id: Date.now(),
      points: -reward.points,
      description: `Redeemed: ${reward.name}`,
      activity: 'redemption',
      date: new Date().toISOString(),
      metadata: { rewardId, rewardName: reward.name }
    })
    
    // Add to user's rewards
    availableRewards.value.push({
      ...reward,
      redeemedDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + reward.validity * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    })
    
    saveLoyaltyData()
    
    return { success: true, reward }
  }

  const calculateFlightPoints = (bookingAmount, distance = 1000) => {
    const basePoints = pointsActivities.booking.base
    const flightPoints = pointsActivities.flight.base * (distance / 1000)
    
    return Math.round(bookingAmount * (basePoints / 100) + flightPoints)
  }

  const updateTierStatus = () => {
    const tiers = Object.entries(loyaltyTiers).reverse() // Start from highest tier
    
    for (const [tierKey, tierInfo] of tiers) {
      if (userPoints.value >= tierInfo.minPoints) {
        if (currentTier.value !== tierKey) {
          // Tier upgrade!
          const oldTier = currentTier.value
          currentTier.value = tierKey
          
          // Award tier upgrade bonus
          const bonusPoints = tierInfo.minPoints * 0.1 // 10% bonus
          awardPoints(bonusPoints, `${tierInfo.name} Tier Upgrade Bonus!`, 'tier_upgrade')
          
          // Add achievement
          achievements.value.push({
            id: `tier_${tierKey}`,
            name: `${tierInfo.name} Member`,
            description: `Achieved ${tierInfo.name} tier status`,
            icon: tierInfo.icon,
            date: new Date().toISOString()
          })
        }
        break
      }
    }
  }

  const checkAchievements = () => {
    // Check various achievements
    const milestones = [5000, 10000, 25000, 50000, 100000]
    
    milestones.forEach(milestone => {
      const achievementId = `points_${milestone}`
      const hasAchievement = achievements.value.some(a => a.id === achievementId)
      
      if (!hasAchievement && lifetimePoints.value >= milestone) {
        achievements.value.push({
          id: achievementId,
          name: `${milestone.toLocaleString()} Points`,
          description: `Earned ${milestone.toLocaleString()} lifetime points`,
          icon: '⭐',
          date: new Date().toISOString()
        })
      }
    })
  }

  const saveLoyaltyData = () => {
    const authStore = useAuthStore()
    if (!authStore.user) return
    
    const data = {
      points: userPoints.value,
      lifetimePoints: lifetimePoints.value,
      tier: currentTier.value,
      history: pointsHistory.value,
      achievements: achievements.value,
      rewards: availableRewards.value
    }
    
    localStorage.setItem(`loyalty_${authStore.user.id}`, JSON.stringify(data))
  }

  const getPointsBalance = () => userPoints.value

  const getRewardsByCategory = (category) => {
    return rewardsCatalog.value.filter(reward => reward.category === category)
  }

  const formatPoints = (points) => {
    return new Intl.NumberFormat('en-US').format(points)
  }

  return {
    // State
    userPoints,
    lifetimePoints,
    currentTier,
    pointsHistory,
    achievements,
    availableRewards,
    rewardsCatalog,

    // Getters
    currentTierInfo,
    nextTier,
    pointsToNextTier,
    tierProgress,
    affordableRewards,
    recentActivity,

    // Actions
    initializeLoyalty,
    awardPoints,
    redeemReward,
    calculateFlightPoints,
    updateTierStatus,
    checkAchievements,
    saveLoyaltyData,
    getPointsBalance,
    getRewardsByCategory,
    formatPoints
  }
})