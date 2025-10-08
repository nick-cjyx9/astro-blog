export type NotifyType = 'success' | 'info' | 'warning' | 'error'

export interface NotifyOptions {
  type?: NotifyType
  title?: string
  message?: string
  duration?: number // ms; 0 => no auto close
  closable?: boolean // default true
  onClose?: () => void
}

interface InternalItem {
  id: number
  el: HTMLDivElement
  wrapper: HTMLDivElement // 控制高度动画的外层
  opts: Required<NotifyOptions>
  timer?: number
}

const DEFAULT_DURATION = 5000
const MAX_STACK = 8
let seed = 0
const stack: InternalItem[] = []

function ensureContainer(): HTMLDivElement {
  let host = document.querySelector<HTMLDivElement>('div[data-notify-root]')
  if (!host) {
    host = document.createElement('div')
    host.dataset.notifyRoot = 'true'
    host.className =
      'pointer-events-none fixed z-[9999] top-4 right-4 flex flex-col items-end w-auto max-w-sm'
    host.setAttribute('data-notify-root', '')
    document.body.appendChild(host)
  }
  return host
}

const palette: Record<NotifyType, { icon: string; classes: string }> = {
  success: {
    icon: 'mdi--check-circle-outline',
    classes:
      'border-green-400/50 text-green-600 dark:text-green-300 bg-green-50/80 dark:bg-green-900/30',
  },
  info: {
    icon: 'mdi--information-outline',
    classes:
      'border-blue-400/50 text-blue-600 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-900/30',
  },
  warning: {
    icon: 'mdi--alert-outline',
    classes:
      'border-amber-400/50 text-amber-600 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-900/30',
  },
  error: {
    icon: 'mdi--alert-circle-outline',
    classes: 'border-red-400/50 text-red-600 dark:text-red-300 bg-red-50/80 dark:bg-red-900/30',
  },
}

function closeItem(item: InternalItem, animate = true) {
  if (item.timer) {
    clearTimeout(item.timer)
    item.timer = undefined
  }
  item.opts.onClose?.()
  const { wrapper, el } = item
  if (animate) {
    wrapper.style.height = `${el.offsetHeight + 16}px` // 16px margin placeholder
    requestAnimationFrame(() => {
      wrapper.style.height = '0px'
      el.classList.remove('notify-enter')
      el.classList.add('notify-leave')
      el.style.opacity = '0'
      el.style.transform = 'translateY(-30px)'
    })
    setTimeout(() => {
      wrapper.remove()
      const idx = stack.findIndex((s) => s.id === item.id)
      if (idx !== -1) stack.splice(idx, 1)
    }, 300)
  } else {
    wrapper.remove()
    const idx = stack.findIndex((s) => s.id === item.id)
    if (idx !== -1) stack.splice(idx, 1)
  }
}

function append(opts: NotifyOptions) {
  const full: Required<NotifyOptions> = {
    type: opts.type || 'info',
    title: opts.title || '',
    message: opts.message || '',
    duration: opts.duration === undefined ? DEFAULT_DURATION : opts.duration,
    closable: opts.closable !== false,
    onClose: opts.onClose || (() => {}),
  }

  const container = ensureContainer()
  while (stack.length >= MAX_STACK) {
    // 移除最早的
    closeItem(stack[0], false)
  }

  const id = ++seed
  const wrapper = document.createElement('div')
  wrapper.dataset.notifyWrapper = String(id)
  wrapper.className =
    'relative w-full max-w-md min-w-[260px] transition-all duration-300 ease-out overflow-visible'
  wrapper.style.height = '0px'
  wrapper.style.marginTop = '0px'

  const el = document.createElement('div')
  const pal = palette[full.type]
  el.className = [
    'pointer-events-auto w-auto min-w-[360px] max-w-md rounded-md shadow-lg shadow-black/10 border backdrop-blur-sm',
    'bg-white/80 dark:bg-gray-800/80',
    pal.classes,
    'transition-all duration-300 will-change-transform will-change-opacity',
  ].join(' ')
  // 初始内联状态以避免某些浏览器 Tailwind class 触发时机差导致的跳闪
  el.style.opacity = '0'
  el.style.transform = 'translateY(30px)'
  el.setAttribute('role', 'alert')
  el.setAttribute('aria-live', 'polite')

  const body = document.createElement('div')
  body.className = 'flex items-start gap-3 px-4 py-3 text-sm leading-5 overflow-hidden'
  body.innerHTML = `
    <span class="icon-[${pal.icon}] w-5 h-5 mt-0.5 text-current"></span>
    <div class="flex-1 min-w-0 pt-0.5 pb-0.5">
      ${full.title ? `<div class="font-bold ${full.message ? 'mb-1' : ''}">${full.title}</div>` : ''}
      <div class="whitespace-pre-wrap break-words">${full.message}</div>
    </div>
    ${full.closable ? `<button type="button" aria-label="关闭" class="text-current cursor-pointer w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 active:bg-black/20 transition-colors" data-close><span class="icon-[mdi--close] w-4 h-4"></span></button>` : ''}
  `

  el.appendChild(body)
  wrapper.appendChild(el)
  container.appendChild(wrapper)

  // 计算高度 -> 触发进入动画
  const h = el.offsetHeight + 16 // 高度 + 顶部间距
  // 双 RAF 确保初始样式已提交
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      wrapper.style.height = `${h}px`
      wrapper.style.marginTop = '16px'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  })

  const item: InternalItem = { id, el, wrapper, opts: full }
  stack.push(item)

  if (full.duration > 0) {
    item.timer = window.setTimeout(() => closeItem(item), full.duration + 300) // +300 让停留时间更贴近展示
  }
  if (full.closable) {
    const closeBtn = el.querySelector('[data-close]')
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      closeItem(item)
    })
  }

  return id
}

export const notify = {
  open: (opts: NotifyOptions) => append(opts),
  success: (message: string, opts: Omit<NotifyOptions, 'message' | 'type'> = {}) =>
    append({ ...opts, message, type: 'success' }),
  info: (message: string, opts: Omit<NotifyOptions, 'message' | 'type'> = {}) =>
    append({ ...opts, message, type: 'info' }),
  warning: (message: string, opts: Omit<NotifyOptions, 'message' | 'type'> = {}) =>
    append({ ...opts, message, type: 'warning' }),
  error: (message: string, opts: Omit<NotifyOptions, 'message' | 'type'> = {}) =>
    append({ ...opts, message, type: 'error' }),
  warn: (message: string, opts: Omit<NotifyOptions, 'message' | 'type'> = {}) =>
    append({ ...opts, message, type: 'warning' }),
  clear: () => {
    ;[...stack].forEach((i) => {
      closeItem(i, false)
    })
  },
}
