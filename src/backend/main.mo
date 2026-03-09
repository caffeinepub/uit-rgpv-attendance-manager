import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization state and mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Data Models
  public type Student = {
    id : Nat;
    name : Text;
    enrollmentNumber : Text;
    semester : Nat;
    section : Text;
    email : Text;
    principal : ?Principal;
  };

  public type Subject = {
    id : Nat;
    name : Text;
    code : Text;
    semester : Nat;
  };

  public type AttendanceRecord = {
    id : Nat;
    studentId : Nat;
    subjectId : Nat;
    date : Text;
    isPresent : Bool;
  };

  public type AttendanceSummary = {
    studentId : Nat;
    subjectId : Nat;
    totalSessions : Nat;
    presentCount : Nat;
  };

  // State
  let students = Map.empty<Nat, Student>();
  let subjects = Map.empty<Nat, Subject>();
  let attendanceRecords = Map.empty<Nat, AttendanceRecord>();

  var nextStudentId = 1;
  var nextSubjectId = 1;
  var nextAttendanceId = 1;

  // Student Management (Admin Only)
  public shared ({ caller }) func addStudent(name : Text, enrollmentNumber : Text, semester : Nat, section : Text, email : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add students");
    };
    let id = nextStudentId;
    let newStudent : Student = {
      id;
      name;
      enrollmentNumber;
      semester;
      section;
      email;
      principal = null;
    };
    students.add(id, newStudent);
    nextStudentId += 1;
    id;
  };

  public shared ({ caller }) func updateStudent(id : Nat, name : Text, enrollmentNumber : Text, semester : Nat, section : Text, email : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update students");
    };
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?existing) {
        let updatedStudent : Student = {
          id;
          name;
          enrollmentNumber;
          semester;
          section;
          email;
          principal = existing.principal;
        };
        students.add(id, updatedStudent);
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };
    students.remove(id);
  };

  // Subject Management (Admin Only)
  public shared ({ caller }) func addSubject(name : Text, code : Text, semester : Nat) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add subjects");
    };
    let id = nextSubjectId;
    let newSubject : Subject = {
      id;
      name;
      code;
      semester;
    };
    subjects.add(id, newSubject);
    nextSubjectId += 1;
    id;
  };

  public shared ({ caller }) func updateSubject(id : Nat, name : Text, code : Text, semester : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update subjects");
    };
    switch (subjects.get(id)) {
      case (null) { Runtime.trap("Subject not found") };
      case (_) {
        let updatedSubject : Subject = {
          id;
          name;
          code;
          semester;
        };
        subjects.add(id, updatedSubject);
      };
    };
  };

  public shared ({ caller }) func deleteSubject(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete subjects");
    };
    subjects.remove(id);
  };

  // Attendance Management (Admin Only)
  public shared ({ caller }) func markAttendance(subjectId : Nat, date : Text, attendanceList : [(Nat, Bool)]) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can mark attendance");
    };
    for ((studentId, isPresent) in attendanceList.values()) {
      let record : AttendanceRecord = {
        id = nextAttendanceId;
        studentId;
        subjectId;
        date;
        isPresent;
      };
      attendanceRecords.add(nextAttendanceId, record);
      nextAttendanceId += 1;
    };
  };

  // Queries (Admin Only)
  public query ({ caller }) func getAttendanceByStudent(studentId : Nat) : async [AttendanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can query attendance records");
    };
    attendanceRecords.values().toArray().filter(func(rec) { rec.studentId == studentId });
  };

  public query ({ caller }) func getAttendanceBySubject(subjectId : Nat) : async [AttendanceRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can query attendance records");
    };
    attendanceRecords.values().toArray().filter(func(rec) { rec.subjectId == subjectId });
  };

  public query ({ caller }) func getAttendanceSummary() : async [AttendanceSummary] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get attendance summary");
    };
    var uniquePairs = Array.tabulate(attendanceRecords.size(), func(i) { (0, 0) });
    var pairCount = 0;

    for (record in attendanceRecords.values()) {
      let pair = (record.studentId, record.subjectId);
      var exists = false;
      for (existing in uniquePairs.values()) {
        exists := exists or (existing.0 == pair.0 and existing.1 == pair.1);
      };
      if (not exists) {
        if (pairCount < uniquePairs.size()) {
          uniquePairs := Array.tabulate(
            uniquePairs.size(),
            func(i) {
              if (i == pairCount) { pair } else { uniquePairs[i] };
            },
          );
        };
        pairCount += 1;
      };
    };

    var summaries = Array.empty<AttendanceSummary>();

    for (i in Nat.range(0, pairCount)) {
      let (studentId, subjectId) = uniquePairs[i];
      var totalSessions = 0;
      var presentCount = 0;

      for (record in attendanceRecords.values()) {
        if (record.studentId == studentId and record.subjectId == subjectId) {
          totalSessions += 1;
          if (record.isPresent) { presentCount += 1 };
        };
      };

      let newSummary : AttendanceSummary = {
        studentId;
        subjectId;
        totalSessions;
        presentCount;
      };
      summaries := Array.tabulate(
        summaries.size() + 1,
        func(i) {
          if (i == summaries.size()) { newSummary } else { summaries[i] };
        },
      );
    };

    summaries.sliceToArray(0, pairCount);
  };

  // Student Self-Registration (User Only)
  public shared ({ caller }) func registerPrincipal(enrollmentNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register their principal");
    };
    switch (students.values().toArray().find(func(student) { student.enrollmentNumber == enrollmentNumber })) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        let updatedStudent : Student = {
          id = student.id;
          name = student.name;
          enrollmentNumber = student.enrollmentNumber;
          semester = student.semester;
          section = student.section;
          email = student.email;
          principal = ?caller;
        };
        students.add(student.id, updatedStudent);
      };
    };
  };

  public query ({ caller }) func getMyAttendanceSummary() : async [AttendanceSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their attendance summary");
    };
    switch (students.values().toArray().find(func(student) { student.principal == ?caller })) {
      case (null) { Runtime.trap("Student not found") };
      case (?student) {
        let studentRecords = attendanceRecords.values().toArray().filter(func(rec) { rec.studentId == student.id });

        let summaries = Array.tabulate(
          studentRecords.size(),
          func(i) {
            let record = studentRecords[i];
            {
              studentId = record.studentId;
              subjectId = record.subjectId;
              totalSessions = 1;
              presentCount = if (record.isPresent) { 1 } else { 0 };
            };
          },
        );

        summaries;
      };
    };
  };

  // List Students and Subjects (Open to All)
  public query ({ caller }) func listStudents() : async [Student] {
    students.values().toArray();
  };

  public query ({ caller }) func listSubjects() : async [Subject] {
    subjects.values().toArray();
  };
};
