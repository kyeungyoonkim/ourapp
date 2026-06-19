import { MessageCircleHeart, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import type { Author } from '../types'
import { emojiOptions, formatDate, formatRelative } from '../utils/helpers'

type WriteMode = 'diary' | 'note'
type Filter = 'all' | 'diary' | 'note'

type JournalItem =
  | { kind: 'diary'; id: string; sortKey: string; author: Author; title: string; body: string; date: string; emoji: string }
  | { kind: 'note'; id: string; sortKey: string; author: Author; title: string; body: string; date: string; emoji: string }

export function JournalPage({ embedded = false }: { embedded?: boolean }) {
  const { data, addDiaryEntry, updateDiaryEntry, removeDiaryEntry, addNote, updateNote, removeNote } =
    useApp()
  const { diaryEntries, notes, settings } = data
  const [open, setOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<JournalItem | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [mode, setMode] = useState<WriteMode>('diary')
  const [author, setAuthor] = useState<Author>('me')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [emoji, setEmoji] = useState('📔')

  const items = useMemo(() => {
    const list: JournalItem[] = [
      ...diaryEntries.map((e) => ({
        kind: 'diary' as const,
        id: e.id,
        sortKey: e.date,
        author: e.author,
        title: e.title,
        body: e.content,
        date: e.date,
        emoji: e.emoji,
      })),
      ...notes.map((n) => ({
        kind: 'note' as const,
        id: n.id,
        sortKey: n.createdAt,
        author: n.author,
        title: n.author === 'me' ? settings.myName : settings.partnerName,
        body: n.message,
        date: n.createdAt,
        emoji: '💌',
      })),
    ]
    return list.sort((a, b) => b.sortKey.localeCompare(a.sortKey))
  }, [diaryEntries, notes, settings.myName, settings.partnerName])

  const filtered = items.filter((item) => filter === 'all' || item.kind === filter)

  function openAdd() {
    setEditingItem(null)
    setMode('diary')
    setAuthor('me')
    setTitle('')
    setContent('')
    setDate(new Date().toISOString().slice(0, 10))
    setEmoji('📔')
    setOpen(true)
  }

  function openEdit(item: JournalItem) {
    setEditingItem(item)
    setMode(item.kind)
    setAuthor(item.author)
    setTitle(item.kind === 'diary' ? item.title : '')
    setContent(item.body)
    setDate(item.kind === 'diary' ? item.date : item.date.slice(0, 10))
    setEmoji(item.kind === 'diary' ? item.emoji : '📔')
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditingItem(null)
  }

  function handleSave() {
    if (mode === 'note') {
      if (!content.trim()) return
      if (editingItem?.kind === 'note') {
        updateNote(editingItem.id, { author, message: content.trim() })
      } else {
        addNote(author, content.trim())
      }
    } else {
      if (!title.trim() || !content.trim()) return
      if (editingItem?.kind === 'diary') {
        updateDiaryEntry(editingItem.id, {
          author,
          title: title.trim(),
          content: content.trim(),
          date,
          emoji,
        })
      } else {
        addDiaryEntry({ author, title: title.trim(), content: content.trim(), date, emoji })
      }
    }
    closeModal()
    setTitle('')
    setContent('')
    setEmoji('📔')
  }

  function handleRemove(item: JournalItem) {
    if (item.kind === 'diary') removeDiaryEntry(item.id)
    else removeNote(item.id)
  }

  const authorStyle: Record<Author, string> = {
    me: 'border-rose-100 bg-rose-50/40',
    partner: 'border-sky-100 bg-sky-50/40',
  }

  return (
    <div className={embedded ? 'space-y-4' : 'fade-in space-y-4'}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">일기 · 쪽지</h1>
            <p className="text-sm text-zinc-500">긴 일기와 짧은 쪽지를 한곳에서</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <Plus size={16} />
            쓰기
          </button>
        </div>
      )}

      <div className={`flex gap-2 ${embedded ? 'items-center justify-between' : ''}`}>
        <div className="flex gap-2">
        {(
          [
            { id: 'all' as const, label: '전체' },
            { id: 'diary' as const, label: '일기' },
            { id: 'note' as const, label: '쪽지' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-500'
            }`}
          >
            {label}
          </button>
        ))}
        </div>
        {embedded && (
          <button className="btn-primary shrink-0" onClick={openAdd}>
            <Plus size={16} />
            쓰기
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          emoji="📔"
          title="아직 글이 없어"
          description="일기나 짧은 쪽지를 남겨봐"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-center text-xs text-zinc-400">
            삭제하면 더보기 → 휴지통에서 복구할 수 있어요
          </p>
          {filtered.map((item) =>
            item.kind === 'note' ? (
              <div
                key={`note-${item.id}`}
                className={`relative rounded-2xl border p-4 shadow-sm ${authorStyle[item.author]}`}
                style={{ transform: `rotate(${item.author === 'me' ? -1 : 1}deg)` }}
              >
                <div className="absolute right-2 top-2 flex gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    title="수정"
                    className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/60 hover:text-rose-400"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleRemove(item)}
                    title="휴지통으로 이동"
                    className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/60 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-zinc-500">
                  <MessageCircleHeart size={12} />
                  쪽지 · {item.author === 'me' ? settings.myName : settings.partnerName}
                </div>
                <p className="whitespace-pre-wrap pr-6 text-sm leading-relaxed text-zinc-700">
                  {item.body}
                </p>
                <div className="mt-3 text-[11px] text-zinc-400">{formatRelative(item.date)}</div>
              </div>
            ) : (
              <article key={`diary-${item.id}`} className={`card border p-4 ${authorStyle[item.author]}`}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.emoji}</span>
                      <h3 className="font-semibold text-zinc-800">{item.title}</h3>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {formatDate(item.date)} ·{' '}
                      {item.author === 'me' ? settings.myName : settings.partnerName}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      title="수정"
                      className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleRemove(item)}
                      title="휴지통으로 이동"
                      className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{item.body}</p>
              </article>
            ),
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editingItem ? '글 수정' : '글 쓰기'}
      >
        <div className="space-y-3">
          {!editingItem && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('diary')}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  mode === 'diary'
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-zinc-100 bg-white text-zinc-500'
                }`}
              >
                📔 일기
              </button>
              <button
                type="button"
                onClick={() => setMode('note')}
                className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                  mode === 'note'
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-zinc-100 bg-white text-zinc-500'
                }`}
              >
                💌 쪽지
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAuthor('me')}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                author === 'me'
                  ? 'border-rose-300 bg-rose-50 text-rose-600'
                  : 'border-zinc-100 bg-white text-zinc-500'
              }`}
            >
              {settings.myName}
            </button>
            <button
              type="button"
              onClick={() => setAuthor('partner')}
              className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                author === 'partner'
                  ? 'border-sky-300 bg-sky-50 text-sky-600'
                  : 'border-zinc-100 bg-white text-zinc-500'
              }`}
            >
              {settings.partnerName}
            </button>
          </div>
          {mode === 'diary' && (
            <>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                className="input"
                placeholder="제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </>
          )}
          <textarea
            className="input"
            rows={mode === 'note' ? 4 : 6}
            placeholder={
              mode === 'note'
                ? '하고 싶은 말을 적어봐...'
                : '오늘 있었던 일, 고마웠던 것, 보고 싶다는 말...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {mode === 'diary' && (
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`rounded-xl px-2 py-1 text-lg ${
                    emoji === e ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          <button className="btn-primary w-full" onClick={handleSave}>
            {editingItem ? '수정 저장' : mode === 'note' ? '쪽지 남기기' : '일기 저장'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
