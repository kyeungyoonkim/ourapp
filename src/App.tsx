import { useState } from 'react'
import { Layout } from './components/Layout'
import { AppProvider } from './store/AppContext'
import { CalendarPage } from './pages/CalendarPage'
import { HomePage } from './pages/HomePage'
import { RecordPage } from './pages/RecordPage'
import { ListsPage } from './pages/ListsPage'
import { MorePage } from './pages/MorePage'
import { TogetherPage } from './pages/TogetherPage'
import { TravelPage } from './pages/TravelPage'
import type { TabId } from './types'

function AppContent() {
  const [tab, setTab] = useState<TabId>('home')

  return (
    <Layout activeTab={tab} onTabChange={setTab}>
      {tab === 'home' && (
        <HomePage
          onGoCalendar={() => setTab('calendar')}
          onGoTogether={() => setTab('together')}
        />
      )}
      {tab === 'calendar' && <CalendarPage />}
      {tab === 'travel' && <TravelPage />}
      {tab === 'lists' && <ListsPage />}
      {tab === 'record' && <RecordPage />}
      {tab === 'together' && <TogetherPage />}
      {tab === 'more' && <MorePage />}
    </Layout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
