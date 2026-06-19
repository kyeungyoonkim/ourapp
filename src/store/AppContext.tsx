import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  Author,
  CalendarEvent,
  CalendarSyncSettings,
  CoupleSettings,
  DiaryEntry,
  Expense,
  FoodLog,
  ItineraryItem,
  JointGoal,
  LoveNote,
  Memory,
  PackingItem,
  TrashItem,
  TravelPlace,
} from '../types'
import { createId, loadData, saveData } from './data'
import { useCloudSync } from '../hooks/useCloudSync'
import type { CloudSyncStatus } from './cloudSync'

interface CloudSyncControls {
  status: CloudSyncStatus
  error: string | null
  roomCode: string
  isConfigured: boolean
  connectRoom: (code: string) => Promise<void>
  disconnectRoom: () => void
  syncNow: () => Promise<void>
}

interface AppContextValue {
  data: AppData
  cloudSync: CloudSyncControls
  updateSettings: (settings: Partial<CoupleSettings>) => void
  updateCalendarSync: (sync: Partial<CalendarSyncSettings>) => void
  setSyncedEvents: (events: CalendarEvent[]) => void
  addPlace: (place: Omit<TravelPlace, 'id'>) => void
  updatePlace: (id: string, updates: Partial<Omit<TravelPlace, 'id'>>) => void
  removePlace: (id: string) => void
  addMemory: (memory: Omit<Memory, 'id'>) => void
  updateMemory: (id: string, updates: Partial<Omit<Memory, 'id'>>) => void
  removeMemoryPhoto: (memoryId: string, photoIndex: number) => void
  removeMemory: (id: string) => void
  addNote: (author: Author, message: string) => void
  updateNote: (id: string, updates: Partial<Omit<LoveNote, 'id'>>) => void
  removeNote: (id: string) => void
  addBucketItem: (title: string, emoji?: string) => void
  toggleBucketItem: (id: string) => void
  removeBucketItem: (id: string) => void
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void
  removeCalendarEvent: (id: string) => void
  addPackingItem: (item: Omit<PackingItem, 'id' | 'done'>) => void
  togglePackingItem: (id: string) => void
  removePackingItem: (id: string) => void
  addDiaryEntry: (entry: Omit<DiaryEntry, 'id'>) => void
  updateDiaryEntry: (id: string, updates: Partial<Omit<DiaryEntry, 'id'>>) => void
  removeDiaryEntry: (id: string) => void
  restoreFromTrash: (trashId: string) => void
  permanentlyDeleteFromTrash: (trashId: string) => void
  emptyTrash: () => void
  addItineraryItem: (item: Omit<ItineraryItem, 'id'>) => void
  updateItineraryItem: (id: string, updates: Partial<Omit<ItineraryItem, 'id'>>) => void
  removeItineraryItem: (id: string) => void
  addGoal: (goal: Omit<JointGoal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<Omit<JointGoal, 'id'>>) => void
  removeGoal: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => void
  toggleExpenseSettled: (id: string) => void
  removeExpense: (id: string) => void
  addFoodLog: (menu: string, date: string) => void
  updateFoodLog: (id: string, updates: Partial<Omit<FoodLog, 'id'>>) => void
  removeFoodLog: (id: string) => void
  importData: (data: AppData) => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => loadData())
  const setData = useCallback((next: AppData) => {
    setDataState(next)
  }, [])
  const cloudSync = useCloudSync(data, setData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const updateSettings = useCallback((settings: Partial<CoupleSettings>) => {
    setDataState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }))
  }, [])

  const updateCalendarSync = useCallback((sync: Partial<CalendarSyncSettings>) => {
    setDataState((prev) => ({
      ...prev,
      calendarSync: { ...prev.calendarSync, ...sync },
    }))
  }, [])

  const setSyncedEvents = useCallback((events: CalendarEvent[]) => {
    setDataState((prev) => ({
      ...prev,
      syncedEvents: events,
      calendarSync: { ...prev.calendarSync, lastSyncedAt: new Date().toISOString() },
    }))
  }, [])

  const addPlace = useCallback((place: Omit<TravelPlace, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      places: [{ ...place, id: createId() }, ...prev.places],
    }))
  }, [])

  const updatePlace = useCallback((id: string, updates: Partial<Omit<TravelPlace, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      places: prev.places.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }, [])

  const removePlace = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      places: prev.places.filter((p) => p.id !== id),
    }))
  }, [])

  const addMemory = useCallback((memory: Omit<Memory, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      memories: [{ ...memory, id: createId() }, ...prev.memories].sort(
        (a, b) => b.date.localeCompare(a.date),
      ),
    }))
  }, [])

  const updateMemory = useCallback((id: string, updates: Partial<Omit<Memory, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      memories: prev.memories
        .map((m) => (m.id === id ? { ...m, ...updates } : m))
        .sort((a, b) => b.date.localeCompare(a.date)),
    }))
  }, [])

  const removeMemoryPhoto = useCallback((memoryId: string, photoIndex: number) => {
    setDataState((prev) => ({
      ...prev,
      memories: prev.memories
        .map((m) => {
          if (m.id !== memoryId || !m.photos) return m
          const photos = m.photos.filter((_, i) => i !== photoIndex)
          return { ...m, photos: photos.length > 0 ? photos : undefined }
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    }))
  }, [])

  const removeMemory = useCallback((id: string) => {
    setDataState((prev) => {
      const memory = prev.memories.find((m) => m.id === id)
      if (!memory) return prev
      const trashItem: TrashItem = {
        id: createId(),
        kind: 'memory',
        deletedAt: new Date().toISOString(),
        memory,
      }
      return {
        ...prev,
        memories: prev.memories.filter((m) => m.id !== id),
        trash: [trashItem, ...prev.trash],
      }
    })
  }, [])

  const addNote = useCallback((author: Author, message: string) => {
    setDataState((prev) => ({
      ...prev,
      notes: [
        { id: createId(), author, message, createdAt: new Date().toISOString() },
        ...prev.notes,
      ],
    }))
  }, [])

  const updateNote = useCallback((id: string, updates: Partial<Omit<LoveNote, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }))
  }, [])

  const removeNote = useCallback((id: string) => {
    setDataState((prev) => {
      const note = prev.notes.find((n) => n.id === id)
      if (!note) return prev
      const trashItem: TrashItem = {
        id: createId(),
        kind: 'note',
        deletedAt: new Date().toISOString(),
        note,
      }
      return {
        ...prev,
        notes: prev.notes.filter((n) => n.id !== id),
        trash: [trashItem, ...prev.trash],
      }
    })
  }, [])

  const addBucketItem = useCallback((title: string, emoji = '✨') => {
    setDataState((prev) => ({
      ...prev,
      bucketList: [{ id: createId(), title, done: false, emoji }, ...prev.bucketList],
    }))
  }, [])

  const toggleBucketItem = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      bucketList: prev.bucketList.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    }))
  }, [])

  const removeBucketItem = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      bucketList: prev.bucketList.filter((item) => item.id !== id),
    }))
  }, [])

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      calendarEvents: [
        ...prev.calendarEvents,
        { ...event, id: createId(), source: event.source ?? 'local' },
      ],
    }))
  }, [])

  const removeCalendarEvent = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter((e) => e.id !== id),
      syncedEvents: prev.syncedEvents.filter((e) => e.id !== id),
    }))
  }, [])

  const addPackingItem = useCallback((item: Omit<PackingItem, 'id' | 'done'>) => {
    setDataState((prev) => ({
      ...prev,
      packingList: [...prev.packingList, { ...item, id: createId(), done: false }],
    }))
  }, [])

  const togglePackingItem = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      packingList: prev.packingList.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      ),
    }))
  }, [])

  const removePackingItem = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      packingList: prev.packingList.filter((item) => item.id !== id),
    }))
  }, [])

  const addDiaryEntry = useCallback((entry: Omit<DiaryEntry, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      diaryEntries: [{ ...entry, id: createId() }, ...prev.diaryEntries],
    }))
  }, [])

  const updateDiaryEntry = useCallback((id: string, updates: Partial<Omit<DiaryEntry, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      diaryEntries: prev.diaryEntries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }, [])

  const removeDiaryEntry = useCallback((id: string) => {
    setDataState((prev) => {
      const entry = prev.diaryEntries.find((e) => e.id === id)
      if (!entry) return prev
      const trashItem: TrashItem = {
        id: createId(),
        kind: 'diary',
        deletedAt: new Date().toISOString(),
        diary: entry,
      }
      return {
        ...prev,
        diaryEntries: prev.diaryEntries.filter((e) => e.id !== id),
        trash: [trashItem, ...prev.trash],
      }
    })
  }, [])

  const restoreFromTrash = useCallback((trashId: string) => {
    setDataState((prev) => {
      const item = prev.trash.find((t) => t.id === trashId)
      if (!item) return prev

      let next = { ...prev, trash: prev.trash.filter((t) => t.id !== trashId) }

      if (item.kind === 'diary' && item.diary) {
        next = {
          ...next,
          diaryEntries: [item.diary, ...prev.diaryEntries.filter((e) => e.id !== item.diary!.id)],
        }
      } else if (item.kind === 'memory' && item.memory) {
        next = {
          ...next,
          memories: [item.memory, ...prev.memories.filter((m) => m.id !== item.memory!.id)].sort(
            (a, b) => b.date.localeCompare(a.date),
          ),
        }
      } else if (item.kind === 'note' && item.note) {
        next = {
          ...next,
          notes: [item.note, ...prev.notes.filter((n) => n.id !== item.note!.id)],
        }
      }

      return next
    })
  }, [])

  const permanentlyDeleteFromTrash = useCallback((trashId: string) => {
    setDataState((prev) => ({
      ...prev,
      trash: prev.trash.filter((t) => t.id !== trashId),
    }))
  }, [])

  const emptyTrash = useCallback(() => {
    setDataState((prev) => ({ ...prev, trash: [] }))
  }, [])

  const addItineraryItem = useCallback((item: Omit<ItineraryItem, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      itinerary: [{ ...item, id: createId() }, ...prev.itinerary],
    }))
  }, [])

  const updateItineraryItem = useCallback(
    (id: string, updates: Partial<Omit<ItineraryItem, 'id'>>) => {
      setDataState((prev) => ({
        ...prev,
        itinerary: prev.itinerary.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      }))
    },
    [],
  )

  const removeItineraryItem = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      itinerary: prev.itinerary.filter((i) => i.id !== id),
    }))
  }, [])

  const addGoal = useCallback((goal: Omit<JointGoal, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      goals: [{ ...goal, id: createId() }, ...prev.goals],
    }))
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<Omit<JointGoal, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }))
  }, [])

  const removeGoal = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }))
  }, [])

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setDataState((prev) => ({
      ...prev,
      expenses: [{ ...expense, id: createId() }, ...prev.expenses],
    }))
  }, [])

  const updateExpense = useCallback((id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }, [])

  const toggleExpenseSettled = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === id ? { ...e, settled: !e.settled } : e)),
    }))
  }, [])

  const removeExpense = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
  }, [])

  const addFoodLog = useCallback((menu: string, date: string) => {
    setDataState((prev) => ({
      ...prev,
      foodLogs: [{ id: createId(), menu: menu.trim(), date }, ...prev.foodLogs],
    }))
  }, [])

  const updateFoodLog = useCallback((id: string, updates: Partial<Omit<FoodLog, 'id'>>) => {
    setDataState((prev) => ({
      ...prev,
      foodLogs: prev.foodLogs.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  }, [])

  const removeFoodLog = useCallback((id: string) => {
    setDataState((prev) => ({
      ...prev,
      foodLogs: prev.foodLogs.filter((f) => f.id !== id),
    }))
  }, [])

  const importData = useCallback((newData: AppData) => {
    setDataState(newData)
    saveData(newData)
  }, [])

  const resetData = useCallback(() => {
    localStorage.removeItem('ourapp-data-v13')
    setDataState({ ...loadData(), settings: data.settings })
  }, [data.settings])

  const cloudSyncValue = useMemo(
    () => ({
      status: cloudSync.status,
      error: cloudSync.error,
      roomCode: cloudSync.roomCode,
      isConfigured: cloudSync.isConfigured,
      connectRoom: cloudSync.connectRoom,
      disconnectRoom: cloudSync.disconnectRoom,
      syncNow: cloudSync.syncNow,
    }),
    [cloudSync],
  )

  const value = useMemo(
    () => ({
      data,
      cloudSync: cloudSyncValue,
      updateSettings,
      updateCalendarSync,
      setSyncedEvents,
      addPlace,
      updatePlace,
      removePlace,
      addMemory,
      updateMemory,
      removeMemoryPhoto,
      removeMemory,
      addNote,
      updateNote,
      removeNote,
      addBucketItem,
      toggleBucketItem,
      removeBucketItem,
      addCalendarEvent,
      removeCalendarEvent,
      addPackingItem,
      togglePackingItem,
      removePackingItem,
      addDiaryEntry,
      updateDiaryEntry,
      removeDiaryEntry,
      restoreFromTrash,
      permanentlyDeleteFromTrash,
      emptyTrash,
      addItineraryItem,
      updateItineraryItem,
      removeItineraryItem,
      addGoal,
      updateGoal,
      removeGoal,
      addExpense,
      updateExpense,
      toggleExpenseSettled,
      removeExpense,
      addFoodLog,
      updateFoodLog,
      removeFoodLog,
      importData,
      resetData,
    }),
    [
      data,
      cloudSyncValue,
      updateSettings,
      updateCalendarSync,
      setSyncedEvents,
      addPlace,
      updatePlace,
      removePlace,
      addMemory,
      updateMemory,
      removeMemoryPhoto,
      removeMemory,
      addNote,
      updateNote,
      removeNote,
      addBucketItem,
      toggleBucketItem,
      removeBucketItem,
      addCalendarEvent,
      removeCalendarEvent,
      addPackingItem,
      togglePackingItem,
      removePackingItem,
      addDiaryEntry,
      updateDiaryEntry,
      removeDiaryEntry,
      restoreFromTrash,
      permanentlyDeleteFromTrash,
      emptyTrash,
      addItineraryItem,
      updateItineraryItem,
      removeItineraryItem,
      addGoal,
      updateGoal,
      removeGoal,
      addExpense,
      updateExpense,
      toggleExpenseSettled,
      removeExpense,
      addFoodLog,
      updateFoodLog,
      removeFoodLog,
      importData,
      resetData,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
