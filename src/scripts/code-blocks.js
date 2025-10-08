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
      <span class="copy-icon icon-[iconamoon--copy]"></span>
      <span class="check-icon hidden icon-[line-md--confirm] w-4 h-4"></span>
      <span class="copy-text">复制</span>
    `
    copyButton.title = '复制代码'
    copyButton.addEventListener('click', async () => {
      const code = pre.querySelector('code')
      if (!code) return
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
      } catch (err) {
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
