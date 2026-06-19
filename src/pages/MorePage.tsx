import { Settings } from 'lucide-react'
import { useState } from 'react'
import { BackupSection } from '../components/BackupSection'
import { CloudSyncSection } from '../components/CloudSyncSection'
import { TrashSection } from '../components/TrashSection'
import { Modal } from '../components/Modal'
import { useApp } from '../store/AppContext'
import { timezoneOptions } from '../utils/helpers'

export function MorePage() {
  const { data, importData, updateSettings } = useApp()
  const { settings } = data
  const [showSettings, setShowSettings] = useState(false)
  const [draft, setDraft] = useState(settings)

  function saveSettings() {
    updateSettings(draft)
    setShowSettings(false)
  }

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="page-title">설정</h1>
        <p className="text-sm text-zinc-500">클라우드 동기화 · 커플 설정 · 백업</p>
      </div>

      <CloudSyncSection />

      <BackupSection data={data} onImport={importData} />

      <TrashSection />

      <button
        className="card flex w-full items-center gap-3 p-4 text-left transition hover:bg-white"
        onClick={() => {
          setDraft(settings)
          setShowSettings(true)
        }}
      >
        <div className="rounded-xl bg-rose-50 p-2 text-rose-400">
          <Settings size={18} />
        </div>
        <div>
          <div className="font-semibold text-zinc-800">커플 설정</div>
          <div className="text-xs text-zinc-500">이름, 기념일, 도시, 타임존, 다음 만남</div>
        </div>
      </button>

      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="커플 설정">
        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          <Field label="내 이름">
            <input
              className="input"
              value={draft.myName}
              onChange={(e) => setDraft({ ...draft, myName: e.target.value })}
            />
          </Field>
          <Field label="상대 이름">
            <input
              className="input"
              value={draft.partnerName}
              onChange={(e) => setDraft({ ...draft, partnerName: e.target.value })}
            />
          </Field>
          <Field label="사귄 날 (기념일)">
            <input
              type="date"
              className="input"
              value={draft.anniversary}
              onChange={(e) => setDraft({ ...draft, anniversary: e.target.value })}
            />
          </Field>
          <Field label="다음 여행 이름">
            <input
              className="input"
              placeholder="예: 콜로라도"
              value={draft.nextTripName}
              onChange={(e) => setDraft({ ...draft, nextTripName: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="여행 시작">
              <input
                type="date"
                className="input"
                value={draft.nextVisit}
                onChange={(e) => setDraft({ ...draft, nextVisit: e.target.value })}
              />
            </Field>
            <Field label="여행 끝">
              <input
                type="date"
                className="input"
                value={draft.nextVisitEnd}
                onChange={(e) => setDraft({ ...draft, nextVisitEnd: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="내 도시 (지금)">
              <input
                className="input"
                value={draft.myCity}
                onChange={(e) => setDraft({ ...draft, myCity: e.target.value })}
              />
            </Field>
            <Field label="상대 도시">
              <input
                className="input"
                value={draft.partnerCity}
                onChange={(e) => setDraft({ ...draft, partnerCity: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="이사할 도시">
              <input
                className="input"
                placeholder="예: 필라델피아"
                value={draft.myCityNext}
                onChange={(e) => setDraft({ ...draft, myCityNext: e.target.value })}
              />
            </Field>
            <Field label="이사 날짜">
              <input
                type="date"
                className="input"
                value={draft.myCityMoveDate}
                onChange={(e) => setDraft({ ...draft, myCityMoveDate: e.target.value })}
              />
            </Field>
          </div>
          <Field label="내 타임존">
            <select
              className="input"
              value={draft.myTimezone}
              onChange={(e) => setDraft({ ...draft, myTimezone: e.target.value })}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="상대 타임존">
            <select
              className="input"
              value={draft.partnerTimezone}
              onChange={(e) => setDraft({ ...draft, partnerTimezone: e.target.value })}
            >
              {timezoneOptions.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </Field>
          <button className="btn-primary w-full" onClick={saveSettings}>
            저장하기
          </button>
        </div>
      </Modal>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  )
}
