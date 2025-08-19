<template>
  <div class="relative">
    <Select
      :model-value="currentLanguage"
      :options="languageOptions"
      :label="showLabel ? $t('common.language') : ''"
      :placeholder="$t('common.select')"
      @update:model-value="changeLanguage"
      :class="containerClass"
    >
      <template #option="{ option }">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-3">
            <span class="text-lg">{{ option.flag }}</span>
            <div>
              <div class="font-medium">{{ option.name }}</div>
              <div class="text-xs text-gray-500">{{ option.value.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </template>
      
      <template #selected="{ option }">
        <div class="flex items-center space-x-2">
          <span class="text-lg">{{ option.flag }}</span>
          <span class="font-medium">{{ compact ? option.value.toUpperCase() : option.name }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { supportedLanguages } from '@/i18n'
import Select from './Select.vue'

const props = defineProps({
  showLabel: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  },
  containerClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['language-changed'])

const { locale, t } = useI18n()

// Computed
const currentLanguage = computed(() => locale.value)

const languageOptions = computed(() => {
  return Object.entries(supportedLanguages).map(([code, info]) => ({
    value: code,
    label: info.name,
    name: info.name,
    flag: info.flag,
    dir: info.dir
  }))
})

// Methods
const changeLanguage = (newLanguage) => {
  if (supportedLanguages[newLanguage]) {
    locale.value = newLanguage
    
    // Update document direction
    document.documentElement.dir = supportedLanguages[newLanguage].dir
    
    // Save to localStorage
    localStorage.setItem('user_language', newLanguage)
    
    // Emit event
    emit('language-changed', newLanguage)
  }
}
</script>