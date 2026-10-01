const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send OTP email to teacher for signup verification
 */
async function sendOtpEmail(toEmail, otp, teacherName = 'Teacher') {
  const mailOptions = {
    from: `"BRC Portal" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your OTP for BRC Teacher Portal Registration',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f6f9; }
          .wrapper { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a5276 0%, #16a085 100%); padding: 32px 40px; text-align: center; }
          .header h1 { color: white; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.3px; }
          .header p { color: rgba(255,255,255,0.80); font-size: 13px; margin: 6px 0 0; }
          .body { padding: 36px 40px; }
          .body p { color: #4a5568; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .otp-box { background: #f0f4f8; border: 2px dashed #1a5276; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-box .otp { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #1a5276; font-family: 'Courier New', monospace; }
          .otp-box .expiry { font-size: 12px; color: #718096; margin-top: 8px; }
          .note { background: #fff8e1; border-left: 3px solid #e67e22; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 13px; color: #7b4f00; margin-top: 20px; }
          .footer { background: #f4f6f9; padding: 20px 40px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🏫 BRC Teacher Portal</h1>
            <p>Block Resource Centre — Verification Code</p>
          </div>
          <div class="body">
            <p>Dear <strong>${teacherName || 'Teacher'}</strong>,</p>
            <p>You requested to register on the BRC Teacher Portal. Please use the OTP below to verify your email address and complete registration.</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
              <div class="expiry">⏱ This OTP expires in <strong>10 minutes</strong></div>
            </div>
            <p>If you did not request this, please ignore this email. Your account will remain secure.</p>
            <div class="note">
              ⚠️ Never share this OTP with anyone. BRC staff will never ask for your OTP.
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Block Resource Centre Portal &nbsp;|&nbsp; Do not reply to this email
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send welcome email after successful registration
 */
async function sendWelcomeEmail(toEmail, teacherName, udiseCode, schoolName) {
  const mailOptions = {
    from: `"BRC Portal" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Welcome to BRC Teacher Portal — Registration Successful',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f6f9; }
          .wrapper { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a5276 0%, #16a085 100%); padding: 32px 40px; text-align: center; }
          .header h1 { color: white; font-size: 22px; margin: 0; font-weight: 700; }
          .body { padding: 36px 40px; }
          .body p { color: #4a5568; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .info-box { background: #e8f5f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d0e8e0; font-size: 14px; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #718096; font-weight: 500; }
          .value { color: #1a5276; font-weight: 700; }
          .footer { background: #f4f6f9; padding: 20px 40px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>✅ Registration Successful!</h1>
          </div>
          <div class="body">
            <p>Dear <strong>${teacherName}</strong>,</p>
            <p>Your account on the <strong>BRC Teacher Portal</strong> has been created successfully. You can now log in using your UDISE code and password.</p>
            <div class="info-box">
              <div class="info-row"><span class="label">Teacher Name</span><span class="value">${teacherName}</span></div>
              <div class="info-row"><span class="label">UDISE Code</span><span class="value">${udiseCode}</span></div>
              <div class="info-row"><span class="label">School</span><span class="value">${schoolName}</span></div>
            </div>
            <p>Login at: <a href="http://localhost:4200/teacher/login" style="color:#1a5276;">BRC Teacher Portal</a></p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Block Resource Centre Portal
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send email notification for document verification status (approve/reject)
 */
async function sendDocumentStatusEmail(toEmail, teacherName, documentTitle, status, remarks) {
  const statusColor = status === 'Approved' ? '#16a085' : '#e74c3c';
  const mailOptions = {
    from: `"BRC Portal" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `Document ${status} — BRC Teacher Portal`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #f4f6f9; }
          .wrapper { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #1a5276 0%, ${statusColor} 100%); padding: 32px 40px; text-align: center; }
          .header h1 { color: white; font-size: 22px; margin: 0; font-weight: 700; }
          .body { padding: 36px 40px; }
          .body p { color: #4a5568; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #718096; font-weight: 500; }
          .value { color: #1a5276; font-weight: 700; }
          .status { color: ${statusColor}; font-weight: bold; }
          .remarks-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px; }
          .remarks-box h4 { margin: 0 0 8px 0; color: #92400e; font-size: 14px; }
          .remarks-box p { margin: 0; color: #b45309; font-size: 14px; }
          .footer { background: #f4f6f9; padding: 20px 40px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>📄 Document Update</h1>
          </div>
          <div class="body">
            <p>Dear <strong>${teacherName}</strong>,</p>
            <p>Your uploaded document has been reviewed by the BRC Administrator. Here are the details:</p>
            <div class="info-box">
              <div class="info-row"><span class="label">Document Title</span><span class="value">${documentTitle}</span></div>
              <div class="info-row"><span class="label">Status</span><span class="status">${status}</span></div>
            </div>
            ${remarks ? `
            <div class="remarks-box">
              <h4>Admin Remarks:</h4>
              <p>${remarks}</p>
            </div>
            ` : ''}
            <p style="margin-top:20px;">You can view more details on your <a href="http://localhost:4200/teacher/dashboard" style="color:#1a5276;">BRC Teacher Dashboard</a>.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Block Resource Centre Portal
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail, sendWelcomeEmail, sendDocumentStatusEmail };
