import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { BarChart3, GraduationCap, Loader2, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "oklch(0.28 0.08 255)" }}
        />
        <div
          className="absolute -bottom-48 -left-48 w-[700px] h-[700px] rounded-full opacity-5"
          style={{ background: "oklch(0.78 0.14 75)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1px] opacity-10 rotate-12"
          style={{ background: "oklch(0.28 0.08 255)" }}
        />
      </div>

      {/* Top bar */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.28 0.08 255)" }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground leading-none">
              UIT RGPV Bhopal
            </p>
            <p className="text-sm font-semibold font-display leading-tight">
              Electrical Engineering Department
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="h-1 w-12 rounded-full"
                  style={{ background: "oklch(0.78 0.14 75)" }}
                />
                <span
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "oklch(0.78 0.14 75)" }}
                >
                  Est. 1985
                </span>
              </div>
              <h1 className="text-5xl font-display font-bold leading-tight text-foreground">
                Attendance
                <br />
                <span style={{ color: "oklch(0.28 0.08 255)" }}>
                  Management
                </span>
                <br />
                System
              </h1>
              <p className="text-lg text-muted-foreground mt-4 max-w-md">
                UIT RGPV Bhopal — Electrical Engineering Department. Track,
                manage, and analyze student attendance efficiently.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                {
                  icon: Shield,
                  label: "Secure",
                  sub: "Internet Identity",
                },
                { icon: BarChart3, label: "Analytics", sub: "Live reports" },
                { icon: Zap, label: "Fast", sub: "Real-time sync" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-card"
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "oklch(0.28 0.08 255)" }}
                  />
                  <p className="text-sm font-semibold font-display">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Login card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Sign In
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use your Internet Identity to securely access the portal
                </p>
              </div>

              <div
                className="w-full h-px"
                style={{ background: "oklch(0.88 0.02 240)" }}
              />

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    For Faculty (Admin)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Manage students, subjects, mark attendance, view reports
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    For Students
                  </p>
                  <p className="text-xs text-muted-foreground">
                    View your attendance records and percentage per subject
                  </p>
                </div>
              </div>

              <Button
                className="w-full h-12 text-base font-semibold font-display"
                style={{
                  background: "oklch(0.28 0.08 255)",
                  color: "white",
                }}
                onClick={() => login()}
                disabled={isLoggingIn}
                data-ocid="login.primary_button"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Sign in with Internet Identity
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Powered by Internet Computer Protocol (ICP)
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-4 text-center">
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
  );
}
