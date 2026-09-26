import { useEffect } from 'react'

import { Icon } from './Icon.tsx'

export interface ToastState {
  message: string
  icon: 'info' | 'check' | 'alert'
}

interface ToastProps {
  toast: ToastState | null
  onDone: () => void
}

export function Toast({ toast, onDone }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(timer)
  }, [toast, onDone])

  if (!toast) return null

  return (
    <div className="toast toast--visible" aria-live="polite">
      <div className="toast__inner">
        <Icon name={toast.icon} />
        <span>{toast.message}</span>
      </div>
    </div>
  )
}
