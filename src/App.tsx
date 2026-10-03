import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.tsx'
import { ErrorBanner } from './components/ErrorBanner.tsx'
import { LoadingScreen } from './components/LoadingScreen.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { MissionDetailPage } from './pages/MissionDetailPage.tsx'
import { MissionFormPage } from './pages/MissionFormPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { SettingsPage } from './pages/SettingsPage.tsx'
import { CairnProvider, useCairn } from './store/CairnProvider.tsx'

function AppRoutes() {
  const { loadStatus, errorMessage } = useCairn()

  if (loadStatus === 'loading') {
    return <LoadingScreen />
  }

  if (loadStatus === 'error') {
    return <ErrorBanner message={errorMessage ?? 'Cairn could not be opened.'} />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/missions/new" element={<MissionFormPage />} />
        <Route path="/missions/:id" element={<MissionDetailPage />} />
        <Route path="/missions/:id/edit" element={<MissionFormPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CairnProvider>
        <AppRoutes />
      </CairnProvider>
    </BrowserRouter>
  )
}
