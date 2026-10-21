/* ========================================================
   EduAttend - Student Portal Logic
   ======================================================== */

const STUDENT_STORAGE_KEY = 'eduattend_student_user';

let currentStudent = null;
let currentStudentData = null;

function getStudentSession() {
  const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function handleStudentLogout() {
  if (confirm('Are you sure you want to sign out from the Student Portal?')) {
    localStorage.removeItem(STUDENT_STORAGE_KEY);
    window.location.href = '/';
  }
}

function switchStudentTab(tabName) {
  // Update buttons
  const buttons = document.querySelectorAll('.nav-tabs-inner .tab-btn');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Switch view tabs
  const tabs = document.querySelectorAll('.student-view-tab');
  tabs.forEach(t => t.classList.remove('active'));

  const target = document.getElementById(`tabContent_${tabName}`);
  if (target) {
    target.classList.add('active');
  }

  // Scroll to view if triggered from hero button
  if (tabName !== 'home') {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Load full portal data for the student
async function loadStudentPortalData() {
  if (!currentStudent || !currentStudent.id) return;

  try {
    const res = await fetch(`/api/student/${currentStudent.id}/portal-data`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('Failed to load student portal data');
      return;
    }

    currentStudentData = data;
    renderStudentHeaderAndHero(data.student);
    renderAttendanceSummary(data.attendance);
    renderAttendanceTimeline(data.attendance.records);
    renderAllAttendanceRecordsTable(data.attendance.records);
    renderStudentAssignments(data.assignments);

  } catch (err) {
    console.error('Error fetching student data:', err);
  }
}

// Render header & hero with student information
function renderStudentHeaderAndHero(student) {
  // Header
  const pillName = document.getElementById('headerStudentName');
  const pillCourse = document.getElementById('headerStudentCourse');
  const avatar = document.getElementById('headerStudentAvatar');

  if (pillName) pillName.textContent = student.name;
  if (pillCourse) pillCourse.textContent = `${student.course} • Sec ${student.section}`;
  if (avatar) avatar.textContent = student.name.charAt(0).toUpperCase();

  // Hero section
  const heroName = document.getElementById('heroStudentName');
  const heroRoll = document.getElementById('heroStudentRoll');
  const heroCourse = document.getElementById('heroStudentCourse');
  const heroAdm = document.getElementById('heroStudentAdmissionNo');

  if (heroName) heroName.textContent = student.name;
  if (heroRoll) heroRoll.textContent = student.rollNo;
  if (heroCourse) heroCourse.textContent = `${student.course} (Section ${student.section})`;
  if (heroAdm) heroAdm.textContent = student.admissionNo;
}

// Render attendance circular meter & summary cards
function renderAttendanceSummary(attendance) {
  const stats = attendance.stats;
  const rate = stats.percentage || 0;

  // Circular meter
  const meter = document.getElementById('circularMeter');
  const meterPercent = document.getElementById('meterPercent');
  const meterStatusBadge = document.getElementById('meterStatusBadge');

  if (meter) {
    meter.style.setProperty('--percent', rate);
  }
  if (meterPercent) {
    meterPercent.textContent = `${rate}%`;
  }
  if (meterStatusBadge) {
    if (rate >= 75) {
      meterStatusBadge.className = 'status-pill pill-present';
      meterStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Good Standing (≥ 75%)';
    } else {
      meterStatusBadge.className = 'status-pill pill-absent';
      meterStatusBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Low Attendance (< 75%)';
    }
  }

  // Summary counts
  const totalEl = document.getElementById('statTotalClasses');
  const presentEl = document.getElementById('statPresentDays');
  const absentEl = document.getElementById('statAbsentDays');

  if (totalEl) totalEl.textContent = stats.totalDays;
  if (presentEl) presentEl.textContent = stats.presentDays;
  if (absentEl) absentEl.textContent = stats.absentDays;

  // Hero Quick Badge
  const heroRateBadge = document.getElementById('heroAttendanceRate');
  if (heroRateBadge) heroRateBadge.textContent = `${rate}% Overall`;
}

// Render past attendance records list (GREEN for Present, RED for Absent)
function renderAttendanceTimeline(records) {
  const container = document.getElementById('attendanceTimelineContainer');
  const fullContainer = document.getElementById('fullAttendanceTimeline');

  if (!records || records.length === 0) {
    const emptyHtml = `
      <div class="empty-box">
        <i class="fa-regular fa-calendar-xmark"></i>
        <h4>No attendance recorded yet</h4>
        <p>Your teachers have not recorded any attendance sessions for your class yet.</p>
      </div>
    `;
    if (container) container.innerHTML = emptyHtml;
    if (fullContainer) fullContainer.innerHTML = emptyHtml;
    return;
  }

  // Sort by date descending
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const itemsHtml = sorted.map(rec => {
    const isPresent = rec.status === 'present';
    const cardClass = isPresent ? 'timeline-card is-present' : 'timeline-card is-absent';
    const statusClass = isPresent ? 'status-pill pill-present' : 'status-pill pill-absent';
    const statusIcon = isPresent ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
    const statusLabel = isPresent ? 'PRESENT' : 'ABSENT';

    const dateObj = new Date(rec.date + 'T00:00:00');
    const month = dateObj.toLocaleDateString(undefined, { month: 'short' });
    const day = dateObj.getDate();
    const fullDate = dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `
      <div class="${cardClass}">
        <div class="timeline-date-info">
          <div class="date-calendar-box">
            <span class="month">${month}</span>
            <span class="day">${day}</span>
          </div>
          <div class="timeline-meta">
            <h4>${fullDate}</h4>
            <p><i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(rec.course)} • Section ${escapeHtml(rec.section)}</p>
          </div>
        </div>

        <div>
          <span class="${statusClass}">
            <i class="${statusIcon}"></i> ${statusLabel}
          </span>
        </div>
      </div>
    `;
  }).join('');

  if (container) container.innerHTML = itemsHtml;
  if (fullContainer) fullContainer.innerHTML = itemsHtml;
}

// Render full table of records
function renderAllAttendanceRecordsTable(records) {
  const tbody = document.getElementById('allAttendanceRecordsTableBody');
  if (!tbody) return;

  if (!records || records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-box">No records to display.</td></tr>`;
    return;
  }

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  tbody.innerHTML = sorted.map(rec => {
    const isPresent = rec.status === 'present';
    const statusPill = isPresent 
      ? '<span class="status-pill pill-present" style="font-size: 11px; padding: 2px 10px;"><i class="fa-solid fa-check"></i> PRESENT</span>'
      : '<span class="status-pill pill-absent" style="font-size: 11px; padding: 2px 10px;"><i class="fa-solid fa-xmark"></i> ABSENT</span>';

    return `
      <tr style="background: ${isPresent ? '#f0fdf4' : '#fef2f2'};">
        <td style="padding: 12px 16px; font-weight: 700;">${rec.date}</td>
        <td style="padding: 12px 16px;">${escapeHtml(rec.course)}</td>
        <td style="padding: 12px 16px;">Section ${escapeHtml(rec.section)}</td>
        <td style="padding: 12px 16px;">${statusPill}</td>
        <td style="padding: 12px 16px; font-size: 12px; color: var(--text-muted);">Recorded by Teacher</td>
      </tr>
    `;
  }).join('');
}

// Filter records in "Show All Records" table
function filterStudentRecordsTable() {
  if (!currentStudentData || !currentStudentData.attendance) return;
  const q = (document.getElementById('searchRecordsInput')?.value || '').toLowerCase().trim();
  const filter = document.getElementById('filterRecordsStatus')?.value || 'ALL';

  let records = currentStudentData.attendance.records || [];
  if (filter !== 'ALL') {
    records = records.filter(r => r.status === filter);
  }
  if (q) {
    records = records.filter(r => r.date.includes(q) || r.course.toLowerCase().includes(q));
  }
  renderAllAttendanceRecordsTable(records);
}

// Render assignments uploaded by teacher for this student's class
function renderStudentAssignments(assignments) {
  const container = document.getElementById('studentAssignmentsContainer');
  const countBadge = document.getElementById('heroAssignmentsCount');

  if (countBadge) {
    countBadge.textContent = assignments ? `${assignments.length} Available` : '0 Available';
  }

  if (!container) return;

  if (!assignments || assignments.length === 0) {
    container.innerHTML = `
      <div class="empty-box" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-book-open"></i>
        <h4>No assignments uploaded yet</h4>
        <p>Your teachers have not uploaded any PDF assignments or study materials for your class yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = assignments.map(asg => {
    const hasFile = Boolean(asg.fileUrl);
    const isPdf = asg.fileName && asg.fileName.toLowerCase().endsWith('.pdf');
    const fileIcon = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-lines';

    return `
      <div class="assignment-card-student">
        <div>
          <div class="asg-top">
            <span class="status-pill" style="background: #eff6ff; color: #1d4ed8; font-size: 11px;">
              <i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(asg.course)} • Sec ${escapeHtml(asg.section)}
            </span>
            ${asg.subject ? `<span class="status-pill" style="background: #f1f5f9; color: #334155; font-size: 11px;">${escapeHtml(asg.subject)}</span>` : ''}
          </div>

          <h3 class="asg-title">${escapeHtml(asg.title)}</h3>
          <p class="asg-desc">${escapeHtml(asg.description || 'No additional instructions provided by teacher.')}</p>

          ${hasFile ? `
            <div class="asg-file-card">
              <div class="asg-file-left">
                <div class="pdf-icon-box">
                  <i class="${fileIcon}"></i>
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 13px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;" title="${escapeHtml(asg.originalName || asg.fileName)}">
                    ${escapeHtml(asg.originalName || asg.fileName)}
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(asg.fileSize || 'PDF Document')}</div>
                </div>
              </div>
              
              <a href="${escapeHtml(asg.fileUrl)}" target="_blank" download class="btn-download-pdf">
                <i class="fa-solid fa-download"></i> Download / View
              </a>
            </div>
          ` : `
            <div style="font-size: 12px; color: var(--text-light); margin-bottom: 16px;">No file attachment</div>
          `}
        </div>

        <div class="asg-meta-footer">
          <div>
            <i class="fa-regular fa-calendar-check" style="color: var(--student-primary);"></i> Due: <strong>${asg.dueDate ? escapeHtml(asg.dueDate) : 'No deadline'}</strong>
          </div>
          <div>
            <span>Uploaded: ${new Date(asg.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  currentStudent = getStudentSession();

  if (!currentStudent) {
    // Redirect to root portal login
    window.location.href = '/?mode=student';
    return;
  }

  loadStudentPortalData();
});
