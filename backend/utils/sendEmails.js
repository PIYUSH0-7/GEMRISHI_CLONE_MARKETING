import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html, attachments, cc }) => {
  try {
    const user = process.env.EMAIL_USER || 'orders@gemrishi.com';
    const pass = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"GemRishi" <${user}>`,
      replyTo: 'orders@gemrishi.com',
      to,
      subject,
      html,
    };

    if (attachments && Array.isArray(attachments)) {
      mailOptions.attachments = attachments;
    }

    if (cc) {
      mailOptions.cc = cc;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error.message);
    throw error;
  }
};
