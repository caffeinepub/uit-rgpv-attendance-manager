import type { Subject } from "@/backend.d";
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
  useAddSubject,
  useDeleteSubject,
  useSubjects,
  useUpdateSubject,
} from "@/hooks/useQueries";
import { BookOpen, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface SubjectFormData {
  name: string;
  code: string;
  semester: string;
}

const emptyForm: SubjectFormData = { name: "", code: "", semester: "1" };

export default function SubjectsPage() {
  const { data: subjects, isLoading } = useSubjects();
  const addSubject = useAddSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<SubjectFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const openAdd = () => {
    setEditingSubject(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingSubject(s);
    setForm({ name: s.name, code: s.code, semester: s.semester.toString() });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          name: form.name,
          code: form.code,
          semester: BigInt(form.semester),
        });
        toast.success("Subject updated");
      } else {
        await addSubject.mutateAsync({
          name: form.name,
          code: form.code,
          semester: BigInt(form.semester),
        });
        toast.success("Subject added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSubject.mutateAsync(deleteId);
      toast.success("Subject deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete subject");
    }
  };

  const isPending = addSubject.isPending || updateSubject.isPending;

  // Group by semester
  const bySemester = (subjects ?? []).reduce(
    (acc, subj) => {
      const sem = subj.semester.toString();
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(subj);
      return acc;
    },
    {} as Record<string, Subject[]>,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Subjects
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subjects?.length ?? 0} subjects configured
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="subjects.add_button"
          style={{ background: "oklch(0.28 0.08 255)", color: "white" }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30 hover:bg-secondary/30">
              <TableHead className="font-semibold">Subject Name</TableHead>
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Semester</TableHead>
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
            ) : !subjects || subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div
                    className="flex flex-col items-center gap-2 text-muted-foreground"
                    data-ocid="subjects.empty_state"
                  >
                    <BookOpen className="w-8 h-8 opacity-40" />
                    <p className="text-sm">
                      No subjects yet. Add the first one!
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(bySemester)
                .sort(([a], [b]) => Number(a) - Number(b))
                .flatMap(([sem, subjs]) =>
                  subjs.map((subj, idx) => (
                    <motion.tr
                      key={subj.id.toString()}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.04 }}
                      data-ocid={`subjects.item.${idx + 1}`}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <TableCell className="font-medium">{subj.name}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-secondary/50 px-2 py-0.5 rounded">
                          {subj.code}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Sem {sem}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(subj)}
                            data-ocid={`subjects.edit_button.${idx + 1}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(subj.id)}
                            data-ocid={`subjects.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )),
                )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="subj-name">Subject Name *</Label>
              <Input
                id="subj-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Electrical Machines"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subj-code">Subject Code *</Label>
              <Input
                id="subj-code"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="e.g. EE-301"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Semester *</Label>
              <Select
                value={form.semester}
                onValueChange={(v) => setForm((f) => ({ ...f, semester: v }))}
              >
                <SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              style={{ background: "oklch(0.28 0.08 255)", color: "white" }}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingSubject ? (
                "Update"
              ) : (
                "Add Subject"
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
            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the subject and all associated
              attendance records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteSubject.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSubject.isPending ? (
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
