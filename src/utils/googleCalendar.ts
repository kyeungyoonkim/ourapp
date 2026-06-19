import type { CalendarEvent, EventSource } from '../types'
import { createId } from '../store/data'

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly'

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: { access_token?: string; error?: string }) => void
          }) => { requestAccessToken: () => void }
        }
      }
    }
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`스크립트 로드 실패: ${src}`))
    document.head.appendChild(script)
  })
}

export async function ensureGoogleIdentityLoaded() {
  await loadScript('https://accounts.google.com/gsi/client')
}

function mapGoogleEvent(item: {
  id?: string
  summary?: string
  description?: string
  start?: { date?: string; dateTime?: string }
  end?: { date?: string; dateTime?: string }
}, source: EventSource): CalendarEvent | null {
  if (!item.summary) return null
  const startRaw = item.start?.date ?? item.start?.dateTime?.slice(0, 10)
  if (!startRaw) return null
  const endRaw = item.end?.date ?? item.end?.dateTime?.slice(0, 10) ?? startRaw
  const endDate =
    item.end?.date && !item.end?.dateTime
      ? (() => {
          const d = new Date(endRaw + 'T12:00:00')
          d.setDate(d.getDate() - 1)
          return d.toISOString().slice(0, 10)
        })()
      : endRaw

  return {
    id: createId(),
    title: item.summary,
    startDate: startRaw,
    endDate: endDate < startRaw ? startRaw : endDate,
    type: 'other',
    note: item.description ?? '',
    source,
    externalId: item.id ?? `${source}-${item.summary}-${startRaw}`,
  }
}

export function fetchGoogleCalendarEvents(
  clientId: string,
  source: EventSource,
): Promise<CalendarEvent[]> {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureGoogleIdentityLoaded()
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity를 불러올 수 없어요'))
        return
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: CALENDAR_SCOPE,
        callback: async (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error ?? 'Google 로그인 실패'))
            return
          }
          try {
            const now = new Date()
            const timeMin = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
            const timeMax = new Date(now.getFullYear(), now.getMonth() + 6, 0).toISOString()
            const params = new URLSearchParams({
              timeMin,
              timeMax,
              singleEvents: 'true',
              orderBy: 'startTime',
              maxResults: '100',
            })
            const res = await fetch(
              `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
              { headers: { Authorization: `Bearer ${response.access_token}` } },
            )
            if (!res.ok) throw new Error(`Calendar API 오류 (${res.status})`)
            const json = (await res.json()) as { items?: Array<Parameters<typeof mapGoogleEvent>[0]> }
            const events = (json.items ?? [])
              .map((item) => mapGoogleEvent(item, source))
              .filter((e): e is CalendarEvent => e !== null)
            resolve(events)
          } catch (err) {
            reject(err)
          }
        },
      })
      tokenClient.requestAccessToken()
    } catch (err) {
      reject(err)
    }
  })
}
