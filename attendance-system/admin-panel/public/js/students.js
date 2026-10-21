/* ========================================================
   EduAttend - Student Management & Records Logic
   ======================================================== */

let allStudentsList = [];
let studentToDeleteId = null;

// Switch between Manual Add and Bulk Excel Import
function switchAddStudentMode(mode) {
  const manualBtn = document.getElementById('modeBtnManual');
  const bulkBtn = document.getElementById('modeBtnBulk');
  const manualContainer = document.getElementById('manualStudentContainer');
  const bulkContainer = document.getElementById('bulkStudentContainer');

  if (!manualBtn || !bulkBtn) return;

  if (mode === 'manual') {
    manualBtn.classList.add('active');
    bulkBtn.classList.remove('active');
    if (manualContainer) manualContainer.style.display = 'block';
    if (bulkContainer) bulkContainer.style.display = 'none';
  } else {
    bulkBtn.classList.add('active');
    manualBtn.classList.remove('active');
    if (manualContainer) manualContainer.style.display = 'none';
    if (bulkContainer) bulkContainer.style.display = 'block';
  }
}

function handleExcelFileSelected(input) {
  const label = document.getElementById('excelDropzoneLabel');
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeKB = (file.size / 1024).toFixed(1);
    label.innerHTML = `<strong>Selected Sheet:</strong> ${escapeHtml(file.name)} <span style="font-size: 11px; opacity: 0.8;">(${sizeKB} KB)</span>`;
  } else {
    label.textContent = 'Click or Drag & Drop Excel Sheet (.xlsx, .xls, .csv)';
  }
}

async function handleBulkUploadExcel() {
  const fileInput = document.getElementById('excelFileInput');
  if (!fileInput.files || !fileInput.files[0]) {
    showToast('Please choose an Excel (.xlsx, .xls) or CSV file to upload.', 'danger');
    return;
  }

  const formData = new FormData();
  formData.append('excelFile', fileInput.files[0]);

  const btn = document.getElementById('btnSubmitBulkExcel');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Parsing Excel & Adding Students...';

  try {
    const res = await fetch('/api/students/bulk-upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Error processing Excel sheet.', 'danger');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-file-excel"></i> Import All Students from Sheet';
      return;
    }

    showToast(data.message, 'success');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-file-excel"></i> Import All Students from Sheet';

    // Show results
    const resultsBox = document.getElementById('bulkUploadResults');
    if (resultsBox) {
      resultsBox.style.display = 'block';
      resultsBox.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; border-radius: 12px; padding: 18px; margin-top: 18px;">
          <h4 style="color: #10b981; font-weight: 800; font-size: 15px; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-circle-check"></i> Bulk Import Complete!
          </h4>
          <p style="font-size: 13px; color: #cbd5e1; margin-top: 6px;">
            Added <strong>${data.addedCount}</strong> students. Skipped <strong>${data.skippedCount}</strong> duplicate or empty rows.
          </p>
          <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm" onclick="switchView('records')">
              <i class="fa-solid fa-users"></i> View All Student Records
            </button>
            <button class="btn btn-primary btn-sm" onclick="switchView('attendance')">
              <i class="fa-solid fa-calendar-check"></i> Take Attendance Now
            </button>
          </div>
        </div>
      `;
    }

    fileInput.value = '';
    const label = document.getElementById('excelDropzoneLabel');
    if (label) label.textContent = 'Click or Drag & Drop Excel Sheet (.xlsx, .xls, .csv)';

    // Reload metadata and student table
    loadCoursesAndSections();
    loadAllStudentsTable();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();

  } catch (err) {
    console.error('Bulk upload error:', err);
    showToast('Network error while importing Excel sheet.', 'danger');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-file-excel"></i> Import All Students from Sheet';
  }
}

// Handle Add Student Form Submission
async function handleAddStudent(e) {
  e.preventDefault();

  const name = document.getElementById('stdName').value.trim();
  const rollNo = document.getElementById('stdRoll').value.trim();
  const course = document.getElementById('stdCourse').value.trim();
  const section = document.getElementById('stdSection').value.trim();
  const admissionNo = document.getElementById('stdAdmissionNo').value.trim();
  const gender = document.getElementById('stdGender').value;
  const contact = document.getElementById('stdContact').value.trim();
  const email = document.getElementById('stdEmail').value.trim();
  const guardianContact = document.getElementById('stdGuardianContact').value.trim();

  if (!name || !rollNo || !course || !section || !admissionNo) {
    showToast('Please fill all required student details.', 'danger');
    return;
  }

  const payload = {
    name,
    rollNo,
    course,
    section,
    admissionNo,
    gender,
    contact,
    email,
    guardianContact
  };

  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Failed to add student.', 'danger');
      return;
    }

    // Show the requested exact message banner: "student added successfull"
    const alertBanner = document.getElementById('addStudentSuccessAlert');
    if (alertBanner) {
      alertBanner.classList.add('show');
      setTimeout(() => {
        alertBanner.classList.remove('show');
      }, 5000);
    }

    // Also fire a green toast notification
    showToast('student added successfull', 'success');

    // Reset the form
    document.getElementById('addStudentForm').reset();

    // Reload metadata and student records
    loadCoursesAndSections();
    loadAllStudentsTable();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();

  } catch (err) {
    console.error('Error adding student:', err);
    showToast('Network error while adding student.', 'danger');
  }
}

// Fetch and load all student records
async function loadAllStudentsTable() {
  try {
    const res = await fetch('/api/students');
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('Could not load students');
      return;
    }

    allStudentsList = data.students || [];

    // Update "Total Students Added Till Date" badges
    const totalCount = allStudentsList.length;
    const badgeEl = document.getElementById('recordsTotalBadge');
    const navBadge = document.getElementById('navBadgeStudentCount');
    const dashTotal = document.getElementById('dashTotalStudents');

    if (badgeEl) badgeEl.textContent = totalCount;
    if (navBadge) navBadge.textContent = totalCount;
    if (dashTotal) dashTotal.textContent = totalCount;

    // Render table
    filterStudentRecords();
    renderRecentStudentsDashboard();

  } catch (err) {
    console.error('Error fetching students:', err);
  }
}

// Filter and render student records table
function filterStudentRecords() {
  const searchInput = document.getElementById('recordSearchInput');
  const courseFilter = document.getElementById('recordCourseFilter');
  const sectionFilter = document.getElementById('recordSectionFilter');
  const tbody = document.getElementById('allStudentsTableBody');

  if (!tbody) return;

  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedCourse = courseFilter ? courseFilter.value : 'ALL';
  const selectedSection = sectionFilter ? sectionFilter.value : 'ALL';

  let filtered = allStudentsList.filter(s => {
    const matchQuery = !q || 
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      (s.contact && s.contact.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q));

    const matchCourse = selectedCourse === 'ALL' || s.course.toLowerCase() === selectedCourse.toLowerCase();
    const matchSection = selectedSection === 'ALL' || s.section.toLowerCase() === selectedSection.toLowerCase();

    return matchQuery && matchCourse && matchSection;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-users-slash"></i></div>
          <h4>No student records found</h4>
          <p>No students match your filter criteria. Try resetting filters or adding new students.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td><span class="badge badge-gray" style="font-weight: 700;">${escapeHtml(s.rollNo)}</span></td>
      <td><strong>${escapeHtml(s.admissionNo)}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="avatar-circle" style="width: 32px; height: 32px; font-size: 13px; background: ${stringToColor(s.name)};">
            ${escapeHtml(s.name.charAt(0).toUpperCase())}
          </div>
          <div>
            <div style="font-weight: 600;">${escapeHtml(s.name)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(s.gender || '')}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge badge-blue">${escapeHtml(s.course)}</span>
        <span class="badge badge-gray">Sec ${escapeHtml(s.section)}</span>
      </td>
      <td>
        <div style="font-size: 13px;">${escapeHtml(s.contact || 'No phone')}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(s.guardianContact ? 'Parent: ' + s.guardianContact : '')}</div>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openStudentHistoryModal('${s.id}', '${escapeJs(s.name)}', '${escapeJs(s.rollNo)}', '${escapeJs(s.course)}', '${escapeJs(s.section)}')">
          <i class="fa-solid fa-calendar-days" style="color: var(--primary);"></i> View History
        </button>
      </td>
      <td style="text-align: right;">
        <button class="btn-action-icon delete-btn" title="Delete Student Record" onclick="openDeleteModal('${s.id}', '${escapeJs(s.name)}')">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function resetRecordsFilter() {
  const searchInput = document.getElementById('recordSearchInput');
  const courseFilter = document.getElementById('recordCourseFilter');
  const sectionFilter = document.getElementById('recordSectionFilter');

  if (searchInput) searchInput.value = '';
  if (courseFilter) courseFilter.value = 'ALL';
  if (sectionFilter) sectionFilter.value = 'ALL';

  filterStudentRecords();
}

// Render preview in Dashboard
function renderRecentStudentsDashboard() {
  const tbody = document.getElementById('dashboardRecentStudentsBody');
  if (!tbody) return;

  if (allStudentsList.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-user-plus"></i></div>
          <h4>No students added yet</h4>
          <p>Click "Add New Student" above to start enrolling students.</p>
        </td>
      </tr>
    `;
    return;
  }

  const recent = [...allStudentsList].reverse().slice(0, 5);
  tbody.innerHTML = recent.map(s => `
    <tr>
      <td><span class="badge badge-gray">${escapeHtml(s.rollNo)}</span></td>
      <td><strong>${escapeHtml(s.admissionNo)}</strong></td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(s.name)}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(s.email || 'No email')}</div>
      </td>
      <td>${escapeHtml(s.course)} - Sec ${escapeHtml(s.section)}</td>
      <td>${escapeHtml(s.contact || 'N/A')}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openStudentHistoryModal('${s.id}', '${escapeJs(s.name)}', '${escapeJs(s.rollNo)}', '${escapeJs(s.course)}', '${escapeJs(s.section)}')">
          <i class="fa-solid fa-clock-rotate-left"></i> History
        </button>
      </td>
    </tr>
  `).join('');
}

// ================= STUDENT ATTENDANCE HISTORY MODAL =================
async function openStudentHistoryModal(studentId, name, rollNo, course, section) {
  const modal = document.getElementById('studentHistoryModal');
  const nameEl = document.getElementById('historyStudentName');
  const detailsEl = document.getElementById('historyStudentDetails');
  const listEl = document.getElementById('historyListContainer');
  const totalDaysEl = document.getElementById('histTotalDays');
  const presentDaysEl = document.getElementById('histPresentDays');
  const absentDaysEl = document.getElementById('histAbsentDays');

  nameEl.textContent = name;
  detailsEl.textContent = `Roll No: ${rollNo} • ${course} (Section ${section})`;
  listEl.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Loading records...</div>';

  modal.classList.add('open');

  try {
    const res = await fetch(`/api/students/${studentId}/attendance`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      listEl.innerHTML = '<div class="empty-state">Unable to load attendance records.</div>';
      return;
    }

    totalDaysEl.textContent = data.stats.totalDays;
    presentDaysEl.textContent = data.stats.presentDays;
    absentDaysEl.textContent = data.stats.absentDays;

    if (data.records.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="padding: 24px;">
          <div class="empty-icon"><i class="fa-regular fa-calendar-xmark"></i></div>
          <h4>No Attendance Recorded Yet</h4>
          <p>No past or future attendance sessions found for this student.</p>
        </div>
      `;
      return;
    }

    // Render list: GREEN for PRESENT, RED for ABSENT
    listEl.innerHTML = data.records.map(rec => {
      const isPresent = rec.status === 'present';
      const statusClass = isPresent ? 'status-present' : 'status-absent';
      const statusIcon = isPresent ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
      const statusLabel = isPresent ? 'PRESENT' : 'ABSENT';

      // Date formatting
      const dateObj = new Date(rec.date + 'T00:00:00');
      const formattedDate = dateObj.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="history-item ${statusClass}">
          <div>
            <div class="history-date">
              <i class="fa-regular fa-calendar" style="margin-right: 6px;"></i>
              ${formattedDate} (${rec.date})
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              ${escapeHtml(rec.course)} - Section ${escapeHtml(rec.section)}
            </div>
          </div>
          <span class="history-tag">
            <i class="${statusIcon}"></i> ${statusLabel}
          </span>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error fetching student history:', err);
    listEl.innerHTML = '<div class="empty-state">Error fetching attendance history.</div>';
  }
}

function closeStudentHistoryModal() {
  document.getElementById('studentHistoryModal').classList.remove('open');
}

// ================= DELETE STUDENT MODAL =================
function openDeleteModal(studentId, studentName) {
  studentToDeleteId = studentId;
  const nameEl = document.getElementById('deleteTargetStudentName');
  if (nameEl) nameEl.textContent = studentName;
  document.getElementById('deleteConfirmModal').classList.add('open');
}

function closeDeleteModal() {
  studentToDeleteId = null;
  document.getElementById('deleteConfirmModal').classList.remove('open');
}

async function confirmDeleteStudent() {
  if (!studentToDeleteId) return;

  const btn = document.getElementById('btnConfirmDeleteStudent');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

  try {
    const res = await fetch(`/api/students/${studentToDeleteId}`, {
      method: 'DELETE'
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Failed to delete student.', 'danger');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Yes, Delete Record';
      return;
    }

    showToast('Student record deleted successfully.', 'success');
    closeDeleteModal();
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Yes, Delete Record';

    // Refresh student list and attendance meta
    loadAllStudentsTable();
    loadCoursesAndSections();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();

  } catch (err) {
    console.error('Error deleting student:', err);
    showToast('Network error while deleting student.', 'danger');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Yes, Delete Record';
  }
}
