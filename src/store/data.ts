import type { AppData, CalendarEvent, CoupleSettings, Memory, TravelPlace } from '../types'

const STORAGE_KEY = 'ourapp-data-v13'

export { STORAGE_KEY }

export const defaultSettings: CoupleSettings = {
  myName: '윤',
  partnerName: '찬',
  anniversary: '2025-07-07',
  nextVisit: '2026-07-02',
  nextVisitEnd: '2026-07-05',
  nextTripName: 'BWI 방문',
  myCity: '카터스빌',
  myCityNext: '필라델피아',
  myCityMoveDate: '2026-08-01',
  partnerCity: '볼티모어',
  myTimezone: 'America/New_York',
  partnerTimezone: 'America/New_York',
}

export const defaultCalendarSync = {
  myIcalUrl: '',
  partnerIcalUrl: '',
  googleClientId: '',
  lastSyncedAt: '',
}

export const defaultData: AppData = {
  settings: defaultSettings,
  calendarSync: defaultCalendarSync,
  syncedEvents: [],
  itinerary: [
    {
      id: 'i1',
      tripName: '조지아 (찬 방문)',
      type: 'flight',
      title: '인디애나폴리스 → 애틀랜타',
      datetime: '2026-06-25T14:30',
      endDatetime: '',
      confirmationCode: 'ABC123',
      location: 'IND → ATL',
      note: '체크인 2시간 전 도착',
    },
    {
      id: 'i2',
      tripName: '조지아 (찬 방문)',
      type: 'hotel',
      title: '애틀랜타 숙소',
      datetime: '2026-06-25T15:00',
      endDatetime: '2026-06-29T11:00',
      confirmationCode: 'HTL-8842',
      location: 'Midtown Atlanta',
      note: '체크아웃 11AM',
    },
  ],
  goals: [
    {
      id: 'g1',
      title: '결혼 자금 모으기',
      currentAmount: 8500,
      targetAmount: 35000,
      unit: '$',
      emoji: '💍',
      deadline: '2027-12-31',
    },
    {
      id: 'g2',
      title: '디지털 상품 첫 수익',
      currentAmount: 0,
      targetAmount: 1,
      unit: '달성',
      emoji: '💻',
      deadline: '2026-12-31',
    },
  ],
  expenses: [
    {
      id: 'e1',
      title: '조지아 여행 저녁',
      amount: 85,
      currency: 'USD',
      paidBy: 'me',
      split: 'equal',
      category: 'date',
      date: '2025-07-05',
      note: '브레이브스 경기 후 식사',
      settled: true,
    },
    {
      id: 'e2',
      title: '시카고 호텔',
      amount: 420,
      currency: 'USD',
      paidBy: 'partner',
      split: 'equal',
      category: 'travel',
      date: '2025-11-26',
      note: '2박',
      settled: false,
    },
  ],
  foodLogs: [
    { id: 'f1', menu: '멕시칸 볼', date: '2025-07-03' },
    { id: 'f2', menu: '멕시칸 볼', date: '2025-11-27' },
    { id: 'f3', menu: '한식 (불고기)', date: '2025-12-24' },
    { id: 'f4', menu: '멕시칸 볼', date: '2026-02-21' },
    { id: 'f5', menu: '피자', date: '2026-04-11' },
  ],
  places: [
    {
      id: '1',
      name: '볼티모어',
      state: '메릴랜드',
      lat: 39.2904,
      lng: -76.6122,
      visitedAt: '2025-05-23',
      note: '5/23–5/27 · DC·JHU 구경',
      emoji: '🦀',
    },
    {
      id: '2',
      name: '애틀랜타',
      state: '조지아',
      lat: 33.749,
      lng: -84.388,
      visitedAt: '2025-07-02',
      note: '7/2–7/7 · 브레이브스 야구경기, 자라 쇼핑',
      emoji: '⚾',
    },
    {
      id: '3',
      name: '필라델피아',
      state: '펜실베이니아',
      lat: 39.9526,
      lng: -75.1652,
      visitedAt: '2025-07-18',
      note: '7/18–7/21 · 필라델피아·볼티모어 구경, 델라웨어 쇼핑',
      emoji: '🔔',
    },
    {
      id: '16',
      name: '크리스티아나 몰',
      state: '델라웨어',
      lat: 39.678,
      lng: -75.651,
      visitedAt: '2025-07-18',
      note: '7/18–7/21 · 크리스티아나 몰 쇼핑',
      emoji: '🛍️',
    },
    {
      id: '4',
      name: '플로리다',
      state: '플로리다',
      lat: 27.9944,
      lng: -81.7603,
      visitedAt: '2025-08-14',
      note: '8/14–8/19 · 로드트립',
      emoji: '🌴',
    },
    {
      id: '5',
      name: '시카고',
      state: '일리노이',
      lat: 41.8781,
      lng: -87.6298,
      visitedAt: '2025-11-26',
      note: '11/26–12/2 · 시카고 여행',
      emoji: '🌬️',
    },
    {
      id: '6',
      name: '카터스빌',
      state: '조지아',
      lat: 34.1651,
      lng: -84.7999,
      visitedAt: '2025-12-23',
      note: '12/23–1/10 · 찬 겨울방학, 같이 보냄',
      emoji: '❄️',
    },
    {
      id: '7',
      name: '시카고',
      state: '일리노이',
      lat: 41.8781,
      lng: -87.6298,
      visitedAt: '2026-02-20',
      note: '2/20–2/22 · 시카고+인디폴 여행',
      emoji: '🏙️',
    },
    {
      id: '8',
      name: '인디애나폴리스',
      state: '인디애나',
      lat: 39.7684,
      lng: -86.1581,
      visitedAt: '2026-02-20',
      note: '2/20–2/22 · 시카고+인디폴 여행',
      emoji: '🏎️',
    },
    {
      id: '9',
      name: '앤아버',
      state: '미시간',
      lat: 42.2808,
      lng: -83.743,
      visitedAt: '2026-04-10',
      note: '4/10–4/12 · 미시간, 앤아버 돌아다님',
      emoji: '🎓',
    },
    {
      id: '10',
      name: '웨스트라피엣',
      state: '인디애나',
      lat: 40.4259,
      lng: -86.9081,
      visitedAt: '2026-05-15',
      note: '5/15–5/17 · 퍼듀, 찬 졸업식',
      emoji: '🎓',
    },
    {
      id: '11',
      name: '인디애나폴리스',
      state: '인디애나',
      lat: 39.7684,
      lng: -86.1581,
      visitedAt: '2024-11-22',
      note: '11/22–11/28 · Indy–Louisville–Nashville–Atlanta–Cincy',
      emoji: '🏎️',
    },
    {
      id: '12',
      name: '루이빌',
      state: '켄터키',
      lat: 38.2527,
      lng: -85.7585,
      visitedAt: '2024-11-22',
      note: '11/22–11/28 · 미드웨스트 로드트립',
      emoji: '🐎',
    },
    {
      id: '13',
      name: '내슈빌',
      state: '테네시',
      lat: 36.1627,
      lng: -86.7816,
      visitedAt: '2024-11-22',
      note: '11/22–11/28 · 미드웨스트 로드트립',
      emoji: '🎸',
    },
    {
      id: '14',
      name: '애틀랜타',
      state: '조지아',
      lat: 33.749,
      lng: -84.388,
      visitedAt: '2024-11-22',
      note: '11/22–11/28 · 미드웨스트 로드트립',
      emoji: '🍑',
    },
    {
      id: '15',
      name: '신시내티',
      state: '오하이오',
      lat: 39.1031,
      lng: -84.512,
      visitedAt: '2024-11-22',
      note: '11/22–11/28 · 미드웨스트 로드트립',
      emoji: '🌭',
    },
    {
      id: '17',
      name: 'Acworth',
      state: '조지아',
      lat: 34.0665,
      lng: -84.6783,
      visitedAt: '2026-06-25',
      note: '6/25–6/28 · Cauble Park에서 수영',
      emoji: '🏊',
    },
    {
      id: '18',
      name: 'Alpharetta',
      state: '조지아',
      lat: 34.0754,
      lng: -84.2941,
      visitedAt: '2026-06-26',
      note: '6/25–6/28 · 갈비찜 먹은 날',
      emoji: '🥘',
    },
    {
      id: '19',
      name: 'Cartersville',
      state: '조지아',
      lat: 34.1651,
      lng: -84.7999,
      visitedAt: '2026-06-27',
      note: '6/25–6/28 · 수영하고 토이스토리 5 봄',
      emoji: '🎬',
    },
  ],
  memories: [
    {
      id: '12',
      title: 'Acworth · Alpharetta · Cartersville',
      description:
        '6/25–6/28 Acworth Cauble Park에서 수영하고, Alpharetta에서 갈비찜 먹고, Cartersville에서 수영하고 토이스토리 5 봤던 시간.',
      date: '2026-06-25',
      endDate: '2026-06-28',
      emoji: '🏊',
    },
    {
      id: '1',
      title: '찬 졸업식',
      description: '5/15–5/17 웨스트라피엣 퍼듀에서 찬 졸업식.',
      date: '2026-05-15',
      endDate: '2026-05-17',
      emoji: '🎓',
    },
    {
      id: '2',
      title: '미시간 · 앤아버',
      description: '4/10–4/12 앤아버 돌아다니며 보낸 미시간 여행.',
      date: '2026-04-10',
      endDate: '2026-04-12',
      emoji: '🎓',
    },
    {
      id: '3',
      title: '시카고 & 인디애나폴리스',
      description: '2/20–2/22 시카고랑 인디폴 함께 여행.',
      date: '2026-02-20',
      endDate: '2026-02-22',
      emoji: '🏙️',
    },
    {
      id: '4',
      title: '찬 겨울방학',
      description: '12/23–1/10 찬 겨울방학, 카터스빌에서 같이 보냈던 시간.',
      date: '2025-12-23',
      endDate: '2026-01-10',
      emoji: '❄️',
    },
    {
      id: '5',
      title: '시카고 여행',
      description: '11/26–12/2 시카고 여행.',
      date: '2025-11-26',
      endDate: '2025-12-02',
      emoji: '🌬️',
    },
    {
      id: '6',
      title: '플로리다 로드트립',
      description: '8/14–8/19 플로리다 로드트립 다녀왔던 여행.',
      date: '2025-08-14',
      endDate: '2025-08-19',
      emoji: '🌴',
    },
    {
      id: '7',
      title: '필라델피아 & 볼티모어',
      description: '7/18–7/21 필라델피아·볼티모어 구경, 델라웨어 크리스티아나 몰 쇼핑.',
      date: '2025-07-18',
      endDate: '2025-07-21',
      emoji: '🏙️',
    },
    {
      id: '8',
      title: '사귄 날',
      description: '2025년 7월 7일, 조지아 여행 마지막 날. 우리의 시작 💕',
      date: '2025-07-07',
      emoji: '💕',
    },
    {
      id: '9',
      title: '조지아 여행',
      description: '7/2–7/7 브레이브스 야구경기 보고 자라 쇼핑했던 여행.',
      date: '2025-07-02',
      emoji: '⚾',
    },
    {
      id: '10',
      title: '볼티모어 여행',
      description: '5/23–5/27 볼티모어에서 DC랑 JHU 구경했던 첫 여행.',
      date: '2025-05-23',
      emoji: '🦀',
    },
    {
      id: '11',
      title: '미드웨스트 로드트립',
      description:
        '11/22–11/28 인디애나폴리스–루이빌–내슈빌–애틀랜타–신시내티 여행.',
      date: '2024-11-22',
      emoji: '🚗',
    },
  ],
  notes: [
    {
      id: '1',
      author: 'me',
      message: '조지아 ↔ 볼티모어 롱디지만, 미국 어디든 같이 가자 ✈️',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      author: 'partner',
      message: '6월에 조지아에서 보자! 너무 기대돼 💕',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  bucketList: [
    { id: '0', title: '찬 조지아 방문 (6/25–6/29)', done: true, emoji: '✈️' },
    { id: '4', title: 'BWI 방문 (7/2–7/5)', done: false, emoji: '🛫' },
    { id: '1', title: '콜로라도 여행 (8/11–8/19)', done: false, emoji: '🏔️' },
    { id: '2', title: '로키산맥 트레킹', done: false, emoji: '🥾' },
    { id: '3', title: '미국 서부 로드트립', done: false, emoji: '🚗' },
  ],
  calendarEvents: [
    { id: 'c0', title: '미드웨스트 로드트립', startDate: '2024-11-22', endDate: '2024-11-28', type: 'trip', note: 'Indy–Louisville–Nashville–Atlanta–Cincinnati' },
    { id: 'c1', title: '볼티모어 여행', startDate: '2025-05-23', endDate: '2025-05-27', type: 'trip', note: 'DC·JHU 구경' },
    { id: 'c2', title: '조지아 여행', startDate: '2025-07-02', endDate: '2025-07-07', type: 'trip', note: '브레이브스 야구, 자라 쇼핑' },
    { id: 'c3', title: '사귄 날 💕', startDate: '2025-07-07', endDate: '2025-07-07', type: 'anniversary', note: '우리의 시작' },
    { id: 'c4', title: '필라델피아 & 볼티모어', startDate: '2025-07-18', endDate: '2025-07-21', type: 'trip', note: '델라웨어 크리스티아나 몰 쇼핑' },
    { id: 'c5', title: '플로리다 로드트립', startDate: '2025-08-14', endDate: '2025-08-19', type: 'trip', note: '' },
    { id: 'c6', title: '시카고 여행', startDate: '2025-11-26', endDate: '2025-12-02', type: 'trip', note: '' },
    { id: 'c7', title: '찬 겨울방학 (카터스빌)', startDate: '2025-12-23', endDate: '2026-01-10', type: 'visit', note: '카터스빌에서 같이 보냄' },
    { id: 'c8', title: '시카고 & 인디애나폴리스', startDate: '2026-02-20', endDate: '2026-02-22', type: 'trip', note: '' },
    { id: 'c9', title: '미시간 · 앤아버', startDate: '2026-04-10', endDate: '2026-04-12', type: 'trip', note: '' },
    { id: 'c10', title: '찬 졸업식 (퍼듀)', startDate: '2026-05-15', endDate: '2026-05-17', type: 'visit', note: '웨스트라피엣' },
    { id: 'c11', title: '찬 조지아 방문', startDate: '2026-06-25', endDate: '2026-06-29', type: 'visit', note: '예정' },
    { id: 'c14', title: 'Acworth · Alpharetta · Cartersville', startDate: '2026-06-25', endDate: '2026-06-28', type: 'trip', note: 'Cauble Park 수영, 갈비찜, 수영, 토이스토리 5' },
    { id: 'c15', title: 'BWI 방문', startDate: '2026-07-02', endDate: '2026-07-05', type: 'visit', note: '예정' },
    { id: 'c12', title: '콜로라도 여행', startDate: '2026-08-11', endDate: '2026-08-19', type: 'trip', note: '예정' },
    { id: 'c13', title: '윤 필라델피아 이사', startDate: '2026-08-01', endDate: '2026-08-01', type: 'other', note: '8/1부터 필라델피아 거주' },
  ],
  packingList: [
    { id: 'p1', title: '여권/신분증', done: false, owner: 'shared', tripName: '조지아 (찬 방문)' },
    { id: 'p2', title: '기내용 7kg 백팩', done: false, owner: 'shared', tripName: '조지아 (찬 방문)' },
    { id: 'p3', title: '세범·선크림', done: false, owner: 'me', tripName: '조지아 (찬 방문)' },
    { id: 'p4', title: '충전기·보조배터리', done: false, owner: 'shared', tripName: '조지아 (찬 방문)' },
    { id: 'p5', title: '캐리온 5일치 옷', done: false, owner: 'partner', tripName: '조지아 (찬 방문)' },
    { id: 'p6', title: '선물', done: false, owner: 'me', tripName: '조지아 (찬 방문)' },
  ],
  diaryEntries: [],
  trash: [],
}

function normalizeGoals(goals: AppData['goals']) {
  return goals.map((g) => {
    if (g.unit === '달성') return g
    if (g.unit === '원' || g.unit === 'KRW' || g.unit === '₩') {
      if (g.id === 'g1' || g.title.includes('결혼')) {
        return { ...g, unit: '$', currentAmount: 8500, targetAmount: 35000 }
      }
      return { ...g, unit: '$' }
    }
    return g.unit === '$' ? g : { ...g, unit: '$' }
  })
}

function normalizeExpenses(expenses: AppData['expenses']) {
  return expenses.map((e) => ({ ...e, currency: 'USD' as const }))
}

function normalizeSettings(settings: CoupleSettings): CoupleSettings {
  if (settings.myCity === '조지아') {
    return { ...settings, myCity: '카터스빌' }
  }
  return settings
}

const juneTripPlaces: TravelPlace[] = [
  {
    id: '17',
    name: 'Acworth',
    state: '조지아',
    lat: 34.0665,
    lng: -84.6783,
    visitedAt: '2026-06-25',
    note: '6/25–6/28 · Cauble Park에서 수영',
    emoji: '🏊',
  },
  {
    id: '18',
    name: 'Alpharetta',
    state: '조지아',
    lat: 34.0754,
    lng: -84.2941,
    visitedAt: '2026-06-26',
    note: '6/25–6/28 · 갈비찜 먹은 날',
    emoji: '🥘',
  },
  {
    id: '19',
    name: 'Cartersville',
    state: '조지아',
    lat: 34.1651,
    lng: -84.7999,
    visitedAt: '2026-06-27',
    note: '6/25–6/28 · 수영하고 토이스토리 5 봄',
    emoji: '🎬',
  },
]

const juneTripMemory: Memory = {
  id: '12',
  title: 'Acworth · Alpharetta · Cartersville',
  description:
    '6/25–6/28 Acworth Cauble Park에서 수영하고, Alpharetta에서 갈비찜 먹고, Cartersville에서 수영하고 토이스토리 5 봤던 시간.',
  date: '2026-06-25',
  endDate: '2026-06-28',
  emoji: '🏊',
}

const juneTripCalendarEvent: CalendarEvent = {
  id: 'c14',
  title: 'Acworth · Alpharetta · Cartersville',
  startDate: '2026-06-25',
  endDate: '2026-06-28',
  type: 'trip',
  note: 'Cauble Park 수영, 갈비찜, 수영, 토이스토리 5',
}

function ensureJuneTripUpdates(data: AppData): AppData {
  const places = [...data.places]
  for (const required of juneTripPlaces) {
    const exists = places.some(
      (place) =>
        place.id === required.id ||
        (place.name.toLowerCase() === required.name.toLowerCase() &&
          place.visitedAt === required.visitedAt),
    )
    if (!exists) places.push(required)
  }

  const memories = [...data.memories]
  const hasMemory = memories.some(
    (memory) =>
      memory.id === juneTripMemory.id ||
      (memory.title === juneTripMemory.title &&
        memory.date === juneTripMemory.date &&
        memory.endDate === juneTripMemory.endDate),
  )
  if (!hasMemory) memories.push(juneTripMemory)

  const calendarEvents = [...data.calendarEvents]
  const hasEvent = calendarEvents.some(
    (event) =>
      event.id === juneTripCalendarEvent.id ||
      (event.title === juneTripCalendarEvent.title &&
        event.startDate === juneTripCalendarEvent.startDate &&
        event.endDate === juneTripCalendarEvent.endDate),
  )
  if (!hasEvent) calendarEvents.push(juneTripCalendarEvent)

  return {
    ...data,
    places,
    memories,
    calendarEvents,
  }
}

export function normalizeAppData(parsed: Partial<AppData>): AppData {
  const defaults = structuredClone(defaultData)
  const packingList = (parsed.packingList?.length ? parsed.packingList : defaults.packingList).map(
    (item) => ({
      ...item,
      owner: item.owner ?? 'shared',
      tripName: item.tripName ?? '',
    }),
  )

  return ensureJuneTripUpdates({
    ...defaults,
    ...parsed,
    settings: normalizeSettings({ ...defaultSettings, ...parsed.settings }),
    calendarSync: { ...defaultCalendarSync, ...parsed.calendarSync },
    calendarEvents: parsed.calendarEvents?.length ? parsed.calendarEvents : defaults.calendarEvents,
    syncedEvents: parsed.syncedEvents ?? [],
    packingList,
    diaryEntries: parsed.diaryEntries?.length ? parsed.diaryEntries : defaults.diaryEntries,
    itinerary: parsed.itinerary?.length ? parsed.itinerary : defaults.itinerary,
    goals: normalizeGoals(parsed.goals?.length ? parsed.goals : defaults.goals),
    expenses: normalizeExpenses(parsed.expenses?.length ? parsed.expenses : defaults.expenses),
    foodLogs: parsed.foodLogs?.length ? parsed.foodLogs : defaults.foodLogs,
    trash: parsed.trash ?? [],
  })
}

export function loadData(): AppData {
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      raw = localStorage.getItem('ourapp-data-v12')
      if (raw) localStorage.setItem(STORAGE_KEY, raw)
    }
    if (!raw) return structuredClone(defaultData)
    const parsed = JSON.parse(raw) as AppData
    const result = normalizeAppData(parsed)
    if (parsed.settings?.myCity === '조지아') {
      saveData(result)
    }
    return result
  } catch {
    return structuredClone(defaultData)
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function createId() {
  return crypto.randomUUID()
}
