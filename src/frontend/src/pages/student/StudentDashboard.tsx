import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useMyAttendanceSummary,
  useRegisterPrincipal,
  useSubjects,
} from "@/hooks/useQueries";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  LogOut,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { clear, identity } = useInternetIdentity();
  const {
    data: mySummary,
    isLoading: loadingSummary,
    refetch,
  } = useMyAttendanceSummary();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const registerPrincipal = useRegisterPrincipal();

  const [enrollmentInput, setEnrollmentInput] = useState("");

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 12)}...`
    : "";

  const isRegistered = mySummary && mySummary.length > 0;

  const getSubjectName = (id: bigint) =>
    subjects?.find((s) => s.id.toString() === id.toString())?.name ?? "Unknown";
  const getSubjectCode = (id: bigint) =>
    subjects?.find((s) => s.id.toString() === id.toString())?.code ?? "—";

  const handleRegister = async () => {
    if (!enrollmentInput.trim()) {
      toast.error("Please enter your enrollment number");
      return;
    }
    try {
      await registerPrincipal.mutateAsync(enrollmentInput.trim());
      toast.success("Registration successful!");
      setEnrollmentInput("");
      refetch();
    } catch {
      toast.error("Registration failed. Please check your enrollment number.");
    }
  };

  const summaryWithPct = (mySummary ?? []).map((s) => ({
    ...s,
    pct:
      Number(s.totalSessions) > 0
        ? Math.round((Number(s.presentCount) / Number(s.totalSessions)) * 100)
        : 0,
  }));

  const overallPct =
    summaryWithPct.length > 0
      ? Math.round(
          summaryWithPct.reduce((a, b) => a + b.pct, 0) / summaryWithPct.length,
        )
      : 0;

  const lowSubjects = summaryWithPct.filter((s) => s.pct < 75);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.28 0.08 255)" }}
            >
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-muted-foreground leading-none">
                UIT RGPV Bhopal
              </p>
              <p className="text-sm font-display font-semibold leading-tight">
                Electrical Engineering
              </p>
            </div>
            <p className="sm:hidden text-sm font-display font-semibold">
              UIT EE Dept.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground font-mono">
              {principalShort}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clear()}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            My Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your attendance records for the current semester
          </p>
        </div>

        {/* Registration flow */}
        {!loadingSummary && !isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border max-w-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display">
                  Register Your Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your enrollment number to link your account and view
                  attendance records.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="enrollment">Enrollment Number</Label>
                  <Input
                    id="enrollment"
                    value={enrollmentInput}
                    onChange={(e) => setEnrollmentInput(e.target.value)}
                    placeholder="e.g. 0827EE211001"
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    data-ocid="student.register_input"
                  />
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={registerPrincipal.isPending}
                  className="w-full font-semibold"
                  data-ocid="student.register_button"
                  style={{ background: "oklch(0.28 0.08 255)", color: "white" }}
                >
                  {registerPrincipal.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Summary cards */}
        {isRegistered && (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-border">
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Overall Attendance
                  </p>
                  <p
                    className="text-3xl font-display font-bold mt-1"
                    style={{
                      color:
                        overallPct >= 75
                          ? "oklch(0.45 0.14 145)"
                          : "oklch(0.45 0.18 27.325)",
                    }}
                  >
                    {overallPct}%
                  </p>
                  <Progress value={overallPct} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Subjects Tracked
                  </p>
                  <p
                    className="text-3xl font-display font-bold mt-1"
                    style={{ color: "oklch(0.28 0.08 255)" }}
                  >
                    {summaryWithPct.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Below 75%
                  </p>
                  <p
                    className="text-3xl font-display font-bold mt-1"
                    style={{
                      color:
                        lowSubjects.length === 0
                          ? "oklch(0.45 0.14 145)"
                          : "oklch(0.45 0.18 27.325)",
                    }}
                  >
                    {lowSubjects.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Low attendance warning */}
            {lowSubjects.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    Low Attendance Warning
                  </p>
                  <p className="text-xs text-destructive/80 mt-0.5">
                    You have {lowSubjects.length} subject
                    {lowSubjects.length !== 1 ? "s" : ""} below 75%.
                    Insufficient attendance may result in being barred from
                    exams.
                  </p>
                </div>
              </div>
            )}

            {/* Attendance table */}
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <Table data-ocid="student.summary_table">
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="font-semibold text-center">
                      Classes Held
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Attended
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Attendance %
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSummary || loadingSubjects ? (
                    Array.from({ length: 5 }, (_, i) => `skel-row-${i}`).map(
                      (key, i) => (
                        <TableRow key={key}>
                          {Array.from(
                            { length: 5 },
                            (__, j) => `skel-cell-${i}-${j}`,
                          ).map((ckey) => (
                            <TableCell key={ckey}>
                              <Skeleton className="h-4 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ),
                    )
                  ) : summaryWithPct.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <BookOpen className="w-8 h-8 opacity-40" />
                          <p className="text-sm">
                            No attendance records yet. Contact your faculty.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    summaryWithPct.map((s, idx) => {
                      const isLow = s.pct < 75;
                      return (
                        <TableRow
                          key={s.subjectId.toString()}
                          data-ocid={`student.summary_item.${idx + 1}`}
                          className={`border-b border-border last:border-0 ${
                            isLow ? "bg-destructive/5" : ""
                          }`}
                        >
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {getSubjectName(s.subjectId)}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {getSubjectCode(s.subjectId)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm">
                            {s.totalSessions.toString()}
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm">
                            {s.presentCount.toString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="space-y-1">
                              <p
                                className="text-sm font-bold font-display"
                                style={{
                                  color: isLow
                                    ? "oklch(0.45 0.18 27.325)"
                                    : "oklch(0.45 0.14 145)",
                                }}
                              >
                                {s.pct}%
                              </p>
                              <Progress
                                value={s.pct}
                                className="h-1.5 max-w-[80px] mx-auto"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {isLow ? (
                              <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Low
                              </Badge>
                            ) : (
                              <Badge className="bg-success/10 text-success border-0 gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Good
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {loadingSummary && (
          <div
            className="flex flex-col items-center gap-3 py-12"
            data-ocid="student.loading_state"
          >
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "oklch(0.28 0.08 255)" }}
            />
            <p className="text-sm text-muted-foreground">
              Loading your attendance...
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
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
