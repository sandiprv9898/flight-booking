<template>
  <div class="relative">
    <Select
      :model-value="currentCurrency"
      :options="currencyOptions"
      :label="showLabel ? 'Currency' : ''"
      :placeholder="placeholder"
      @update:model-value="handleCurrencyChange"
      :class="containerClass"
    >
      <template #option="{ option }">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-2">
            <span class="font-medium">{{ option.symbol }}</span>
            <span>{{ option.value }}</span>
          </div>
          <span class="text-sm text-gray-500">{{ option.label.split(' - ')[1] }}</span>
        </div>
      </template>
      
      <template #selected="{ option }">
        <div class="flex items-center space-x-2">
          <span class="font-medium">{{ option.symbol }}</span>
          <span>{{ option.value }}</span>
        </div>
      </template>
    </Select>
    
    <!-- Exchange Rate Info -->
    <div v-if="showRateInfo && !isBaseCurrency" class="mt-1 text-xs text-gray-500">
      1 USD = {{ formatRate() }} {{ currentCurrency }}
    </div>
    
    <!-- Last Updated -->
    <div v-if="showLastUpdated && lastUpdated" class="mt-1 text-xs text-gray-400">
      Updated: {{ formatLastUpdated() }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrencyStore } from '@/store/currency'
import Select from './Select.vue'

const props = defineProps({
  showLabel: {
    type: Boolean,
    default: true
  },
  showRateInfo: {
    type: Boolean,
    default: false
  },
  showLastUpdated: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Select currency'
  },
  containerClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['currency-changed'])

const currencyStore = useCurrencyStore()

// Computed
const currentCurrency = computed(() => currencyStore.currentCurrency)
const currencyOptions = computed(() => currencyStore.availableCurrencies)
const isBaseCurrency = computed(() => currencyStore.isBaseCurrency)
const lastUpdated = computed(() => currencyStore.lastUpdated)

// Methods
const handleCurrencyChange = (newCurrency) => {
  currencyStore.setCurrency(newCurrency)
  emit('currency-changed', newCurrency)
}

const formatRate = () => {
  const rate = currencyStore.convertPrice(1, 'USD')
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(rate)
}

const formatLastUpdated = () => {
  if (!lastUpdated.value) return ''
  
  const date = new Date(lastUpdated.value)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>