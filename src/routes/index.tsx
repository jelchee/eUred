import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { PublicPassportPage } from '@/pages/PublicPassportPage';
import { AssetDetailPage } from '@/pages/AssetDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AssetRegistryPage } from '@/pages/AssetRegistryPage';
import { LifecycleTimelinePage } from '@/pages/LifecycleTimelinePage';
import { PassportDetailPage } from '@/pages/PassportDetailPage';
import { TelemetryPage } from '@/pages/TelemetryPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { SystemStatusPage } from '@/pages/SystemStatusPage';
import { TasksPage } from '@/pages/TasksPage';
import { AuditTrailPage } from '@/pages/AuditTrailPage';
import { DocumentVaultPage } from '@/pages/DocumentVaultPage';
import { CreateAssetPage } from '@/pages/CreateAssetPage';
import { DemoDataAdminPage } from '@/pages/DemoDataAdminPage';
import { MockIntegrationsPage } from '@/pages/MockIntegrationsPage';
import { CSVImportPage } from '@/pages/CSVImportPage';
import { SupplierPortalPage } from '@/pages/SupplierPortalPage';
import { PassportPublishPage } from '@/pages/PassportPublishPage';

// ============================================================
// APP ROUTES
// ============================================================

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — no authentication required */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/public/passport/:passportId"
        element={
          <PublicRoute>
            <PublicPassportPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected routes — authentication required, role-based access */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <AppShell>
              <AssetRegistryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/new"
        element={
          <ProtectedRoute>
            <AppShell>
              <CreateAssetPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:assetId"
        element={
          <ProtectedRoute>
            <AppShell>
              <AssetDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:assetId/passport/publish"
        element={
          <ProtectedRoute>
            <AppShell>
              <PassportPublishPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:assetId/passport"
        element={
          <ProtectedRoute>
            <AppShell>
              <PassportDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:assetId/telemetry"
        element={
          <ProtectedRoute>
            <AppShell>
              <TelemetryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets/:assetId/timeline"
        element={
          <ProtectedRoute>
            <AppShell>
              <LifecycleTimelinePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <AppShell>
              <CompliancePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <AppShell>
              <DocumentVaultPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <AppShell>
              <AuditTrailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AppShell>
              <TasksPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system"
        element={
          <ProtectedRoute>
            <AppShell>
              <SystemStatusPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/import"
        element={
          <ProtectedRoute>
            <AppShell>
              <CSVImportPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <AppShell>
              <MockIntegrationsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier"
        element={
          <ProtectedRoute>
            <AppShell>
              <SupplierPortalPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/demo-data"
        element={
          <ProtectedRoute>
            <AppShell>
              <DemoDataAdminPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
