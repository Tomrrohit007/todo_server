import { IUser } from "../Models/User.Model";

const nodemailer = require("nodemailer");

const createHTMLEmailForgotPassword = (user: IUser, resetLink?: string) => {
  const emailTemplate = `
    <html>
      <body>
        <h1>Password Reset</h1>
        <p>Hello ${user.name},</p>
        <p>You have requested a password reset. Click the link below to reset your password:</p>
<a href="${resetLink}">${resetLink}</a>

        <p>If you didn't request this, please ignore this email.</p>
      </body>
    </html>
  `;
  return emailTemplate;
};

const userVerificationEmail = (user: IUser, resetLink?: string) => {
  return `<!DOCTYPE html>
<html>
<body>
  <h1>Account Activation</h1>
   <p>Hello ${user.name},</p>
  <p>Thank you for signing up!</p>
  <p>Please click the following link to activate your account:</p>
<a href="${resetLink}">${resetLink}</a>
</body>
</html>`;
};

const emailOnSignUp = (user: IUser) => {
  return `<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Rohit Todo!</title>
</head>
<body>
    <table align="center" cellpadding="0" cellspacing="0" width="600">
        <tr>
            <td>
                <h1 style="text-align: center;">Welcome to Rohit Todo!</h1>
                <p>Dear ${user.name},</p>
                <p>Welcome to Rohit Todo! We are excited to have you as a new user.</p>
                <p>With Rohit Todo, you can stay organized, manage your tasks effectively, and boost your productivity.</p>
                <p>Key Features:</p>
                <ul>
                    <li>Task Management: Easily create and organize your tasks.</li>
                    <li>Reminders and Notifications: Set reminders to stay on top of your to-dos.</li>
                    <li>Collaborative Workspaces: Share workspaces and collaborate with others.</li>
                    <li>Due Date and Time Tracking: Set due dates and track your progress.</li>
                    <li>Seamless Synchronization: Access your tasks from anywhere, on any device.</li>
                </ul>
                <p>We are committed to providing you with a great experience and continuously improving our app based on user feedback.</p>
                <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:webdevrohit@proton.me">webdevrohit@proton.me</a>.</p>
                <p>Thank you for choosing Rohit Todo! Start organizing your tasks and achieving your goals today!</p>
                <p>Best regards,</p>
                <p>The Rohit Todo Team</p>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

class Email {
  constructor(public user: IUser, public resetToken?: string) {}

  newTransport() {
    return nodemailer.createTransport({
      // service:"Brevo",
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(subject: string, htmlTemplate: Function) {
    // 2) Define email options
    const mailOptions = {
      from: `Todo <${process.env.EMAIL_FROM}>`,
      to: this.user.email,
      subject,
      html: htmlTemplate(this.user, this.resetToken),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  public async sendWelcome() {
    await this.send("Welcome", emailOnSignUp);
  }

  public async sendPasswordReset() {
    await this.send("Password Reset", createHTMLEmailForgotPassword);
  }
  public async sendVerificationMail() {
    await this.send("Account Verification", userVerificationEmail);
  }
}

export default Email;
