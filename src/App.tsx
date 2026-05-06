import { Route, Routes } from 'react-router-dom'
import { PrivateRoute } from '@/components/PrivateRoute'
import { AppShell } from '@/components/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventDetailPage } from '@/pages/EventDetailPage'
import { EventFormPage } from '@/pages/EventFormPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { PublicEventPage } from '@/pages/PublicEventPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CheckinPage } from '@/pages/CheckinPage'
import { CheckinScannerPage } from '@/pages/CheckinScannerPage'
import { CertificateEditorPage } from '@/pages/CertificateEditorPage'
import { CertificatePrintPage } from '@/pages/CertificatePrintPage'
import { FinanceiroDashboardPage } from '@/pages/FinanceiroDashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/e/:slug" element={<PublicEventPage />} />
      <Route path="/e/:slug/confirmacao" element={<ConfirmationPage />} />
      <Route element={<PrivateRoute><AppShell /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/events/new" element={<EventFormPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/events/:id/edit" element={<EventFormPage />} />
        <Route path="/financeiro" element={<FinanceiroDashboardPage />} />
      </Route>
      <Route path="/events/:id/certificate-editor" element={<PrivateRoute><CertificateEditorPage /></PrivateRoute>} />
      <Route path="/certificate-print" element={<CertificatePrintPage />} />
      <Route path="/checkin" element={<PrivateRoute><CheckinPage /></PrivateRoute>} />
      <Route path="/checkin/:eventId" element={<PrivateRoute><CheckinScannerPage /></PrivateRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
