import {
  BarChart3,
  BookHeart,
  CalendarDays,
  Heart,
  ListTodo,
  MapPin,
  Settings,
} from 'lucide-react'
import type { TabId } from '../types'

const tabs: Array<{ id: TabId; label: string; icon: typeof Heart }> = [
  { id: 'home', label: '홈', icon: Heart },
  { id: 'calendar', label: '일정', icon: CalendarDays },
  { id: 'travel', label: '여행', icon: MapPin },
  { id: 'lists', label: '리스트', icon: ListTodo },
  { id: 'together', label: '함께', icon: BarChart3 },
  { id: 'record', label: '기록', icon: BookHeart },
  { id: 'more', label: '설정', icon: Settings },
]

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-rose-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 py-1">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-2 text-[10px] font-medium transition ${
                isActive ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-400'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

interface LayoutProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: React.ReactNode
}

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col">
      <main className="flex-1 px-4 pb-24 pt-5">{children}</main>
      <BottomNav active={activeTab} onChange={onTabChange} />
    </div>
  )
}
