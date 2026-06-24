# Implementation Plan: Battery Passport Platform

## Overview

Build a client-side React + TypeScript + Vite SPA that demonstrates an EU Battery Passport for Rimac Energy SineStack BESS assets. The implementation follows a bottom-up approach: scaffolding → types → data layer → store → routing/RBAC → shared components → domain components → pages → integration. All data is local mock data with no backend.

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialize Vite + React + TypeScript project
    - Run `npm create vite@latest` with React + TypeScript template
    - Install dependencies: `react-router-dom`, `zustand`, `immer`, `recharts`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`
    - Install shadcn/ui dependencies: `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
    - _Requirements: NFR-007_

  - [x] 1.2 Configure Tailwind CSS with design tokens
    - Set up `tailwind.config.ts` with custom colors (navy backgrounds, cyan/emerald/amber/red accents), typography (Inter, JetBrains Mono), spacing, shadows, border-radius from design tokens
    - Create `src/styles/globals.css` with base styles, glassmorphism utilities, and CSS custom properties
    - Configure dark-mode as default (no toggle needed — always dark)
    - _Requirements: NFR-006, Section 12 (UI Design)_

  - [x] 1.3 Configure path aliases and project structure
    - Set up `@/` path alias in `tsconfig.json` and `vite.config.ts`
    - Create directory structure: `src/components/shared/`, `src/components/domain/`, `src/components/layout/`, `src/pages/`, `src/store/`, `src/store/slices/`, `src/hooks/`, `src/data/`, `src/types/`, `src/lib/`, `src/providers/`
    - Configure Vitest in `vite.config.ts` with jsdom environment
    - _Requirements: NFR-007_

- [x] 2. Types and data models
  - [x] 2.1 Define core TypeScript types
    - Create `src/types/index.ts` with all type definitions: `UserRole`, `DemoUser`, `DemoOrganization`, `Permission`, `RolePermissionMap`, `AccessLevel`
    - Create `src/types/asset.ts` with `Asset`, `AssetLocation`, `BatteryChemistry`, `AssetStatus`, `TelemetrySnapshot`
    - Create `src/types/passport.ts` with `PassportAttribute`, `PassportSection`, `AttributeStatus`, `VerificationStatus`, `DataSource`, `ConfidenceLevel`
    - Create `src/types/telemetry.ts` with `TelemetryReading`, `Alarm`, `AlarmType`, `TelemetryMetric`, `TimeRange`
    - Create `src/types/document.ts` with `Document`, `DocumentType`, `DocumentStatus`
    - Create `src/types/audit.ts` with `AuditEvent`, `AuditAction`, `EntityType`, `LifecycleEvent`, `LifecycleEventType`, `EventCategory`
    - Create `src/types/task.ts` with `Task`, `TaskType`
    - Create `src/types/esg.ts` with `CarbonFootprint`, `CarbonLifecycleStage`, `RecycledContent`, `SystemHealth`
    - _Requirements: FR-001, FR-002, FR-003, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-012_

  - [x] 2.2 Define RBAC permission map and route permissions
    - Create `src/lib/permissions.ts` with `ROLE_ACCESS_MAP`, `ROLE_PERMISSION_MAP`, and `ROUTE_PERMISSIONS` constants as specified in design
    - Implement `filterByRole<T>()` function with visible/restricted split
    - Implement `canAccessRoute()` function with redirect logic
    - _Requirements: FR-009, NFR-001_

  - [ ]* 2.3 Write property tests for RBAC functions
    - **Property 1: Role Isolation** — For all roles R and items with accessLevel not in ROLE_ACCESS_MAP[R], filterByRole never includes them in visible array
    - **Property 10: Route Guard Completeness** — Every defined route returns a deterministic result for every role
    - **Validates: Requirements FR-009, NFR-001**

- [x] 3. Mock data layer
  - [x] 3.1 Create static demo data
    - Create `src/data/organizations.ts` with 6 demo organizations
    - Create `src/data/users.ts` with 7 demo users (one per role)
    - Create `src/data/assets.ts` with 3 assets: "Nearly ready" (ZG-0001), "Needs attention" (UK-0002), "Critical gaps" (DE-0003)
    - Create `src/data/documents.ts` with 10+ demo documents of various types and statuses
    - Create `src/data/lifecycleEvents.ts` with lifecycle events for each asset
    - Create `src/data/auditEvents.ts` with 40+ audit events
    - Create `src/data/tasks.ts` with demo tasks
    - _Requirements: FR-014, FR-001, FR-008, FR-006, FR-010, FR-012_

  - [x] 3.2 Create passport attributes mock data
    - Create `src/data/passportAttributes.ts` with full set of attributes across 13 sections for each asset
    - Each attribute must include: status, verificationStatus, source, confidence, accessLevel
    - Distribute statuses realistically: ZG-0001 ~80% provided/verified, UK-0002 ~60%, DE-0003 ~35%
    - _Requirements: FR-003, FR-004_

  - [x] 3.3 Implement telemetry generator
    - Create `src/data/telemetryGenerator.ts` implementing `generateTelemetry(asset, days, profile)` as specified in design
    - SoC oscillates 20-90% with realistic daily patterns
    - SoH degrades monotonically (~0.003%/day)
    - Temperature follows diurnal pattern
    - Warning profile includes high-temp event and connectivity loss
    - Generate 90 days × 24 hours = 2160 readings per asset
    - _Requirements: FR-005_

  - [ ]* 3.4 Write property tests for telemetry generator
    - **Property 5: Telemetry Ordering** — All timestamps in generated array are strictly sequential
    - **Property 6: SoH Monotonic Decrease** — SoH values are monotonically non-increasing for operational profiles
    - **Validates: Requirements FR-005**

  - [x] 3.5 Implement compliance score calculator
    - Create `src/lib/compliance.ts` implementing `calculateComplianceScore(attributes, documents)` per design specification
    - Scoring logic: required provided (+1), required verified (+1 bonus), expired doc (-2), optional (+0.25)
    - Source weight mapping: document_upload 1.0, BMS/ERP/MES 0.9, supplier_declaration 0.7, calculated 0.7, manual 0.6, public_spec 0.5, simulated 0.3
    - `scoreToLevel()` with thresholds: 0-49 critical_gaps, 50-74 needs_attention, 75-89 nearly_ready, 90-100 passport_ready
    - _Requirements: FR-004_

  - [ ]* 3.6 Write property tests for compliance score
    - **Property 2: Compliance Score Determinism** — Same inputs always produce same output
    - **Property 3: Compliance Score Bounds** — Score is always in [0, 100]
    - **Property 4: Level-Score Consistency** — scoreToLevel matches documented thresholds exactly
    - **Validates: Requirements FR-004**

- [x] 4. Checkpoint — Core data layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. State management (Zustand store)
  - [x] 5.1 Create Zustand store with slices
    - Create `src/store/slices/auth.ts` — AuthSlice: currentRole, currentUser, isAuthenticated, setRole, login, logout
    - Create `src/store/slices/assets.ts` — AssetSlice: assets, selectedAsset, selectAsset, getAssetById
    - Create `src/store/slices/telemetry.ts` — TelemetrySlice: readings map by assetId, timeRange, getTelemetry, generateForAsset
    - Create `src/store/slices/compliance.ts` — ComplianceSlice: scores map by passportId, calculateScore
    - Create `src/store/slices/ui.ts` — UISlice: sidebarOpen, sidebarCollapsed, mobileNavOpen, toggleSidebar
    - Create `src/store/index.ts` combining all slices with immer middleware
    - _Requirements: FR-009, FR-014, NFR-007_

  - [x] 5.2 Create typed selector hooks
    - Create `src/hooks/useRole.ts` — returns currentRole, currentUser, setRole, permissions
    - Create `src/hooks/useAssets.ts` — returns assets filtered by role, selectedAsset
    - Create `src/hooks/useTelemetry.ts` — returns readings for assetId filtered by timeRange, stats, alarms
    - Create `src/hooks/useCompliance.ts` — returns compliance score, gaps, topGaps for an asset
    - Create `src/hooks/usePassportAttributes.ts` — returns visible/restricted attributes for current role
    - Create `src/hooks/useDocuments.ts` — returns documents filtered by role and access level
    - _Requirements: FR-009, NFR-007_

- [x] 6. Routing and layout
  - [x] 6.1 Set up React Router with route guards
    - Create `src/routes/index.tsx` defining all 15 routes from design route map
    - Create `src/components/layout/ProtectedRoute.tsx` — checks canAccessRoute, redirects if denied
    - Create `src/components/layout/PublicRoute.tsx` — for landing, public passport, login
    - _Requirements: FR-009, NFR-001_

  - [x] 6.2 Implement AppShell layout
    - Create `src/components/layout/AppShell.tsx` — responsive layout with sidebar + topbar + main content
    - Create `src/components/layout/Sidebar.tsx` — left navigation with icons, labels, active state, collapsed mode
    - Create `src/components/layout/TopBar.tsx` — demo badge, role switcher, tenant display, breadcrumbs
    - Create `src/components/layout/MobileNav.tsx` — bottom navigation for mobile with 5 primary icons
    - Use Zustand UI slice for sidebar state management
    - _Requirements: NFR-003, NFR-006_

  - [x] 6.3 Implement RoleSwitcher component
    - Create `src/components/layout/RoleSwitcher.tsx` — dropdown showing all 7 roles with descriptions
    - On role change: update Zustand auth slice, trigger re-render of all role-dependent components
    - Display current role avatar and label in top bar
    - _Requirements: FR-009_

- [x] 7. Shared component library
  - [x] 7.1 Implement StatusBadge component
    - Create `src/components/shared/StatusBadge.tsx`
    - Support all status types: AttributeStatus, ComplianceLevel, ConnectivityStatus, AlarmStatus
    - Color mapping per design tokens, always include text label (accessibility)
    - Sizes: xs, sm, md
    - Optional icon prefix
    - _Requirements: NFR-006, FR-003, FR-004_

  - [x] 7.2 Implement KPICard component
    - Create `src/components/shared/KPICard.tsx`
    - Large numeric display with tabular number font feature
    - Variants: default, glass (glassmorphism), accent
    - AccentColor options: cyan, emerald, amber, red
    - Optional trend indicator, icon, and unit
    - _Requirements: NFR-006_

  - [x] 7.3 Implement DataTable component
    - Create `src/components/shared/DataTable.tsx`
    - Sortable columns, filter controls, pagination
    - Keyboard accessible, proper th/td with scope
    - Dark theme styling with subtle row borders
    - _Requirements: NFR-006, FR-001_

  - [x] 7.4 Implement ChartContainer and GaugeChart components
    - Create `src/components/shared/ChartContainer.tsx` — wrapper with title, time range selector, responsive sizing
    - Create `src/components/shared/GaugeChart.tsx` — semi-circular gauge with color segments (red/amber/cyan/emerald)
    - Respect `prefers-reduced-motion` for animations
    - _Requirements: NFR-006, FR-005_

  - [x] 7.5 Implement utility shared components
    - Create `src/components/shared/RestrictedDataPlaceholder.tsx` — lock icon, section name, required roles, contextual message
    - Create `src/components/shared/DemoDisclaimer.tsx` — persistent "Demo Mode" badge/banner
    - Create `src/components/shared/TimelineEvent.tsx` — single event node for timeline display
    - _Requirements: FR-009, NFR-002_

- [x] 8. Domain components
  - [x] 8.1 Implement asset domain components
    - Create `src/components/domain/AssetStatusCard.tsx` — compact/expanded variants, SoC/SoH gauges, compliance badge, alarm status
    - Create `src/components/domain/BatteryHealthCard.tsx` — SoH trend, cycle count, energy throughput summary
    - _Requirements: FR-001, FR-005_

  - [x] 8.2 Implement passport domain components
    - Create `src/components/domain/PassportAttributeRow.tsx` — attribute display with status badge, source, confidence
    - Create `src/components/domain/PassportReadinessGauge.tsx` — circular gauge 0-100% with color segments
    - Create `src/components/domain/QRCodePanel.tsx` — QR code display with passport ID and scan instructions
    - _Requirements: FR-002, FR-003, FR-004_

  - [x] 8.3 Implement telemetry and compliance domain components
    - Create `src/components/domain/TelemetryChart.tsx` — Recharts line/area chart with time range, alarm overlay, thresholds
    - Create `src/components/domain/ComplianceGapTable.tsx` — grouped by section, filter by status, "Create Task" button, top 5 gaps panel
    - _Requirements: FR-005, FR-004_

  - [x] 8.4 Implement lifecycle and ESG domain components
    - Create `src/components/domain/LifecycleTimeline.tsx` — vertical timeline, color-coded by category, BMS vs manual distinction
    - Create `src/components/domain/CarbonFootprintBreakdown.tsx` — stacked bar/pie for lifecycle stages
    - Create `src/components/domain/RecycledContentBarList.tsx` — bar chart per material with percentage
    - _Requirements: FR-006, FR-007_

  - [x] 8.5 Implement remaining domain components
    - Create `src/components/domain/DocumentVaultTable.tsx` — filterable document table with expiry indicators
    - Create `src/components/domain/AuditTrailTimeline.tsx` — searchable audit timeline with filters
    - Create `src/components/domain/RoleAccessBanner.tsx` — shows current role context on pages
    - Create `src/components/domain/SystemHealthPanel.tsx` — service status cards for platform health
    - Create `src/components/domain/DemoDataControlPanel.tsx` — reset demo data, generate telemetry buttons
    - _Requirements: FR-008, FR-010, NFR-005, FR-014_

- [x] 9. Checkpoint — Components complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Pages — Public and authentication
  - [x] 10.1 Implement LandingPage
    - Create `src/pages/LandingPage.tsx`
    - Hero section with platform branding, partnership context (ENT + Rimac Energy)
    - "Scan QR Code" and "Demo Login" CTAs
    - Brief feature highlights grid
    - _Requirements: 3.2 (board-level demo)_

  - [x] 10.2 Implement PublicPassportPage
    - Create `src/pages/PublicPassportPage.tsx`
    - Mobile-first layout (primary QR scan flow)
    - Display only PUBLIC accessLevel passport attributes
    - Battery model, manufacturer, capacity, chemistry, safety summary, recycling instructions, public carbon footprint
    - Masked serial number format: `SEST-2026-****-0001`
    - "Request Access" CTA button
    - Compliance badge (Draft/In Review/Verified)
    - _Requirements: FR-002_

  - [x] 10.3 Implement LoginPage
    - Create `src/pages/LoginPage.tsx`
    - Demo login interface with role selection cards (7 roles)
    - Each card shows role name, description, and what data they can see
    - On select: calls store login action, redirects to /dashboard
    - _Requirements: FR-009_

- [x] 11. Pages — Main dashboard and asset views
  - [x] 11.1 Implement DashboardPage
    - Create `src/pages/DashboardPage.tsx`
    - KPI hero row: Total Assets, Average SoH, Passport Readiness, Critical Gaps
    - Asset cards grid (expanded variant)
    - Task summary with counts by priority
    - Recent audit events
    - Role-filtered content (different KPIs visible per role)
    - _Requirements: FR-001, FR-004, FR-012_

  - [x] 11.2 Implement AssetRegistryPage
    - Create `src/pages/AssetRegistryPage.tsx`
    - DataTable with all assets
    - Columns: Asset ID, Model, Location, Owner, SoC, SoH, Compliance Score, Alarm Status, Connectivity
    - Filters: location, owner, status, compliance score range
    - Click row navigates to asset detail
    - Visual highlighting for alarmed assets and compliance gaps
    - _Requirements: FR-001_

  - [x] 11.3 Implement AssetDetailPage
    - Create `src/pages/AssetDetailPage.tsx`
    - Header: asset name, location, status badges
    - Tab navigation or section links: Passport, Telemetry, Timeline, Documents
    - Summary KPIs: SoC, SoH, Cycles, Availability, Compliance Score
    - Quick-access links to sub-pages
    - _Requirements: FR-001, FR-003_

- [x] 12. Pages — Passport and telemetry
  - [x] 12.1 Implement PassportDetailPage
    - Create `src/pages/PassportDetailPage.tsx`
    - Passport readiness gauge at top
    - Sections grouped by PassportSection (13 sections)
    - Each attribute rendered with PassportAttributeRow
    - Restricted attributes shown as RestrictedDataPlaceholder based on current role
    - QR code panel in sidebar
    - _Requirements: FR-003, FR-009_

  - [x] 12.2 Implement TelemetryPage
    - Create `src/pages/TelemetryPage.tsx`
    - Time range selector (24h, 7d, 30d, 90d)
    - Four chart panels: SoC, SoH, Temperature, Energy Throughput
    - Alarm events overlaid on charts
    - Current status cards: Latest SoC, SoH, Temperature, Availability
    - Warning/critical thresholds as reference lines on charts
    - _Requirements: FR-005_

  - [x] 12.3 Implement LifecycleTimelinePage
    - Create `src/pages/LifecycleTimelinePage.tsx`
    - LifecycleTimeline component with full event history
    - Filter tabs: All, Production, Operational, Service, Compliance
    - Expandable event details with actor, source, linked document
    - _Requirements: FR-006_

- [x] 13. Pages — Compliance, documents, and operations
  - [x] 13.1 Implement CompliancePage
    - Create `src/pages/CompliancePage.tsx`
    - Overall compliance score gauge per asset
    - ComplianceGapTable with all attributes
    - Top 5 gaps highlighted
    - Filter by status, section
    - "Create Task" action for gaps
    - Demo score disclaimer
    - _Requirements: FR-004_

  - [x] 13.2 Implement DocumentVaultPage
    - Create `src/pages/DocumentVaultPage.tsx`
    - DocumentVaultTable with all documents for current asset/global
    - Filters: type, status, access level
    - Expired document highlighting
    - Document metadata display
    - _Requirements: FR-008_

  - [x] 13.3 Implement AuditTrailPage
    - Create `src/pages/AuditTrailPage.tsx`
    - AuditTrailTimeline with searchable events
    - Filters: asset, actor, action type, date range
    - Read-only for regulator role
    - CSV export button for admin
    - _Requirements: FR-010_

  - [x] 13.4 Implement TasksPage
    - Create `src/pages/TasksPage.tsx`
    - Task list grouped by priority (critical, high, medium, low)
    - Task cards with: title, description, assignee, due date, status
    - "Mark as resolved" action in demo mode
    - Link to related asset/attribute
    - _Requirements: FR-012_

  - [x] 13.5 Implement SystemStatusPage
    - Create `src/pages/SystemStatusPage.tsx`
    - SystemHealthPanel showing service statuses: Ingest, API Gateway, Database, Export Queue, Auth
    - Uptime percentages, latency indicators
    - Trace ID display
    - ENT_PLATFORM_OPERATOR and ADMIN only
    - _Requirements: NFR-005_

  - [x] 13.6 Implement DemoDataAdminPage
    - Create `src/pages/DemoDataAdminPage.tsx`
    - DemoDataControlPanel with "Reset Demo Data" button (with confirmation dialog)
    - "Generate New Telemetry" button
    - Current dataset stats display
    - ADMIN only
    - _Requirements: FR-014_

- [x] 14. Checkpoint — All pages complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Integration, polish, and ESG module
  - [x] 15.1 Wire ESG and carbon data into passport pages
    - Integrate CarbonFootprintBreakdown into PassportDetailPage carbon section
    - Integrate RecycledContentBarList into passport materials section
    - Add due diligence summary section with supplier declaration counts
    - Add confidence level indicators per data point
    - Add "Demo values — not externally verified" disclaimer
    - _Requirements: FR-007_

  - [x] 15.2 Implement export functionality
    - Create `src/lib/exportService.ts`
    - JSON passport export (full passport attributes as structured JSON)
    - CSV audit trail export
    - CSV telemetry summary export
    - Add export buttons to relevant pages (Passport, Audit, Telemetry)
    - Include timestamp, generated-by, demo disclaimer in all exports
    - _Requirements: FR-013_

  - [x] 15.3 Demo Mode indicators and disclaimers
    - Ensure DemoDisclaimer badge visible on every authenticated page (TopBar)
    - Add "Demo Mode" persistent indicator that cannot be dismissed
    - Add data confidence tooltips where applicable
    - Mark all synthetic data clearly
    - _Requirements: NFR-002_

  - [ ]* 15.4 Write property test for public passport safety
    - **Property 7: Public Passport Safety** — PublicPassportPage never renders data with accessLevel !== 'PUBLIC'
    - **Validates: Requirements FR-002, NFR-001**

  - [ ]* 15.5 Write integration tests for role switching
    - Test role switch updates all visible data across pages
    - Test route guards redirect correctly for each role
    - Test restricted placeholders appear when role lacks access
    - _Requirements: FR-009_

- [x] 16. Final checkpoint — All tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Data Ingestion types, data layer, and new store slices
  - [x] 17.1 Define data ingestion TypeScript types
    - Create `src/types/dataIngestion.ts` with: `NewAssetDraft`, `AssetFormField`, `VisibilityLevel`, `CSVRow`, `CSVValidationResult`, `ImportResult`, `ImportStep`, `MockIntegration`, `IntegrationSystem`, `SimulatorState`, `TelemetryScenario`, `ScenarioConfig`
    - Create `src/types/supplier.ts` with: `SupplierObligation`, `SupplierSubmissionStatus`, `SupplierDeclaration`, `DemoOrganization` (supplier type)
    - Create `src/types/workflow.ts` with: `ReviewableItem`, `ReviewStatus`, `ReviewAction`, `ReviewResult`, `PassportCompletenessScore`, `SectionScore`, `ScoreSnapshot`, `PublishStep`, `PublishReadinessCheck`, `PublicPassportData`, `PublishResult`, `DocumentUpload`, `DocumentUploadStatus`, `ExtendedDocumentType`, `ExtendedAuditAction`, `EnhancedAuditEvent`, `ExtendedLifecycleEventType`, `NewLifecycleEvent`
    - Extend existing `UserRole` type with: `RIMAC_OPERATOR`, `RIMAC_COMPLIANCE_MANAGER`, `RIMAC_SERVICE_USER`, `SUPPLIER_USER`
    - _Requirements: FR-DI-001, FR-DI-003, FR-DI-005, FR-DI-006, FR-DI-007, FR-DI-009, FR-DI-010, FR-DI-011, FR-DI-013, FR-DI-014, FR-DI-015_

  - [x] 17.2 Create demo data for suppliers, obligations, and CSV templates
    - Create `src/data/suppliers.ts` with 4 demo supplier organizations (Demo Cell Supplier A, Demo Electronics Supplier B, Demo Materials Supplier C, Demo Enclosure Supplier D)
    - Create `src/data/obligations.ts` with 8-10 demo supplier obligations across assets with varied statuses (pending, submitted, under_review, approved, rejected)
    - Create `src/data/csvTemplates.ts` with pre-loaded demo CSV data (3 example rows) and column definitions
    - Add 4 new demo users to `src/data/users.ts`: Tomislav Jurić (RIMAC_OPERATOR), Ana Babić (RIMAC_COMPLIANCE_MANAGER), Marko Novak (RIMAC_SERVICE_USER), Chen Wei (SUPPLIER_USER)
    - _Requirements: FR-DI-003, FR-DI-007, FR-DI-009_

  - [x] 17.3 Create utility libraries for data ingestion
    - Create `src/lib/csvValidator.ts` with `parseCSV()`, `validateCSVRow()`, `validateCSVImport()` functions per design spec (required column checks, duplicate detection, capacity range validation, chemistry validation)
    - Create `src/lib/completenessScore.ts` with `calculateCompletenessScore()` function (40% field population + 30% verification + 20% documents + 10% supplier declarations)
    - Create `src/lib/visibilityClassifier.ts` with `FIELD_VISIBILITY_MAP` constant and `classifyVisibility()` function
    - Create `src/lib/auditLogger.ts` with centralized `createAuditEvent()` function that integrates with store
    - _Requirements: FR-DI-004, FR-DI-010, FR-DI-014, FR-DI-015_

  - [x] 17.4 Implement new Zustand store slices
    - Create `src/store/slices/dataIngestion.ts` — DataIngestionSlice: CSV import state, mock integration statuses, telemetry simulator states per asset, draft assets, actions (startCSVImport, completeCSVImport, triggerMockImport, startSimulator, stopSimulator, changeScenario, saveDraft, publishDraft)
    - Create `src/store/slices/supplier.ts` — SupplierSlice: obligations, declarations, actions (submitDeclaration, getObligationsForSupplier, approveDeclaration, rejectDeclaration, requestChanges)
    - Create `src/store/slices/workflow.ts` — WorkflowSlice: completenessScores, publishingState, reviewQueue, actions (recalculateCompleteness, startPublishWorkflow, completePublish, processReview, addLifecycleEvent)
    - Update `src/store/index.ts` to combine new slices with existing store
    - _Requirements: FR-DI-001, FR-DI-003, FR-DI-005, FR-DI-006, FR-DI-007, FR-DI-009, FR-DI-010, FR-DI-011_

  - [x] 17.5 Update RBAC permissions for new roles
    - Update `src/lib/permissions.ts` to include RIMAC_OPERATOR, RIMAC_COMPLIANCE_MANAGER, RIMAC_SERVICE_USER, SUPPLIER_USER permissions as defined in design
    - Add new permissions: `create_assets`, `edit_assets`, `import_csv`, `import_mock_api`, `create_lifecycle_events`, `review_compliance`, `approve_evidence`, `reject_evidence`, `request_changes`, `publish_passport`, `view_supplier_obligations`, `submit_declarations`, `view_own_submissions`
    - Update route permissions to include new routes (`/assets/new`, `/import`, `/integrations`, `/supplier`, `/assets/:assetId/passport/publish`)
    - Update RoleSwitcher to include new 4 roles with descriptions
    - _Requirements: FR-DI-001, FR-DI-003, FR-DI-005, FR-DI-007, FR-DI-009, FR-DI-011_

- [x] 18. Checkpoint — Data ingestion foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Create Asset Form and CSV Import
  - [x] 19.1 Implement CreateAssetForm component
    - Create `src/components/domain/CreateAssetForm.tsx`
    - Multi-section form grouped by: Identity, Technical, Location, Status
    - Show VisibilityBadge (Public/Restricted/Confidential) next to each field
    - Validate required fields on submit (asset ID, serial number, product family, battery type, capacity, chemistry, manufacturing date, manufacturing site, lifecycle status)
    - Support "Save as Draft" with partial data
    - On save: create asset in store, generate passport draft, create audit event, calculate initial completeness
    - Show inline validation errors and success toast with link to new asset
    - _Requirements: FR-DI-001, FR-DI-002, FR-DI-014, FR-DI-015_

  - [x] 19.2 Implement CreateAssetPage
    - Create `src/pages/CreateAssetPage.tsx`
    - Page wrapper with heading, DemoDisclaimer, and CreateAssetForm
    - Route guard: only accessible to RIMAC_OPERATOR and ADMIN roles
    - On successful save, navigate to the new asset's detail page
    - Add route `/assets/new` to router configuration
    - _Requirements: FR-DI-001, FR-DI-002_

  - [x] 19.3 Implement CSVImportWizard component
    - Create `src/components/domain/CSVImportWizard.tsx`
    - 6-step wizard: Template → Upload → Validate → Preview → Confirm → Complete
    - Step 1: Show CSV template with example data and copy-to-clipboard button
    - Step 2: Textarea for pasting CSV or simulated file upload; pre-load demo CSV data
    - Step 3: Parse CSV using `csvValidator.ts`, show row-by-row validation status
    - Step 4: DataTable preview with valid/warning/error/duplicate indicators; allow deselecting error rows
    - Step 5: Import summary showing counts; "Import" confirmation button
    - Step 6: Success message with imported asset count and link to registry
    - On import: create assets for valid rows, generate passports, batch audit event
    - _Requirements: FR-DI-003, FR-DI-004, FR-DI-014_

  - [x] 19.4 Implement CSVImportPage
    - Create `src/pages/CSVImportPage.tsx`
    - Page wrapper with heading, DemoDisclaimer, and CSVImportWizard
    - Route guard: only accessible to RIMAC_OPERATOR and ADMIN roles
    - Add route `/import` to router configuration
    - _Requirements: FR-DI-003, FR-DI-004_

  - [ ]* 19.5 Write unit tests for CSV validator
    - Test `parseCSV()` with valid, malformed, and empty input
    - Test `validateCSVRow()` detects missing required fields, invalid capacity, unknown chemistry, duplicates
    - Test `validateCSVImport()` returns correct counts for mixed valid/error/duplicate rows
    - _Requirements: FR-DI-003, FR-DI-004_

- [x] 20. Mock Integrations and Telemetry Simulator
  - [x] 20.1 Implement MockIntegrationPanel component
    - Create `src/components/domain/MockIntegrationPanel.tsx`
    - Display card per integration system (PLM, MES, ERP, QMS, BMS, Document Vault) with icon, description, status badge, last sync time
    - Each card has "Import" button triggering simulated 1-2s loading state
    - On import: populate relevant passport fields from mock data, update completeness score, create audit event
    - Show which fields each system populates and data preview
    - Track import source per field
    - _Requirements: FR-DI-005, FR-DI-010, FR-DI-014_

  - [x] 20.2 Implement MockIntegrationsPage
    - Create `src/pages/MockIntegrationsPage.tsx`
    - Page wrapper with heading, asset selector dropdown, DemoDisclaimer, and MockIntegrationPanel
    - Route guard: RIMAC_OPERATOR, ENT_PLATFORM_OPERATOR, ADMIN
    - Add route `/integrations` to router configuration
    - _Requirements: FR-DI-005_

  - [x] 20.3 Implement TelemetrySimulatorControls component
    - Create `src/components/domain/TelemetrySimulatorControls.tsx`
    - Start/Stop toggle button for telemetry generation (uses setInterval)
    - Scenario selector cards: Normal, Warning, Critical, Degradation with descriptions and color coding
    - Live tick counter and last tick timestamp display
    - Mini cards showing current simulated values (SoC, SoH, Temp, Alarms)
    - "Reset to Healthy" button that clears alarms and restores normal baseline
    - On each tick: generate TelemetryReading per scenario config, push to store, mark source as 'Telemetry Simulator'
    - _Requirements: FR-DI-006, FR-DI-014_

  - [ ]* 20.4 Write property test for telemetry simulator isolation
    - **Property 20: Telemetry Simulator Isolation** — All generated readings have `source: 'Telemetry Simulator'` or `source: 'simulated'`; never presented as real BMS data
    - **Validates: Requirements FR-DI-006**

- [x] 21. Supplier Portal and Compliance Review
  - [x] 21.1 Implement SupplierPortalView component
    - Create `src/components/domain/SupplierPortalView.tsx`
    - Filter obligations by logged-in supplier's organizationId
    - Display table of pending requests with: obligation, component, required evidence, due date, status badge
    - "Submit Declaration" action per obligation opening a form
    - Support structured data entry (key-value fields) or document upload simulation
    - Show approval status, rejection reasons, and change requests
    - On submit: set status to 'under_review' (never auto-approved), create audit event
    - _Requirements: FR-DI-007, FR-DI-014_

  - [x] 21.2 Implement SupplierPortalPage
    - Create `src/pages/SupplierPortalPage.tsx`
    - Page wrapper with supplier-specific heading, obligations summary stats, and SupplierPortalView
    - Route guard: only accessible to SUPPLIER_USER
    - Add route `/supplier` to router configuration
    - _Requirements: FR-DI-007_

  - [x] 21.3 Implement ComplianceReviewPanel component
    - Create `src/components/domain/ComplianceReviewPanel.tsx`
    - List items pending compliance review for selected asset (supplier declarations, documents, passport attributes)
    - Each item shows: title, submitter, submission date, linked evidence, current status
    - Reviewer actions: Approve, Reject, Request Changes — each requires non-empty comment
    - On approve: status → 'approved', linked passport attribute → 'verified', recalculate completeness
    - On reject: status → 'rejected', store rejection reason
    - On request changes: status → 'changes_requested', notify submitter
    - Show review history timeline per item
    - All actions create audit trail events
    - _Requirements: FR-DI-009, FR-DI-014_

  - [x] 21.4 Integrate ComplianceReviewPanel into existing CompliancePage
    - Update `src/pages/CompliancePage.tsx` to conditionally render ComplianceReviewPanel when user role is RIMAC_COMPLIANCE_MANAGER
    - Add review queue count indicator in the page header
    - _Requirements: FR-DI-009_

  - [ ]* 21.5 Write property tests for supplier and compliance review
    - **Property 12: Supplier Data Never Auto-Approved** — Supplier-submitted declarations transition from 'submitted' to 'under_review', never directly to 'approved'
    - **Property 17: Role-Scoped Supplier View** — Supplier users only see obligations linked to their own organizationId
    - **Property 18: Review Action Requires Comment** — All review actions require non-empty comment; empty comments are rejected
    - **Validates: Requirements FR-DI-007, FR-DI-009**

- [x] 22. Checkpoint — Data entry and review workflows
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Document Upload, Lifecycle Events, and Visibility
  - [x] 23.1 Implement DocumentUploadForm component
    - Create `src/components/domain/DocumentUploadForm.tsx`
    - Document type dropdown (EU Declaration of Conformity, Carbon Footprint Report, Recycled Content Declaration, Safety Certificate, Supplier Due Diligence Statement, etc.)
    - Title, description fields
    - Asset linking dropdown
    - Passport attribute linking (multi-select)
    - Visibility classification selector (Public/Restricted/Confidential)
    - Simulated file selection (shows file name, size, MIME type — no actual file processing)
    - On save: create document record, link to asset/passport attributes, set reviewStatus to 'pending_review', create audit event
    - _Requirements: FR-DI-008, FR-DI-014, FR-DI-015_

  - [x] 23.2 Integrate DocumentUploadForm into DocumentVaultPage
    - Update `src/pages/DocumentVaultPage.tsx` with "Upload Document" button that opens DocumentUploadForm in a modal/panel
    - Show upload source on each document in the vault table
    - Accessible to RIMAC_OPERATOR, RIMAC_COMPLIANCE_MANAGER, RIMAC_SERVICE_USER, SUPPLIER_USER
    - _Requirements: FR-DI-008_

  - [x] 23.3 Implement LifecycleEventForm component
    - Create `src/components/domain/LifecycleEventForm.tsx`
    - Event type dropdown grouped by category (Production, Operational, Service, Compliance) including extended types: maintenance_performed, capacity_test, software_update, site_relocation, ownership_transfer
    - Date/time picker for event timestamp
    - Free-text description field
    - Optional document link dropdown (existing documents from vault)
    - Optional key-value metadata fields (add/remove pairs)
    - On save: add event to lifecycle timeline, create audit event
    - Accessible to RIMAC_OPERATOR and RIMAC_SERVICE_USER
    - _Requirements: FR-DI-013, FR-DI-014_

  - [x] 23.4 Integrate LifecycleEventForm into LifecycleTimelinePage
    - Update `src/pages/LifecycleTimelinePage.tsx` with "Add Event" button that opens LifecycleEventForm
    - New events appear at the correct chronological position in the timeline
    - Show event source badge ('manual' for form entries)
    - _Requirements: FR-DI-013_

  - [x] 23.5 Implement VisibilityBadge component
    - Create `src/components/domain/VisibilityBadge.tsx`
    - Compact badge showing visibility level: Public (emerald), Restricted (amber), Confidential (red)
    - Tooltip explaining what each level means
    - Used in CreateAssetForm, DocumentUploadForm, and PassportDetailPage
    - _Requirements: FR-DI-015_

  - [ ]* 23.6 Write property test for visibility classification
    - **Property 16: Visibility Classification Consistency** — Every asset field displayed in the UI has a defined visibility classification; fields without explicit classification default to 'restricted'
    - **Validates: Requirements FR-DI-015**

- [x] 24. Passport Completeness Score and Publish Workflow
  - [x] 24.1 Implement PassportCompletenessCard component
    - Create `src/components/domain/PassportCompletenessCard.tsx`
    - Display overall completeness score as percentage with color-coded gauge
    - Section-by-section breakdown showing completed/total fields per section
    - Trend indicator (improving/stable/declining) based on score history
    - Blockers list showing missing required fields
    - Pending review count
    - Mini trend chart using Recharts (last 5 score snapshots)
    - _Requirements: FR-DI-010_

  - [x] 24.2 Integrate PassportCompletenessCard into PassportDetailPage
    - Update `src/pages/PassportDetailPage.tsx` to show PassportCompletenessCard in the sidebar or header section
    - Score updates reactively when data is imported, reviewed, or approved
    - _Requirements: FR-DI-010_

  - [x] 24.3 Implement PassportPublishWorkflow component
    - Create `src/components/domain/PassportPublishWorkflow.tsx`
    - 4-step workflow: Readiness Check → Preview → Confirm → Published
    - Step 1: Validate required PUBLIC fields populated; show blockers (disable "Next" if any) and warnings
    - Step 2: Render public passport preview showing ONLY public-visibility fields; explicitly hide Restricted/Confidential
    - Step 3: Final confirmation with publisher identity, timestamp, summary of what will be published
    - Step 4: Success state showing QR code, public URL placeholder, audit event reference
    - On publish: update passport status to 'published', create PASSPORT_PUBLISHED audit event, generate PublicPassportData
    - Only accessible to RIMAC_COMPLIANCE_MANAGER
    - _Requirements: FR-DI-011, FR-DI-012, FR-DI-014, FR-DI-015_

  - [x] 24.4 Implement PassportPublishPage
    - Create `src/pages/PassportPublishPage.tsx`
    - Page wrapper with heading, asset info summary, and PassportPublishWorkflow
    - Route guard: only accessible to RIMAC_COMPLIANCE_MANAGER and ADMIN
    - Add route `/assets/:assetId/passport/publish` to router configuration
    - _Requirements: FR-DI-011, FR-DI-012_

  - [ ]* 24.5 Write property tests for completeness score and publishing
    - **Property 13: Public Passport Data Safety** — Published public passport data only contains fields with `visibility === 'public'`; no restricted/confidential fields ever appear
    - **Property 14: Completeness Score Monotonic on Approval** — When a compliance item is approved, the completeness score increases or stays the same, never decreases
    - **Property 19: Publishing Blocked by Incomplete Public Fields** — A passport cannot be published if any required public field has status 'missing'
    - **Validates: Requirements FR-DI-010, FR-DI-011, FR-DI-012, FR-DI-015**

- [x] 25. Checkpoint — All data ingestion features complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 26. Enhanced Audit Trail and Integration Wiring
  - [x] 26.1 Enhance audit trail with data ingestion events
    - Update `src/components/domain/AuditTrailTimeline.tsx` to display new audit action types: ASSET_DRAFT_SAVED, CSV_IMPORT_COMPLETED, MOCK_API_IMPORT, TELEMETRY_SIMULATOR_STARTED/STOPPED, SUPPLIER_DECLARATION_SUBMITTED, COMPLIANCE_REVIEW_APPROVED/REJECTED, PASSPORT_PUBLISHED, LIFECYCLE_EVENT_ADDED, DOCUMENT_LINKED, VISIBILITY_CHANGED, COMPLETENESS_RECALCULATED
    - Add filter options for new action types in AuditTrailPage
    - Display `dataSource`, `affectedFields`, and `scoreImpact` when available on audit events
    - _Requirements: FR-DI-014_

  - [x] 26.2 Wire navigation and sidebar for new pages
    - Update `src/components/layout/Sidebar.tsx` to add new navigation items: "Create Asset" (/assets/new), "Import" (/import), "Integrations" (/integrations), "Supplier Portal" (/supplier)
    - Conditionally show navigation items based on current role permissions
    - Add "Publish" action link in passport detail page header (visible to RIMAC_COMPLIANCE_MANAGER)
    - Update mobile navigation for new routes
    - _Requirements: FR-DI-001, FR-DI-003, FR-DI-005, FR-DI-007, FR-DI-011_

  - [x] 26.3 Wire completeness score recalculation triggers
    - Connect completeness recalculation to: asset creation, CSV import completion, mock API import, supplier declaration approval, document verification, compliance review approval
    - Ensure score history tracks each recalculation with trigger description
    - Display score change notification (toast) when score improves by ≥5 points
    - _Requirements: FR-DI-010, FR-DI-014_

  - [x] 26.4 Add DemoDisclaimer and data source labels to all new pages
    - Ensure all new pages (CreateAssetPage, CSVImportPage, MockIntegrationsPage, SupplierPortalPage, PassportPublishPage) display DemoDisclaimer
    - Add data source badges ("Manual Entry", "CSV Demo Import", "Mock API Import", "Supplier Submission", "Telemetry Simulator") on relevant data displays
    - Mark all demo data with "Synthetic demo data — not externally verified" where appropriate
    - _Requirements: FR-DI-014, NFR-002_

  - [ ]* 26.5 Write property test for audit trail completeness
    - **Property 11: Audit Trail Completeness** — For every user action (create, edit, import, approve, reject, publish), exactly one audit event is created containing: action type, actor, timestamp, entity reference, and data source
    - **Property 15: CSV Import Idempotency Guard** — Importing the same CSV data twice never creates duplicate assets; second import flags existing asset_ids as duplicates
    - **Validates: Requirements FR-DI-014, FR-DI-003**

- [x] 27. Final checkpoint — Data ingestion module complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The stack is React + TypeScript + Vite + Tailwind CSS + shadcn/ui + lucide-react + Recharts + Zustand
- All data is local mock data — no backend integration required
- The design mandates dark theme exclusively (navy backgrounds, premium energy-tech aesthetic)
- Tasks 17-27 cover the Data Ingestion & Demo Data Entry extension (FR-DI-001 through FR-DI-015)
- New store slices: DataIngestionSlice, SupplierSlice, WorkflowSlice
- New roles: RIMAC_OPERATOR, RIMAC_COMPLIANCE_MANAGER, RIMAC_SERVICE_USER, SUPPLIER_USER
- No new external dependencies required (optional: papaparse for CSV, but built-in parser suffices for demo)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "3.1", "3.2"] },
    { "id": 4, "tasks": ["2.3", "3.3", "3.5"] },
    { "id": 5, "tasks": ["3.4", "3.6", "5.1"] },
    { "id": 6, "tasks": ["5.2", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3"] },
    { "id": 8, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5"] },
    { "id": 9, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5"] },
    { "id": 10, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 11, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 12, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 13, "tasks": ["13.1", "13.2", "13.3", "13.4", "13.5", "13.6"] },
    { "id": 14, "tasks": ["15.1", "15.2", "15.3"] },
    { "id": 15, "tasks": ["15.4", "15.5"] },
    { "id": 16, "tasks": ["17.1", "17.2"] },
    { "id": 17, "tasks": ["17.3", "17.5"] },
    { "id": 18, "tasks": ["17.4"] },
    { "id": 19, "tasks": ["19.1", "19.3", "20.1", "20.3"] },
    { "id": 20, "tasks": ["19.2", "19.4", "19.5", "20.2", "20.4"] },
    { "id": 21, "tasks": ["21.1", "21.3", "23.1", "23.3", "23.5"] },
    { "id": 22, "tasks": ["21.2", "21.4", "21.5", "23.2", "23.4", "23.6"] },
    { "id": 23, "tasks": ["24.1", "24.3"] },
    { "id": 24, "tasks": ["24.2", "24.4", "24.5"] },
    { "id": 25, "tasks": ["26.1", "26.2", "26.3", "26.4"] },
    { "id": 26, "tasks": ["26.5"] }
  ]
}
```
