<template>
  <div class="space-y-5">
    <!-- 提示信息 -->
    <div class="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg px-4 pt-4 border border-blue-100 dark:border-blue-800">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
          <span class="icon-[ep--info-filled] w-4 h-4 text-blue-600 dark:text-blue-300"></span>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">温馨提示</h4>
          <p class="text-sm text-blue-800 dark:text-blue-200">如果你愿意的话，可以在你的站点添加本站的友链，信息如下：</p>
        </div>
      </div>
    </div>

    <!-- 信息展示 -->
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-5">
      <!-- 站点名称 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">站点名称</label>
        <div class="relative">
          <input
            type="text"
            :value="siteInfo.title"
            disabled
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 pr-10 opacity-90 cursor-not-allowed"
          />
          <button
            type="button"
            @click="copyField(siteInfo.title, '站点名称')"
            class="absolute inset-y-0 right-2 my-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="复制站点名称"
          >
            <span class="icon-[mingcute--copy-line] w-4 h-4"></span>
          </button>
        </div>
      </div>
      <!-- 站点链接 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">站点链接</label>
        <div class="relative">
          <input
            type="text"
            :value="siteInfo.url"
            disabled
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 pr-10 opacity-90 cursor-not-allowed"
          />
          <button
            type="button"
            @click="copyField(siteInfo.url, '站点链接')"
            class="absolute inset-y-0 right-2 my-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="复制站点链接"
          >
            <span class="icon-[mingcute--copy-line] w-4 h-4"></span>
          </button>
        </div>
      </div>
      <!-- 站点描述 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">站点描述</label>
        <div class="relative">
          <input
            type="text"
            :value="siteInfo.description"
            disabled
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 pr-10 opacity-90 cursor-not-allowed"
          />
          <button
            type="button"
            @click="copyField(siteInfo.description, '站点描述')"
            class="absolute inset-y-0 right-2 my-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="复制站点描述"
          >
            <span class="icon-[mingcute--copy-line] w-4 h-4"></span>
          </button>
        </div>
      </div>
      <!-- 站点头像 -->
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">站点头像</label>
        <div class="relative">
          <input
            type="text"
            :value="siteInfo.avatar"
            disabled
            class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 pr-10 opacity-90 cursor-not-allowed"
          />
          <button
            type="button"
            @click="copyField(siteInfo.avatar, '站点头像')"
            class="absolute inset-y-0 right-2 my-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="复制站点头像URL"
          >
            <span class="icon-[mingcute--copy-line] w-4 h-4"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100 transition-colors"
        @click="handleCopyAll"
      >
        <span class="icon-[mingcute--copy-line] w-4 h-4"></span>复制信息
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
        @click="$emit('next')"
      >
        下一步
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotification } from '../../../../composables/useNotification'

interface SiteInfo {
  title: string
  url: string
  description: string
  avatar: string
}

const props = defineProps<{ siteInfo: SiteInfo }>()
defineEmits<{ next: [] }>()

const { notify } = useNotification()

const siteInfoSnippet = computed(() => {
  return `title: "${props.siteInfo.title}"
link: "${props.siteInfo.url}"
description: "${props.siteInfo.description}"
avatar: "${props.siteInfo.avatar}"`
})

const copyField = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value)
    notify('info', `${label}已复制`)
  } catch {
    notify('warn', `${label}复制失败`)
  }
}

const handleCopyAll = async () => {
  try {
    await navigator.clipboard.writeText(siteInfoSnippet.value)
    notify('info', '站点信息已复制')
  } catch {
    notify('warn', '复制失败')
  }
}
</script>
