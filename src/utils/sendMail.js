const nodemailer = require('nodemailer');
const transporter=require('../config/email')

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Taskopia" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Preview URL: %s', previewUrl);
    }
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

module.exports = sendEmail;
