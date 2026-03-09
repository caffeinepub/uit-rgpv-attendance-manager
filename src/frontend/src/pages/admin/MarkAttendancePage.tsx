import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  useMarkAttendance,
  useStudents,
  useSubjects,
} from "@/hooks/useQueries";
import { CalendarDays, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function MarkAttendancePage() {
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();
  const { data: students, isLoading: loadingStudents } = useStudents();
  const markAttendance = useMarkAttendance();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>(
    {},
  );
  const [loaded, setLoaded] = useState(false);

  const selectedSubject = subjects?.find(
    (s) => s.id.toString() === selectedSubjectId,
  );

  // Filter students by subject semester
  const filteredStudents = students?.filter(
    (s) =>
      selectedSubject &&
      s.semester.toString() === selectedSubject.semester.toString(),
  );

  const handleLoad = () => {
    if (!selectedSubjectId || !selectedDate) {
      toast.error("Please select a subject and date");
      return;
    }
    if (!filteredStudents || filteredStudents.length === 0) {
      toast.error("No students found for this subject's semester");
      return;
    }
    // Initialize all as present
    const map = Object.fromEntries(
      filteredStudents.map((s) => [s.id.toString(), true]),
    );
    setAttendanceMap(map);
    setLoaded(true);
  };

  const handleToggle = (studentId: string, present: boolean) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: present }));
  };

  const handleMarkAll = (present: boolean) => {
    const map = Object.fromEntries(
      (filteredStudents ?? []).map((s) => [s.id.toString(), present]),
    );
    setAttendanceMap(map);
  };

  const handleSubmit = async () => {
    if (!selectedSubjectId || !selectedDate || !loaded) return;
    const attendanceList: Array<[bigint, boolean]> = Object.entries(
      attendanceMap,
    ).map(([id, present]) => [BigInt(id), present]);

    try {
      await markAttendance.mutateAsync({
        subjectId: BigInt(selectedSubjectId),
        date: selectedDate,
        attendanceList,
      });
      toast.success("Attendance marked successfully!");
      setLoaded(false);
      setAttendanceMap({});
    } catch {
      toast.error("Failed to mark attendance. Please try again.");
    }
  };

  const presentCount = Object.values(attendanceMap).filter(Boolean).length;
  const totalCount = filteredStudents?.length ?? 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Mark Attendance
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select a subject and date, then record attendance for each student
        </p>
      </div>

      {/* Selection panel */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Session Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              {loadingSubjects ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={selectedSubjectId}
                  onValueChange={(v) => {
                    setSelectedSubjectId(v);
                    setLoaded(false);
                    setAttendanceMap({});
                  }}
                >
                  <SelectTrigger data-ocid="attendance.subject_select">
                    <SelectValue placeholder="Select subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjects ?? []).map((subj) => (
                      <SelectItem
                        key={subj.id.toString()}
                        value={subj.id.toString()}
                      >
                        {subj.name} ({subj.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="att-date">Date *</Label>
              <input
                id="att-date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setLoaded(false);
                  setAttendanceMap({});
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                data-ocid="attendance.date_input"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleLoad}
                disabled={
                  !selectedSubjectId || !selectedDate || loadingStudents
                }
                className="w-full"
                variant="secondary"
                data-ocid="attendance.load_button"
              >
                {loadingStudents ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load Students"
                )}
              </Button>
            </div>
          </div>

          {selectedSubject && (
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <Badge variant="secondary">
                Semester {selectedSubject.semester.toString()}
              </Badge>
              <Badge variant="outline">{selectedSubject.code}</Badge>
              {filteredStudents && (
                <span className="text-xs text-muted-foreground">
                  {filteredStudents.length} students in this semester
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance list */}
      {loaded && filteredStudents && filteredStudents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className="w-4 h-4"
                  style={{ color: "oklch(0.55 0.16 145)" }}
                />
                <span className="text-sm font-medium">
                  {presentCount} Present
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">
                  {totalCount - presentCount} Absent
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll(true)}
              >
                Mark All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll(false)}
              >
                Mark All Absent
              </Button>
            </div>
          </div>

          {/* Student list */}
          <div className="rounded-xl border border-border overflow-hidden bg-card divide-y divide-border">
            {filteredStudents.map((student, idx) => {
              const isPresent = attendanceMap[student.id.toString()] ?? true;
              return (
                <div
                  key={student.id.toString()}
                  data-ocid={`attendance.item.${idx + 1}`}
                  className={`flex items-center justify-between px-4 py-3 transition-colors ${
                    isPresent ? "" : "bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        background: isPresent
                          ? "oklch(0.55 0.16 145)"
                          : "oklch(0.577 0.245 27.325)",
                      }}
                    >
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {student.enrollmentNumber} · Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: isPresent
                          ? "oklch(0.45 0.14 145)"
                          : "oklch(0.55 0.18 27.325)",
                      }}
                    >
                      {isPresent ? "Present" : "Absent"}
                    </span>
                    <Switch
                      checked={isPresent}
                      onCheckedChange={(v) =>
                        handleToggle(student.id.toString(), v)
                      }
                      data-ocid={`attendance.toggle.${idx + 1}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={markAttendance.isPending}
              data-ocid="attendance.submit_button"
              size="lg"
              className="font-semibold font-display gap-2"
              style={{ background: "oklch(0.28 0.08 255)", color: "white" }}
            >
              {markAttendance.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Attendance ({presentCount}/{totalCount})
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {loaded && (!filteredStudents || filteredStudents.length === 0) && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">
            No students found for Semester{" "}
            {selectedSubject?.semester.toString()}. Add students first.
          </p>
        </div>
      )}
    </div>
  );
}
