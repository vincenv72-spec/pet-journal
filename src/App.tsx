import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import PetsPage from './pages/PetsPage'
import PetDetailPage from './pages/PetDetailPage'
import YearReviewPage from './pages/YearReviewPage'
import LifelongScrollPage from './pages/LifelongScrollPage'
import CursorTrail from './components/CursorTrail'
import BottomNav from './components/BottomNav'

function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <p className="text-center py-20">加载中...</p>
  if (!session) return <Navigate to="/login" replace />
  return (
    <>
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CursorTrail />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/editor/:id" element={<Protected><EditorPage /></Protected>} />
          <Route path="/pets" element={<Protected><PetsPage /></Protected>} />
          <Route path="/pets/:id" element={<Protected><PetDetailPage /></Protected>} />
          <Route path="/pets/:id/year" element={<Protected><YearReviewPage /></Protected>} />
          <Route path="/pets/:id/lifelong" element={<Protected><LifelongScrollPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  )
}
