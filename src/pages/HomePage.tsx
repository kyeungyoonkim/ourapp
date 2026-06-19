import { BookHeart, CalendarDays, CalendarHeart, MapPin, Plane, Target } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import {
  eventTypeBadge,
  eventTypeColor,
  eventTypeLabel,
  formatEventRange,
  mergeCalendarEvents,
  upcomingEvents,
} from '../utils/calendar'
import { getDailyMessage } from '../utils/dailyMessage'
import {
  daysTogether,
  daysUntil,
  effectiveMyCity,
  formatDate,
  formatDateInZone,
  formatMiles,
  formatTimeInZone,
  hasMovedIn,
  milesBetweenCities,
  uniqueCityCount,
  uniqueStateCount,
  uniqueStates,
} from '../utils/helpers'
import { countMlbGames, topFoodMenus } from '../utils/stats'

interface HomePageProps {
  onGoCalendar?: () => void
  onGoTogether?: () => void
}

export function HomePage({ onGoCalendar, onGoTogether }: HomePageProps) {
  const { data } = useApp()
  const { settings, places, memories, notes, diaryEntries, calendarEvents, syncedEvents, goals } =
    data
  const [, setTick] = useState(0)
  const allEvents = useMemo(
    () => mergeCalendarEvents(calendarEvents, syncedEvents),
    [calendarEvents, syncedEvents],
  )
  const upcoming = useMemo(() => upcomingEvents(allEvents, 3), [allEvents])
  const topFood = useMemo(() => topFoodMenus(data, 1)[0], [data])
  const mlbGames = useMemo(() => countMlbGames(data), [data])
  const dailyMessage = useMemo(() => getDailyMessage(settings, data), [settings, data])

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const together = daysTogether(settings.anniversary)
  const cityCount = uniqueCityCount(places)
  const stateCount = uniqueStateCount(places)
  const states = useMemo(() => uniqueStates(places), [places])
  const tripCount = places.length
  const journalCount = notes.length + diaryEntries.length
  const myCityNow = effectiveMyCity(
    settings.myCity,
    settings.myCityNext,
    settings.myCityMoveDate,
  )
  const currentDistance = milesBetweenCities(settings.myCity, settings.partnerCity)
  const futureDistance = settings.myCityNext
    ? milesBetweenCities(settings.myCityNext, settings.partnerCity)
    : null
  const showFutureDistance =
    settings.myCityNext &&
    settings.myCityMoveDate &&
    !hasMovedIn(settings.myCityMoveDate) &&
    futureDistance !== null
  const activeDistance =
    showFutureDistance && futureDistance !== null
      ? futureDistance
      : currentDistance ?? futureDistance ?? 0
  const activeCityPair = showFutureDistance
    ? `${settings.myCityNext} ↔ ${settings.partnerCity}`
    : `${myCityNow} ↔ ${settings.partnerCity}`
  const untilVisit = daysUntil(settings.nextVisit)
  const visitLabel =
    untilVisit > 0
      ? `D-${untilVisit}`
      : untilVisit === 0
        ? '오늘 만나는 날!'
        : `${Math.abs(untilVisit)}일 전에 만났어`

  return (
    <div className="fade-in space-y-4">
      <header className="card overflow-hidden p-5">
        <div className="mb-1 text-sm text-rose-400">우리만의 공간</div>
        <h1 className="text-2xl font-bold text-zinc-800">
          {settings.myName}
          <span className="mx-2 text-rose-300">♥</span>
          {settings.partnerName}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {showFutureDistance ? (
            <>
              {settings.myName}: {settings.myCity} →{' '}
              {formatDate(settings.myCityMoveDate).replace(/^\d{4}년 /, '')}부터 {settings.myCityNext}
            </>
          ) : (
            <>{settings.myName}: {myCityNow}</>
          )}
          <span className="mx-1.5">↔</span>
          {settings.partnerName}: {settings.partnerCity}
        </p>
      </header>

      <section className="card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <MapPin size={15} className="text-rose-400" />
          거리 · 시간
        </div>
        {(currentDistance !== null || futureDistance !== null) && (
          <div className="mb-3 flex items-baseline justify-between rounded-xl bg-zinc-50 px-3 py-2.5">
            <div>
              <div className="text-[10px] text-zinc-500">
                {showFutureDistance
                  ? `${formatDate(settings.myCityMoveDate).replace(/^\d{4}년 /, '')}부터 더 가까워져요`
                  : '우리 거리'}
              </div>
              <div className="text-lg font-bold text-zinc-800">
                {formatMiles(activeDistance)} <span className="text-sm font-medium text-zinc-500">miles</span>
              </div>
              <div className="text-[10px] text-zinc-400">{activeCityPair}</div>
            </div>
            {showFutureDistance && currentDistance !== null && futureDistance !== null && (
              <div className="text-right text-[10px] text-rose-500">
                지금 {formatMiles(currentDistance)} mi
                <br />−{formatMiles(currentDistance - futureDistance)} mi
              </div>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <TimezoneCard
            name={settings.myName}
            city={myCityNow}
            timezone={settings.myTimezone}
          />
          <TimezoneCard
            name={settings.partnerName}
            city={settings.partnerCity}
            timezone={settings.partnerTimezone}
          />
        </div>
      </section>

      <section className="card border-zinc-100 bg-white p-4">
        <div className="grid grid-cols-3 gap-2">
          <SoftStat icon={CalendarHeart} label="함께 한지" value={`${together.toLocaleString()}일`} />
          <SoftStat icon={MapPin} label="함께 간 도시" value={`${cityCount}곳`} />
          <SoftStat icon={MapPin} label="미국 주" value={`${stateCount}개`} />
        </div>
        <div className="mt-2 text-center text-[10px] text-zinc-400">
          여행 {tripCount}번 기록
        </div>
        {cityCount > 0 && (
          <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(places.map((p) => p.name))].map((name) => {
                const place = places.find((p) => p.name === name)!
                return (
                  <span
                    key={name}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600"
                  >
                    {place.emoji} {name}
                  </span>
                )
              })}
            </div>
            {states.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {states.map((state) => (
                  <span
                    key={state}
                    className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-400"
                  >
                    🗺️ {state}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card p-4">
        <div className="mb-2 flex items-center gap-2 text-rose-400">
          <Plane size={16} />
          <span className="text-xs font-semibold">다음 만남</span>
        </div>
        <div className="text-xl font-bold text-zinc-800">{visitLabel}</div>
        <div className="mt-1 text-xs text-zinc-500">
          {settings.nextTripName} · {settings.nextVisit}
          {settings.nextVisitEnd && settings.nextVisitEnd !== settings.nextVisit
            ? ` – ${settings.nextVisitEnd}`
            : ''}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
              <CalendarDays size={16} className="text-rose-400" />
              다가오는 일정
            </div>
            {onGoCalendar && (
              <button
                onClick={onGoCalendar}
                className="text-xs font-medium text-rose-500 hover:text-rose-600"
              >
                전체 보기
              </button>
            )}
          </div>
          <div className="space-y-2">
            {upcoming.map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-xl bg-rose-50/50 px-3 py-2">
                <div className={`h-2 w-2 shrink-0 rounded-full ${eventTypeColor(event.type)}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-800">{event.title}</div>
                  <div className="text-xs text-zinc-500">
                    {formatEventRange(event.startDate, event.endDate)}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[10px] font-semibold ${eventTypeBadge(event.type)}`}
                >
                  {eventTypeLabel(event.type)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <StatCard icon={BookHeart} label="일기·쪽지" value={journalCount} />
        <StatCard icon={CalendarHeart} label="추억" value={memories.length} />
      </section>

      <section className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            <Target size={16} className="text-rose-400" />
            우리 요약
          </div>
          {onGoTogether && (
            <button
              onClick={onGoTogether}
              className="text-xs font-medium text-rose-500 hover:text-rose-600"
            >
              자세히
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniStat label="MLB 경기" value={`${mlbGames}`} />
          <MiniStat label="TOP 메뉴" value={topFood?.menu.slice(0, 6) ?? '-'} />
          <MiniStat label="공동 목표" value={`${goals.length}개`} />
        </div>
      </section>

      <section className="card p-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">오늘의 한마디</h2>
        <p className="text-sm leading-relaxed text-zinc-600">{dailyMessage}</p>
      </section>
    </div>
  )
}

function TimezoneCard({
  name,
  city,
  timezone,
}: {
  name: string
  city: string
  timezone: string
}) {
  return (
    <div className="rounded-xl bg-rose-50/60 p-2.5">
      <div className="text-[10px] font-medium text-rose-400">{name}</div>
      <div className="text-base font-bold text-zinc-800">{formatTimeInZone(timezone)}</div>
      <div className="truncate text-[10px] text-zinc-500">
        {city} · {formatDateInZone(timezone)}
      </div>
    </div>
  )
}

function SoftStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl bg-zinc-50 px-2 py-2 text-center">
      <div className="flex items-center justify-center gap-0.5 text-[10px] text-zinc-500">
        <Icon size={11} className="text-rose-300" />
        {label}
      </div>
      <div className="mt-0.5 text-base font-bold text-zinc-700">{value}</div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookHeart
  label: string
  value: number
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="rounded-xl bg-rose-50 p-2 text-rose-400">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs text-zinc-500">{label}</div>
        <div className="text-lg font-bold text-zinc-800">{value}</div>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-rose-50/80 px-2 py-2">
      <div className="text-[10px] text-zinc-500">{label}</div>
      <div className="truncate text-sm font-bold text-zinc-800">{value}</div>
    </div>
  )
}
