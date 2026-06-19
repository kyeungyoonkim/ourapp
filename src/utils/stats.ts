import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { AppData, CoupleSettings } from '../types'
import { parseLocalDate } from './helpers'

const MLB_KEYWORDS = /야구|mlb|브레이브스|braves|메이저리그|baseball|⚾/i

export function countMlbGames(data: AppData) {
  const memoryCount = data.memories.filter(
    (m) => m.emoji === '⚾' || MLB_KEYWORDS.test(`${m.title} ${m.description}`),
  ).length
  const eventCount = [...data.calendarEvents, ...data.syncedEvents].filter((e) =>
    MLB_KEYWORDS.test(`${e.title} ${e.note}`),
  ).length
  return memoryCount + eventCount
}

export function countCityVisits(data: AppData, settings: CoupleSettings) {
  const uniqueCities = new Set(data.places.map((p) => p.name))
  const partnerVisits = data.memories.filter((m) =>
    m.description.includes(settings.partnerCity) || m.title.includes(settings.partnerCity),
  ).length
  const myVisits = data.memories.filter((m) =>
    m.description.includes(settings.myCity) ||
    m.title.includes(settings.myCity) ||
    (settings.myCityNext && (m.description.includes(settings.myCityNext) || m.title.includes(settings.myCityNext))),
  ).length
  return {
    uniqueCities: uniqueCities.size,
    totalTrips: data.places.length,
    partnerCityVisits: partnerVisits,
    myCityVisits: myVisits,
  }
}

export function topFoodMenus(data: AppData, limit = 5) {
  const counts = new Map<string, number>()
  for (const log of data.foodLogs) {
    const key = log.menu.trim()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([menu, count]) => ({ menu, count }))
}

export function monthlySummary(data: AppData, month: Date) {
  const interval = { start: startOfMonth(month), end: endOfMonth(month) }
  const label = format(month, 'yyyy년 M월', { locale: ko })

  const trips = data.places.filter((p) => {
    const d = parseLocalDate(p.visitedAt)
    return isWithinInterval(d, interval)
  }).length

  const memories = data.memories.filter((m) => {
    const d = parseLocalDate(m.date)
    return isWithinInterval(d, interval)
  }).length

  const expenses = data.expenses.filter((e) => {
    const d = parseLocalDate(e.date)
    return isWithinInterval(d, interval)
  })

  const spentUsd = expenses.filter((e) => e.currency === 'USD').reduce((s, e) => s + e.amount, 0)
  const spentKrw = expenses.filter((e) => e.currency === 'KRW').reduce((s, e) => s + e.amount, 0)

  const foods = data.foodLogs.filter((f) => {
    const d = parseLocalDate(f.date)
    return isWithinInterval(d, interval)
  })

  return {
    label,
    trips,
    memories,
    expenseCount: expenses.length,
    spentUsd,
    spentKrw,
    foodCount: foods.length,
    topFood: topFoodMenus({ ...data, foodLogs: foods }, 1)[0]?.menu ?? '-',
  }
}

export function computeSettlement(data: AppData) {
  let mePaid = 0
  let partnerPaid = 0
  let meShare = 0
  let partnerShare = 0

  for (const e of data.expenses.filter((x) => !x.settled)) {
    const amount = e.amount
    if (e.paidBy === 'me') mePaid += amount
    else partnerPaid += amount

    if (e.split === 'equal') {
      meShare += amount / 2
      partnerShare += amount / 2
    } else if (e.split === 'me') {
      meShare += amount
    } else {
      partnerShare += amount
    }
  }

  const meBalance = mePaid - meShare

  if (Math.abs(meBalance) < 0.01) {
    return { message: '정산 완료! 더치페이 맞춰졌어요 ✨', owes: null as null }
  }
  if (meBalance > 0) {
    return {
      message: `${data.settings.partnerName}이(가) ${data.settings.myName}에게`,
      owes: { from: 'partner' as const, to: 'me' as const, amount: meBalance },
    }
  }
  return {
    message: `${data.settings.myName}이(가) ${data.settings.partnerName}에게`,
    owes: { from: 'me' as const, to: 'partner' as const, amount: Math.abs(meBalance) },
  }
}
