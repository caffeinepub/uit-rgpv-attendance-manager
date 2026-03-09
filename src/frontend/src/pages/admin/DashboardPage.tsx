import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/useQueries";
import { useSubjects } from "@/hooks/useQueries";
import { useAttendanceSummary } from "@/hooks/useQueries";
import { BookOpen, ClipboardCheck, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";

export default function DashboardPage() {
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const { data: summary, isLoading: loadingSummary } = useAttendanceSummary();

  const totalStudents = students?.length ?? 0;
  const totalSubjects = subjects?.length ?? 0;

  // Count unique sessions (unique subject+date combos in summary)
  const totalRecords = summary?.length ?? 0;

  // Compute avg attendance %
  const avgAttendance =
    summary && summary.length > 0
      ? Math.round(
          (summary.reduce((acc, s) => {
            const pct =
              Number(s.totalSessions) > 0
                ? (Number(s.presentCount) / Number(s.totalSessions)) * 100
                : 0;
            return acc + pct;
          }, 0) /
            summary.length) *
            10,
        ) / 10
      : 0;

  const cards = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "oklch(0.28 0.08 255)",
      loading: loadingStudents,
    },
    {
      label: "Total Subjects",
      value: totalSubjects,
      icon: BookOpen,
      color: "oklch(0.78 0.14 75)",
      loading: loadingSubjects,
    },
    {
      label: "Attendance Records",
      value: totalRecords,
      icon: ClipboardCheck,
      color: "oklch(0.55 0.16 145)",
      loading: loadingSummary,
    },
    {
      label: "Avg. Attendance",
      value: `${avgAttendance}%`,
      icon: TrendingUp,
      color:
        avgAttendance >= 75
          ? "oklch(0.55 0.16 145)"
          : "oklch(0.577 0.245 27.325)",
      loading: loadingSummary,
    },
  ];

  // Recent sessions — unique subjects that have summary records
  const recentSubjectIds = summary
    ? [...new Set(summary.map((s) => s.subjectId.toString()))].slice(0, 5)
    : [];
  const recentSubjects = subjects?.filter((s) =>
    recentSubjectIds.includes(s.id.toString()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          UIT RGPV Bhopal — Electrical Engineering Department
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          >
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {card.label}
                    </p>
                    {card.loading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p
                        className="text-3xl font-display font-bold"
                        style={{ color: card.color }}
                      >
                        {card.value}
                      </p>
                    )}
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${card.color}22` }}
                  >
                    <card.icon
                      className="w-5 h-5"
                      style={{ color: card.color }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Subjects with Attendance Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary || loadingSubjects ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentSubjects && recentSubjects.length > 0 ? (
              <div className="space-y-2">
                {recentSubjects.map((subj) => {
                  const subSummary = summary?.filter(
                    (s) => s.subjectId.toString() === subj.id.toString(),
                  );
                  const avgPct =
                    subSummary && subSummary.length > 0
                      ? Math.round(
                          subSummary.reduce((acc, s) => {
                            return (
                              acc +
                              (Number(s.totalSessions) > 0
                                ? (Number(s.presentCount) /
                                    Number(s.totalSessions)) *
                                  100
                                : 0)
                            );
                          }, 0) / subSummary.length,
                        )
                      : 0;

                  return (
                    <div
                      key={subj.id.toString()}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{subj.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subj.code} · Sem {subj.semester.toString()}
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold font-display"
                        style={{
                          color:
                            avgPct >= 75
                              ? "oklch(0.45 0.14 145)"
                              : "oklch(0.55 0.18 27.325)",
                        }}
                      >
                        {avgPct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No attendance data yet. Start by marking attendance.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Quick Stats by Semester
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStudents ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : students && students.length > 0 ? (
              <div className="space-y-2">
                {[...new Set(students.map((s) => Number(s.semester)))]
                  .sort((a, b) => a - b)
                  .map((sem) => {
                    const count = students.filter(
                      (s) => Number(s.semester) === sem,
                    ).length;
                    const sections = [
                      ...new Set(
                        students
                          .filter((s) => Number(s.semester) === sem)
                          .map((s) => s.section),
                      ),
                    ];
                    return (
                      <div
                        key={sem}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="text-sm font-medium">Semester {sem}</p>
                          <p className="text-xs text-muted-foreground">
                            Sections: {sections.join(", ") || "—"}
                          </p>
                        </div>
                        <span
                          className="text-sm font-bold font-display"
                          style={{ color: "oklch(0.28 0.08 255)" }}
                        >
                          {count} students
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No students enrolled yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
