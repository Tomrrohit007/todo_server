import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// Configure SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

// Create HTML email
const createHTMLEmail = (recipientName: string, resetLink: string): string => {
  const emailTemplate = `
    <html>
      <body>
        <h1>Password Reset</h1>
        <p>Hello ${recipientName},</p>
        <p>You have requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </body>
    </html>
  `;
  return emailTemplate;
};

// Create and send the email
const sendEmail = async (
  recipientEmail: string,
  recipientName: string,
  resetLink: string
): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY as string,
      },
    });

    const mailOptions = {
      to: recipientEmail,
      from: process.env.SENDGRID_EMAIL,
      subject: "Reset Password",
      html: createHTMLEmail(recipientName, resetLink),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent:", result);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendEmail
