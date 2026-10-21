const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const LOGS_FILE = path.join(__dirname, 'data', 'email_logs.json');

function getEmailLogs() {
  try {
    if (!fs.existsSync(LOGS_FILE)) {
      fs.writeFileSync(LOGS_FILE, '[]', 'utf8');
      return [];
    }
    return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
  } catch (err) {
    return [];
  }
}

function saveEmailLog(logEntry) {
  const logs = getEmailLogs();
  logs.unshift(logEntry);
  // Keep last 200 logs
  if (logs.length > 200) logs.pop();
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf8');
}

// Create transporter
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send daily attendance email for a student
 */
async function sendStudentAttendanceEmail({ student, date, todayStatus, todayRatio, overallRate, totalPresent, totalDays }) {
  const recipientEmail = student.email || `${student.admissionNo.toLowerCase()}@student.school.edu`;
  const subject = `Daily Attendance Report: ${student.name} - ${date} (${todayRatio || todayStatus.toUpperCase()})`;

  const statusColor = todayStatus === 'present' ? '#10b981' : '#ef4444';
  const statusBadge = todayStatus === 'present' ? 'PRESENT' : 'ABSENT';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; padding: 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 20px; }
        .header p { margin: 6px 0 0; opacity: 0.85; font-size: 13px; }
        .content { padding: 24px; }
        .status-box { background: ${todayStatus === 'present' ? '#ecfdf5' : '#fef2f2'}; border: 1px solid ${statusColor}; border-radius: 8px; padding: 16px; margin: 18px 0; text-align: center; }
        .status-badge { display: inline-block; padding: 4px 14px; border-radius: 9999px; background: ${statusColor}; color: #ffffff; font-weight: 700; font-size: 14px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
        .stat-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .stat-val { font-size: 20px; font-weight: 800; color: #0f172a; }
        .stat-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 2px; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>EduAttend Academic Portal</h1>
          <p>Daily Attendance Notification • ${date}</p>
        </div>
        <div class="content">
          <p>Dear <strong>${student.name}</strong> (Roll No: <strong>${student.rollNo}</strong>),</p>
          <p>This is your automated end-of-day attendance summary for <strong>${date}</strong>.</p>
          
          <div class="status-box">
            <div style="font-size: 13px; color: #475569; margin-bottom: 6px;">Today's Attendance Status:</div>
            <span class="status-badge">${statusBadge}</span>
            <div style="font-size: 14px; font-weight: 600; margin-top: 8px; color: #0f172a;">
              Classes Attended Today: <strong>${todayRatio}</strong>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-val" style="color: #4f46e5;">${overallRate}%</div>
              <div class="stat-lbl">Overall Attendance Rate</div>
            </div>
            <div class="stat-item">
              <div class="stat-val" style="color: #059669;">${totalPresent} / ${totalDays}</div>
              <div class="stat-lbl">Total Days Present</div>
            </div>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            You can view your complete attendance history, check daily logs, and access teacher-uploaded assignment PDFs by logging into your <strong>Student Portal</strong>.
          </p>
        </div>
        <div class="footer">
          EduAttend Automated Notification System • Course: ${student.course} (Section ${student.section})
        </div>
      </div>
    </body>
    </html>
  `;

  let deliveryStatus = 'Sent (Simulated SMTP Dispatch)';
  let messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: '"EduAttend Attendance Office" <noreply@school.edu>',
        to: recipientEmail,
        subject: subject,
        html: htmlContent
      });
      deliveryStatus = 'Delivered (SMTP)';
      messageId = info.messageId || messageId;
    } catch (err) {
      console.warn('Real SMTP failed, falling back to logged dispatch:', err.message);
      deliveryStatus = 'Queued / Logged: ' + err.message;
    }
  }

  const logEntry = {
    id: messageId,
    studentId: student.id,
    studentName: student.name,
    studentEmail: recipientEmail,
    rollNo: student.rollNo,
    course: student.course,
    section: student.section,
    date: date,
    subject: subject,
    todayRatio: todayRatio,
    todayStatus: todayStatus,
    overallRate: overallRate,
    timestamp: new Date().toISOString(),
    status: deliveryStatus,
    previewHtml: htmlContent
  };

  saveEmailLog(logEntry);
  return logEntry;
}

module.exports = {
  getEmailLogs,
  sendStudentAttendanceEmail
};
