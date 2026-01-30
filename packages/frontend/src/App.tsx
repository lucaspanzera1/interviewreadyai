import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './components/LoginPage'
import AuthCallback from './components/AuthCallback'
import ProfilePage from './components/ProfilePage'
import AppLayout from './components/AppLayout'

import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './components/HomePage'
import AdminUsers from './components/AdminUsers'
import TokensPage from './components/TokensPage'
import FreeQuizzesPage from './components/FreeQuizzesPage'
import OnboardingProvider from './components/OnboardingProvider'
import ToastContainer from './components/ToastContainer'

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected route: profile only */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Home page - allows inactive users */}
        <Route path="/" element={
          <ProtectedRoute requireAuth={false}>
            <HomePage />
          </ProtectedRoute>
        } />

        {/* Users page - only for authenticated users (role check is in the page/sidebar) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminUsers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Free Quizzes page */}
        <Route
          path="/free-quizzes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <FreeQuizzesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Tokens page */}
        <Route
          path="/tokens"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TokensPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Onboarding modal */}
      <OnboardingProvider />

      {/* Toast notifications */}
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default App