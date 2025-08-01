// 代码块增强功能
document.addEventListener('DOMContentLoaded', () => {
  // 为所有代码块添加语言指示器和复制按钮
  const codeBlocks = document.querySelectorAll('pre.astro-code')

  codeBlocks.forEach((pre) => {
    // 创建代码块容器
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    // 将原始的 pre 元素包装起来
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    // 获取语言信息
    const langMatch = pre.className.match(/language-(\w+)/)
    const language = langMatch ? langMatch[1] : 'text'

    // 创建头部工具栏
    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'

    // 语言指示器
    const langIndicator = document.createElement('span')
    langIndicator.className = 'code-language'
    langIndicator.textContent = language.toUpperCase()

    // 复制按钮
    const copyButton = document.createElement('button')
    copyButton.className = 'code-copy-button'
    copyButton.innerHTML = `
      <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <svg class="check-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
      <span class="copy-text">复制</span>
    `
    copyButton.title = '复制代码'

    // 复制功能
    copyButton.addEventListener('click', async () => {
      const code = pre.querySelector('code')
      if (!code)
        return

      try {
        await navigator.clipboard.writeText(code.textContent || '')

        // 显示成功状态
        const copyIcon = copyButton.querySelector('.copy-icon')
        const checkIcon = copyButton.querySelector('.check-icon')
        const copyText = copyButton.querySelector('.copy-text')

        copyIcon?.classList.add('hidden')
        checkIcon?.classList.remove('hidden')
        copyText.textContent = '已复制'
        copyButton.classList.add('copied')

        // 2秒后恢复原状
        setTimeout(() => {
          copyIcon?.classList.remove('hidden')
          checkIcon?.classList.add('hidden')
          copyText.textContent = '复制'
          copyButton.classList.remove('copied')
        }, 2000)
      }
      catch (err) {
        console.error('复制失败:', err)

        // 降级方案：选中文本
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(code)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    })

    // 组装工具栏
    toolbar.appendChild(langIndicator)
    toolbar.appendChild(copyButton)

    // 将工具栏插入到代码块前面
    wrapper.insertBefore(toolbar, pre)
  })

  // 可选：为长代码块添加行号的函数
  const _addLineNumbers = (pre) => {
    const code = pre.querySelector('code')
    if (!code)
      return

    const lines = (code.textContent || '').split('\n')
    if (lines.length <= 1)
      return

    // 移除最后一个空行
    if (lines[lines.length - 1] === '') {
      lines.pop()
    }

    const lineNumbers = document.createElement('div')
    lineNumbers.className = 'line-numbers'
    lineNumbers.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('')

    pre.classList.add('has-line-numbers')
    pre.insertBefore(lineNumbers, code)
  }

  // 可选：为长代码块添加行号
  codeBlocks.forEach((pre) => {
    const code = pre.querySelector('code')
    if (code && (code.textContent || '').split('\n').length > 10) {
      // _addLineNumbers(pre); // 取消注释以启用行号
    }
  })
})

// 主题切换时更新代码块主题
document.addEventListener('astro:page-load', () => {
  // Astro 页面切换时重新初始化
  const event = new Event('DOMContentLoaded')
  document.dispatchEvent(event)
})
