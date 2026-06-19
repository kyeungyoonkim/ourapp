import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { AppData } from '../types'
import { STORAGE_KEY } from '../store/data'

export function BackupSection({
  data,
  onImport,
}: {
  data: AppData
  onImport: (data: AppData) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `우리백업-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('백업 파일을 저장했어요')
    setError('')
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as AppData
        if (!parsed.settings || !Array.isArray(parsed.places)) {
          throw new Error('invalid')
        }
        onImport({
          ...parsed,
          diaryEntries: parsed.diaryEntries ?? [],
          calendarEvents: parsed.calendarEvents ?? [],
          packingList: parsed.packingList ?? [],
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        setMessage('백업을 불러왔어요! 새로고침 없이 바로 적용됐어요')
        setError('')
      } catch {
        setError('백업 파일을 읽지 못했어요. 올바른 파일인지 확인해줘')
        setMessage('')
      }
    }
    reader.readAsText(file)
  }

  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center gap-2">
        <Download size={18} className="text-rose-400" />
        <h2 className="font-semibold text-zinc-800">백업 & 복원</h2>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-zinc-500">
        일기·여행·일정을 JSON 파일로 저장하고, 상대 폰에서 불러오면 같이 쓸 수 있어요.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-primary" onClick={handleExport}>
          <Download size={16} />
          백업 저장
        </button>
        <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
          <Upload size={16} />
          백업 불러오기
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {message && <p className="mt-2 text-xs text-emerald-600">{message}</p>}
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </section>
  )
}
