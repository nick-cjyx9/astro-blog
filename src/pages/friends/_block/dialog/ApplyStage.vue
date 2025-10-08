<template>
  <div>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="space-y-2">
        <label for="f-title" class="block text-sm font-semibold text-gray-900 dark:text-white">站点标题 *</label>
        <input
          id="f-title"
          v-model="form.title"
          type="text"
          required
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/40': errors.title }"
          placeholder="您的站点名称"
          @input="clearError('title')"
        />
        <p v-if="errors.title" class="text-xs text-red-600 dark:text-red-400">{{ errors.title }}</p>
      </div>

      <div class="space-y-2">
        <label for="f-link" class="block text-sm font-semibold text-gray-900 dark:text-white">链接 *</label>
        <input
          id="f-link"
          v-model="form.link"
          type="url"
          required
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/40': errors.link }"
          placeholder="https://example.com"
          @input="clearError('link')"
        />
        <p v-if="errors.link" class="text-xs text-red-600 dark:text-red-400">{{ errors.link }}</p>
      </div>

      <div class="space-y-2">
        <label for="f-desc" class="block text-sm font-semibold text-gray-900 dark:text-white">描述 *</label>
        <textarea
          id="f-desc"
          v-model="form.description"
          rows="3"
          required
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors resize-none"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/40': errors.description }"
          placeholder="请简要描述您的站点内容（不超过100字）"
          @input="clearError('description')"
        ></textarea>
        <p v-if="errors.description" class="text-xs text-red-600 dark:text-red-400">{{ errors.description }}</p>
      </div>

      <div class="space-y-2">
        <label for="f-mail" class="block text-sm font-semibold text-gray-900 dark:text-white">邮箱</label>
        <input
          id="f-mail"
          v-model="form.email"
          type="email"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/40': errors.email }"
          placeholder="your@email.com"
          @input="clearError('email')"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400">可选，用于友链审核结果通知</p>
        <p v-if="errors.email" class="text-xs text-red-600 dark:text-red-400">{{ errors.email }}</p>
      </div>

      <div class="space-y-2">
        <label for="f-avatar" class="block text-sm font-semibold text-gray-900 dark:text-white">头像（URL）</label>
        <input
          id="f-avatar"
          v-model="form.avatar"
          type="url"
          class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
          :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500/40': errors.avatar }"
          placeholder="https://example.com/avatar.jpg"
          @input="clearError('avatar')"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400">可选，站点头像链接</p>
        <p v-if="errors.avatar" class="text-xs text-red-600 dark:text-red-400">{{ errors.avatar }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          @click="$emit('previous')"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition-colors"
        >
          上一步
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white shadow-sm transition-colors"
        >
          <svg v-if="submitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m100 50 L24 4l-8 13A9.5 9.5 0 1 0 0"></path>
          </svg>
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import * as ActionMod from 'astro:actions'

interface FormData {
  title: string
  link: string
  description: string
  email: string
  avatar: string
}

defineEmits<{
  previous: []
  submit: [data: FormData]
}>()

const submitting = ref(false)

// 表单数据
const form = reactive<FormData>({
  title: '',
  link: '',
  description: '',
  email: '',
  avatar: ''
})

// 表单错误
const errors = reactive<Partial<FormData>>({})

// 通知函数
const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warn' = 'info') => {
  document.dispatchEvent(new CustomEvent('vue:notify', {
    detail: { type, message }
  }))
}

// 清除字段错误
const clearError = (field: keyof FormData) => {
  delete errors[field]
}

// 表单验证
const validateForm = (): boolean => {
  // 清除所有错误
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof FormData]
  })

  let isValid = true

  if (!form.title.trim()) {
    errors.title = '请填写站点标题'
    isValid = false
  }

  if (!form.link.trim()) {
    errors.link = '请填写站点链接'
    isValid = false
  } else {
    try {
      new URL(form.link)
    } catch {
      errors.link = '请输入有效的网站地址'
      isValid = false
    }
  }

  if (!form.description.trim()) {
    errors.description = '请填写站点描述'
    isValid = false
  } else if (form.description.length > 100) {
    errors.description = '站点描述不能超过100个字符'
    isValid = false
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  if (form.avatar) {
    try {
      new URL(form.avatar)
    } catch {
      errors.avatar = '请输入有效的头像URL'
      isValid = false
    }
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  submitting.value = true

  try {
    const actions = ActionMod.actions
    const isInputError = ActionMod.isInputError

    if (actions?.sendFriendForm) {
      const result = await actions.sendFriendForm({
        title: form.title.trim(),
        link: form.link.trim(),
        description: form.description.trim(),
        avatar: form.avatar.trim(),
        mail: form.email.trim()
      })

      if (result.error) {
        if (isInputError?.(result.error)) {
          // 处理验证错误
          const fields = (result.error as any).fields || {}
          if (fields.title?.length) errors.title = fields.title.join(',')
          if (fields.link?.length) errors.link = fields.link.join(',')
          if (fields.description?.length) errors.description = fields.description.join(',')
          if (fields.avatar?.length) errors.avatar = fields.avatar.join(',')
        } else {
          showNotification(result.error.message || '提交失败，请重试', 'error')
        }
      } else {
        showNotification('友链申请已提交，我们会尽快审核', 'success')
        // 通知父组件提交成功
        document.dispatchEvent(new CustomEvent('friend-form-submitted'))
      }
    } else {
      showNotification('提交功能不可用', 'error')
    }
  } catch (error) {
    showNotification('提交失败，请重试', 'error')
  } finally {
    submitting.value = false
  }
}
</script>
