/* ========================================================
   EduAttend - Main Application Coordinator
   ======================================================== */

// View switching
function switchView(viewName) {
  // Update sidebar active state
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Hide all views
  const views = document.querySelectorAll('.section-view');
  views.forEach(v => v.classList.remove('active'));

  // Target view mapping
  const viewMap = {
    dashboard: { id: 'viewDashboard', title: 'Dashboard Overview', sub: 'System metrics and quick attendance management' },
    attendance: { id: 'viewAttendance', title: 'Take Attendance', sub: 'Record, review, and save student presence records' },
    addStudent: { id: 'viewAddStudent', title: 'Add Student', sub: 'Enroll new students into class sections' },
    records: { id: 'viewRecords', title: 'Student Records', sub: 'Comprehensive roster and attendance history of all students' },
    assignments: { id: 'viewAssignments', title: 'Assignments', sub: 'Upload and distribute homework & study material PDFs' }
  };

  const target = viewMap[viewName];
  if (target) {
    const el = document.getElementById(target.id);
    if (el) el.classList.add('active');

    const pageTitle = document.getElementById('pageTitle');
    const pageSub = document.getElementById('pageSubtitle');
    if (pageTitle) pageTitle.textContent = target.title;
    if (pageSub) pageSub.textContent = target.sub;
  }

  // View-specific refreshes
  if (viewName === 'attendance') {
    initAttendanceControls();
    loadCoursesAndSections();
  } else if (viewName === 'records') {
    loadAllStudentsTable();
  } else if (viewName === 'assignments') {
    loadAssignments();
    loadCoursesAndSections();
  } else if (viewName === 'dashboard') {
    loadDashboardStats();
    loadAllStudentsTable();
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-solid fa-circle-info';
  if (type === 'success') icon = 'fa-solid fa-circle-check';
  if (type === 'danger') icon = 'fa-solid fa-circle-exclamation';

  toast.innerHTML = `<i class="${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
}

// Load dashboard stats
async function loadDashboardStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    if (data.success) {
      const totalStudentsEl = document.getElementById('dashTotalStudents');
      const attendanceRateEl = document.getElementById('dashAttendanceRate');
      const attendanceSubEl = document.getElementById('dashAttendanceSub');
      const assignmentsCountEl = document.getElementById('dashAssignmentsCount');
      const activeCoursesEl = document.getElementById('dashActiveCourses');

      if (totalStudentsEl) totalStudentsEl.textContent = data.totalStudents;
      if (attendanceRateEl) attendanceRateEl.textContent = `${data.overallAttendance.rate}%`;
      if (attendanceSubEl) attendanceSubEl.textContent = `${data.overallAttendance.present} Present / ${data.overallAttendance.absent} Absent`;
      if (assignmentsCountEl) assignmentsCountEl.textContent = data.totalAssignments;

      if (activeCoursesEl && availableClasses) {
        activeCoursesEl.textContent = availableClasses.length;
      }
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }
}

// Topbar Date display
function updateCurrentDateDisplay() {
  const el = document.getElementById('currentDateDisplay');
  if (el) {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    el.textContent = now.toLocaleDateString(undefined, options);
  }
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper: Escape JS string literals in inline onclicks
function escapeJs(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Helper: Generate consistent pleasant color from string
function stringToColor(str) {
  if (!str) return '#4f46e5';
  const colors = [
    '#4f46e5', '#059669', '#d97706', '#dc2626',
    '#7c3aed', '#0284c7', '#db2777', '#0d9488'
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Quick Refresh
function quickRefresh() {
  loadCoursesAndSections();
  loadAllStudentsTable();
  loadAssignments();
  loadDashboardStats();
  showToast('Data refreshed.', 'info');
}

// Initialize all application data once logged in
function initAppData() {
  updateCurrentDateDisplay();
  initAttendanceControls();
  loadCoursesAndSections();
  loadAllStudentsTable();
  loadAssignments();
  loadDashboardStats();
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = getLoggedInUser();
  if (loggedInUser) {
    renderAppForLoggedInUser(loggedInUser);
  } else {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
  }
});
