# EduAttend • Admin & Teacher Attendance Portal

A modern, responsive attendance and student management system built with Node.js, Express, and modern CSS/JavaScript.

## 📁 Project Structure

```
attendance-system/
└── admin-panel/
    ├── package.json          # Dependencies (express, multer, cors)
    ├── server.js             # Express API server & static file host
    ├── storage.js            # Persistence engine for students, attendance, & assignments
    ├── data/                 # JSON file database
    │   ├── users.json        # Teacher & Admin accounts
    │   ├── students.json     # Student records
    │   ├── attendance.json   # Attendance entries across past, present, & future dates
    │   └── assignments.json  # Uploaded assignment metadata
    ├── uploads/
    │   └── assignments/      # Uploaded PDF and document files
    └── public/
        ├── index.html        # Single-page interface (Auth, Dashboard, Attendance, Add Student, Records, Assignments)
        ├── css/
        │   └── style.css     # Clean styles with Green (Present) & Red (Absent) indicators
        └── js/
            ├── app.js        # View routing, toast notifications, stats
            ├── auth.js       # Teacher login & register logic
            ├── attendance.js # Class/section/date selection, Present (Green) / Absent (Red) toggles, Save Data
            ├── students.js   # Add student ("student added successfull"), records view, delete records
            └── assignments.js# Assignment modal, file/PDF upload, download links
```

---

## 🚀 How to Run the Admin Panel

1. Open PowerShell / Terminal:
   ```bash
   cd "C:\Users\prakh\.gemini\antigravity\scratch\attendance-system\admin-panel"
   ```

2. Start the server:
   ```bash
   npm start
   ```
   *(or `node server.js`)*

3. Open your browser:
   ```
   http://localhost:3000
   ```

---

## 🔑 Default Teacher Credentials

- **Email**: `teacher@school.edu`
- **Password**: `password123`
*(You can also use the one-click **"Auto Fill"** demo button on the login screen, or click the **"Teacher Register"** tab to create a new teacher account).*

---

## ✨ Features Implemented

1. **Teacher Login & Registration**:
   - Register new faculty accounts with full name, department, work email, and password.
   - Login session storage with profile pill in sidebar and logout functionality.

2. **Add Student Form**:
   - Form fields: Name, Roll Number, Course/Class, Section, Admission Number, Gender, Student Contact, Email, and Parent/Guardian Contact.
   - On submission, displays: **`student added successfull`** alert banner and toast.

3. **Take Attendance Interface**:
   - Dropdown selectors for:
     - **Class / Course** (e.g. B.Tech CSE, BCA, etc.)
     - **Section** (e.g. A, B, C)
     - **Date** (allows picking **past**, **today**, or **future** dates)
   - Load Sheet button pulls students enrolled in that class/section.
   - **Present (Green)** toggle button with checkmark.
   - **Absent (Red)** toggle button with cross.
   - Real-time counters (Total, Present, Absent).
   - "Mark All Present" & "Mark All Absent" shortcuts.
   - **`Save Data`** button saves all records to the database with confirmation.

4. **Student Records & History**:
   - Prominently displays: **"Total Students Added Till Date: [Count]"**.
   - Search by name, roll no, or admission number, plus course & section filters.
   - **View History** modal: Displays chronological attendance history (past and future dates) with **Green for Present** and **Red for Absent**, plus percentage calculation.
   - **Delete Student** button: Safely deletes a student and their attendance history with confirmation.

5. **Assignment Upload (PDF / Document)**:
   - "Add Assignment" button opens a file upload modal.
   - Upload assignment form with drag-and-drop file input supporting **PDF files** (up to 25MB).
   - View uploaded assignments with download links to directly inspect or download the PDF.
   - Delete assignment button.

---

## 🔜 Next Step: Student Panel
When ready, the student panel can be created in a sibling directory:
`attendance-system/student-panel/`
It will connect to the same backend data (`http://localhost:3000/api/...`) so students can log in, view their attendance percentage, see which days they were Present (Green) or Absent (Red), and download uploaded assignment PDFs!
