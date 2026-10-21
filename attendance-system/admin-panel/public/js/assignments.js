/* ========================================================
   EduAttend - Assignment Upload & Management Logic
   ======================================================== */

let allAssignmentsList = [];

function openAssignmentModal() {
  document.getElementById('assignmentUploadForm').reset();
  const label = document.getElementById('dropzoneLabel');
  if (label) label.textContent = 'Click or Drag & Drop Assignment PDF';
  document.getElementById('assignmentModal').classList.add('open');
}

function closeAssignmentModal() {
  document.getElementById('assignmentModal').classList.remove('open');
}

function handleFileSelected(input) {
  const label = document.getElementById('dropzoneLabel');
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const sizeKB = (file.size / 1024).toFixed(1);
    label.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)} <span style="font-size: 11px; color: var(--text-muted);">(${sizeKB} KB)</span>`;
  } else {
    label.textContent = 'Click or Drag & Drop Assignment PDF';
  }
}

// Upload assignment with PDF file
async function handleUploadAssignment(e) {
  e.preventDefault();

  const title = document.getElementById('asgTitle').value.trim();
  const course = document.getElementById('asgCourse').value.trim();
  const section = document.getElementById('asgSection').value.trim();
  const subject = document.getElementById('asgSubject').value.trim();
  const dueDate = document.getElementById('asgDueDate').value;
  const description = document.getElementById('asgDescription').value.trim();
  const fileInput = document.getElementById('asgFile');

  if (!title || !course || !section) {
    showToast('Please specify Assignment Title, Course, and Section.', 'danger');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('course', course);
  formData.append('section', section);
  formData.append('subject', subject);
  formData.append('dueDate', dueDate);
  formData.append('description', description);

  if (fileInput.files && fileInput.files[0]) {
    formData.append('assignmentFile', fileInput.files[0]);
  }

  const submitBtn = document.getElementById('btnUploadSubmit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading PDF...';

  try {
    const res = await fetch('/api/assignments', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Error uploading assignment.', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload & Publish';
      return;
    }

    showToast('Assignment uploaded successfully!', 'success');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload & Publish';
    closeAssignmentModal();

    // Reload assignments
    loadAssignments();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();

  } catch (err) {
    console.error('Error uploading assignment:', err);
    showToast('Network error while uploading assignment.', 'danger');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-upload"></i> Upload & Publish';
  }
}

// Load and render all assignments
async function loadAssignments() {
  try {
    const res = await fetch('/api/assignments');
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error('Could not load assignments');
      return;
    }

    allAssignmentsList = data.assignments || [];

    // Update badge counters
    const navBadge = document.getElementById('navBadgeAssignmentCount');
    const dashCount = document.getElementById('dashAssignmentsCount');
    if (navBadge) navBadge.textContent = allAssignmentsList.length;
    if (dashCount) dashCount.textContent = allAssignmentsList.length;

    renderAssignmentsGrid();

  } catch (err) {
    console.error('Error fetching assignments:', err);
  }
}

function renderAssignmentsGrid() {
  const container = document.getElementById('assignmentsGridContainer');
  if (!container) return;

  if (allAssignmentsList.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; background: #ffffff; border-radius: var(--radius-lg); border: 1px dashed var(--border-color); padding: 60px 20px;">
        <div class="empty-icon"><i class="fa-solid fa-folder-open"></i></div>
        <h4>No assignments uploaded yet</h4>
        <p>Click "Add Assignment" to upload course materials, assignments, or PDF worksheets for your students.</p>
        <button class="btn btn-primary" style="margin-top: 14px;" onclick="openAssignmentModal()">
          <i class="fa-solid fa-plus"></i> Upload First Assignment
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = allAssignmentsList.map(asg => {
    const hasFile = Boolean(asg.fileUrl);
    const isPdf = asg.fileName && asg.fileName.toLowerCase().endsWith('.pdf');
    const fileIcon = isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-file-lines';

    return `
      <div class="assignment-card">
        <div>
          <div class="assignment-header">
            <div class="assignment-tags">
              <span class="badge badge-blue">${escapeHtml(asg.course)}</span>
              <span class="badge badge-gray">Sec ${escapeHtml(asg.section)}</span>
              ${asg.subject ? `<span class="badge badge-green">${escapeHtml(asg.subject)}</span>` : ''}
            </div>
            <button class="btn-action-icon delete-btn" title="Delete Assignment" onclick="deleteAssignmentItem('${asg.id}', '${escapeJs(asg.title)}')">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>

          <h4 class="assignment-title">${escapeHtml(asg.title)}</h4>
          <p class="assignment-desc">${escapeHtml(asg.description || 'No additional instructions provided.')}</p>

          ${hasFile ? `
            <div class="assignment-file-box">
              <div class="file-info">
                <i class="${fileIcon} file-icon"></i>
                <div>
                  <div class="file-name" title="${escapeHtml(asg.originalName || asg.fileName)}">${escapeHtml(asg.originalName || asg.fileName)}</div>
                  <div class="file-size">${escapeHtml(asg.fileSize || 'PDF Document')}</div>
                </div>
              </div>
              <a href="${escapeHtml(asg.fileUrl)}" target="_blank" download class="btn btn-outline btn-sm" style="flex-shrink: 0;">
                <i class="fa-solid fa-download"></i> View / Download
              </a>
            </div>
          ` : `
            <div style="font-size: 12px; color: var(--text-light); margin-bottom: 12px;">No file attachment</div>
          `}
        </div>

        <div class="assignment-footer">
          <div>
            <i class="fa-regular fa-calendar-check"></i> Due: <strong>${asg.dueDate ? escapeHtml(asg.dueDate) : 'No deadline'}</strong>
          </div>
          <div>
            <span style="font-size: 11px; color: var(--text-light);">Uploaded ${new Date(asg.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function deleteAssignmentItem(assignmentId, title) {
  if (!confirm(`Are you sure you want to delete assignment "${title}"?`)) return;

  try {
    const res = await fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
    const data = await res.json();

    if (!res.ok || !data.success) {
      showToast(data.message || 'Failed to delete assignment.', 'danger');
      return;
    }

    showToast('Assignment deleted successfully.', 'success');
    loadAssignments();
    if (typeof loadDashboardStats === 'function') loadDashboardStats();

  } catch (err) {
    console.error('Error deleting assignment:', err);
    showToast('Network error while deleting assignment.', 'danger');
  }
}
