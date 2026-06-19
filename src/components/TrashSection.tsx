import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { EmptyState, Modal } from './Modal'
import { useApp } from '../store/AppContext'
import { trashItemPreview, trashItemTitle, trashKindEmoji, trashKindLabel } from '../utils/trash'

export function TrashSection() {
  const { data, restoreFromTrash, permanentlyDeleteFromTrash, emptyTrash } = useApp()
  const { trash } = data
  const [open, setOpen] = useState(false)
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const sorted = [...trash].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt))

  return (
    <>
      <button
        className="card flex w-full items-center gap-3 p-4 text-left transition hover:bg-white"
        onClick={() => setOpen(true)}
      >
        <div className="rounded-xl bg-zinc-100 p-2 text-zinc-500">
          <Trash2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-zinc-800">휴지통</div>
          <div className="text-xs text-zinc-500">
            {trash.length > 0
              ? `일기·추억·쪽지 ${trash.length}개 · 복구 가능`
              : '삭제한 글을 여기서 복구할 수 있어'}
          </div>
        </div>
        {trash.length > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-500">
            {trash.length}
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="휴지통">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {sorted.length === 0 ? (
            <EmptyState
              emoji="🗑️"
              title="휴지통이 비어있어"
              description="삭제한 일기·추억·쪽지가 여기에 모여요"
            />
          ) : (
            <>
              <p className="text-xs text-zinc-500">
                삭제해도 바로 없어지지 않아요. 복구하거나 영구 삭제할 수 있어요.
              </p>
              <div className="space-y-2">
                {sorted.map((item) => (
                  <div key={item.id} className="rounded-xl border border-zinc-100 p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{trashKindEmoji[item.kind]}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-zinc-800">{trashItemTitle(item)}</span>
                          <span className="rounded-lg bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                            {trashKindLabel[item.kind]}
                          </span>
                        </div>
                        {trashItemPreview(item) && (
                          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                            {trashItemPreview(item)}
                          </p>
                        )}
                        <div className="mt-1 text-[10px] text-zinc-400">
                          {format(new Date(item.deletedAt), 'M/d HH:mm', { locale: ko })} 삭제
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="btn-secondary flex-1 py-2 text-xs"
                        onClick={() => restoreFromTrash(item.id)}
                      >
                        <RotateCcw size={14} />
                        복구
                      </button>
                      <button
                        className="flex-1 rounded-xl border border-rose-200 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50"
                        onClick={() => permanentlyDeleteFromTrash(item.id)}
                      >
                        영구 삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="w-full rounded-xl py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-50 hover:text-rose-500"
                onClick={() => setConfirmEmpty(true)}
              >
                휴지통 비우기
              </button>
            </>
          )}
        </div>
      </Modal>

      <Modal open={confirmEmpty} onClose={() => setConfirmEmpty(false)} title="휴지통 비우기">
        <p className="text-sm text-zinc-600">
          {sorted.length}개 항목을 영구 삭제할까요? 복구할 수 없어요.
        </p>
        <div className="mt-4 flex gap-2">
          <button className="btn-secondary flex-1" onClick={() => setConfirmEmpty(false)}>
            취소
          </button>
          <button
            className="btn-primary flex-1 bg-rose-600 hover:bg-rose-700"
            onClick={() => {
              emptyTrash()
              setConfirmEmpty(false)
            }}
          >
            비우기
          </button>
        </div>
      </Modal>
    </>
  )
}
