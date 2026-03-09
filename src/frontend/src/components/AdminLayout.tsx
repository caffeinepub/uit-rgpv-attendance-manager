import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/subjects", label: "Subjects", icon: BookOpen },
  {
    to: "/admin/mark-attendance",
    label: "Mark Attendance",
    icon: ClipboardCheck,
  },
  { to: "/admin/records", label: "Records", icon: FileText },
  { to: "/admin/summary", label: "Summary", icon: BarChart2 },
];

const navOcids: Record<string, string> = {
  "/admin": "nav.dashboard_link",
  "/admin/students": "nav.students_link",
  "/admin/subjects": "nav.subjects_link",
  "/admin/mark-attendance": "nav.attendance_link",
  "/admin/records": "nav.records_link",
  "/admin/summary": "nav.summary_link",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string, exact?: boolean) => {
    if (exact) return currentPath === to;
    return currentPath.startsWith(to);
  };

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 12)}...`
    : "";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30">
        <div
          className="flex flex-col h-full"
          style={{ background: "oklch(0.18 0.06 255)" }}
        >
          {/* Logo */}
          <div className="px-5 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(0.78 0.14 75)" }}
              >
                <GraduationCap className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-sidebar-foreground/60 leading-none">
                  UIT RGPV Bhopal
                </p>
                <p className="text-sm font-display font-semibold text-sidebar-foreground leading-tight">
                  Electrical Dept.
                </p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  data-ocid={navOcids[item.to]}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + logout */}
          <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
            <div className="px-3 py-2">
              <p className="text-xs text-sidebar-foreground/40 truncate">
                Admin
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate font-mono">
                {principalShort}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={() => clear()}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
              style={{ background: "oklch(0.18 0.06 255)" }}
            >
              <div className="flex flex-col h-full">
                <div className="px-5 py-5 border-b border-sidebar-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "oklch(0.78 0.14 75)" }}
                    >
                      <GraduationCap className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-sidebar-foreground/60">
                        UIT RGPV Bhopal
                      </p>
                      <p className="text-sm font-display font-semibold text-sidebar-foreground">
                        Electrical Dept.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-sidebar-foreground/70"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                  {navItems.map((item) => {
                    const active = isActive(item.to, item.exact);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        data-ocid={navOcids[item.to]}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="px-3 py-4 border-t border-sidebar-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    onClick={() => clear()}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 lg:px-6 h-14">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden lg:block">
                <p className="text-sm font-display font-semibold text-foreground">
                  Attendance Management Portal
                </p>
                <p className="text-xs text-muted-foreground">
                  UIT RGPV Bhopal — Electrical Engineering
                </p>
              </div>
              <div className="lg:hidden">
                <p className="text-sm font-display font-semibold">
                  UIT EE Dept.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                {principalShort}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clear()}
                className="text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
