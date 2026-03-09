import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceRecord,
  AttendanceSummary,
  Student,
  Subject,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Role ──────────────────────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Students ──────────────────────────────────────────────────────────────────

export function useStudents() {
  const { actor, isFetching } = useActor();
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStudents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      enrollmentNumber: string;
      semester: bigint;
      section: string;
      email: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addStudent(
        data.name,
        data.enrollmentNumber,
        data.semester,
        data.section,
        data.email,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      enrollmentNumber: string;
      semester: bigint;
      section: string;
      email: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateStudent(
        data.id,
        data.name,
        data.enrollmentNumber,
        data.semester,
        data.section,
        data.email,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteStudent(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

// ── Subjects ──────────────────────────────────────────────────────────────────

export function useSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      code: string;
      semester: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubject(data.name, data.code, data.semester);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      code: string;
      semester: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSubject(data.id, data.name, data.code, data.semester);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteSubject(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

// ── Attendance ────────────────────────────────────────────────────────────────

export function useAttendanceSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceSummary[]>({
    queryKey: ["attendanceSummary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAttendanceSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyAttendanceSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceSummary[]>({
    queryKey: ["myAttendanceSummary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAttendanceSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAttendanceByStudent(studentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendanceByStudent", studentId?.toString()],
    queryFn: async () => {
      if (!actor || !studentId) return [];
      return actor.getAttendanceByStudent(studentId);
    },
    enabled: !!actor && !isFetching && !!studentId,
  });
}

export function useAttendanceBySubject(subjectId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<AttendanceRecord[]>({
    queryKey: ["attendanceBySubject", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || !subjectId) return [];
      return actor.getAttendanceBySubject(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      subjectId: bigint;
      date: string;
      attendanceList: Array<[bigint, boolean]>;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.markAttendance(
        data.subjectId,
        data.date,
        data.attendanceList,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendanceSummary"] });
      qc.invalidateQueries({ queryKey: ["attendanceByStudent"] });
      qc.invalidateQueries({ queryKey: ["attendanceBySubject"] });
    },
  });
}

export function useRegisterPrincipal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (enrollmentNumber: string) => {
      if (!actor) throw new Error("No actor");
      return actor.registerPrincipal(enrollmentNumber);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAttendanceSummary"] });
      qc.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}
