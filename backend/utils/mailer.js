import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password, not your real password
  },
});

const sendVerificationEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Parkette" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your Parkette account',
    html: `
      <div style="font-family: monospace; background-color: #e8e4f7; padding: 40px; text-align: center;">
        <h1 style="color: #1a1a6e; font-size: 28px;">Parkette</h1>
        <p style="color: #1a1a6e; font-size: 16px;">
          Thanks for signing up! Use the code below to verify your account.
        </p>
        <div style="
          display: inline-block;
          background-color: #ffffff;
          border: 3px dashed #1a1a6e;
          border-radius: 12px;
          padding: 24px 48px;
          margin: 24px 0;
        ">
          <span style="font-size: 40px; font-weight: 900; color: #1a1a6e; letter-spacing: 12px;">
            ${otp}
          </span>
        </div>
        <p style="color: #1a1a6e; opacity: 0.6; font-size: 13px;">
          This code expires in 15 minutes. Do not share it with anyone.
        </p>
      </div>
    `,
  });
};

export { sendVerificationEmail };

