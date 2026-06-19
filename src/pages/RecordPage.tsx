import { BookHeart, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { JournalPage } from './JournalPage'
import { MemoriesPage } from './MemoriesPage'

type RecordSection = 'memories' | 'journal'

export function RecordPage() {
  const [section, setSection] = useState<RecordSection>('memories')

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="page-title">기록</h1>
        <p className="text-sm text-zinc-500">추억 · 일기 · 쪽지</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-rose-50/80 p-1">
        <button
          onClick={() => setSection('memories')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
            section === 'memories'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-zinc-500 hover:text-rose-500'
          }`}
        >
          <Sparkles size={14} />
          추억
        </button>
        <button
          onClick={() => setSection('journal')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
            section === 'journal'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-zinc-500 hover:text-rose-500'
          }`}
        >
          <BookHeart size={14} />
          일기·쪽지
        </button>
      </div>

      {section === 'memories' ? <MemoriesPage embedded /> : <JournalPage embedded />}
    </div>
  )
}
