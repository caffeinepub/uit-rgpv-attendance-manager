import type { Student } from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  useAddStudent,
  useDeleteStudent,
  useStudents,
  useUpdateStudent,
} from "@/hooks/useQueries";
import { Edit2, Loader2, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface StudentFormData {
  name: string;
  enrollmentNumber: string;
  semester: string;
  section: string;
  email: string;
}

const emptyForm: StudentFormData = {
  name: "",
  enrollmentNumber: "",
  semester: "1",
  section: "A",
  email: "",
};

export default function StudentsPage() {
  const { data: students, isLoading } = useStudents();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState("all");
  const [filterSection, setFilterSection] = useState("all");

  const openAdd = () => {
    setEditingStudent(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({
      name: s.name,
      enrollmentNumber: s.enrollmentNumber,
      semester: s.semester.toString(),
      section: s.section,
      email: s.email,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.enrollmentNumber || !form.email) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({
          id: editingStudent.id,
          name: form.name,
          enrollmentNumber: form.enrollmentNumber,
          semester: BigInt(form.semester),
          section: form.section,
          email: form.email,
        });
        toast.success("Student updated successfully");
      } else {
        await addStudent.mutateAsync({
          name: form.name,
          enrollmentNumber: form.enrollmentNumber,
          semester: BigInt(form.semester),
          section: form.section,
          email: form.email,
        });
        toast.success("Student added successfully");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      toast.success("Student deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const filtered = (students ?? []).filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchSem =
      filterSemester === "all" || s.semester.toString() === filterSemester;
    const matchSection = filterSection === "all" || s.section === filterSection;
    return matchSearch && matchSem && matchSection;
  });

  const semesters = [
    ...new Set((students ?? []).map((s) => s.semester.toString())),
  ].sort();
  const sections = [...new Set((students ?? []).map((s) => s.section))].sort();

  const isPending = addStudent.isPending || updateStudent.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Students
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {students?.length ?? 0} enrolled students
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="students.add_button"
          style={{ background: "oklch(0.28 0.08 255)", color: "white" }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="students.search_input"
          />
        </div>
        <Select value={filterSemester} onValueChange={setFilterSemester}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s} value={s}>
                Semester {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSection} onValueChange={setFilterSection}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s} value={s}>
                Section {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table data-ocid="students.table">
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Enrollment No.</TableHead>
              <TableHead className="font-semibold">Semester</TableHead>
              <TableHead className="font-semibold">Section</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, i) => `skel-row-${i}`).map(
                (key, i) => (
                  <TableRow key={key}>
                    {Array.from(
                      { length: 6 },
                      (__, j) => `skel-cell-${i}-${j}`,
                    ).map((ckey) => (
                      <TableCell key={ckey}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div
                    className="flex flex-col items-center gap-2 text-muted-foreground"
                    data-ocid="students.empty_state"
                  >
                    <UserPlus className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      {search ||
                      filterSemester !== "all" ||
                      filterSection !== "all"
                        ? "No students match your filters"
                        : "No students yet. Add the first one!"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student, idx) => (
                <motion.tr
                  key={student.id.toString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  data-ocid={`students.item.${idx + 1}`}
                  className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                >
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.enrollmentNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      Sem {student.semester.toString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.section}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(student)}
                        data-ocid={`students.edit_button.${idx + 1}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(student.id)}
                        data-ocid={`students.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]" data-ocid="students.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-name">Full Name *</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Rahul Sharma"
                data-ocid="students.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-enrollment">Enrollment Number *</Label>
              <Input
                id="s-enrollment"
                value={form.enrollmentNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    enrollmentNumber: e.target.value,
                  }))
                }
                placeholder="e.g. 0827EE211001"
                data-ocid="students.enrollment_input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Semester *</Label>
                <Select
                  value={form.semester}
                  onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}
                >
                  <SelectTrigger data-ocid="students.semester_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Section *</Label>
                <Select
                  value={form.section}
                  onValueChange={(v) => setForm((f) => ({ ...f, section: v }))}
                >
                  <SelectTrigger data-ocid="students.section_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A", "B", "C", "D"].map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        Section {sec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Email Address *</Label>
              <Input
                id="s-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="student@uit.edu"
                data-ocid="students.email_input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="students.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              data-ocid="students.submit_button"
              style={{ background: "oklch(0.28 0.08 255)", color: "white" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingStudent ? (
                "Update Student"
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the student and all associated
              attendance records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteId(null)}
              data-ocid="students.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteStudent.isPending}
              data-ocid="students.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteStudent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
