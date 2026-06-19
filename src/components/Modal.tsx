import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <button className="absolute inset-0" aria-label="닫기" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-5 shadow-xl fade-in safe-bottom">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  emoji: string
  title: string
  description: string
}

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <h3 className="font-semibold text-zinc-700">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </div>
  )
}
