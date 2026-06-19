import { Check, ListTodo, Luggage, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import type { Author } from '../types'

type OwnerFilter = 'all' | Author | 'shared'
type ListSection = 'packing' | 'bucket'

export function ListsPage() {
  const {
    data,
    addBucketItem,
    toggleBucketItem,
    removeBucketItem,
    addPackingItem,
    togglePackingItem,
    removePackingItem,
  } = useApp()
  const { settings, bucketList, packingList } = data
  const [section, setSection] = useState<ListSection>('packing')
  const [openBucket, setOpenBucket] = useState(false)
  const [openPacking, setOpenPacking] = useState(false)
  const [ownerFilter, setOwnerFilter] = useState<OwnerFilter>('all')
  const [newItem, setNewItem] = useState('')
  const [newPacking, setNewPacking] = useState('')
  const [packingOwner, setPackingOwner] = useState<Author | 'shared'>('shared')
  const [packingTrip, setPackingTrip] = useState(settings.nextTripName)

  const filteredPacking = useMemo(() => {
    if (ownerFilter === 'all') return packingList
    return packingList.filter((item) => item.owner === ownerFilter)
  }, [packingList, ownerFilter])

  const packedCount = filteredPacking.filter((item) => item.done).length
  const doneCount = bucketList.filter((item) => item.done).length

  function handleAddBucket() {
    if (!newItem.trim()) return
    addBucketItem(newItem.trim())
    setNewItem('')
    setOpenBucket(false)
  }

  function handleAddPacking() {
    if (!newPacking.trim()) return
    addPackingItem({
      title: newPacking.trim(),
      owner: packingOwner,
      tripName: packingTrip.trim() || settings.nextTripName,
    })
    setNewPacking('')
    setOpenPacking(false)
  }

  const ownerLabel = (owner: Author | 'shared') => {
    if (owner === 'me') return settings.myName
    if (owner === 'partner') return settings.partnerName
    return '공용'
  }

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="page-title">리스트</h1>
        <p className="text-sm text-zinc-500">패킹 · 버킷리스트</p>
      </div>

      <div className="flex gap-2 rounded-2xl bg-rose-50/80 p-1">
        <button
          onClick={() => setSection('packing')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
            section === 'packing'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-zinc-500 hover:text-rose-500'
          }`}
        >
          <Luggage size={14} />
          패킹
          <span className="text-[10px] font-normal text-zinc-400">
            {packedCount}/{filteredPacking.length}
          </span>
        </button>
        <button
          onClick={() => setSection('bucket')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
            section === 'bucket'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-zinc-500 hover:text-rose-500'
          }`}
        >
          <ListTodo size={14} />
          버킷
          <span className="text-[10px] font-normal text-zinc-400">
            {doneCount}/{bucketList.length}
          </span>
        </button>
      </div>

      {section === 'packing' ? (
        <section className="card p-4">
          <p className="mb-3 text-xs text-zinc-400">위탁 수하물 없이 — 기내용만 챙겨요 ✈️</p>

          <div className="mb-3 flex flex-wrap gap-2">
            {(
              [
                { id: 'all' as const, label: '전체' },
                { id: 'shared' as const, label: '공용' },
                { id: 'me' as const, label: settings.myName },
                { id: 'partner' as const, label: settings.partnerName },
              ] as const
            ).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setOwnerFilter(id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  ownerFilter === id
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-50 text-rose-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredPacking.length === 0 ? (
            <EmptyState
              emoji="🎒"
              title="체크리스트가 비어있어"
              description="각자 챙길 짐을 공유해봐"
            />
          ) : (
            <div className="space-y-2">
              {filteredPacking.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    item.done ? 'border-rose-50 bg-rose-50/50' : 'border-zinc-100 bg-white'
                  }`}
                >
                  <button
                    onClick={() => togglePackingItem(item.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      item.done
                        ? 'border-rose-400 bg-rose-400 text-white'
                        : 'border-rose-200 bg-white text-transparent'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm ${
                        item.done ? 'text-zinc-400 line-through' : 'text-zinc-700'
                      }`}
                    >
                      {item.title}
                    </span>
                    <div className="text-[10px] text-zinc-400">
                      {ownerLabel(item.owner)}
                      {item.tripName ? ` · ${item.tripName}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => removePackingItem(item.id)}
                    className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-secondary mt-3 w-full" onClick={() => setOpenPacking(true)}>
            <Plus size={16} />
            항목 추가
          </button>
        </section>
      ) : (
        <section className="card p-4">
          {bucketList.length === 0 ? (
            <EmptyState
              emoji="📝"
              title="버킷리스트가 비어있어"
              description="함께 하고 싶은 것들을 적어봐"
            />
          ) : (
            <div className="space-y-2">
              {bucketList.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    item.done ? 'border-rose-50 bg-rose-50/50' : 'border-zinc-100 bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggleBucketItem(item.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                      item.done
                        ? 'border-rose-400 bg-rose-400 text-white'
                        : 'border-rose-200 bg-white text-transparent'
                    }`}
                  >
                    <Check size={14} />
                  </button>
                  <span className="text-lg">{item.emoji}</span>
                  <span
                    className={`flex-1 text-sm ${
                      item.done ? 'text-zinc-400 line-through' : 'text-zinc-700'
                    }`}
                  >
                    {item.title}
                  </span>
                  <button
                    onClick={() => removeBucketItem(item.id)}
                    className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn-secondary mt-3 w-full" onClick={() => setOpenBucket(true)}>
            <Plus size={16} />
            항목 추가
          </button>
        </section>
      )}

      <Modal open={openPacking} onClose={() => setOpenPacking(false)} title="패킹 항목 추가">
        <div className="space-y-3">
          <input
            className="input"
            placeholder="챙길 것 (예: 기내용 세면도구)"
            value={newPacking}
            onChange={(e) => setNewPacking(e.target.value)}
          />
          <input
            className="input"
            placeholder="여행 이름"
            value={packingTrip}
            onChange={(e) => setPackingTrip(e.target.value)}
          />
          <div>
            <span className="mb-1 block text-xs font-medium text-zinc-500">누가 챙겨?</span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'shared' as const, label: '공용' },
                  { id: 'me' as const, label: settings.myName },
                  { id: 'partner' as const, label: settings.partnerName },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPackingOwner(id)}
                  className={`rounded-xl py-2 text-xs font-semibold ${
                    packingOwner === id
                      ? id === 'me'
                        ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-200'
                        : id === 'partner'
                          ? 'bg-sky-100 text-sky-600 ring-2 ring-sky-200'
                          : 'bg-zinc-100 text-zinc-700 ring-2 ring-zinc-200'
                      : 'bg-zinc-50 text-zinc-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-primary w-full" onClick={handleAddPacking}>
            추가하기
          </button>
        </div>
      </Modal>

      <Modal open={openBucket} onClose={() => setOpenBucket(false)} title="버킷리스트 추가">
        <div className="space-y-3">
          <input
            className="input"
            placeholder="함께 하고 싶은 것"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <button className="btn-primary w-full" onClick={handleAddBucket}>
            추가하기
          </button>
        </div>
      </Modal>
    </div>
  )
}
