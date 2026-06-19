import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase, isSupabaseConfigured } from '../lib/supabase'
import type { AppData } from '../types'
import { normalizeAppData } from './data'

const CLOUD_CONFIG_KEY = 'ourapp-cloud-v1'

export type CloudSyncStatus =
  | 'off'
  | 'connecting'
  | 'synced'
  | 'syncing'
  | 'error'
  | 'unconfigured'

export interface CloudConfig {
  roomCode: string
  deviceId: string
  lastRevision: number
  lastSyncedAt: string
}

export interface CloudRoomRow {
  room_code: string
  payload: AppData
  revision: number
  updated_at: string
}

export function normalizeRoomCode(code: string) {
  return code.trim().toLowerCase().replace(/\s+/g, '-')
}

export function getCloudConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CloudConfig
  } catch {
    return null
  }
}

export function saveCloudConfig(config: CloudConfig) {
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config))
}

export function clearCloudConfig() {
  localStorage.removeItem(CLOUD_CONFIG_KEY)
}

export function getOrCreateDeviceId() {
  const existing = getCloudConfig()?.deviceId
  if (existing) return existing
  return crypto.randomUUID()
}

export async function fetchCloudRoom(roomCode: string): Promise<CloudRoomRow | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('couple_data')
    .select('room_code,payload,revision,updated_at')
    .eq('room_code', roomCode)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    room_code: data.room_code,
    payload: normalizeAppData(data.payload as Partial<AppData>),
    revision: Number(data.revision),
    updated_at: data.updated_at,
  }
}

export async function pushCloudRoom(roomCode: string, payload: AppData, revision: number) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase가 설정되지 않았어요')

  const { error } = await supabase.from('couple_data').upsert(
    {
      room_code: roomCode,
      payload,
      revision,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'room_code' },
  )

  if (error) throw new Error(error.message)
  return revision
}

export function subscribeCloudRoom(
  roomCode: string,
  onRemoteUpdate: (row: CloudRoomRow) => void,
): () => void {
  const supabase = getSupabase()
  if (!supabase) return () => {}

  let channel: RealtimeChannel | null = supabase
    .channel(`couple-room-${roomCode}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'couple_data',
        filter: `room_code=eq.${roomCode}`,
      },
      (payload) => {
        const row = payload.new as CloudRoomRow | null
        if (!row?.payload) return
        onRemoteUpdate({
          room_code: row.room_code,
          payload: normalizeAppData(row.payload as Partial<AppData>),
          revision: Number(row.revision),
          updated_at: row.updated_at,
        })
      },
    )
    .subscribe()

  return () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }
}

export async function connectCloudRoom(
  roomCodeInput: string,
  localData: AppData,
): Promise<{ data: AppData; config: CloudConfig }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase 환경 변수가 없어요 (.env 확인)')
  }

  const roomCode = normalizeRoomCode(roomCodeInput)
  if (roomCode.length < 4) {
    throw new Error('커플 코드는 4글자 이상으로 만들어 주세요')
  }

  const deviceId = getOrCreateDeviceId()
  const previous = getCloudConfig()
  const remote = await fetchCloudRoom(roomCode)
  const revision = Date.now()

  let nextData = localData
  let nextRevision = revision

  if (remote && remote.revision > (previous?.lastRevision ?? 0)) {
    nextData = remote.payload
    nextRevision = remote.revision
  } else {
    nextRevision = await pushCloudRoom(roomCode, localData, revision)
  }

  const config: CloudConfig = {
    roomCode,
    deviceId,
    lastRevision: nextRevision,
    lastSyncedAt: new Date().toISOString(),
  }
  saveCloudConfig(config)

  return { data: nextData, config }
}

export async function syncCloudRoom(localData: AppData, config: CloudConfig) {
  const revision = Date.now()
  await pushCloudRoom(config.roomCode, localData, revision)
  const nextConfig = {
    ...config,
    lastRevision: revision,
    lastSyncedAt: new Date().toISOString(),
  }
  saveCloudConfig(nextConfig)
  return nextConfig
}
