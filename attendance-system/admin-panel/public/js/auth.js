/* ========================================================
   EduAttend - Dual Role Authentication Logic (Teacher & Student)
   ======================================================== */

const AUTH_STORAGE_KEY = 'eduattend_admin_user';
const STUDENT_STORAGE_KEY = 'eduattend_student_user';

let currentAuthRole = 'teacher'; // 'teacher' or 'student'
let currentAuthTab = 'login';    // 'login' or 'register'

function getLoggedInUser() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

function setLoggedInUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

function clearLoggedInUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Switch between "Teacher" and "Student" roles on login screen
function switchAuthRole(role) {
  currentAuthRole = role;

  const btnTeacher = document.getElementById('roleBtnTeacher');
  const btnStudent = document.getElementById('roleBtnStudent');

  const teacherForms = document.getElementById('teacherFormsContainer');
  const studentForms = document.getElementById('studentFormsContainer');

  const portalSubtitle = document.getElementById('portalSubtitle');

  if (role === 'teacher') {
    btnTeacher.classList.add('active');
    btnStudent.classList.remove('active');
    teacherForms.style.display = 'block';
    studentForms.style.display = 'none';
    if (portalSubtitle) portalSubtitle.textContent = 'Teacher & Administrator Management Panel';
    switchAuthTab('login');
  } else {
    btnStudent.classList.add('active');
    btnTeacher.classList.remove('active');
    teacherForms.style.display = 'none';
    studentForms.style.display = 'block';
    if (portalSubtitle) portalSubtitle.textContent = 'Student Academic & Attendance Portal';
    switchAuthTab('login');
  }
}

// Switch between "Login" and "Register" subtabs
function switchAuthTab(tab) {
  currentAuthTab = tab;

  // Teacher forms
  const tLoginBtn = document.getElementById('tabLoginBtn');
  const tRegBtn = document.getElementById('tabRegisterBtn');
  const tLoginForm = document.getElementById('loginForm');
  const tRegForm = document.getElementById('registerForm');

  // Student forms
  const sLoginBtn = document.getElementById('tabStudentLoginBtn');
  const sRegBtn = document.getElementById('tabStudentRegisterBtn');
  const sLoginForm = document.getElementById('studentLoginForm');
  const sRegForm = document.getElementById('studentRegisterForm');

  if (currentAuthRole === 'teacher') {
    if (tab === 'login') {
      tLoginBtn.classList.add('active');
      tRegBtn.classList.remove('active');
      tLoginForm.style.display = 'flex';
      tRegForm.style.display = 'none';
    } else {
      tRegBtn.classList.add('active');
      tLoginBtn.classList.remove('active');
      tLoginForm.style.display = 'none';
      tRegForm.style.display = 'flex';
    }
  } else {
    if (tab === 'login') {
      sLoginBtn.classList.add('active');
      sRegBtn.classList.remove('active');
      sLoginForm.style.display = 'flex';
      sRegForm.style.display = 'none';
    } else {
      sRegBtn.classList.add('active');
      sLoginBtn.classList.remove('active');
      sLoginForm.style.display = 'none';
      sRegForm.style.display = 'flex';
    }
  }
}

function fillDemoTeacherCredentials() {
  document.getElementById('loginEmail').value = 'teacher@school.edu';
  document.getElementById('loginPassword').value = 'password123';
  showToast('Demo teacher credentials auto-filled!', 'info');
}

function fillDemoStudentCredentials() {
  document.getElementById('studentLoginIdentifier').value = 'ADM2026001';
  document.getElementById('studentLoginPassword').value = 'password123';
  showToast('Demo student credentials auto-filled (Aarav Sharma)!', 'info');
}

// ================= TEACHER AUTH =================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    showToast('Please enter both email and password.', 'danger');
    return;
  }

  try {
    const res = await fetch('/api/auth/teacher/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Login failed. Please check credentials.', 'danger');
      return;
    }

    setLoggedInUser(data.user);
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    renderAppForLoggedInUser(data.user);
  } catch (err) {
    console.error('Login error:', err);
    showToast('Network error during login.', 'danger');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const department = document.getElementById('regDepartment').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!name || !email || !password) {
    showToast('Please fill in all required registration fields.', 'danger');
    return;
  }

  try {
    const res = await fetch('/api/auth/teacher/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, department, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Registration failed.', 'danger');
      return;
    }

    setLoggedInUser(data.user);
    showToast('Teacher registered successfully! Welcome to Admin Panel.', 'success');
    renderAppForLoggedInUser(data.user);
  } catch (err) {
    console.error('Registration error:', err);
    showToast('Network error during registration.', 'danger');
  }
}

// ================= STUDENT AUTH =================
async function handleStudentLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById('studentLoginIdentifier').value.trim();
  const password = document.getElementById('studentLoginPassword').value.trim();

  if (!identifier || !password) {
    showToast('Please enter Admission No. / Email and password.', 'danger');
    return;
  }

  try {
    const res = await fetch('/api/auth/student/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Student login failed.', 'danger');
      return;
    }

    // Save student session and redirect to student panel
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(data.student));
    showToast(`Welcome, ${data.student.name}! Loading your Student Panel...`, 'success');

    setTimeout(() => {
      window.location.href = '/student';
    }, 800);

  } catch (err) {
    console.error('Student login error:', err);
    showToast('Network error during student login.', 'danger');
  }
}

async function handleStudentRegister(e) {
  e.preventDefault();
  const name = document.getElementById('stdRegName').value.trim();
  const admissionNo = document.getElementById('stdRegAdm').value.trim();
  const rollNo = document.getElementById('stdRegRoll').value.trim();
  const course = document.getElementById('stdRegCourse').value.trim();
  const section = document.getElementById('stdRegSection').value.trim();
  const email = document.getElementById('stdRegEmail').value.trim();
  const contact = document.getElementById('stdRegContact').value.trim();
  const password = document.getElementById('stdRegPassword').value.trim();

  if (!name || !admissionNo || !rollNo || !course || !section || !password) {
    showToast('Please fill all required student registration fields.', 'danger');
    return;
  }

  try {
    const res = await fetch('/api/auth/student/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, admissionNo, rollNo, course, section, email, contact, password })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Student registration failed.', 'danger');
      return;
    }

    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(data.student));
    showToast(`Registered successfully! Opening Student Panel...`, 'success');

    setTimeout(() => {
      window.location.href = '/student';
    }, 800);

  } catch (err) {
    console.error('Student registration error:', err);
    showToast('Network error during student registration.', 'danger');
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to sign out from the Admin Panel?')) {
    clearLoggedInUser();
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('appContainer').style.display = 'none';
    showToast('You have signed out successfully.', 'info');
  }
}

function renderAppForLoggedInUser(user) {
  document.getElementById('authContainer').style.display = 'none';
  document.getElementById('appContainer').style.display = 'flex';

  const nameDisplay = document.getElementById('userNameDisplay');
  const deptDisplay = document.getElementById('userDeptDisplay');
  const avatar = document.getElementById('userAvatar');

  if (nameDisplay) nameDisplay.textContent = user.name;
  if (deptDisplay) deptDisplay.textContent = user.department || 'Faculty Admin';
  if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();

  if (typeof initAppData === 'function') {
    initAppData();
  }
}
