import type { CalendarEvent, EventSource, EventType } from '../types'
import { createId } from '../store/data'

function unfoldIcsLines(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '')
}

function parseIcsDate(value: string): string {
  const raw = value.replace(/^.*:/, '').trim()
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  }
  if (raw.length >= 15) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  }
  return raw.slice(0, 10)
}

function guessEventType(title: string, description: string): EventType {
  const text = `${title} ${description}`.toLowerCase()
  if (/시험|exam|midterm|final|quiz/.test(text)) return 'exam'
  if (/마감|deadline|due|submit|과제/.test(text)) return 'deadline'
  if (/학회|conference|symposium|workshop|세미나/.test(text)) return 'conference'
  if (/통화|call|zoom|facetime/.test(text)) return 'call'
  if (/여행|trip|flight|비행/.test(text)) return 'trip'
  if (/만남|visit|방문/.test(text)) return 'visit'
  if (/기념|anniversary|생일|birthday/.test(text)) return 'anniversary'
  return 'other'
}

export function parseIcsToEvents(icsText: string, source: EventSource): CalendarEvent[] {
  const unfolded = unfoldIcsLines(icsText)
  const blocks = unfolded.split('BEGIN:VEVENT').slice(1)
  const events: CalendarEvent[] = []

  for (const block of blocks) {
    const chunk = block.split('END:VEVENT')[0] ?? ''
    const lines = chunk.split('\n')
    let uid = ''
    let summary = ''
    let description = ''
    let dtStart = ''
    let dtEnd = ''

    for (const line of lines) {
      const [key, ...rest] = line.split(':')
      const value = rest.join(':').trim()
      const baseKey = key?.split(';')[0] ?? ''
      if (baseKey === 'UID') uid = value
      if (baseKey === 'SUMMARY') summary = value.replace(/\\,/g, ',').replace(/\\n/g, ' ')
      if (baseKey === 'DESCRIPTION') description = value.replace(/\\,/g, ',').replace(/\\n/g, ' ')
      if (baseKey === 'DTSTART') dtStart = value
      if (baseKey === 'DTEND') dtEnd = value
    }

    if (!summary || !dtStart) continue

    const startDate = parseIcsDate(dtStart)
    const endDate = dtEnd ? parseIcsDate(dtEnd) : startDate
    const adjustedEnd =
      dtEnd && dtEnd.length > 8 && dtEnd.endsWith('T000000')
        ? (() => {
            const d = new Date(endDate + 'T12:00:00')
            d.setDate(d.getDate() - 1)
            return d.toISOString().slice(0, 10)
          })()
        : endDate

    events.push({
      id: createId(),
      title: summary,
      startDate,
      endDate: adjustedEnd < startDate ? startDate : adjustedEnd,
      type: guessEventType(summary, description),
      note: description,
      source,
      externalId: uid || `${source}-${summary}-${startDate}`,
    })
  }

  return events
}

export async function fetchIcsFromUrl(url: string): Promise<string> {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('URL이 비어 있어요')

  const proxy = import.meta.env.VITE_ICAL_PROXY as string | undefined
  const fetchUrl = proxy ? `${proxy}${encodeURIComponent(trimmed)}` : trimmed

  const res = await fetch(fetchUrl)
  if (!res.ok) throw new Error(`가져오기 실패 (${res.status})`)
  const text = await res.text()
  if (!text.includes('BEGIN:VCALENDAR')) throw new Error('유효한 iCal 형식이 아니에요')
  return text
}
