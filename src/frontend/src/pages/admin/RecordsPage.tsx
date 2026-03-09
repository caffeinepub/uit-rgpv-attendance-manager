import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useAttendanceByStudent,
  useAttendanceBySubject,
  useStudents,
  useSubjects,
} from "@/hooks/useQueries";
import { CheckCircle2, FileText, XCircle } from "lucide-react";
import { useState } from "react";

export default function RecordsPage() {
  const { data: students, isLoading: loadingStudents } = useStudents();
  const { data: subjects, isLoading: loadingSubjects } = useSubjects();

  const [filterStudentId, setFilterStudentId] = useState<string>("none");
  const [filterSubjectId, setFilterSubjectId] = useState<string>("none");

  const studentId = filterStudentId !== "none" ? BigInt(filterStudentId) : null;
  const subjectId = filterSubjectId !== "none" ? BigInt(filterSubjectId) : null;

  const { data: byStudent, isLoading: loadingByStudent } =
    useAttendanceByStudent(studentId);
  const { data: bySubject, isLoading: loadingBySubject } =
    useAttendanceBySubject(subjectId);

  // Determine which data to show
  const records =
    filterStudentId !== "none"
      ? (byStudent ?? [])
      : filterSubjectId !== "none"
        ? (bySubject ?? [])
        : [];

  const isLoading = loadingByStudent || loadingBySubject;
  const hasFilter = filterStudentId !== "none" || filterSubjectId !== "none";

  const getStudentName = (id: bigint) =>
    students?.find((s) => s.id.toString() === id.toString())?.name ?? "Unknown";
  const getSubjectName = (id: bigint) =>
    subjects?.find((s) => s.id.toString() === id.toString())?.name ?? "Unknown";
  const getSubjectCode = (id: bigint) =>
    subjects?.find((s) => s.id.toString() === id.toString())?.code ?? "—";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Attendance Records
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Filter by student or subject to view detailed attendance
        </p>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="space-y-1.5">
          <Label>Filter by Student</Label>
          {loadingStudents ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={filterStudentId}
              onValueChange={(v) => {
                setFilterStudentId(v);
                if (v !== "none") setFilterSubjectId("none");
              }}
            >
              <SelectTrigger data-ocid="records.student_select">
                <SelectValue placeholder="Select student..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— All Students —</SelectItem>
                {(students ?? []).map((s) => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.name} ({s.enrollmentNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Filter by Subject</Label>
          {loadingSubjects ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={filterSubjectId}
              onValueChange={(v) => {
                setFilterSubjectId(v);
                if (v !== "none") setFilterStudentId("none");
              }}
            >
              <SelectTrigger data-ocid="records.subject_select">
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— All Subjects —</SelectItem>
                {(subjects ?? []).map((s) => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table data-ocid="records.table">
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Student</TableHead>
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasFilter ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      Select a student or subject to view records
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }, (_, i) => `skel-row-${i}`).map(
                (key, i) => (
                  <TableRow key={key}>
                    {Array.from(
                      { length: 4 },
                      (__, j) => `skel-cell-${i}-${j}`,
                    ).map((ckey) => (
                      <TableCell key={ckey}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div
                    className="flex flex-col items-center gap-2 text-muted-foreground"
                    data-ocid="records.empty_state"
                  >
                    <FileText className="w-8 h-8 opacity-40" />
                    <p className="text-sm">No records found for this filter</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              [...records]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record, idx) => (
                  <TableRow
                    key={record.id.toString()}
                    data-ocid={`records.item.${idx + 1}`}
                    className={`border-b border-border last:border-0 ${
                      record.isPresent ? "" : "bg-destructive/5"
                    }`}
                  >
                    <TableCell className="font-mono text-sm">
                      {record.date}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getStudentName(record.studentId)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {getSubjectName(record.subjectId)}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {getSubjectCode(record.subjectId)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.isPresent ? (
                        <Badge className="bg-success/10 text-success border-0 gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Present
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="bg-destructive/10 text-destructive border-0 gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {hasFilter && records.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {records.length} record{records.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
