const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE !== 'false',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
  connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT) || 10000,
  greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT) || 10000,
  socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT) || 15000,
});

if (process.env.VERIFY_EMAIL_TRANSPORT === 'true') {
  transporter.verify((error) => {
    if (error) {
      console.error('Error connecting to email server:', error);
    } else {
      console.log('email server is ready to send messages');
    }
  });
}

module.exports = transporter;
