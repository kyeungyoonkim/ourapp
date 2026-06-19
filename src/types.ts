export type Author = 'me' | 'partner'

export interface CoupleSettings {
  myName: string
  partnerName: string
  anniversary: string
  nextVisit: string
  nextVisitEnd: string
  nextTripName: string
  myCity: string
  myCityNext: string
  myCityMoveDate: string
  partnerCity: string
  myTimezone: string
  partnerTimezone: string
}

export interface CalendarSyncSettings {
  myIcalUrl: string
  partnerIcalUrl: string
  googleClientId: string
  lastSyncedAt: string
}

export interface TravelPlace {
  id: string
  name: string
  state: string
  lat: number
  lng: number
  visitedAt: string
  note: string
  emoji: string
}

export interface Memory {
  id: string
  title: string
  description: string
  date: string
  endDate?: string
  emoji: string
  photos?: string[]
}

export interface LoveNote {
  id: string
  author: Author
  message: string
  createdAt: string
}

export interface BucketItem {
  id: string
  title: string
  done: boolean
  emoji: string
}

export type EventType =
  | 'visit'
  | 'trip'
  | 'anniversary'
  | 'call'
  | 'exam'
  | 'deadline'
  | 'conference'
  | 'other'

export type EventSource = 'local' | 'me' | 'partner'

export interface CalendarEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  type: EventType
  note: string
  source?: EventSource
  externalId?: string
}

export interface PackingItem {
  id: string
  title: string
  done: boolean
  owner: Author | 'shared'
  tripName?: string
}

export interface DiaryEntry {
  id: string
  author: Author
  date: string
  title: string
  content: string
  emoji: string
}

export type ItineraryType = 'flight' | 'hotel' | 'car' | 'transport' | 'other'

export interface ItineraryItem {
  id: string
  tripName: string
  type: ItineraryType
  title: string
  datetime: string
  endDatetime: string
  confirmationCode: string
  location: string
  note: string
}

export interface JointGoal {
  id: string
  title: string
  currentAmount: number
  targetAmount: number
  unit: string
  emoji: string
  deadline: string
}

export type ExpenseCategory = 'date' | 'travel' | 'food' | 'other'
export type ExpenseCurrency = 'KRW' | 'USD'
export type ExpenseSplit = 'equal' | 'me' | 'partner'

export interface Expense {
  id: string
  title: string
  amount: number
  currency: ExpenseCurrency
  paidBy: Author
  split: ExpenseSplit
  category: ExpenseCategory
  date: string
  note: string
  settled: boolean
}

export interface FoodLog {
  id: string
  menu: string
  date: string
}

export type TrashKind = 'diary' | 'memory' | 'note'

export interface TrashItem {
  id: string
  kind: TrashKind
  deletedAt: string
  diary?: DiaryEntry
  memory?: Memory
  note?: LoveNote
}

export interface AppData {
  settings: CoupleSettings
  calendarSync: CalendarSyncSettings
  places: TravelPlace[]
  memories: Memory[]
  notes: LoveNote[]
  bucketList: BucketItem[]
  calendarEvents: CalendarEvent[]
  syncedEvents: CalendarEvent[]
  packingList: PackingItem[]
  diaryEntries: DiaryEntry[]
  itinerary: ItineraryItem[]
  goals: JointGoal[]
  expenses: Expense[]
  foodLogs: FoodLog[]
  trash: TrashItem[]
}

export type TabId =
  | 'home'
  | 'calendar'
  | 'travel'
  | 'lists'
  | 'record'
  | 'together'
  | 'more'
