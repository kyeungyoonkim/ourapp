import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { EmptyState, Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import type { Memory } from '../types'
import { compressImage, emojiOptions, formatDateRange } from '../utils/helpers'

const MAX_PHOTOS = 6

type MemoryForm = {
  title: string
  description: string
  date: string
  endDate: string
  emoji: string
  photos: string[]
}

const emptyForm = (): MemoryForm => ({
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  endDate: '',
  emoji: '✨',
  photos: [],
})

export function MemoriesPage({ embedded = false }: { embedded?: boolean }) {
  const { data, addMemory, updateMemory, removeMemory, removeMemoryPhoto } = useApp()
  const { memories } = data
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MemoryForm>(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm())
    setOpen(true)
  }

  function openEdit(memory: Memory) {
    setEditingId(memory.id)
    setForm({
      title: memory.title,
      description: memory.description,
      date: memory.date,
      endDate: memory.endDate ?? '',
      emoji: memory.emoji,
      photos: memory.photos ?? [],
    })
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditingId(null)
    setForm(emptyForm())
  }

  function handleSave() {
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      endDate: form.endDate && form.endDate !== form.date ? form.endDate : undefined,
      emoji: form.emoji,
      photos: form.photos.length > 0 ? form.photos : undefined,
    }
    if (editingId) {
      updateMemory(editingId, payload)
    } else {
      addMemory(payload)
    }
    closeModal()
  }

  async function handlePhotoSelect(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      const remaining = MAX_PHOTOS - form.photos.length
      const toAdd = Array.from(files).slice(0, remaining)
      const compressed = await Promise.all(
        toAdd.filter((f) => f.type.startsWith('image/')).map((f) => compressImage(f)),
      )
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...compressed].slice(0, MAX_PHOTOS) }))
    } finally {
      setUploading(false)
    }
  }

  async function handleAddPhotosToMemory(memory: Memory, files: FileList | null) {
    if (!files?.length) return
    const current = memory.photos ?? []
    const remaining = MAX_PHOTOS - current.length
    if (remaining <= 0) return
    const toAdd = Array.from(files).slice(0, remaining)
    const compressed = await Promise.all(
      toAdd.filter((f) => f.type.startsWith('image/')).map((f) => compressImage(f)),
    )
    updateMemory(memory.id, { photos: [...current, ...compressed].slice(0, MAX_PHOTOS) })
  }

  return (
    <div className={embedded ? 'space-y-4' : 'fade-in space-y-4'}>
      <div className={`flex items-center ${embedded ? 'justify-end' : 'justify-between'}`}>
        {!embedded && (
          <div>
            <h1 className="page-title">추억 타임라인</h1>
            <p className="text-sm text-zinc-500">소중한 순간들을 기록해둬</p>
          </div>
        )}
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} />
          추가
        </button>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          emoji="📔"
          title="아직 추억이 없어"
          description="첫 추억을 추가해서 타임라인을 만들어봐"
        />
      ) : (
        <div className="relative space-y-3 pl-4">
          <div className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-rose-100" />
          {memories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={() => openEdit(memory)}
              onRemove={() => removeMemory(memory.id)}
              onRemovePhoto={(index) => removeMemoryPhoto(memory.id, index)}
              onAddPhotos={(files) => handleAddPhotosToMemory(memory, files)}
              onPhotoClick={setLightbox}
            />
          ))}
        </div>
      )}

      <Modal open={open} onClose={closeModal} title={editingId ? '추억 수정' : '추억 추가'}>
        <div className="space-y-3">
          <input
            className="input"
            placeholder="제목 (예: 첫 여행)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">시작 날짜</span>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">끝 날짜 (선택)</span>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </label>
          </div>
          <textarea
            className="input"
            rows={4}
            placeholder="그때 기억나는 것들..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">사진</span>
              <span className="text-xs text-zinc-400">
                {form.photos.length}/{MAX_PHOTOS}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, photos: form.photos.filter((_, j) => j !== i) })
                    }
                    className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {form.photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/50 text-rose-400 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">{uploading ? '처리 중...' : '추가'}</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotoSelect(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setForm({ ...form, emoji: e })}
                className={`rounded-xl px-2 py-1 text-lg ${
                  form.emoji === e ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <button className="btn-primary w-full" onClick={handleSave} disabled={uploading}>
            {editingId ? '수정 저장' : '저장하기'}
          </button>
        </div>
      </Modal>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

function MemoryCard({
  memory,
  onEdit,
  onRemove,
  onRemovePhoto,
  onAddPhotos,
  onPhotoClick,
}: {
  memory: Memory
  onEdit: () => void
  onRemove: () => void
  onRemovePhoto: (index: number) => void
  onAddPhotos: (files: FileList | null) => void
  onPhotoClick: (src: string) => void
}) {
  const addPhotoRef = useRef<HTMLInputElement>(null)
  const photoCount = memory.photos?.length ?? 0

  return (
    <div className="relative">
      <div className="absolute -left-4 top-5 h-3 w-3 rounded-full border-2 border-white bg-rose-400 shadow" />
      <div className="card ml-2 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{memory.emoji}</div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-rose-400">
              {formatDateRange(memory.date, memory.endDate)}
            </div>
            <h3 className="mt-0.5 font-semibold text-zinc-800">{memory.title}</h3>
            {memory.description && (
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{memory.description}</p>
            )}
            {photoCount > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {memory.photos!.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    <button
                      type="button"
                      onClick={() => onPhotoClick(src)}
                      className="h-full w-full"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                    <button
                      type="button"
                      title="사진 삭제"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemovePhoto(i)
                      }}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photoCount < MAX_PHOTOS && (
              <>
                <button
                  type="button"
                  onClick={() => addPhotoRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-500"
                >
                  <ImagePlus size={14} />
                  사진 {photoCount > 0 ? '더 ' : ''}추가
                </button>
                <input
                  ref={addPhotoRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    onAddPhotos(e.target.files)
                    e.target.value = ''
                  }}
                />
              </>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <button
              onClick={onEdit}
              title="수정"
              className="rounded-lg p-2 text-zinc-300 hover:bg-rose-50 hover:text-rose-400"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onRemove}
              title="휴지통으로 이동"
              className="rounded-lg p-2 text-zinc-300 hover:bg-rose-50 hover:text-rose-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
