import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './components/LoginPage'
import AuthCallback from './components/AuthCallback'
import ProfilePage from './components/ProfilePage'
import UserQuizHistoryPage from './components/UserQuizHistoryPage'
import AppLayout from './components/AppLayout'
import DevEnvironmentBadge from './components/DevEnvironmentBadge'

import ErrorBoundary from './components/ErrorBoundary'
import HomePage from './components/HomePage'
import AdminUsers from './components/AdminUsers'
import TokensPage from './components/TokensPage'
import FreeQuizzesPage from './components/FreeQuizzesPage'
import OnboardingProvider from './components/OnboardingProvider'
import ToastContainer from './components/ToastContainer'
import GeneratedQuizPage from './components/GeneratedQuizPage'
import UserQuizPage from './components/UserQuizPage'
import AdminQuizzesPage from './components/AdminQuizzesPage'
import AdminQuizStatsPage from './components/AdminQuizStatsPage'
import AdminQuizDetailsPage from './components/AdminQuizDetailsPage'
import UserQuizAttemptDetailsPage from './components/UserQuizAttemptDetailsPage'
import CreateQuizByLinkPage from './components/CreateQuizByLinkPage'
import MyQuizzesPage from './components/MyQuizzesPage'
import SettingsPage from './components/SettingsPage'
import TermsOfUsePage from './components/TermsOfUsePage'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import RewardHistoryPage from './components/RewardHistoryPage'
import AdminTokenPackagesPage from './components/AdminTokenPackagesPage'
import AdminRolesPage from './components/AdminRolesPage'
import OrderConfirmationPage from './components/OrderConfirmationPage'

function App() {
  return (
    <ErrorBoundary>
      <DevEnvironmentBadge />
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

        {/* Terms of Use */}
        <Route
          path="/terms"
          element={
            <ProtectedRoute requireAuth={false}>
              <TermsOfUsePage />
            </ProtectedRoute>
          }
        />

        {/* Privacy Policy */}
        <Route
          path="/privacy"
          element={
            <ProtectedRoute requireAuth={false}>
              <PrivacyPolicyPage />
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

        {/* User Quiz History page */}
        <Route
          path="/profile/quiz-history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UserQuizHistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Reward History page */}
        <Route
          path="/profile/reward-history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RewardHistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Desempenho / Performance page */}
        <Route
          path="/desempenho"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UserQuizHistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* User Quiz Attempt Details page */}
        <Route
          path="/profile/quiz-history/:attemptId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UserQuizAttemptDetailsPage />
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

        {/* Token Packages page - only for admins */}
        <Route
          path="/token-packages"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminTokenPackagesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Roles page - only for admins */}
        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminRolesPage />
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

        {/* Generated Quiz page */}
        <Route
          path="/quiz/generated"
          element={
            <ProtectedRoute>
              <GeneratedQuizPage />
            </ProtectedRoute>
          }
        />

        {/* User Quiz page */}
        <Route
          path="/quiz/user"
          element={
            <ProtectedRoute>
              <UserQuizPage />
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

        {/* Order Confirmation page */}
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />

        {/* Create Quiz by Link page */}
        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CreateQuizByLinkPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* My Quizzes page */}
        <Route
          path="/my-quizzes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <MyQuizzesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Settings page */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Quizzes page */}
        <Route
          path="/admin/quizzes"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminQuizzesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Quiz Stats page */}
        <Route
          path="/admin/quizzes/:id/stats"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminQuizStatsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Quiz Details page */}
        <Route
          path="/admin/quizzes/:id/details"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AdminQuizDetailsPage />
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