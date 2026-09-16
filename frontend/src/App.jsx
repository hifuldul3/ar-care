import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SessionProvider } from './context/SessionContext';

import { Login } from './pages/Login';

// Worker Pages
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { NewCase } from './pages/worker/NewCase';
import { CaseDetails } from './pages/worker/CaseDetails';
import { WorkerSession } from './pages/worker/WorkerSession';
import { WorkerReports } from './pages/worker/WorkerReports';
import { OfflineQueue } from './pages/worker/OfflineQueue';

// Specialist Pages
import { SpecialistDashboard } from './pages/specialist/SpecialistDashboard';
import { SpecialistCases } from './pages/specialist/SpecialistCases';
import { SpecialistCaseDetails } from './pages/specialist/SpecialistCaseDetails';
import { SpecialistSession } from './pages/specialist/SpecialistSession';
import { SpecialistReports } from './pages/specialist/SpecialistReports';

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'worker' ? '/worker/dashboard' : '/specialist/dashboard'} replace />;
  }
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <SessionProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path="/" element={<Login />} />

              {/* Worker Routes */}
              <Route
                path="/worker/dashboard"
                element={
                  <ProtectedRoute allowedRole="worker">
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/new-case"
                element={
                  <ProtectedRoute allowedRole="worker">
                    <NewCase />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/case/:caseId"
                element={
                  <ProtectedRoute allowedRole="worker">
                    <CaseDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/session/:caseId"
                element={
                  <ProtectedRoute allowedRole="worker">
                    <WorkerSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/reports"
                element={
                  <ProtectedRoute allowedRole="worker">
                    <WorkerReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/worker/offline-queue"
                element={
                  <ProtectedRoute allowedRole="worker">
                    <OfflineQueue />
                  </ProtectedRoute>
                }
              />

              {/* Specialist Routes */}
              <Route
                path="/specialist/dashboard"
                element={
                  <ProtectedRoute allowedRole="specialist">
                    <SpecialistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/specialist/cases"
                element={
                  <ProtectedRoute allowedRole="specialist">
                    <SpecialistCases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/specialist/case/:caseId"
                element={
                  <ProtectedRoute allowedRole="specialist">
                    <SpecialistCaseDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/specialist/session/:caseId"
                element={
                  <ProtectedRoute allowedRole="specialist">
                    <SpecialistSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/specialist/reports"
                element={
                  <ProtectedRoute allowedRole="specialist">
                    <SpecialistReports />
                  </ProtectedRoute>
                }
              />

              {/* Fallback wildcard route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
