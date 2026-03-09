import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAttendanceSummary,
  useStudents,
  useSubjects,
} from "@/hooks/useQueries";
import { AlertTriangle, BarChart2 } from "lucide-react";

export default function SummaryPage() {
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const { data: summary, isLoading: loadingSummary } = useAttendanceSummary();

  const isLoading = loadingStudents || loadingSubjects || loadingSummary;

  const getAttendancePct = (
    studentId: bigint,
    subjectId: bigint,
  ): number | null => {
    const record = summary?.find(
      (s) =>
        s.studentId.toString() === studentId.toString() &&
        s.subjectId.toString() === subjectId.toString(),
    );
    if (!record) return null;
    if (Number(record.totalSessions) === 0) return null;
    return Math.round(
      (Number(record.presentCount) / Number(record.totalSessions)) * 100,
    );
  };

  const lowAttendanceCount =
    summary?.filter((s) => {
      const pct =
        Number(s.totalSessions) > 0
          ? (Number(s.presentCount) / Number(s.totalSessions)) * 100
          : 0;
      return pct < 75;
    }).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Attendance Summary
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of student attendance across all subjects
          </p>
        </div>
        {lowAttendanceCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              {lowAttendanceCount} case{lowAttendanceCount !== 1 ? "s" : ""}{" "}
              below 75%
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: "oklch(0.55 0.16 145 / 0.2)" }}
          />
          <span>≥ 75% (Good)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ background: "oklch(0.577 0.245 27.325 / 0.15)" }}
          />
          <span>{"< 75% (Warning)"}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <span>No data</span>
        </div>
      </div>

      {/* Scrollable table */}
      <div className="rounded-xl border border-border overflow-auto bg-card">
        <Table data-ocid="summary.table">
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="font-semibold sticky left-0 bg-secondary/30 z-10 min-w-[200px]">
                Student
              </TableHead>
              <TableHead className="font-semibold sticky left-[200px] bg-secondary/30 z-10 min-w-[120px]">
                Enrollment
              </TableHead>
              {isLoading ? (
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ) : (
                (subjects ?? []).map((subj) => (
                  <TableHead
                    key={subj.id.toString()}
                    className="font-semibold min-w-[100px] text-center"
                  >
                    <div>
                      <p className="text-xs">{subj.code}</p>
                      <p className="text-[11px] text-muted-foreground font-normal truncate max-w-[100px]">
                        {subj.name}
                      </p>
                    </div>
                  </TableHead>
                ))
              )}
              <TableHead className="font-semibold min-w-[80px] text-center">
                Overall
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => `skel-row-${i}`).map(
                (key, i) => (
                  <TableRow key={key}>
                    {Array.from(
                      { length: (subjects?.length ?? 3) + 3 },
                      (__, j) => `skel-cell-${i}-${j}`,
                    ).map((ckey) => (
                      <TableCell key={ckey}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : !students || students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={(subjects?.length ?? 0) + 3}
                  className="text-center py-12"
                >
                  <div
                    className="flex flex-col items-center gap-2 text-muted-foreground"
                    data-ocid="summary.empty_state"
                  >
                    <BarChart2 className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      No data yet. Add students and mark attendance first.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (students ?? []).map((student, sIdx) => {
                const subjectPcts = (subjects ?? []).map((subj) =>
                  getAttendancePct(student.id, subj.id),
                );
                const validPcts = subjectPcts.filter(
                  (p): p is number => p !== null,
                );
                const overallPct =
                  validPcts.length > 0
                    ? Math.round(
                        validPcts.reduce((a, b) => a + b, 0) / validPcts.length,
                      )
                    : null;

                return (
                  <TableRow
                    key={student.id.toString()}
                    data-ocid={`summary.item.${sIdx + 1}`}
                    className="border-b border-border last:border-0 hover:bg-secondary/10"
                  >
                    <TableCell
                      className="font-medium sticky left-0 bg-card z-10"
                      style={{
                        background:
                          overallPct !== null && overallPct < 75
                            ? "oklch(0.577 0.245 27.325 / 0.04)"
                            : undefined,
                      }}
                    >
                      <div>
                        <p className="text-sm">{student.name}</p>
                        <div className="flex gap-1 mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0"
                          >
                            Sem {student.semester.toString()}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] py-0">
                            {student.section}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-mono text-sm sticky left-[200px] bg-card z-10 text-muted-foreground"
                      style={{
                        background:
                          overallPct !== null && overallPct < 75
                            ? "oklch(0.577 0.245 27.325 / 0.04)"
                            : undefined,
                      }}
                    >
                      {student.enrollmentNumber}
                    </TableCell>

                    {(subjects ?? []).map((subj, subjIdx) => {
                      const pct = subjectPcts[subjIdx];
                      const isLow = pct !== null && pct < 75;
                      return (
                        <TableCell
                          key={subj.id.toString()}
                          className="text-center"
                          style={{
                            background: isLow
                              ? "oklch(0.577 0.245 27.325 / 0.08)"
                              : pct !== null
                                ? "oklch(0.55 0.16 145 / 0.06)"
                                : undefined,
                          }}
                        >
                          {pct === null ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : (
                            <span
                              className="text-sm font-bold font-display"
                              style={{
                                color: isLow
                                  ? "oklch(0.45 0.18 27.325)"
                                  : "oklch(0.45 0.14 145)",
                              }}
                            >
                              {pct}%
                            </span>
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell className="text-center">
                      {overallPct === null ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Badge
                          className={`text-xs font-bold font-display ${
                            overallPct < 75
                              ? "bg-destructive/10 text-destructive border-0"
                              : "bg-success/10 text-success border-0"
                          }`}
                        >
                          {overallPct}%
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
    </div>
  );
}
