import type { TrashItem, TrashKind } from '../types'

export const trashKindLabel: Record<TrashKind, string> = {
  diary: '일기',
  memory: '추억',
  note: '쪽지',
}

export const trashKindEmoji: Record<TrashKind, string> = {
  diary: '📔',
  memory: '✨',
  note: '💌',
}

export function trashItemTitle(item: TrashItem): string {
  if (item.kind === 'diary' && item.diary) return item.diary.title
  if (item.kind === 'memory' && item.memory) return item.memory.title
  if (item.kind === 'note' && item.note) {
    return item.note.message.length > 30 ? `${item.note.message.slice(0, 30)}…` : item.note.message
  }
  return '삭제된 항목'
}

export function trashItemPreview(item: TrashItem): string {
  if (item.kind === 'diary' && item.diary) return item.diary.content.slice(0, 60)
  if (item.kind === 'memory' && item.memory) return item.memory.description.slice(0, 60)
  if (item.kind === 'note' && item.note) return item.note.message.slice(0, 60)
  return ''
}
