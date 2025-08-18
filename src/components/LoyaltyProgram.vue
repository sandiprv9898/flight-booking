<template>
  <div class="bg-white rounded-lg border border-neutral-200 overflow-hidden">
    <div class="p-6 border-b border-neutral-200" :class="tierStyles.header">
      <div class="flex items-center space-x-3">
        <div class="w-12 h-12 rounded-lg flex items-center justify-center" :class="tierStyles.icon">
          <TrophyIcon class="w-7 h-7" :class="tierStyles.iconColor" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">FlightBook Rewards</h2>
          <p class="text-sm opacity-90">{{ currentTier.name }} Member</p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Current Status -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-neutral-900">Current Status</h3>
          <div class="text-right">
            <div class="text-2xl font-bold" :class="tierStyles.text">{{ loyaltyData.miles.toLocaleString() }}</div>
            <div class="text-sm text-neutral-600">Total Miles</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Progress to {{ nextTier?.name || 'Elite Status' }}</span>
            <span>{{ milesNeeded.toLocaleString() }} miles needed</span>
          </div>
          <div class="w-full bg-neutral-200 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-500" 
              :class="tierStyles.progress"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
        </div>
        
        <!-- Tier Benefits -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-neutral-50 rounded-lg">
            <div class="text-lg font-bold" :class="tierStyles.text">{{ currentTier.earnRate }}x</div>
            <div class="text-sm text-neutral-600">Miles Earning Rate</div>
          </div>
          <div class="text-center p-4 bg-neutral-50 rounded-lg">
            <div class="text-lg font-bold" :class="tierStyles.text">{{ loyaltyData.upgradesAvailable }}</div>
            <div class="text-sm text-neutral-600">Free Upgrades</div>
          </div>
          <div class="text-center p-4 bg-neutral-50 rounded-lg">
            <div class="text-lg font-bold" :class="tierStyles.text">{{ currentTier.priorityBoarding ? 'Yes' : 'No' }}</div>
            <div class="text-sm text-neutral-600">Priority Boarding</div>
          </div>
        </div>
      </div>

      <!-- Available Rewards -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">Available Rewards</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="reward in availableRewards" 
            :key="reward.id"
            class="border border-neutral-200 rounded-lg p-4 hover:border-primary-300 transition-colors cursor-pointer"
            :class="{ 'opacity-50': loyaltyData.miles < reward.cost }"
            @click="redeemReward(reward)"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-neutral-900">{{ reward.title }}</h4>
              <div class="text-lg font-bold" :class="tierStyles.text">{{ reward.cost.toLocaleString() }}</div>
            </div>
            <p class="text-sm text-neutral-600 mb-3">{{ reward.description }}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              class="w-full"
              :disabled="loyaltyData.miles < reward.cost"
              @click.stop="redeemReward(reward)"
            >
              {{ loyaltyData.miles >= reward.cost ? 'Redeem' : 'Not enough miles' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Earning History -->
      <div>
        <h3 class="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
        <div class="space-y-3">
          <div 
            v-for="activity in loyaltyData.recentActivity" 
            :key="activity.id"
            class="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="getActivityIcon(activity.type).bg">
                <component :is="getActivityIcon(activity.type).icon" class="w-4 h-4" :class="getActivityIcon(activity.type).color" />
              </div>
              <div>
                <div class="font-medium text-neutral-900">{{ activity.description }}</div>
                <div class="text-sm text-neutral-600">{{ formatDate(activity.date) }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-semibold" :class="activity.miles > 0 ? 'text-success-600' : 'text-error-600'">
                {{ activity.miles > 0 ? '+' : '' }}{{ activity.miles.toLocaleString() }} miles
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tier Information -->
      <div class="mt-8 p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-lg border border-neutral-200">
        <h4 class="font-semibold text-neutral-900 mb-3">Membership Tiers</h4>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div 
            v-for="tier in tiers" 
            :key="tier.level"
            class="text-center p-3 rounded border"
            :class="tier.level === currentTier.level ? 'bg-primary-100 border-primary-300' : 'bg-white border-neutral-200'"
          >
            <div class="text-sm font-medium" :class="tier.level === currentTier.level ? 'text-primary-900' : 'text-neutral-700'">
              {{ tier.name }}
            </div>
            <div class="text-xs text-neutral-600 mt-1">{{ tier.threshold.toLocaleString() }}+ miles</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import { 
  TrophyIcon,
  PlusIcon,
  MinusIcon,
  GiftIcon,
  AirplaneIcon
} from '@heroicons/vue/24/outline'

// Mock loyalty data
const loyaltyData = ref({
  miles: 42750,
  upgradesAvailable: 2,
  recentActivity: [
    {
      id: 1,
      type: 'flight',
      description: 'Flight JFK → LHR (BA178)',
      miles: 3500,
      date: '2024-03-10'
    },
    {
      id: 2,
      type: 'redemption',
      description: 'Free upgrade to Business Class',
      miles: -15000,
      date: '2024-03-05'
    },
    {
      id: 3,
      type: 'bonus',
      description: 'New member bonus',
      miles: 5000,
      date: '2024-02-28'
    },
    {
      id: 4,
      type: 'flight',
      description: 'Flight LAX → NRT (JL061)',
      miles: 4200,
      date: '2024-02-20'
    }
  ]
})

const tiers = [
  { level: 1, name: 'Silver', threshold: 0, earnRate: 1, priorityBoarding: false },
  { level: 2, name: 'Gold', threshold: 25000, earnRate: 1.5, priorityBoarding: true },
  { level: 3, name: 'Platinum', threshold: 50000, earnRate: 2, priorityBoarding: true },
  { level: 4, name: 'Diamond', threshold: 100000, earnRate: 2.5, priorityBoarding: true }
]

const availableRewards = ref([
  {
    id: 1,
    title: 'Free Domestic Flight',
    description: 'Redeem for any domestic flight under 3 hours',
    cost: 25000
  },
  {
    id: 2,
    title: 'Business Class Upgrade',
    description: 'Upgrade your next flight to Business Class',
    cost: 15000
  },
  {
    id: 3,
    title: 'Lounge Access Pass',
    description: 'Access to airport lounges worldwide for 1 year',
    cost: 35000
  },
  {
    id: 4,
    title: 'Extra Baggage Allowance',
    description: '50lbs additional baggage allowance',
    cost: 8000
  }
])

const currentTier = computed(() => {
  const miles = loyaltyData.value.miles
  return [...tiers].reverse().find(tier => miles >= tier.threshold) || tiers[0]
})

const nextTier = computed(() => {
  const currentLevel = currentTier.value.level
  return tiers.find(tier => tier.level > currentLevel)
})

const milesNeeded = computed(() => {
  if (!nextTier.value) return 0
  return nextTier.value.threshold - loyaltyData.value.miles
})

const progressPercent = computed(() => {
  if (!nextTier.value) return 100
  const currentThreshold = currentTier.value.threshold
  const nextThreshold = nextTier.value.threshold
  const progress = (loyaltyData.value.miles - currentThreshold) / (nextThreshold - currentThreshold)
  return Math.min(100, Math.max(0, progress * 100))
})

const tierStyles = computed(() => {
  const styles = {
    1: { // Silver
      header: 'bg-gradient-to-r from-neutral-400 to-neutral-500',
      icon: 'bg-neutral-100',
      iconColor: 'text-neutral-600',
      text: 'text-neutral-600',
      progress: 'bg-neutral-400'
    },
    2: { // Gold
      header: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
      icon: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      text: 'text-yellow-600',
      progress: 'bg-yellow-400'
    },
    3: { // Platinum
      header: 'bg-gradient-to-r from-purple-500 to-purple-600',
      icon: 'bg-purple-100',
      iconColor: 'text-purple-600',
      text: 'text-purple-600',
      progress: 'bg-purple-500'
    },
    4: { // Diamond
      header: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'bg-blue-100',
      iconColor: 'text-blue-600',
      text: 'text-blue-600',
      progress: 'bg-blue-500'
    }
  }
  return styles[currentTier.value.level]
})

const getActivityIcon = (type) => {
  const icons = {
    flight: { icon: AirplaneIcon, bg: 'bg-primary-100', color: 'text-primary-600' },
    redemption: { icon: MinusIcon, bg: 'bg-error-100', color: 'text-error-600' },
    bonus: { icon: GiftIcon, bg: 'bg-success-100', color: 'text-success-600' }
  }
  return icons[type] || { icon: PlusIcon, bg: 'bg-neutral-100', color: 'text-neutral-600' }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const redeemReward = (reward) => {
  if (loyaltyData.value.miles < reward.cost) {
    alert('Not enough miles to redeem this reward')
    return
  }

  if (confirm(`Redeem ${reward.cost.toLocaleString()} miles for "${reward.title}"?`)) {
    loyaltyData.value.miles -= reward.cost
    loyaltyData.value.recentActivity.unshift({
      id: Date.now(),
      type: 'redemption',
      description: `Redeemed: ${reward.title}`,
      miles: -reward.cost,
      date: new Date().toISOString().split('T')[0]
    })
    alert(`Successfully redeemed "${reward.title}"!`)
  }
}
</script>