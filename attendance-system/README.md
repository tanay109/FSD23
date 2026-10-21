# EduAttend • Academic Attendance & Student Portal

A dual-panel attendance and student management system with automated daily attendance emails, assignment distribution, and role-based access for both **Teachers (Admin)** and **Students**.

---

## 📁 System Architecture

```
attendance-system/
├── package.json                 # Root package script
├── README.md                    # Root project documentation
├── admin-panel/                 # 👨‍🏫 TEACHER / ADMIN PANEL
│   ├── package.json
│   ├── server.js                # Express Server running port 3000
│   ├── storage.js               # JSON Database & Student/Teacher persistence
│   ├── mailer.js                # Daily attendance automated email dispatcher
│   ├── data/
│   │   ├── users.json           # Teacher / Admin accounts
│   │   ├── students.json        # Student accounts & profiles
│   │   ├── attendance.json      # Attendance records (past, present, future)
│   │   ├── assignments.json     # Assignment records
│   │   └── email_logs.json      # End-of-day sent email outbox
│   ├── uploads/assignments/     # Uploaded PDF assignments
│   └── public/                  # Teacher Portal & Dual Login Gateway
│       ├── index.html           # Unified Login (Teacher & Student) + Admin Portal
│       ├── css/style.css
│       └── js/
│           ├── auth.js          # Role-based auth (Teacher / Student)
│           ├── attendance.js    # Take Attendance (Green / Red), Save Data
│           ├── students.js      # Add student, show records, delete student
│           ├── assignments.js   # Upload assignment (file/PDF)
│           ├── email.js         # 1-Click end-of-day daily attendance emails
│           └── app.js
│
└── student-panel/               # 🎓 STUDENT PANEL (Dedicated Folder)
    ├── README.md
    └── public/
        ├── index.html           # Student Portal UI
        ├── css/student.css      # Modern student styling
        └── js/student.js        # "Show My Attendance", "Show My Assignments"
```

---

## 🚀 How to Run

1. Open PowerShell or Terminal:
   ```powershell
   cd "C:\Users\prakh\OneDrive\Desktop\attendance-system\admin-panel"
   npm start
   ```
   *(or from the root folder: `cd "C:\Users\prakh\OneDrive\Desktop\attendance-system"` and `npm start`)*

2. Open your browser:
   - **Unified Portal Login:** [http://localhost:3000](http://localhost:3000)
   - **Teacher Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
   - **Student Panel:** [http://localhost:3000/student](http://localhost:3000/student)

---

## 🔑 Default Accounts (with 1-Click Auto Fill)

### 👨‍🏫 Teacher / Admin Account:
- **Email**: `teacher@school.edu`
- **Password**: `password123`
*(Directs to the **Admin Panel**)*

### 🎓 Student Account:
- **Admission No**: `ADM2026001` *(or Email: `aarav.sharma@example.com`)*
- **Password**: `password123`
*(Directs to the **Student Panel**)*

---

## 🌟 Key Features

### 1. Dual Role Login on Portal
- Choose **Login as Teacher** or **Login as Student**.
- Teacher login -> opens full **Admin Panel**.
- Student login -> opens full **Student Panel**.
- Full registration forms for both roles.

### 2. Teacher Admin Panel
- **Add Student**: Form with Name, Roll No, Section, Course, Admission No, Contact info. Shows `"student added successfull"`.
- **Take Attendance**: Select Course, Section, and Date (past, present, future).
  - **Present (Green `#10b981`)** / **Absent (Red `#ef4444`)** toggles.
  - **Save Data** button to persist attendance.
- **Student Records**: View all registered students, total count added till date, attendance history, and **Delete Student** records.
- **Assignments**: Upload assignments with attached **PDF files**.
- **📧 1-Click Daily Attendance Emails**: Dispatches end-of-day attendance emails to all students (e.g., *"Today's Attendance: 4/8 classes attended"*), overall rate %, with an email outbox delivery log & HTML preview!

### 3. Student Panel
- **Show My Attendance**:
  - Live Circular Percentage Meter (e.g. `75%`).
  - Total Classes, Present Days (Green), Absent Days (Red).
  - Chronological past history timeline with **Green check for Present** and **Red cross for Absent**.
  - **Show All Records** searchable table.
- **Show My Assignments**:
  - Filtered by student's course & section.
  - Teacher instructions & due date.
  - **Download / View PDF** button to access study materials.
