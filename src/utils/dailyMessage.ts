import type { AppData, CoupleSettings } from '../types'
import { daysTogether, daysUntil } from './helpers'

const messages = [
  (s: CoupleSettings) => `${s.myName}과 ${s.partnerName}, 오늘도 잘 버텨보자 💕`,
  (s: CoupleSettings) => `멀리 있어도 ${s.partnerName} 생각나는 하루`,
  () => '롱디지만 우리 페이스대로, 천천히 가도 괜찮아',
  (s: CoupleSettings) => `${s.myName} ♥ ${s.partnerName} — 거리는 멀어도 마음은 가까워`,
  () => '오늘도 서로에게 good night 보내기 🌙',
  () => '다음 만남을 상상하면 하루가 조금 더 빨리 가',
  (s: CoupleSettings) => `${s.partnerName}한테 짧은 쪽지 하나 어때?`,
  () => '함께 간 도시들, 다시 가고 싶은 곳 있어?',
  () => '오늘 뭐 먹었는지 나중에 기록해두자 🍜',
  () => '사소한 하루도 나중엔 소중한 추억이 돼',
  (s: CoupleSettings) => `${s.myName}의 하루, ${s.partnerName}의 하루 — 둘 다 응원해`,
  () => '비행기표 검색하다가 설레본 적, 있지? ✈️',
  () => '같이 본 야구 경기, 또 가고 싶다 ⚾',
  () => '버킷리스트 하나씩 체크해볼까',
  (s: CoupleSettings) => `${s.anniversary.slice(0, 4)}년부터 — ${daysTogether(s.anniversary).toLocaleString()}일째`,
  () => '오늘의 기분을 일기에 남겨봐 📔',
  () => '둘만의 작은 목표, 오늘도 한 걸음',
  () => '타임존이 달라도 같은 하늘을 보고 있어',
]

export function getDailyMessage(settings: CoupleSettings, data: AppData): string {
  const untilVisit = daysUntil(settings.nextVisit)

  if (untilVisit === 0) {
    return `${settings.nextTripName} 첫날! 드디어 만난다 💕`
  }
  if (untilVisit > 0 && untilVisit <= 7) {
    return `${settings.nextTripName}까지 ${untilVisit}일! 거의 다 왔어 ✨`
  }
  if (untilVisit > 0 && untilVisit <= 30) {
    return `${settings.nextTripName}까지 ${untilVisit}일 — 설레는 한 달`
  }
  if (untilVisit > 0) {
    return `${settings.nextTripName}까지 ${untilVisit}일! 곧 만날 수 있어 ✨`
  }

  const dayIndex = Math.floor(Date.now() / 86400000)
  const seed = dayIndex + daysTogether(settings.anniversary) + data.memories.length
  return messages[seed % messages.length](settings)
}
