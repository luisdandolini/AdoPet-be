import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!, 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendConfirmationEmail = async (
  email: string,
  token: string,
  host: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "default_host",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    auth: {
      user: process.env.SMTP_USER || "default_user",
      pass: process.env.SMTP_PASS || "default_password",
    },
  });
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "Confirmação de Cadastro",
    text: `Por favor, confirme seu cadastro clicando no seguinte link: http://${host}/activate/${token}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("E-mail de confirmação enviado:", info.response);
    return info;
  } catch (error) {
    console.error("Erro ao enviar o e-mail de confirmação:", error);
    throw error;
  }
};
