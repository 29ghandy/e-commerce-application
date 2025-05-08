import nodemailer from "nodemailer";

export const sendResetEmail = async (to: string, link: string) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "your@email.com",
      pass: "yourpassword",
    },
  });

  await transporter.sendMail({
    from: '"Your App" <no-reply@yourapp.com>',
    to,
    subject: "Password Reset",
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
  });
};
