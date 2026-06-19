import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppData } from '../types'
import { saveData } from '../store/data'
import {
  clearCloudConfig,
  connectCloudRoom,
  getCloudConfig,
  saveCloudConfig,
  subscribeCloudRoom,
  syncCloudRoom,
  type CloudConfig,
  type CloudSyncStatus,
} from '../store/cloudSync'
import { isSupabaseConfigured } from '../lib/supabase'

const PUSH_DELAY_MS = 1200

export function useCloudSync(
  data: AppData,
  setData: (data: AppData) => void,
) {
  const [status, setStatus] = useState<CloudSyncStatus>(() =>
    isSupabaseConfigured() ? (getCloudConfig() ? 'synced' : 'off') : 'unconfigured',
  )
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState(() => getCloudConfig()?.roomCode ?? '')

  const applyingRemoteRef = useRef(false)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const configRef = useRef<CloudConfig | null>(getCloudConfig())

  const applyRemote = useCallback(
    (payload: AppData, revision: number) => {
      applyingRemoteRef.current = true
      setData(payload)
      saveData(payload)

      const nextConfig = {
        ...(configRef.current ?? {
          roomCode: roomCode,
          deviceId: crypto.randomUUID(),
          lastRevision: 0,
          lastSyncedAt: '',
        }),
        lastRevision: revision,
        lastSyncedAt: new Date().toISOString(),
      }
      configRef.current = nextConfig
      saveCloudConfig(nextConfig)
      setStatus('synced')
      setError(null)

      window.setTimeout(() => {
        applyingRemoteRef.current = false
      }, 50)
    },
    [roomCode, setData],
  )

  useEffect(() => {
    if (!isSupabaseConfigured() || !roomCode) return

    const unsubscribe = subscribeCloudRoom(roomCode, (row) => {
      if (row.revision <= (configRef.current?.lastRevision ?? 0)) return
      applyRemote(row.payload, row.revision)
    })

    return unsubscribe
  }, [roomCode, applyRemote])

  useEffect(() => {
    if (!isSupabaseConfigured() || !roomCode) return
    if (applyingRemoteRef.current) return

    setStatus((prev) => (prev === 'connecting' ? prev : 'syncing'))

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    pushTimerRef.current = window.setTimeout(async () => {
      const config = configRef.current
      if (!config?.roomCode) return

      try {
        const nextConfig = await syncCloudRoom(data, config)
        configRef.current = nextConfig
        setStatus('synced')
        setError(null)
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : '동기화 실패')
      }
    }, PUSH_DELAY_MS)

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current)
    }
  }, [data, roomCode])

  const connectRoom = useCallback(
    async (codeInput: string) => {
      setStatus('connecting')
      setError(null)
      try {
        const result = await connectCloudRoom(codeInput, data)
        configRef.current = result.config
        setRoomCode(result.config.roomCode)
        setData(result.data)
        saveData(result.data)
        setStatus('synced')
      } catch (err) {
        setStatus('error')
        setError(err instanceof Error ? err.message : '연결 실패')
        throw err
      }
    },
    [data, setData],
  )

  const disconnectRoom = useCallback(() => {
    clearCloudConfig()
    configRef.current = null
    setRoomCode('')
    setStatus(isSupabaseConfigured() ? 'off' : 'unconfigured')
    setError(null)
  }, [])

  const syncNow = useCallback(async () => {
    const config = configRef.current
    if (!config?.roomCode) return

    setStatus('syncing')
    setError(null)
    try {
      const nextConfig = await syncCloudRoom(data, config)
      configRef.current = nextConfig
      setStatus('synced')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : '동기화 실패')
    }
  }, [data])

  return {
    status,
    error,
    roomCode,
    connectRoom,
    disconnectRoom,
    syncNow,
    isConfigured: isSupabaseConfigured(),
  }
}
