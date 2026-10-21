/* ========================================================
   EduAttend - End-of-Day Daily Attendance Email Dispatch Logic
   ======================================================== */

let emailLogsCache = [];

function openDailyEmailModal() {
  const modal = document.getElementById('dailyEmailModal');
  const dateInput = document.getElementById('emailTargetDate');

  if (dateInput && !dateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  modal.classList.add('open');
  loadEmailLogs();
}

function closeDailyEmailModal() {
  document.getElementById('dailyEmailModal').classList.remove('open');
}

// 1-Click Send Daily Attendance Emails to All Students
async function sendDailyAttendanceEmailsNow() {
  const dateInput = document.getElementById('emailTargetDate');
  const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

  const sendBtn = document.getElementById('btnSendEmailsSubmit');
  sendBtn.disabled = true;
  sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Dispatching Daily Emails...';

  try {
    const res = await fetch('/api/attendance/send-daily-emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Failed to dispatch daily emails.', 'danger');
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Daily Emails in 1-Click';
      return;
    }

    showToast(`Daily attendance emails sent to ${data.count} students successfully!`, 'success');
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Daily Emails in 1-Click';

    // Refresh email outbox table
    loadEmailLogs();

  } catch (err) {
    console.error('Error dispatching emails:', err);
    showToast('Network error while dispatching daily emails.', 'danger');
    sendBtn.disabled = false;
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Daily Emails in 1-Click';
  }
}

// Fetch and render sent emails outbox
async function loadEmailLogs() {
  const tbody = document.getElementById('emailLogsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/attendance/email-logs');
    const data = await res.json();

    if (!res.ok || !data.success) return;

    emailLogsCache = data.logs || [];
    renderEmailLogsTable(emailLogsCache);

  } catch (err) {
    console.error('Error loading email logs:', err);
  }
}

function renderEmailLogsTable(logs) {
  const tbody = document.getElementById('emailLogsTableBody');
  if (!tbody) return;

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state" style="padding: 24px;">
          <i class="fa-solid fa-envelope-circle-check empty-icon"></i>
          <h4>No emails sent yet today</h4>
          <p>Click "Send Daily Emails in 1-Click" above to notify all students of their daily attendance.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs.map(log => {
    const isPresent = log.todayStatus === 'present';
    const badgeColor = isPresent ? 'badge-green' : 'badge-red';

    return `
      <tr>
        <td><strong>${escapeHtml(log.studentName)}</strong><br><span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(log.rollNo)}</span></td>
        <td>${escapeHtml(log.studentEmail)}</td>
        <td>${escapeHtml(log.date)}</td>
        <td>
          <span class="badge ${badgeColor}">${escapeHtml(log.todayRatio || log.todayStatus.toUpperCase())}</span>
        </td>
        <td>
          <span class="badge badge-blue"><i class="fa-solid fa-check"></i> ${escapeHtml(log.status)}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-outline btn-sm" onclick="previewEmail('${log.id}')">
            <i class="fa-solid fa-eye"></i> Preview
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// Preview email HTML in modal
function previewEmail(logId) {
  const log = emailLogsCache.find(l => l.id === logId);
  if (!log) return;

  const previewModal = document.getElementById('emailPreviewModal');
  const previewFrame = document.getElementById('emailPreviewFrame');
  const previewSubject = document.getElementById('emailPreviewSubject');
  const previewTo = document.getElementById('emailPreviewTo');

  if (previewSubject) previewSubject.textContent = log.subject;
  if (previewTo) previewTo.textContent = `To: ${log.studentName} <${log.studentEmail}>`;

  if (previewFrame) {
    const doc = previewFrame.contentWindow.document;
    doc.open();
    doc.write(log.previewHtml || '<p>No preview available.</p>');
    doc.close();
  }

  if (previewModal) previewModal.classList.add('open');
}

function closeEmailPreviewModal() {
  const modal = document.getElementById('emailPreviewModal');
  if (modal) modal.classList.remove('open');
}
