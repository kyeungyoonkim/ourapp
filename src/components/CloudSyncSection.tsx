import { Cloud, CloudOff, RefreshCw, Wifi } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../store/AppContext'
import type { CloudSyncStatus } from '../store/cloudSync'

const statusLabel: Record<CloudSyncStatus, string> = {
  off: '연결 안 됨',
  connecting: '연결 중…',
  synced: '동기화됨',
  syncing: '저장 중…',
  error: '오류',
  unconfigured: '설정 필요',
}

const statusClass: Record<CloudSyncStatus, string> = {
  off: 'bg-zinc-100 text-zinc-600',
  connecting: 'bg-amber-50 text-amber-700',
  synced: 'bg-emerald-50 text-emerald-700',
  syncing: 'bg-sky-50 text-sky-700',
  error: 'bg-rose-50 text-rose-600',
  unconfigured: 'bg-zinc-100 text-zinc-500',
}

export function CloudSyncSection() {
  const { cloudSync } = useApp()
  const [codeInput, setCodeInput] = useState(cloudSync.roomCode)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function handleConnect() {
    setBusy(true)
    setMessage('')
    try {
      await cloudSync.connectRoom(codeInput)
      setMessage('연결됐어요! 이제 수정하면 자동으로 상대 폰에도 반영돼요.')
    } catch {
      // error shown via cloudSync.error
    } finally {
      setBusy(false)
    }
  }

  async function handleSyncNow() {
    setBusy(true)
    setMessage('')
    try {
      await cloudSync.syncNow()
      setMessage('지금 바로 클라우드에 저장했어요.')
    } finally {
      setBusy(false)
    }
  }

  async function handleUploadLocal() {
    setBusy(true)
    setMessage('')
    try {
      await cloudSync.connectRoom(cloudSync.roomCode || codeInput)
      setMessage('이 폰 데이터를 클라우드에 올렸어요.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cloud size={18} className="text-rose-400" />
          <h2 className="font-semibold text-zinc-800">클라우드 자동 동기화</h2>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass[cloudSync.status]}`}
        >
          {statusLabel[cloudSync.status]}
        </span>
      </div>

      {!cloudSync.isConfigured ? (
        <div className="space-y-2 text-xs leading-relaxed text-zinc-500">
          <p>
            Supabase 키가 아직 없어요. 배포 전에 GitHub Secrets 또는 로컬 <code>.env</code>에
            넣어야 자동 동기화가 켜져요.
          </p>
          <p className="rounded-xl bg-zinc-50 px-3 py-2">
            그 전까지는 아래 <strong>백업 & 복원</strong>으로 공유할 수 있어요.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs leading-relaxed text-zinc-500">
            둘이 같은 <strong>커플 코드</strong>를 입력하면 Supabase에 자동 저장돼요. 서버 켤
            필요 없이 폰 브라우저에서 URL만 열면 됩니다.
          </p>

          <label className="mb-2 block text-xs font-medium text-zinc-500">커플 코드</label>
          <input
            className="input mb-3"
            placeholder="예: yoon-chan-2025"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            disabled={busy}
          />

          {cloudSync.roomCode ? (
            <div className="mb-3 rounded-xl bg-emerald-50/80 px-3 py-2 text-xs text-emerald-700">
              <div className="flex items-center gap-1.5 font-semibold">
                <Wifi size={14} />
                연결됨: {cloudSync.roomCode}
              </div>
              <p className="mt-1 text-[11px] text-emerald-600/90">
                수정하면 1~2초 후 자동 저장 · 상대 폰도 자동 반영
              </p>
            </div>
          ) : (
            <p className="mb-3 text-[11px] text-zinc-400">
              처음 연결하는 사람이 지금 데이터를 클라우드에 올려요. 상대는 같은 코드만 입력하면
              돼요.
            </p>
          )}

          {cloudSync.error && (
            <p className="mb-3 text-xs text-rose-500">{cloudSync.error}</p>
          )}
          {message && <p className="mb-3 text-xs text-emerald-600">{message}</p>}

          <div className="grid grid-cols-2 gap-2">
            {!cloudSync.roomCode ? (
              <button className="btn-primary col-span-2" disabled={busy} onClick={handleConnect}>
                <Cloud size={16} />
                연결하기
              </button>
            ) : (
              <>
                <button className="btn-secondary" disabled={busy} onClick={handleSyncNow}>
                  <RefreshCw size={16} />
                  지금 동기화
                </button>
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        '연결을 해제할까요? 이 폰의 데이터는 그대로 남고, 자동 동기화만 꺼져요.',
                      )
                    ) {
                      cloudSync.disconnectRoom()
                      setMessage('연결을 해제했어요.')
                    }
                  }}
                >
                  <CloudOff size={16} />
                  연결 해제
                </button>
                <button
                  className="btn-secondary col-span-2"
                  disabled={busy}
                  onClick={handleUploadLocal}
                >
                  이 폰 데이터로 클라우드 덮어쓰기
                </button>
              </>
            )}
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
            💡 코드는 둘만 아는 비밀번호처럼 쓰세요. 백업 JSON은 그대로 보조 수단으로 쓸 수
            있어요.
          </p>
        </>
      )}
    </section>
  )
}
