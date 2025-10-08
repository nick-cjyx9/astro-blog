<template>
  <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div 
      class="absolute inset-0 backdrop-blur-xs"
      @click="close"
    ></div>
    
    <!-- 对话框内容 -->
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">申请友链</h2>
        <button
          @click="close"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 步骤指示器 -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <div 
              class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
              :class="currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'"
            >
              1
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">添加本站</span>
          </div>
          <div class="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
          <div class="flex items-center">
            <div 
              class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
              :class="currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'"
            >
              2
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900 dark:text-white">提交信息</span>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 第一步：添加本站信息 -->
        <InfoStage
          v-if="currentStep === 1"
          :site-info="siteInfo"
          @next="goToStep2"
        />

        <!-- 第二步：填写申请信息 -->
        <ApplyStage
          v-if="currentStep === 2"
          @previous="goToStep1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import InfoStage from './InfoStage.vue'
import ApplyStage from './ApplyStage.vue'

interface SiteInfo {
  title: string
  url: string
  description: string
  avatar: string
}

interface Props {
  siteInfo: SiteInfo
}

defineProps<Props>()

const isVisible = ref(false)
const currentStep = ref(1)

const goToStep2 = () => {
  currentStep.value = 2
  nextTick(() => {
    const firstInput = document.querySelector('#f-title') as HTMLInputElement
    firstInput?.focus()
  })
}

const goToStep1 = () => {
  currentStep.value = 1
}

// 提交成功通过全局事件 friend-form-submitted 处理（ApplyStage 内部已派发），无需直接回调

const close = () => {
  isVisible.value = false
  currentStep.value = 1
}

const open = () => {
  isVisible.value = true
}

onMounted(() => {
  const handleOpenDialog = () => {
    open()
  }

  const handleFormSubmitted = () => {
    close()
  }

  document.addEventListener('open-friend-dialog', handleOpenDialog)
  document.addEventListener('friend-form-submitted', handleFormSubmitted)

  onUnmounted(() => {
    document.removeEventListener('open-friend-dialog', handleOpenDialog)
    document.removeEventListener('friend-form-submitted', handleFormSubmitted)
  })
})

defineExpose({
  open,
  close
})
</script>
