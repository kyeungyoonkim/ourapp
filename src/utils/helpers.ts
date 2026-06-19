import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'

import type { TravelPlace } from '../types'

/** YYYY-MM-DD 문자열을 로컬 날짜로 파싱 (UTC 자정 → 전날 표시 버그 방지) */
export function parseLocalDate(dateStr: string) {
  if (!dateStr) return new Date()
  if (dateStr.includes('T')) return parseISO(dateStr)
  return parseISO(`${dateStr}T12:00:00`)
}

export function formatDate(dateStr: string) {
  return format(parseLocalDate(dateStr), 'yyyy년 M월 d일', { locale: ko })
}

export function formatDateShort(dateStr: string) {
  return format(parseLocalDate(dateStr), 'M/d', { locale: ko })
}

export function formatDateRange(start: string, end?: string) {
  if (!end || end === start) return formatDate(start)
  const startFmt = format(parseLocalDate(start), 'M월 d일', { locale: ko })
  const endFmt = format(parseLocalDate(end), 'd일', { locale: ko })
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${startFmt} – ${endFmt}`
  }
  return `${startFmt} – ${format(parseLocalDate(end), 'M월 d일', { locale: ko })}`
}

export function uniqueCityCount(places: TravelPlace[]) {
  return new Set(places.map((p) => p.name)).size
}

const cityToState: Record<string, string> = {
  볼티모어: '메릴랜드',
  애틀랜타: '조지아',
  카터스빌: '조지아',
  '크리스티아나 몰': '델라웨어',
  필라델피아: '펜실베이니아',
  플로리다: '플로리다',
  시카고: '일리노이',
  인디애나폴리스: '인디애나',
  웨스트라피엣: '인디애나',
  앤아버: '미시간',
  루이빌: '켄터키',
  내슈빌: '테네시',
  신시내티: '오하이오',
  워싱턴: 'DC',
  뉴욕: '뉴욕',
  콜로라도: '콜로라도',
}

const usStateToKorean: Record<string, string> = {
  Maryland: '메릴랜드',
  Georgia: '조지아',
  Delaware: '델라웨어',
  Pennsylvania: '펜실베이니아',
  Florida: '플로리다',
  Illinois: '일리노이',
  Indiana: '인디애나',
  Michigan: '미시간',
  Kentucky: '켄터키',
  Tennessee: '테네시',
  Ohio: '오하이오',
  Colorado: '콜로라도',
  California: '캘리포니아',
  Texas: '텍사스',
  'New York': '뉴욕',
  Virginia: '버지니아',
  'District of Columbia': 'DC',
}

export function resolvePlaceState(place: TravelPlace) {
  if (place.state) return place.state
  return cityToState[place.name] ?? ''
}

export function uniqueStateCount(places: TravelPlace[]) {
  return new Set(places.map(resolvePlaceState).filter(Boolean)).size
}

export function uniqueStates(places: TravelPlace[]) {
  return [...new Set(places.map(resolvePlaceState).filter(Boolean))].sort()
}

export function englishStateToKorean(state: string) {
  return usStateToKorean[state] ?? state
}

export function daysTogether(anniversary: string) {
  const start = parseLocalDate(anniversary)
  const today = new Date()
  return Math.max(0, differenceInCalendarDays(today, start))
}

export function daysUntil(dateStr: string) {
  const target = parseLocalDate(dateStr)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  target.setHours(12, 0, 0, 0)
  return differenceInCalendarDays(target, today)
}

export function formatRelative(dateStr: string) {
  return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true, locale: ko })
}

export function formatTimeInZone(timezone: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function formatDateInZone(timezone: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: timezone,
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())
}

export async function geocodePlace(
  query: string,
): Promise<{ lat: number; lng: number; name: string; state: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=1`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ko' },
  })
  if (!res.ok) return null
  const data = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
    address?: { state?: string }
  }>
  if (!data.length) return null
  const rawState = data[0].address?.state ?? ''
  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon),
    name: data[0].display_name.split(',')[0],
    state: englishStateToKorean(rawState) || cityToState[data[0].display_name.split(',')[0]] || '',
  }
}

export const timezoneOptions = [
  { value: 'Asia/Seoul', label: '한국 (서울)' },
  { value: 'Asia/Tokyo', label: '일본 (도쿄)' },
  { value: 'America/Los_Angeles', label: '미국 (LA)' },
  { value: 'America/New_York', label: '미국 동부 (뉴욕/조지아/볼티모어)' },
  { value: 'Europe/London', label: '영국 (런던)' },
  { value: 'Europe/Paris', label: '프랑스 (파리)' },
  { value: 'Asia/Shanghai', label: '중국 (상하이)' },
  { value: 'Asia/Singapore', label: '싱가포르' },
  { value: 'Australia/Sydney', label: '호주 (시드니)' },
]

export const NORTH_AMERICA_MAP_CENTER: [number, number] = [42, -98]
export const NORTH_AMERICA_MAP_ZOOM = 4

export const emojiOptions = ['❤️', '✨', '🌊', '🍜', '📸', '🌸', '✈️', '🎡', '🏔️', '🌙', '☕', '🎁']

const cityCoords: Record<string, { lat: number; lng: number }> = {
  조지아: { lat: 33.749, lng: -84.388 },
  카터스빌: { lat: 34.1651, lng: -84.7999 },
  애틀랜타: { lat: 33.749, lng: -84.388 },
  필라델피아: { lat: 39.9526, lng: -75.1652 },
  볼티모어: { lat: 39.2904, lng: -76.6122 },
  시카고: { lat: 41.8781, lng: -87.6298 },
  워싱턴: { lat: 38.9072, lng: -77.0369 },
  루이빌: { lat: 38.2527, lng: -85.7585 },
  내슈빌: { lat: 36.1627, lng: -86.7816 },
  신시내티: { lat: 39.1031, lng: -84.512 },
  인디애나폴리스: { lat: 39.7684, lng: -86.1581 },
  뉴욕: { lat: 40.7128, lng: -74.006 },
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

export function milesBetweenCities(cityA: string, cityB: string) {
  const a = cityCoords[cityA]
  const b = cityCoords[cityB]
  if (!a || !b) return null

  const R = 3958.8
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}

export function hasMovedIn(moveDate: string) {
  if (!moveDate) return false
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const move = parseLocalDate(moveDate)
  move.setHours(12, 0, 0, 0)
  return today >= move
}

export function effectiveMyCity(
  myCity: string,
  myCityNext: string,
  myCityMoveDate: string,
) {
  if (myCityNext && myCityMoveDate && hasMovedIn(myCityMoveDate)) {
    return myCityNext
  }
  return myCity
}

export function formatMiles(miles: number) {
  return miles.toLocaleString('en-US')
}

export function formatUsd(amount: number) {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

export function compressImage(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('canvas'))
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('image'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('read'))
    reader.readAsDataURL(file)
  })
}
