import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useCallerRole, useIsAdmin } from "@/hooks/useQueries";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { GraduationCap, Loader2 } from "lucide-react";

import AdminLayout from "@/components/AdminLayout";
// Pages
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import MarkAttendancePage from "@/pages/admin/MarkAttendancePage";
import RecordsPage from "@/pages/admin/RecordsPage";
import StudentsPage from "@/pages/admin/StudentsPage";
import SubjectsPage from "@/pages/admin/SubjectsPage";
import SummaryPage from "@/pages/admin/SummaryPage";
import StudentDashboard from "@/pages/student/StudentDashboard";

// ── Root route ────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

// ── Auth gate ─────────────────────────────────────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: loadingAdmin } = useIsAdmin();
  const { isLoading: loadingRole } = useCallerRole();

  if (isInitializing || loadingAdmin || loadingRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "oklch(0.28 0.08 255)" }}
        >
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(0.28 0.08 255)" }}
        />
        <p className="text-sm text-muted-foreground">Loading portal...</p>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  // Non-admin logged in -> student dashboard
  return <StudentDashboard />;
}

// ── Admin wrapper ─────────────────────────────────────────────────────────────

function AdminWrapper({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();

  if (!identity || !isAdmin) {
    return <StudentDashboard />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// ── Routes ────────────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <DashboardPage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <DashboardPage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const studentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/students",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <StudentsPage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const subjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/subjects",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <SubjectsPage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const markAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/mark-attendance",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <MarkAttendancePage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const recordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/records",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <RecordsPage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const summaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/summary",
  component: () => (
    <AuthGate>
      <AdminWrapper>
        <SummaryPage />
      </AdminWrapper>
    </AuthGate>
  ),
});

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/student",
  component: () => (
    <AuthGate>
      <StudentDashboard />
    </AuthGate>
  ),
});

// ── Router ────────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  studentsRoute,
  subjectsRoute,
  markAttendanceRoute,
  recordsRoute,
  summaryRoute,
  studentRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
