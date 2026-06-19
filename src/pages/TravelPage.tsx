import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Car, Hotel, Pencil, Plane, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState, Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import type { ItineraryItem, ItineraryType, TravelPlace } from '../types'
import {
  emojiOptions,
  formatDate,
  geocodePlace,
  NORTH_AMERICA_MAP_CENTER,
  NORTH_AMERICA_MAP_ZOOM,
  parseLocalDate,
  resolvePlaceState,
} from '../utils/helpers'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function FitBounds({ places }: { places: Array<{ lat: number; lng: number }> }) {
  const map = useMap()

  useEffect(() => {
    if (!places.length) {
      map.setView(NORTH_AMERICA_MAP_CENTER, NORTH_AMERICA_MAP_ZOOM)
      return
    }
    const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
  }, [map, places])

  return null
}

const itineraryIcons: Record<ItineraryType, typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  car: Car,
  transport: Car,
  other: Plane,
}

const itineraryLabels: Record<ItineraryType, string> = {
  flight: '비행기',
  hotel: '숙소',
  car: '렌터카',
  transport: '교통',
  other: '기타',
}

function formatItineraryDatetime(value: string) {
  if (!value) return ''
  try {
    const d = value.includes('T') ? parseISO(value) : parseLocalDate(value)
    return format(d, value.includes('T') ? 'M/d HH:mm' : 'M/d', { locale: ko })
  } catch {
    return value
  }
}

export function TravelPage() {
  const {
    data,
    addPlace,
    updatePlace,
    removePlace,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,
  } = useApp()
  const { places, itinerary, settings } = data
  const [open, setOpen] = useState(false)
  const [itineraryOpen, setItineraryOpen] = useState(false)
  const [editPlaceOpen, setEditPlaceOpen] = useState(false)
  const [editItineraryOpen, setEditItineraryOpen] = useState(false)
  const [editingPlace, setEditingPlace] = useState<TravelPlace | null>(null)
  const [editingItinerary, setEditingItinerary] = useState<ItineraryItem | null>(null)
  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')
  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().slice(0, 10))
  const [emoji, setEmoji] = useState('📍')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [itineraryDraft, setItineraryDraft] = useState({
    tripName: settings.nextTripName,
    type: 'flight' as ItineraryType,
    title: '',
    datetime: '',
    endDatetime: '',
    confirmationCode: '',
    location: '',
    note: '',
  })

  const [placeDraft, setPlaceDraft] = useState({
    name: '',
    note: '',
    visitedAt: '',
    emoji: '📍',
  })

  const sortedItinerary = useMemo(
    () => [...itinerary].sort((a, b) => a.datetime.localeCompare(b.datetime)),
    [itinerary],
  )
  const tripGroups = useMemo(() => {
    const groups = new Map<string, typeof sortedItinerary>()
    for (const item of sortedItinerary) {
      const list = groups.get(item.tripName) ?? []
      list.push(item)
      groups.set(item.tripName, list)
    }
    return [...groups.entries()]
  }, [sortedItinerary])

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => b.visitedAt.localeCompare(a.visitedAt)),
    [places],
  )

  const center = useMemo(() => {
    if (!places.length) return NORTH_AMERICA_MAP_CENTER
    const lat = places.reduce((sum, p) => sum + p.lat, 0) / places.length
    const lng = places.reduce((sum, p) => sum + p.lng, 0) / places.length
    return [lat, lng] as [number, number]
  }, [places])

  async function handleAdd() {
    if (!query.trim()) {
      setError('장소 이름을 입력해줘')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await geocodePlace(query.trim())
      if (!result) {
        setError('장소를 찾지 못했어. 도시 이름으로 다시 검색해봐')
        return
      }
      addPlace({
        name: result.name,
        state: result.state,
        lat: result.lat,
        lng: result.lng,
        visitedAt,
        note: note.trim(),
        emoji,
      })
      setOpen(false)
      setQuery('')
      setNote('')
      setEmoji('📍')
    } catch {
      setError('검색 중 오류가 났어. 잠시 후 다시 시도해줘')
    } finally {
      setLoading(false)
    }
  }

  function handleAddItinerary() {
    if (!itineraryDraft.title.trim() || !itineraryDraft.datetime) return
    addItineraryItem({
      ...itineraryDraft,
      title: itineraryDraft.title.trim(),
      tripName: itineraryDraft.tripName.trim() || settings.nextTripName,
    })
    setItineraryOpen(false)
    setItineraryDraft({
      tripName: settings.nextTripName,
      type: 'flight',
      title: '',
      datetime: '',
      endDatetime: '',
      confirmationCode: '',
      location: '',
      note: '',
    })
  }

  function openEditPlace(place: TravelPlace) {
    setEditingPlace(place)
    setPlaceDraft({
      name: place.name,
      note: place.note,
      visitedAt: place.visitedAt,
      emoji: place.emoji,
    })
    setEditPlaceOpen(true)
  }

  function handleSavePlace() {
    if (!editingPlace || !placeDraft.name.trim()) return
    updatePlace(editingPlace.id, {
      name: placeDraft.name.trim(),
      note: placeDraft.note.trim(),
      visitedAt: placeDraft.visitedAt,
      emoji: placeDraft.emoji,
    })
    setEditPlaceOpen(false)
    setEditingPlace(null)
  }

  function openEditItinerary(item: ItineraryItem) {
    setEditingItinerary(item)
    setItineraryDraft({
      tripName: item.tripName,
      type: item.type,
      title: item.title,
      datetime: item.datetime,
      endDatetime: item.endDatetime,
      confirmationCode: item.confirmationCode,
      location: item.location,
      note: item.note,
    })
    setEditItineraryOpen(true)
  }

  function handleSaveItinerary() {
    if (!editingItinerary || !itineraryDraft.title.trim() || !itineraryDraft.datetime) return
    updateItineraryItem(editingItinerary.id, {
      ...itineraryDraft,
      title: itineraryDraft.title.trim(),
      tripName: itineraryDraft.tripName.trim() || settings.nextTripName,
    })
    setEditItineraryOpen(false)
    setEditingItinerary(null)
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">여행</h1>
          <p className="text-sm text-zinc-500">일정표 · 지도 · 방문 기록</p>
        </div>
        <button className="btn-primary" onClick={() => setItineraryOpen(true)}>
          <Plus size={16} />
          일정
        </button>
      </div>

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">공유 여행 일정표</h2>
          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setOpen(true)}>
            <Plus size={14} />
            지도
          </button>
        </div>
        {tripGroups.length === 0 ? (
          <EmptyState
            emoji="✈️"
            title="여행 일정이 없어요"
            description="비행기, 숙소, 렌터카 예약 정보를 모아두세요"
          />
        ) : (
          <div className="space-y-4">
            {tripGroups.map(([tripName, items]) => (
              <div key={tripName}>
                <div className="mb-2 text-xs font-semibold text-rose-500">{tripName}</div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = itineraryIcons[item.type]
                    return (
                      <div key={item.id} className="flex items-start gap-3 rounded-xl border border-rose-50 p-3">
                        <div className="rounded-xl bg-rose-50 p-2 text-rose-400">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-zinc-800">{item.title}</span>
                            <span className="rounded-lg bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
                              {itineraryLabels[item.type]}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-500">
                            {formatItineraryDatetime(item.datetime)}
                            {item.endDatetime && ` – ${formatItineraryDatetime(item.endDatetime)}`}
                          </div>
                          {item.location && (
                            <div className="text-xs text-zinc-500">{item.location}</div>
                          )}
                          {item.confirmationCode && (
                            <div className="mt-1 font-mono text-xs text-rose-500">
                              #{item.confirmationCode}
                            </div>
                          )}
                          {item.note && <p className="mt-1 text-sm text-zinc-600">{item.note}</p>}
                        </div>
                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            onClick={() => openEditItinerary(item)}
                            className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                            title="수정"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => removeItineraryItem(item.id)}
                            className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                            title="삭제"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-700">여행 지도</h2>
        <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setOpen(true)}>
          <Plus size={14} />
          장소
        </button>
      </div>

      <div className="card overflow-hidden p-1">
        <MapContainer
          center={center}
          zoom={NORTH_AMERICA_MAP_ZOOM}
          scrollWheelZoom={false}
          className="h-64 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds places={places} />
          {places.map((place) => (
            <Marker key={place.id} position={[place.lat, place.lng]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">
                    {place.emoji} {place.name}
                  </div>
                  <div className="text-zinc-500">{formatDate(place.visitedAt)}</div>
                  {place.note && <p className="mt-1">{place.note}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {places.length === 0 ? (
        <EmptyState
          emoji="🗺️"
          title="아직 기록된 여행지가 없어"
          description="첫 여행지를 추가해서 지도를 채워보자"
        />
      ) : (
        <div className="space-y-2">
          {sortedPlaces.map((place) => (
            <div key={place.id} className="card flex items-start gap-3 p-4">
              <div className="text-2xl">{place.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-800">{place.name}</div>
                {resolvePlaceState(place) && (
                  <div className="text-[11px] text-rose-400">{resolvePlaceState(place)}</div>
                )}
                <div className="text-xs text-zinc-500">{formatDate(place.visitedAt)}</div>
                {place.note && (
                  <p className="mt-1 text-sm text-zinc-600">{place.note}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  onClick={() => openEditPlace(place)}
                  className="rounded-lg p-2 text-zinc-300 hover:bg-rose-50 hover:text-rose-400"
                  title="수정"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => removePlace(place.id)}
                  className="rounded-lg p-2 text-zinc-300 hover:bg-rose-50 hover:text-rose-400"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={editPlaceOpen} onClose={() => setEditPlaceOpen(false)} title="여행지 수정">
        <div className="space-y-3">
          <input
            className="input"
            placeholder="장소 이름"
            value={placeDraft.name}
            onChange={(e) => setPlaceDraft({ ...placeDraft, name: e.target.value })}
          />
          <input
            type="date"
            className="input"
            value={placeDraft.visitedAt}
            onChange={(e) => setPlaceDraft({ ...placeDraft, visitedAt: e.target.value })}
          />
          <textarea
            className="input"
            rows={3}
            placeholder="그때 뭐 했는지, 숙소, 기억..."
            value={placeDraft.note}
            onChange={(e) => setPlaceDraft({ ...placeDraft, note: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setPlaceDraft({ ...placeDraft, emoji: e })}
                className={`rounded-xl px-2 py-1 text-lg ${
                  placeDraft.emoji === e ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <button className="btn-primary w-full" onClick={handleSavePlace}>
            저장하기
          </button>
        </div>
      </Modal>

      <Modal
        open={editItineraryOpen}
        onClose={() => setEditItineraryOpen(false)}
        title="여행 일정 수정"
      >
        <div className="space-y-3">
          <input
            className="input"
            placeholder="여행 이름"
            value={itineraryDraft.tripName}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, tripName: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(itineraryLabels) as ItineraryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setItineraryDraft({ ...itineraryDraft, type: t })}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  itineraryDraft.type === t
                    ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
                    : 'bg-zinc-50 text-zinc-500'
                }`}
              >
                {itineraryLabels[t]}
              </button>
            ))}
          </div>
          <input
            className="input"
            placeholder="제목"
            value={itineraryDraft.title}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">시작</span>
              <input
                type="datetime-local"
                className="input"
                value={itineraryDraft.datetime}
                onChange={(e) => setItineraryDraft({ ...itineraryDraft, datetime: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">종료 (선택)</span>
              <input
                type="datetime-local"
                className="input"
                value={itineraryDraft.endDatetime}
                onChange={(e) =>
                  setItineraryDraft({ ...itineraryDraft, endDatetime: e.target.value })
                }
              />
            </label>
          </div>
          <input
            className="input"
            placeholder="예약 번호"
            value={itineraryDraft.confirmationCode}
            onChange={(e) =>
              setItineraryDraft({ ...itineraryDraft, confirmationCode: e.target.value })
            }
          />
          <input
            className="input"
            placeholder="장소 / 노선 / 숙소"
            value={itineraryDraft.location}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, location: e.target.value })}
          />
          <textarea
            className="input"
            rows={2}
            placeholder="메모"
            value={itineraryDraft.note}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, note: e.target.value })}
          />
          <button className="btn-primary w-full" onClick={handleSaveItinerary}>
            저장하기
          </button>
        </div>
      </Modal>

      <Modal open={itineraryOpen} onClose={() => setItineraryOpen(false)} title="여행 일정 추가">
        <div className="space-y-3">
          <input
            className="input"
            placeholder="여행 이름"
            value={itineraryDraft.tripName}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, tripName: e.target.value })}
          />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(itineraryLabels) as ItineraryType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setItineraryDraft({ ...itineraryDraft, type: t })}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  itineraryDraft.type === t
                    ? 'bg-rose-50 text-rose-600 ring-2 ring-rose-200'
                    : 'bg-zinc-50 text-zinc-500'
                }`}
              >
                {itineraryLabels[t]}
              </button>
            ))}
          </div>
          <input
            className="input"
            placeholder="제목 (예: ATL → IND 비행)"
            value={itineraryDraft.title}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">시작</span>
              <input
                type="datetime-local"
                className="input"
                value={itineraryDraft.datetime}
                onChange={(e) => setItineraryDraft({ ...itineraryDraft, datetime: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-zinc-500">종료 (선택)</span>
              <input
                type="datetime-local"
                className="input"
                value={itineraryDraft.endDatetime}
                onChange={(e) =>
                  setItineraryDraft({ ...itineraryDraft, endDatetime: e.target.value })
                }
              />
            </label>
          </div>
          <input
            className="input"
            placeholder="예약 번호"
            value={itineraryDraft.confirmationCode}
            onChange={(e) =>
              setItineraryDraft({ ...itineraryDraft, confirmationCode: e.target.value })
            }
          />
          <input
            className="input"
            placeholder="장소 / 노선"
            value={itineraryDraft.location}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, location: e.target.value })}
          />
          <textarea
            className="input"
            rows={2}
            placeholder="메모"
            value={itineraryDraft.note}
            onChange={(e) => setItineraryDraft({ ...itineraryDraft, note: e.target.value })}
          />
          <button className="btn-primary w-full" onClick={handleAddItinerary}>
            추가하기
          </button>
        </div>
      </Modal>

      <Modal open={open} onClose={() => setOpen(false)} title="여행지 추가">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">장소 검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
              <input
                className="input pl-9"
                placeholder="예: 콜로라도, 뉴욕, 시카고"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">방문 날짜</label>
            <input
              type="date"
              className="input"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">메모</label>
            <textarea
              className="input"
              rows={3}
              placeholder="그때 뭐 했는지 적어봐"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">이모지</label>
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
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button className="btn-primary w-full" onClick={handleAdd} disabled={loading}>
            {loading ? '검색 중...' : '지도에 추가'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
