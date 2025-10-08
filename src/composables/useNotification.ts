// 通知处理的组合函数（恢复）
export const useNotification = () => {
  const notify = (type: 'success' | 'error' | 'info' | 'warn', message: string) => {
    document.dispatchEvent(
      new CustomEvent('vue:notify', {
        detail: { type, message },
      })
    )
  }

  return {
    notifySuccess: (message: string) => notify('success', message),
    notifyError: (message: string) => notify('error', message),
    notifyInfo: (message: string) => notify('info', message),
    notifyWarn: (message: string) => notify('warn', message),
    notify,
  }
}
