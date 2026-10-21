const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const ATTENDANCE_FILE = path.join(DATA_DIR, 'attendance.json');
const ASSIGNMENTS_FILE = path.join(DATA_DIR, 'assignments.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, defaultValue = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultValue;
  }
}

function writeJson(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Initialize seed data if empty
function initializeSeedData() {
  const users = readJson(USERS_FILE, []);
  if (users.length === 0) {
    users.push({
      id: 'teacher-1',
      name: 'Dr. Sarah Jenkins',
      email: 'teacher@school.edu',
      password: 'password123',
      department: 'Computer Science',
      role: 'teacher',
      createdAt: new Date().toISOString()
    });
    writeJson(USERS_FILE, users);
  }

  const students = readJson(STUDENTS_FILE, []);
  if (students.length === 0) {
    const seedStudents = [
      {
        id: 'std-101',
        name: 'Aarav Sharma',
        rollNo: 'CS-01',
        section: 'A',
        course: 'B.Tech CSE',
        admissionNo: 'ADM2026001',
        contact: '+91 98765 43210',
        email: 'aarav.sharma@example.com',
        guardianContact: '+91 98765 43200',
        gender: 'Male',
        dateAdded: '2026-09-01T10:00:00.000Z'
      },
      {
        id: 'std-102',
        name: 'Diya Patel',
        rollNo: 'CS-02',
        section: 'A',
        course: 'B.Tech CSE',
        admissionNo: 'ADM2026002',
        contact: '+91 98765 43211',
        email: 'diya.patel@example.com',
        guardianContact: '+91 98765 43201',
        gender: 'Female',
        dateAdded: '2026-09-01T10:05:00.000Z'
      },
      {
        id: 'std-103',
        name: 'Rohan Verma',
        rollNo: 'CS-03',
        section: 'A',
        course: 'B.Tech CSE',
        admissionNo: 'ADM2026003',
        contact: '+91 98765 43212',
        email: 'rohan.verma@example.com',
        guardianContact: '+91 98765 43202',
        gender: 'Male',
        dateAdded: '2026-09-02T11:20:00.000Z'
      },
      {
        id: 'std-104',
        name: 'Ananya Iyer',
        rollNo: 'CS-04',
        section: 'A',
        course: 'B.Tech CSE',
        admissionNo: 'ADM2026004',
        contact: '+91 98765 43213',
        email: 'ananya.iyer@example.com',
        guardianContact: '+91 98765 43203',
        gender: 'Female',
        dateAdded: '2026-09-02T11:25:00.000Z'
      },
      {
        id: 'std-105',
        name: 'Kabir Mehta',
        rollNo: 'CS-05',
        section: 'B',
        course: 'B.Tech CSE',
        admissionNo: 'ADM2026005',
        contact: '+91 98765 43214',
        email: 'kabir.mehta@example.com',
        guardianContact: '+91 98765 43204',
        gender: 'Male',
        dateAdded: '2026-09-03T09:15:00.000Z'
      },
      {
        id: 'std-106',
        name: 'Ishaan Gupta',
        rollNo: 'BCA-01',
        section: 'A',
        course: 'BCA',
        admissionNo: 'ADM2026010',
        contact: '+91 98765 43215',
        email: 'ishaan.gupta@example.com',
        guardianContact: '+91 98765 43205',
        gender: 'Male',
        dateAdded: '2026-09-04T14:30:00.000Z'
      }
    ];
    writeJson(STUDENTS_FILE, seedStudents);
  }

  const attendance = readJson(ATTENDANCE_FILE, []);
  if (attendance.length === 0) {
    // Seed sample records for recent days (past, today)
    const seedAttendance = [
      {
        id: 'att-1',
        date: '2026-10-19',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-101',
        status: 'present',
        markedAt: '2026-10-19T09:30:00.000Z'
      },
      {
        id: 'att-2',
        date: '2026-10-19',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-102',
        status: 'present',
        markedAt: '2026-10-19T09:30:00.000Z'
      },
      {
        id: 'att-3',
        date: '2026-10-19',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-103',
        status: 'absent',
        markedAt: '2026-10-19T09:30:00.000Z'
      },
      {
        id: 'att-4',
        date: '2026-10-19',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-104',
        status: 'present',
        markedAt: '2026-10-19T09:30:00.000Z'
      },
      {
        id: 'att-5',
        date: '2026-10-20',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-101',
        status: 'present',
        markedAt: '2026-10-20T09:30:00.000Z'
      },
      {
        id: 'att-6',
        date: '2026-10-20',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-102',
        status: 'absent',
        markedAt: '2026-10-20T09:30:00.000Z'
      },
      {
        id: 'att-7',
        date: '2026-10-20',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-103',
        status: 'present',
        markedAt: '2026-10-20T09:30:00.000Z'
      },
      {
        id: 'att-8',
        date: '2026-10-20',
        course: 'B.Tech CSE',
        section: 'A',
        studentId: 'std-104',
        status: 'present',
        markedAt: '2026-10-20T09:30:00.000Z'
      }
    ];
    writeJson(ATTENDANCE_FILE, seedAttendance);
  }

  const assignments = readJson(ASSIGNMENTS_FILE, []);
  if (assignments.length === 0) {
    const seedAssignments = [
      {
        id: 'asg-1',
        title: 'Data Structures: Binary Trees & Graphs Implementation',
        course: 'B.Tech CSE',
        section: 'A',
        subject: 'Data Structures & Algorithms',
        dueDate: '2026-10-30',
        description: 'Complete the implementations of BFS, DFS and AVL tree rotations. Submit code along with test cases.',
        fileName: 'sample_dsa_assignment.pdf',
        originalName: 'DSA_Unit3_Assignment.pdf',
        fileSize: '45.2 KB',
        fileUrl: '/uploads/assignments/sample_dsa_assignment.pdf',
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(ASSIGNMENTS_FILE, seedAssignments);

    // Create a dummy sample pdf/file if not present
    const sampleFilePath = path.join(__dirname, 'uploads', 'assignments', 'sample_dsa_assignment.pdf');
    if (!fs.existsSync(sampleFilePath)) {
      fs.writeFileSync(sampleFilePath, '%PDF-1.4\n% Sample Assignment Document for Data Structures\n1 0 obj\n<< /Title (DSA Assignment 1) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF', 'utf8');
    }
  }
}

// User methods
function findUserByEmail(email) {
  const users = readJson(USERS_FILE);
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function createUser(userData) {
  const users = readJson(USERS_FILE);
  const newUser = {
    id: 'usr_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    name: userData.name,
    email: userData.email.toLowerCase(),
    password: userData.password,
    department: userData.department || 'General',
    role: userData.role || 'teacher',
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  writeJson(USERS_FILE, users);
  return newUser;
}

// Student methods
function getAllStudents() {
  return readJson(STUDENTS_FILE);
}

function addStudent(studentData) {
  const students = readJson(STUDENTS_FILE);
  const newStudent = {
    id: 'std_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    name: studentData.name.trim(),
    rollNo: studentData.rollNo.trim(),
    section: studentData.section.trim(),
    course: studentData.course.trim(),
    admissionNo: studentData.admissionNo.trim(),
    contact: studentData.contact ? studentData.contact.trim() : '',
    email: studentData.email ? studentData.email.trim() : '',
    guardianContact: studentData.guardianContact ? studentData.guardianContact.trim() : '',
    gender: studentData.gender || 'Not Specified',
    password: studentData.password ? studentData.password : 'password123',
    dateAdded: new Date().toISOString()
  };
  students.push(newStudent);
  writeJson(STUDENTS_FILE, students);
  return newStudent;
}

function findStudentById(studentId) {
  const students = readJson(STUDENTS_FILE);
  return students.find(s => s.id === studentId);
}

function findStudentByEmailOrAdmissionNo(identifier) {
  if (!identifier) return null;
  const idLower = identifier.trim().toLowerCase();
  const students = readJson(STUDENTS_FILE);
  return students.find(s => 
    (s.email && s.email.toLowerCase() === idLower) ||
    (s.admissionNo && s.admissionNo.toLowerCase() === idLower) ||
    (s.rollNo && s.rollNo.toLowerCase() === idLower)
  );
}

function registerOrUpdateStudent(studentData) {
  const students = readJson(STUDENTS_FILE);
  const existing = findStudentByEmailOrAdmissionNo(studentData.admissionNo) ||
                   (studentData.email ? findStudentByEmailOrAdmissionNo(studentData.email) : null);

  if (existing) {
    // Update existing student with password and info
    existing.password = studentData.password || existing.password || 'password123';
    if (studentData.name) existing.name = studentData.name.trim();
    if (studentData.email) existing.email = studentData.email.trim();
    if (studentData.contact) existing.contact = studentData.contact.trim();
    if (studentData.course) existing.course = studentData.course.trim();
    if (studentData.section) existing.section = studentData.section.trim();
    writeJson(STUDENTS_FILE, students);
    return existing;
  }

  // Create new student record
  return addStudent(studentData);
}

function validateStudentLogin(identifier, password) {
  const student = findStudentByEmailOrAdmissionNo(identifier);
  if (!student) return null;

  const validPassword = student.password || 'password123';
  if (validPassword !== password) return null;

  const { password: _, ...safeStudent } = student;
  return safeStudent;
}

function deleteStudent(studentId) {
  let students = readJson(STUDENTS_FILE);
  const initialLength = students.length;
  students = students.filter(s => s.id !== studentId);
  if (students.length === initialLength) {
    return false;
  }
  writeJson(STUDENTS_FILE, students);

  // Also clean up attendance records for this student
  let attendance = readJson(ATTENDANCE_FILE);
  attendance = attendance.filter(a => a.studentId !== studentId);
  writeJson(ATTENDANCE_FILE, attendance);

  return true;
}

// Attendance methods
function getAllAttendance() {
  return readJson(ATTENDANCE_FILE);
}

function getAttendanceForClassAndDate(course, section, date) {
  const attendance = readJson(ATTENDANCE_FILE);
  return attendance.filter(a => 
    a.course.toLowerCase() === course.toLowerCase() &&
    a.section.toLowerCase() === section.toLowerCase() &&
    a.date === date
  );
}

function saveClassAttendance(course, section, date, records) {
  // records: [ { studentId: string, status: 'present' | 'absent' } ]
  let attendance = readJson(ATTENDANCE_FILE);
  
  // Remove existing records for this course, section, and date
  attendance = attendance.filter(a => 
    !(a.course.toLowerCase() === course.toLowerCase() &&
      a.section.toLowerCase() === section.toLowerCase() &&
      a.date === date)
  );

  const now = new Date().toISOString();
  records.forEach(rec => {
    attendance.push({
      id: 'att_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
      date: date,
      course: course,
      section: section,
      studentId: rec.studentId,
      status: rec.status === 'present' ? 'present' : 'absent',
      markedAt: now
    });
  });

  writeJson(ATTENDANCE_FILE, attendance);
  return true;
}

function getStudentAttendanceHistory(studentId) {
  const attendance = readJson(ATTENDANCE_FILE);
  return attendance
    .filter(a => a.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Assignment methods
function getAllAssignments() {
  return readJson(ASSIGNMENTS_FILE);
}

function addAssignment(assignmentData) {
  const assignments = readJson(ASSIGNMENTS_FILE);
  const newAssignment = {
    id: 'asg_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    title: assignmentData.title,
    course: assignmentData.course,
    section: assignmentData.section,
    subject: assignmentData.subject || '',
    dueDate: assignmentData.dueDate || '',
    description: assignmentData.description || '',
    fileName: assignmentData.fileName,
    originalName: assignmentData.originalName,
    fileSize: assignmentData.fileSize,
    fileUrl: assignmentData.fileUrl,
    createdAt: new Date().toISOString()
  };
  assignments.unshift(newAssignment);
  writeJson(ASSIGNMENTS_FILE, assignments);
  return newAssignment;
}

function deleteAssignment(assignmentId) {
  let assignments = readJson(ASSIGNMENTS_FILE);
  const toDelete = assignments.find(a => a.id === assignmentId);
  if (!toDelete) return false;

  assignments = assignments.filter(a => a.id !== assignmentId);
  writeJson(ASSIGNMENTS_FILE, assignments);

  // Attempt to delete physical file
  if (toDelete.fileName) {
    const filePath = path.join(__dirname, 'uploads', 'assignments', toDelete.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not remove file:', filePath);
      }
    }
  }

  return true;
}

// Helper to get distinct courses and sections
function getCoursesAndSections() {
  const students = readJson(STUDENTS_FILE);
  const courseMap = {};
  students.forEach(s => {
    if (!courseMap[s.course]) {
      courseMap[s.course] = new Set();
    }
    if (s.section) {
      courseMap[s.course].add(s.section);
    }
  });

  const result = [];
  for (const [course, sections] of Object.entries(courseMap)) {
    result.push({
      course,
      sections: Array.from(sections).sort()
    });
  }
  return result;
}

module.exports = {
  initializeSeedData,
  findUserByEmail,
  createUser,
  getAllStudents,
  addStudent,
  deleteStudent,
  findStudentById,
  findStudentByEmailOrAdmissionNo,
  registerOrUpdateStudent,
  validateStudentLogin,
  getAllAttendance,
  getAttendanceForClassAndDate,
  saveClassAttendance,
  getStudentAttendanceHistory,
  getAllAssignments,
  addAssignment,
  deleteAssignment,
  getCoursesAndSections
};
