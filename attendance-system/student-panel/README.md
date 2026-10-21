# EduAttend • Student Portal

A dedicated, student-centered portal for students to track their attendance status, inspect past & present records, and access teacher-uploaded course assignment PDFs.

## 📁 Student Panel Structure

```
student-panel/
└── public/
    ├── index.html        # Student Portal UI
    ├── css/
    │   └── student.css   # Student theme (Cyan/Blue gradients, circular meter, Green/Red pills)
    └── js/
        └── student.js    # Data fetching, percentage calculation, PDF downloads
```

## 🚀 Key Features

1. **Dual Role Login Integration**:
   - Students can log in using their **Admission Number** (e.g. `ADM2026001`) or **Email** and password.
   - Demo student credentials: `aarav.sharma@example.com` / `password123`.

2. **Show My Attendance**:
   - Real-time attendance percentage ring (e.g. `75%`).
   - Summary statistics: Total Sessions, Present Days (Green), Absent Days (Red).
   - Past records timeline: Every date is marked with a **Green check for Present** or **Red cross for Absent**.
   - Show All Records table with search by date and status filters.

3. **Show My Assignments**:
   - Filtered specifically for the student's Course & Section.
   - Displays all PDF assignments uploaded by teachers.
   - One-click **Download / View PDF** button.
