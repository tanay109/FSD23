/* ========================================================
   EduAttend - Attendance Management Logic
   ======================================================== */

let currentAttendanceState = {
  course: '',
  section: '',
  date: '',
  students: [] // Array of { id, name, rollNo, admissionNo, status: 'present'|'absent' }
};

let availableClasses = [];

// Initialize attendance date picker to today
function initAttendanceControls() {
  const datePicker = document.getElementById('attDatePicker');
  if (datePicker && !datePicker.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${yyyy}-${mm}-${dd}`;
  }
}

// Load courses and sections metadata
async function loadCoursesAndSections() {
  try {
    const res = await fetch('/api/meta/classes');
    const data = await res.json();
    if (data.success) {
      availableClasses = data.classes;
      populateCourseDropdowns();
    }
  } catch (err) {
    console.error('Error fetching classes:', err);
  }
}

function populateCourseDropdowns() {
  const attCourseSelect = document.getElementById('attCourseSelect');
  const recordCourseFilter = document.getElementById('recordCourseFilter');
  const asgCourse = document.getElementById('asgCourse');

  const courseOptionsHtml = '<option value="">-- Choose Course --</option>' +
    availableClasses.map(c => `<option value="${escapeHtml(c.course)}">${escapeHtml(c.course)}</option>`).join('');

  if (attCourseSelect) {
    attCourseSelect.innerHTML = courseOptionsHtml;
  }

  if (recordCourseFilter) {
    recordCourseFilter.innerHTML = '<option value="ALL">All Courses</option>' +
      availableClasses.map(c => `<option value="${escapeHtml(c.course)}">${escapeHtml(c.course)}</option>`).join('');
  }

  if (asgCourse) {
    asgCourse.innerHTML = '<option value="">-- Select Course --</option>' +
      availableClasses.map(c => `<option value="${escapeHtml(c.course)}">${escapeHtml(c.course)}</option>`).join('');
  }
}

function onAttendanceCourseChange() {
  const course = document.getElementById('attCourseSelect').value;
  const sectionSelect = document.getElementById('attSectionSelect');
  sectionSelect.innerHTML = '<option value="">-- Section --</option>';

  const match = availableClasses.find(c => c.course === course);
  if (match && match.sections.length > 0) {
    match.sections.forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec;
      opt.textContent = `Section ${sec}`;
      sectionSelect.appendChild(opt);
    });
    // Auto-select first section
    sectionSelect.value = match.sections[0];
  } else {
    // Default sections if none found
    ['A', 'B', 'C'].forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec;
      opt.textContent = `Section ${sec}`;
      sectionSelect.appendChild(opt);
    });
  }
}

// Fetch class attendance for selected course, section, and date
async function loadClassAttendance() {
  const course = document.getElementById('attCourseSelect').value;
  const section = document.getElementById('attSectionSelect').value;
  const date = document.getElementById('attDatePicker').value;

  if (!course) {
    showToast('Please select a Class / Course from the dropdown.', 'danger');
    return;
  }
  if (!section) {
    showToast('Please select a Section.', 'danger');
    return;
  }
  if (!date) {
    showToast('Please select a Date.', 'danger');
    return;
  }

  try {
    const res = await fetch(`/api/attendance?course=${encodeURIComponent(course)}&section=${encodeURIComponent(section)}&date=${encodeURIComponent(date)}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Could not load attendance data.', 'danger');
      return;
    }

    if (data.students.length === 0) {
      document.getElementById('attendancePlaceholder').style.display = 'block';
      document.getElementById('attendanceSheetContainer').style.display = 'none';
      document.getElementById('attendancePlaceholder').innerHTML = `
        <div class="empty-icon"><i class="fa-solid fa-user-xmark"></i></div>
        <h4>No students found</h4>
        <p>There are no students registered in <strong>${escapeHtml(course)} - Section ${escapeHtml(section)}</strong> yet. 
        You can add students using the "Add Student" section.</p>
        <button class="btn btn-primary" style="margin-top: 14px;" onclick="switchView('addStudent')">
          <i class="fa-solid fa-user-plus"></i> Add Student to this Class
        </button>
      `;
      return;
    }

    currentAttendanceState = {
      course: data.course,
      section: data.section,
      date: data.date,
      students: data.students.map(s => ({
        id: s.id,
        name: s.name,
        rollNo: s.rollNo,
        admissionNo: s.admissionNo,
        status: s.status || 'present'
      }))
    };

    renderAttendanceSheet(data.isAlreadySaved);
    showToast(`Loaded ${data.students.length} students for ${date}`, 'info');

  } catch (err) {
    console.error('Error loading attendance:', err);
    showToast('Failed to connect to attendance service.', 'danger');
  }
}

// Render the attendance sheet list
function renderAttendanceSheet(isAlreadySaved = false) {
  const placeholder = document.getElementById('attendancePlaceholder');
  const sheet = document.getElementById('attendanceSheetContainer');
  const container = document.getElementById('attendanceStudentsList');
  const savedIndicator = document.getElementById('savedIndicator');

  placeholder.style.display = 'none';
  sheet.style.display = 'block';

  if (isAlreadySaved) {
    savedIndicator.className = 'badge badge-green';
    savedIndicator.innerHTML = '<i class="fa-solid fa-check"></i> Previously Saved';
  } else {
    savedIndicator.className = 'badge badge-gray';
    savedIndicator.innerHTML = '<i class="fa-solid fa-pen"></i> New / Unsaved';
  }

  let html = '';
  currentAttendanceState.students.forEach((student, index) => {
    const isPresent = student.status === 'present';
    const rowClass = isPresent ? 'student-row status-present' : 'student-row status-absent';

    html += `
      <div class="${rowClass}" id="student-row-${student.id}">
        <div class="student-info-col">
          <div class="student-roll-badge">${escapeHtml(student.rollNo)}</div>
          <div class="avatar-circle" style="width: 38px; height: 38px; font-size: 14px; background: ${stringToColor(student.name)};">
            ${escapeHtml(student.name.charAt(0).toUpperCase())}
          </div>
          <div class="student-name-group">
            <h4>${escapeHtml(student.name)}</h4>
            <p>Admission No: <strong>${escapeHtml(student.admissionNo)}</strong> • ${escapeHtml(currentAttendanceState.course)} (${escapeHtml(currentAttendanceState.section)})</p>
          </div>
        </div>

        <div class="attendance-toggle-group">
          <!-- Present Button (Green) -->
          <button type="button" 
            class="toggle-btn btn-present ${isPresent ? 'active' : ''}" 
            onclick="setStudentAttendanceStatus('${student.id}', 'present')">
            <i class="fa-solid fa-check"></i> Present
          </button>

          <!-- Absent Button (Red) -->
          <button type="button" 
            class="toggle-btn btn-absent ${!isPresent ? 'active' : ''}" 
            onclick="setStudentAttendanceStatus('${student.id}', 'absent')">
            <i class="fa-solid fa-xmark"></i> Absent
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  updateAttendanceCounters();
}

// Toggle individual student status
function setStudentAttendanceStatus(studentId, newStatus) {
  const student = currentAttendanceState.students.find(s => s.id === studentId);
  if (!student) return;

  student.status = newStatus;
  const row = document.getElementById(`student-row-${studentId}`);
  if (row) {
    if (newStatus === 'present') {
      row.className = 'student-row status-present';
      const presentBtn = row.querySelector('.btn-present');
      const absentBtn = row.querySelector('.btn-absent');
      if (presentBtn) presentBtn.classList.add('active');
      if (absentBtn) absentBtn.classList.remove('active');
    } else {
      row.className = 'student-row status-absent';
      const presentBtn = row.querySelector('.btn-present');
      const absentBtn = row.querySelector('.btn-absent');
      if (presentBtn) presentBtn.classList.remove('active');
      if (absentBtn) absentBtn.classList.add('active');
    }
  }

  // Update unsaved indicator
  const savedIndicator = document.getElementById('savedIndicator');
  if (savedIndicator) {
    savedIndicator.className = 'badge badge-gray';
    savedIndicator.innerHTML = '<i class="fa-solid fa-pen"></i> Unsaved changes';
  }

  updateAttendanceCounters();
}

// Bulk mark all
function markAllAttendance(status) {
  currentAttendanceState.students.forEach(s => {
    s.status = status;
    const row = document.getElementById(`student-row-${s.id}`);
    if (row) {
      if (status === 'present') {
        row.className = 'student-row status-present';
        const pBtn = row.querySelector('.btn-present');
        const aBtn = row.querySelector('.btn-absent');
        if (pBtn) pBtn.classList.add('active');
        if (aBtn) aBtn.classList.remove('active');
      } else {
        row.className = 'student-row status-absent';
        const pBtn = row.querySelector('.btn-present');
        const aBtn = row.querySelector('.btn-absent');
        if (pBtn) pBtn.classList.remove('active');
        if (aBtn) aBtn.classList.add('active');
      }
    }
  });

  const savedIndicator = document.getElementById('savedIndicator');
  if (savedIndicator) {
    savedIndicator.className = 'badge badge-gray';
    savedIndicator.innerHTML = '<i class="fa-solid fa-pen"></i> Unsaved changes';
  }

  updateAttendanceCounters();
  showToast(`All students marked as ${status.toUpperCase()}! Click 'Save Data' to persist.`, 'info');
}

// Recalculate present and absent counters
function updateAttendanceCounters() {
  const total = currentAttendanceState.students.length;
  const present = currentAttendanceState.students.filter(s => s.status === 'present').length;
  const absent = total - present;

  const totalEl = document.getElementById('sheetTotalCount');
  const presentEl = document.getElementById('sheetPresentCount');
  const absentEl = document.getElementById('sheetAbsentCount');

  if (totalEl) totalEl.textContent = total;
  if (presentEl) presentEl.textContent = present;
  if (absentEl) absentEl.textContent = absent;
}

// SAVE ALL ATTENDANCE DATA TO BACKEND
async function saveAttendanceData() {
  if (currentAttendanceState.students.length === 0) {
    showToast('No students loaded to save attendance for.', 'danger');
    return;
  }

  const payload = {
    course: currentAttendanceState.course,
    section: currentAttendanceState.section,
    date: currentAttendanceState.date,
    records: currentAttendanceState.students.map(s => ({
      studentId: s.id,
      status: s.status
    }))
  };

  try {
    const res = await fetch('/api/attendance/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Error saving attendance.', 'danger');
      return;
    }

    const savedIndicator = document.getElementById('savedIndicator');
    if (savedIndicator) {
      savedIndicator.className = 'badge badge-green';
      savedIndicator.innerHTML = '<i class="fa-solid fa-check-double"></i> Saved successfully';
    }

    showToast(`Attendance saved: ${data.summary.present} Present (Green), ${data.summary.absent} Absent (Red)!`, 'success');
    
    // Refresh stats and student records in background
    if (typeof loadDashboardStats === 'function') loadDashboardStats();
    if (typeof loadAllStudentsTable === 'function') loadAllStudentsTable();

  } catch (err) {
    console.error('Error saving attendance:', err);
    showToast('Failed to save attendance due to server error.', 'danger');
  }
}
