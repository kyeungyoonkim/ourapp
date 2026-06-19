import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import type { CalendarEvent, EventType } from '../types'
import {
  eventOnDay,
  eventSourceBadge,
  eventSourceLabel,
  eventTypeBadge,
  eventTypeColor,
  eventTypeLabel,
  formatEventRange,
  getCalendarDays,
  isSameDay,
  isSameMonth,
  isToday,
  mergeCalendarEvents,
  parseEventDate,
  upcomingEvents,
} from '../utils/calendar'
import { fetchGoogleCalendarEvents } from '../utils/googleCalendar'
import { fetchIcsFromUrl, parseIcsToEvents } from '../utils/ical'

const eventTypes: EventType[] = [
  'visit',
  'trip',
  'anniversary',
  'call',
  'exam',
  'deadline',
  'conference',
  'other',
]
const weekdays = ['일', '월', '화', '수', '목', '금', '토']

export function CalendarPage() {
  const { data, addCalendarEvent, removeCalendarEvent, updateCalendarSync, setSyncedEvents } =
    useApp()
  const { calendarEvents, syncedEvents, calendarSync, settings } = data
  const allEvents = useMemo(
    () => mergeCalendarEvents(calendarEvents, syncedEvents),
    [calendarEvents, syncedEvents],
  )

  const [month, setMonth] = useState(() => new Date())
  const [selected, setSelected] = useState(() => new Date())
  const [open, setOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState('')
  const [syncDraft, setSyncDraft] = useState(calendarSync)
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<EventType>('visit')
  const [note, setNote] = useState('')

  const days = useMemo(() => getCalendarDays(month), [month])
  const selectedEvents = useMemo(() => eventOnDay(allEvents, selected), [allEvents, selected])
  const upcoming = useMemo(() => upcomingEvents(allEvents), [allEvents])

  function handleAdd() {
    if (!title.trim()) return
    addCalendarEvent({
      title: title.trim(),
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
      type,
      note: note.trim(),
      source: 'local',
    })
    setOpen(false)
    setTitle('')
    setNote('')
    setType('visit')
  }

  function openAddForSelected() {
    const iso = format(selected, 'yyyy-MM-dd')
    setStartDate(iso)
    setEndDate(iso)
    setOpen(true)
  }

  function shiftMonth(delta: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  async function handleSync() {
    setSyncing(true)
    setSyncError('')
    updateCalendarSync(syncDraft)
    try {
      const collected: CalendarEvent[] = []
      const errors: string[] = []

      if (syncDraft.myIcalUrl.trim()) {
        try {
          const text = await fetchIcsFromUrl(syncDraft.myIcalUrl)
          collected.push(...parseIcsToEvents(text, 'me'))
        } catch {
          errors.push('내 iCal URL')
        }
      }
      if (syncDraft.partnerIcalUrl.trim()) {
        try {
          const text = await fetchIcsFromUrl(syncDraft.partnerIcalUrl)
          collected.push(...parseIcsToEvents(text, 'partner'))
        } catch {
          errors.push('상대 iCal URL')
        }
      }
      if (syncDraft.googleClientId.trim()) {
        try {
          const googleEvents = await fetchGoogleCalendarEvents(syncDraft.googleClientId, 'me')
          collected.push(...googleEvents)
        } catch {
          errors.push('Google Calendar API')
        }
      }

      const seen = new Set<string>()
      const deduped = collected.filter((e) => {
        const key = e.externalId ?? `${e.source}-${e.title}-${e.startDate}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })

      setSyncedEvents(deduped)

      if (errors.length && deduped.length === 0) {
        setSyncError(
          `${errors.join(', ')} 연동 실패. .ics 파일 업로드 또는 Google Cloud Client ID를 확인해줘.`,
        )
      } else if (errors.length) {
        setSyncError(`일부 연동 실패: ${errors.join(', ')} (나머지는 반영됨)`)
      } else if (deduped.length === 0) {
        setSyncError('연동할 URL이나 Client ID를 입력해줘')
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : '동기화 실패')
    } finally {
      setSyncing(false)
    }
  }

  async function handleIcsUpload(file: File, source: 'me' | 'partner') {
    const text = await file.text()
    const imported = parseIcsToEvents(text, source)
    const others = syncedEvents.filter((e) => e.source !== source)
    setSyncedEvents([...others, ...imported])
    setSyncError('')
  }

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">공유 일정</h1>
          <p className="text-sm text-zinc-500">두 사람 달력을 한 화면에서</p>
        </div>
        <button className="btn-primary" onClick={() => setOpen(true)}>
          <Plus size={16} />
          추가
        </button>
      </div>

      <section className="card p-4">
        <button
          className="flex w-full items-center justify-between text-left"
          onClick={() => {
            setSyncDraft(calendarSync)
            setSyncOpen((v) => !v)
          }}
        >
          <div>
            <div className="text-sm font-semibold text-zinc-800">Google Calendar 연동</div>
            <div className="text-xs text-zinc-500">
              {calendarSync.lastSyncedAt
                ? `마지막 동기화 ${format(new Date(calendarSync.lastSyncedAt), 'M/d HH:mm', { locale: ko })}`
                : 'iCal URL · Google API · .ics 업로드'}
            </div>
          </div>
          {syncOpen ? (
            <ChevronUp size={18} className="text-zinc-400" />
          ) : (
            <ChevronDown size={18} className="text-zinc-400" />
          )}
        </button>

        {syncOpen && (
          <div className="mt-4 space-y-3 border-t border-rose-50 pt-4">
            <Field label={`${settings.myName} iCal URL (Google Calendar → 설정 → iCal)`}>
              <input
                className="input text-xs"
                placeholder="https://calendar.google.com/calendar/ical/..."
                value={syncDraft.myIcalUrl}
                onChange={(e) => setSyncDraft({ ...syncDraft, myIcalUrl: e.target.value })}
              />
            </Field>
            <Field label={`${settings.partnerName} iCal URL`}>
              <input
                className="input text-xs"
                placeholder="https://calendar.google.com/calendar/ical/..."
                value={syncDraft.partnerIcalUrl}
                onChange={(e) => setSyncDraft({ ...syncDraft, partnerIcalUrl: e.target.value })}
              />
            </Field>
            <Field label="Google OAuth Client ID (선택, Calendar API)">
              <input
                className="input text-xs"
                placeholder="xxxx.apps.googleusercontent.com"
                value={syncDraft.googleClientId}
                onChange={(e) => setSyncDraft({ ...syncDraft, googleClientId: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn-secondary text-xs"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={14} />
                .ics 업로드
              </button>
              <button className="btn-primary text-xs" onClick={handleSync} disabled={syncing}>
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? '동기화 중…' : '동기화'}
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleIcsUpload(file, 'me')
                e.target.value = ''
              }}
            />
            {syncError && <p className="text-xs text-rose-500">{syncError}</p>}
            <p className="text-[10px] leading-relaxed text-zinc-400">
              Google Calendar에서 &quot;비공개 iCal 주소&quot;를 복사해 붙여넣으면 시험·마감·학회 일정이
              자동 분류돼요. CORS 오류 시 .ics 파일을 다운로드해서 업로드하세요.
            </p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2 text-[10px]">
        <LegendDot color="bg-rose-500" label={settings.myName} />
        <LegendDot color="bg-sky-500" label={settings.partnerName} />
        <LegendDot color="bg-zinc-400" label="우리 일정" />
      </div>

      {upcoming.length > 0 && (
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold text-zinc-700">다가오는 일정</h2>
          <div className="space-y-2">
            {upcoming.map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  const day = parseEventDate(event.startDate)
                  setMonth(new Date(day.getFullYear(), day.getMonth(), 1))
                  setSelected(day)
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-rose-50/50 px-3 py-2.5 text-left transition hover:bg-rose-50"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    event.source === 'me'
                      ? 'bg-rose-500'
                      : event.source === 'partner'
                        ? 'bg-sky-500'
                        : eventTypeColor(event.type)
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-800">{event.title}</div>
                  <div className="text-xs text-zinc-500">
                    {formatEventRange(event.startDate, event.endDate)}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${eventTypeBadge(event.type)}`}
                >
                  {eventTypeLabel(event.type)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="card p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => shiftMonth(-1)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-zinc-800">{format(month, 'yyyy년 M월', { locale: ko })}</h2>
          <button
            onClick={() => shiftMonth(1)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-zinc-400">
          {weekdays.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const dayEvents = eventOnDay(allEvents, day)
            const inMonth = isSameMonth(day, month)
            const selectedDay = isSameDay(day, selected)
            const today = isToday(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={`relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition ${
                  !inMonth
                    ? 'text-zinc-300'
                    : selectedDay
                      ? 'bg-rose-500 font-semibold text-white'
                      : today
                        ? 'bg-rose-100 font-semibold text-rose-600'
                        : 'text-zinc-700 hover:bg-rose-50'
                }`}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && !selectedDay && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={`h-1 w-1 rounded-full ${
                          e.source === 'me'
                            ? 'bg-rose-500'
                            : e.source === 'partner'
                              ? 'bg-sky-500'
                              : eventTypeColor(e.type)
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">
            {format(selected, 'M월 d일 (EEE)', { locale: ko })}
          </h2>
          <button
            onClick={openAddForSelected}
            className="text-xs font-medium text-rose-500 hover:text-rose-600"
          >
            + 이 날짜에 추가
          </button>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-400">이 날 일정이 없어요</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-xl border border-rose-50 p-3"
              >
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    event.source === 'me'
                      ? 'bg-rose-500'
                      : event.source === 'partner'
                        ? 'bg-sky-500'
                        : eventTypeColor(event.type)
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-800">{event.title}</span>
                    <span
                      className={`rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${eventTypeBadge(event.type)}`}
                    >
                      {eventTypeLabel(event.type)}
                    </span>
                    {event.source && event.source !== 'local' && (
                      <span
                        className={`rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${eventSourceBadge(event.source)}`}
                      >
                        {eventSourceLabel(event.source, settings.myName, settings.partnerName)}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {formatEventRange(event.startDate, event.endDate)}
                  </div>
                  {event.note && <p className="mt-1 text-sm text-zinc-600">{event.note}</p>}
                </div>
                {event.source === 'local' || !event.source ? (
                  <button
                    onClick={() => removeCalendarEvent(event.id)}
                    className="rounded-lg p-1.5 text-zinc-300 hover:text-rose-400"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="일정 추가">
        <div className="space-y-3">
          <input
            className="input"
            placeholder="제목 (예: 기말고사, 프로젝트 마감)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Field label="시작">
              <input
                type="date"
                className="input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>
            <Field label="끝">
              <input
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Field>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-zinc-500">종류</span>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    type === t
                      ? eventTypeBadge(t) + ' ring-2 ring-rose-200'
                      : 'bg-zinc-50 text-zinc-500'
                  }`}
                >
                  {eventTypeLabel(t)}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="input"
            rows={2}
            placeholder="메모 (선택)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="btn-primary w-full" onClick={handleAdd}>
            저장하기
          </button>
        </div>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-zinc-500">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  )
}
