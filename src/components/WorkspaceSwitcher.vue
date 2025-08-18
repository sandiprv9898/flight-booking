<template>
  <div class="relative">
    <!-- Workspace Switcher Button -->
    <button
      class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      @click="toggleDropdown"
    >
      <BuildingOfficeIcon class="h-5 w-5 text-gray-400" />
      <span class="hidden sm:block">{{ currentWorkspace?.name || 'Select Workspace' }}</span>
      <ChevronUpDownIcon class="h-4 w-4 text-gray-400" />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900">
            Switch Workspace
          </h3>
          <button
            class="text-sm text-primary-600 hover:text-primary-500"
            @click="showCreateWorkspace = true"
          >
            + New
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Manage your travel across different workspaces
        </p>
      </div>

      <!-- Current Workspace -->
      <div class="px-4 py-2 bg-gray-50">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Current Workspace
        </p>
      </div>

      <div class="px-4 py-3 bg-primary-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon class="h-4 w-4 text-white" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                {{ currentWorkspace?.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ currentWorkspace?.settings?.currency }} • {{ currentWorkspace?.settings?.language.toUpperCase() }}
              </p>
            </div>
          </div>
          <CheckIcon class="h-5 w-5 text-primary-600" />
        </div>
      </div>

      <!-- Other Workspaces -->
      <div class="px-4 py-2">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Other Workspaces
        </p>
      </div>

      <div class="max-h-48 overflow-y-auto">
        <div
          v-for="workspace in otherWorkspaces"
          :key="workspace.id"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer"
          @click="switchWorkspace(workspace.id)"
        >
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon class="h-4 w-4 text-gray-400" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ workspace.name }}
              </p>
              <p class="text-xs text-gray-500">
                {{ workspace.settings?.currency }} • {{ workspace.settings?.language.toUpperCase() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- No other workspaces message -->
      <div
        v-if="otherWorkspaces.length === 0"
        class="px-4 py-6 text-center"
      >
        <BuildingOfficeIcon class="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">
          No other workspaces
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Create a new workspace to organize your travel
        </p>
      </div>

      <!-- Footer Actions -->
      <div class="border-t border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <button
            class="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            @click="showManageWorkspaces = true"
          >
            <Cog6ToothIcon class="h-4 w-4 mr-2" />
            Manage Workspaces
          </button>
          
          <button
            class="text-sm text-primary-600 hover:text-primary-500 flex items-center"
            @click="showCreateWorkspace = true"
          >
            <PlusIcon class="h-4 w-4 mr-1" />
            Create New
          </button>
        </div>
      </div>
    </div>

    <!-- Create Workspace Modal -->
    <Modal
      :show="showCreateWorkspace"
      title="Create New Workspace"
      @close="showCreateWorkspace = false"
    >
      <div class="space-y-4">
        <Input
          v-model="newWorkspace.name"
          label="Workspace Name"
          placeholder="e.g., Business Travel, Family Trips"
          required
        />

        <Select
          v-model="newWorkspace.currency"
          label="Default Currency"
          :options="currencyOptions"
        />

        <Select
          v-model="newWorkspace.language"
          label="Language"
          :options="languageOptions"
        />

        <Select
          v-model="newWorkspace.timezone"
          label="Timezone"
          :options="timezoneOptions"
        />
      </div>

      <template #footer>
        <div class="flex justify-end space-x-3">
          <Button
            variant="secondary"
            @click="showCreateWorkspace = false"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            @click="createWorkspace"
            :disabled="!newWorkspace.name"
          >
            Create Workspace
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Manage Workspaces Modal -->
    <Modal
      :show="showManageWorkspaces"
      title="Manage Workspaces"
      size="lg"
      @close="showManageWorkspaces = false"
    >
      <div class="space-y-4">
        <div
          v-for="workspace in allWorkspaces"
          :key="workspace.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon class="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ workspace.name }}</p>
              <p class="text-sm text-gray-500">
                {{ workspace.settings?.currency }} • {{ workspace.settings?.language.toUpperCase() }}
                <span v-if="workspace.isDefault" class="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded">
                  Default
                </span>
              </p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              @click="editWorkspace(workspace)"
            >
              Edit
            </Button>
            <Button
              v-if="!workspace.isDefault"
              variant="ghost"
              size="sm"
              @click="deleteWorkspace(workspace.id)"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <Button
            variant="secondary"
            @click="showManageWorkspaces = false"
          >
            Close
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import {
  BuildingOfficeIcon,
  ChevronUpDownIcon,
  CheckIcon,
  Cog6ToothIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'

const authStore = useAuthStore()

const isOpen = ref(false)
const showCreateWorkspace = ref(false)
const showManageWorkspaces = ref(false)

const newWorkspace = ref({
  name: '',
  currency: 'USD',
  language: 'en',
  timezone: 'America/New_York'
})

const currentWorkspace = computed(() => authStore.currentWorkspace)
const allWorkspaces = computed(() => authStore.userWorkspaces)

const otherWorkspaces = computed(() => {
  return allWorkspaces.value.filter(ws => ws.id !== currentWorkspace.value?.id)
})

// Options data
const currencyOptions = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' }
]

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' }
]

const timezoneOptions = [
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London Time' },
  { value: 'Europe/Paris', label: 'Central European Time' }
]

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const switchWorkspace = (workspaceId) => {
  authStore.switchWorkspace(workspaceId)
  isOpen.value = false
}

const createWorkspace = () => {
  // In a real app, this would make an API call
  console.log('Creating workspace:', newWorkspace.value)
  
  // Reset form
  newWorkspace.value = {
    name: '',
    currency: 'USD',
    language: 'en',
    timezone: 'America/New_York'
  }
  
  showCreateWorkspace.value = false
  isOpen.value = false
}

const editWorkspace = (workspace) => {
  console.log('Editing workspace:', workspace)
  showManageWorkspaces.value = false
}

const deleteWorkspace = (workspaceId) => {
  if (confirm('Are you sure you want to delete this workspace?')) {
    console.log('Deleting workspace:', workspaceId)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>