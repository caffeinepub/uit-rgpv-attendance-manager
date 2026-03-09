import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface AttendanceSummary {
    studentId: bigint;
    presentCount: bigint;
    subjectId: bigint;
    totalSessions: bigint;
}
export interface AttendanceRecord {
    id: bigint;
    studentId: bigint;
    isPresent: boolean;
    date: string;
    subjectId: bigint;
}
export interface Subject {
    id: bigint;
    semester: bigint;
    code: string;
    name: string;
}
export interface Student {
    id: bigint;
    principal?: Principal;
    semester: bigint;
    name: string;
    section: string;
    email: string;
    enrollmentNumber: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStudent(name: string, enrollmentNumber: string, semester: bigint, section: string, email: string): Promise<bigint>;
    addSubject(name: string, code: string, semester: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteStudent(id: bigint): Promise<void>;
    deleteSubject(id: bigint): Promise<void>;
    getAttendanceByStudent(studentId: bigint): Promise<Array<AttendanceRecord>>;
    getAttendanceBySubject(subjectId: bigint): Promise<Array<AttendanceRecord>>;
    getAttendanceSummary(): Promise<Array<AttendanceSummary>>;
    getCallerUserRole(): Promise<UserRole>;
    getMyAttendanceSummary(): Promise<Array<AttendanceSummary>>;
    isCallerAdmin(): Promise<boolean>;
    listStudents(): Promise<Array<Student>>;
    listSubjects(): Promise<Array<Subject>>;
    markAttendance(subjectId: bigint, date: string, attendanceList: Array<[bigint, boolean]>): Promise<void>;
    registerPrincipal(enrollmentNumber: string): Promise<void>;
    updateStudent(id: bigint, name: string, enrollmentNumber: string, semester: bigint, section: string, email: string): Promise<void>;
    updateSubject(id: bigint, name: string, code: string, semester: bigint): Promise<void>;
}
