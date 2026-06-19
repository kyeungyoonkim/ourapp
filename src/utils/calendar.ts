import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { ko } from 'date-fns/locale'
import type { CalendarEvent, EventType } from '../types'

export function eventTypeLabel(type: EventType) {
  const labels: Record<EventType, string> = {
    visit: '만남',
    trip: '여행',
    anniversary: '기념일',
    call: '통화',
    exam: '시험',
    deadline: '마감',
    conference: '학회',
    other: '기타',
  }
  return labels[type]
}

export function eventTypeColor(type: EventType) {
  const colors: Record<EventType, string> = {
    visit: 'bg-rose-500',
    trip: 'bg-sky-500',
    anniversary: 'bg-pink-500',
    call: 'bg-emerald-500',
    exam: 'bg-amber-500',
    deadline: 'bg-orange-500',
    conference: 'bg-violet-500',
    other: 'bg-zinc-400',
  }
  return colors[type]
}

export function eventTypeBadge(type: EventType) {
  const badges: Record<EventType, string> = {
    visit: 'bg-rose-50 text-rose-600',
    trip: 'bg-sky-50 text-sky-600',
    anniversary: 'bg-pink-50 text-pink-600',
    call: 'bg-emerald-50 text-emerald-600',
    exam: 'bg-amber-50 text-amber-700',
    deadline: 'bg-orange-50 text-orange-700',
    conference: 'bg-violet-50 text-violet-700',
    other: 'bg-zinc-100 text-zinc-600',
  }
  return badges[type]
}

export function eventSourceLabel(source: CalendarEvent['source'], myName: string, partnerName: string) {
  if (source === 'me') return myName
  if (source === 'partner') return partnerName
  return '우리'
}

export function eventSourceBadge(source: CalendarEvent['source']) {
  if (source === 'me') return 'bg-rose-100 text-rose-700'
  if (source === 'partner') return 'bg-sky-100 text-sky-700'
  return 'bg-zinc-100 text-zinc-600'
}

export function mergeCalendarEvents(local: CalendarEvent[], synced: CalendarEvent[]) {
  const seen = new Set<string>()
  const merged: CalendarEvent[] = []

  for (const event of [...local, ...synced]) {
    const key = event.externalId ?? `${event.source ?? 'local'}-${event.title}-${event.startDate}`
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(event)
  }

  return sortEvents(merged)
}

export function formatEventRange(startDate: string, endDate: string) {
  const start = parseEventDate(startDate)
  const end = parseEventDate(endDate)
  if (startDate === endDate) {
    return format(start, 'M월 d일', { locale: ko })
  }
  if (format(start, 'yyyy-MM') === format(end, 'yyyy-MM')) {
    return `${format(start, 'M월 d일', { locale: ko })} – ${format(end, 'd일', { locale: ko })}`
  }
  return `${format(start, 'M월 d일', { locale: ko })} – ${format(end, 'M월 d일', { locale: ko })}`
}

export function getCalendarDays(month: Date) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

import { parseLocalDate } from './helpers'

export function parseEventDate(date: string) {
  return parseLocalDate(date)
}

export function eventOnDay(events: CalendarEvent[], day: Date) {
  return events.filter((event) => {
    const start = parseEventDate(event.startDate)
    const end = parseEventDate(event.endDate)
    return isWithinInterval(day, { start, end })
  })
}

export function sortEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate))
}

export function upcomingEvents(events: CalendarEvent[], limit = 5) {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return sortEvents(events)
    .filter((event) => parseEventDate(event.endDate) >= today)
    .slice(0, limit)
}

export function isToday(day: Date) {
  return isSameDay(day, new Date())
}

export { format, isSameMonth, isSameDay }
