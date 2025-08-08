document.addEventListener('DOMContentLoaded', () => {
  const codeBlocks = document.querySelectorAll('pre.astro-code')
  codeBlocks.forEach((pre) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)
    const language = pre.getAttribute('data-language')
    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'
    const langIndicator = document.createElement('span')
    langIndicator.className = 'code-language'
    langIndicator.textContent = language.toUpperCase()
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
    copyButton.addEventListener('click', async () => {
      const code = pre.querySelector('code')
      if (!code)
        return
      try {
        await navigator.clipboard.writeText(code.textContent || '')
        const copyIcon = copyButton.querySelector('.copy-icon')
        const checkIcon = copyButton.querySelector('.check-icon')
        const copyText = copyButton.querySelector('.copy-text')
        copyIcon?.classList.add('hidden')
        checkIcon?.classList.remove('hidden')
        copyText.textContent = '已复制'
        copyButton.classList.add('copied')
        setTimeout(() => {
          copyIcon?.classList.remove('hidden')
          checkIcon?.classList.add('hidden')
          copyText.textContent = '复制'
          copyButton.classList.remove('copied')
        }, 2000)
      }
      catch (err) {
        console.error('复制失败:', err)
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(code)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    })
    toolbar.appendChild(langIndicator)
    toolbar.appendChild(copyButton)

    wrapper.insertBefore(toolbar, pre)
  })
})
