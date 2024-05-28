import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Op } from "sequelize";
import User from "../models/User";
import { sendConfirmationEmail } from "../services/emailService";

export const register = async (req: Request, res: Response) => {
  const {
    username,
    password,
    email,
    phone,
    birthdate,
    cep,
    state,
    city,
    neighborhood,
    street,
  } = req.body;

  if (
    !username ||
    !password ||
    !email ||
    !phone ||
    !birthdate ||
    !cep ||
    !state ||
    !city ||
    !neighborhood ||
    !street
  ) {
    return res.status(400).send("Todos os campos são obrigatórios.");
  }

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(400).send("Nome de usuário ou email já está em uso.");
    }

    const [day, month, year] = birthdate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const confirmationToken = crypto.randomBytes(20).toString("hex");

    await User.create({
      username,
      password: hash,
      email,
      phone,
      birthdate: formattedDate,
      cep,
      state,
      city,
      neighborhood,
      street,
      activationToken: confirmationToken,
      status: "pending",
    });

    await sendConfirmationEmail(
      email,
      confirmationToken,
      req.headers.host || "default_host"
    );

    res.send(
      "Registro iniciado! Verifique seu e-mail para confirmar o cadastro."
    );
  } catch (err) {
    console.error("Erro ao registrar o usuário:", err);
    res.status(500).send("Erro ao registrar o usuário.");
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuário ou Senha estão incorretas!" });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message:
          "Conta não ativada. Por favor, verifique seu e-mail para ativar sua conta.",
      });
    }

    req.logIn(user, function (err) {
      if (err) return next(err);
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
      return res.json({ message: "Logged in successfully!", token: token });
    });
  })(req, res, next);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email é obrigatório.");

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).send("Email não encontrado.");

    const token = crypto.randomBytes(20).toString("hex");
    const expireTime = new Date(Date.now() + 3600000);

    await User.update(
      { reset_password_token: token, reset_password_expires: expireTime },
      { where: { email } }
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT as string, 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error(
          "Erro ao verificar a conexão com o servidor de email:",
          error
        );
        return res
          .status(500)
          .send("Erro ao verificar a conexão com o servidor de email.");
      } else {
        console.log("Servidor de email está pronto para enviar mensagens");
      }
    });

    const mailOptions = {
      to: email,
      from: process.env.SMTP_USER,
      subject: "Password Reset",
      text:
        `Você está recebendo este e-mail porque você (ou alguém) solicitou a redefinição da senha para sua conta.\n\n` +
        `Por favor, clique no seguinte link ou cole-o no seu navegador para completar o processo dentro de uma hora da recepção deste e-mail:\n\n` +
        `http://${req.headers.host}/reset/${token}\n\n` +
        `Se você não solicitou isso, por favor ignore este e-mail e sua senha permanecerá inalterada.\n`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Erro ao enviar o e-mail:", err);
        return res.status(500).send("Erro ao enviar o e-mail.");
      }
      console.log("Email enviado:", info.response);
      res.send("Email enviado com sucesso!");
    });
  } catch (err) {
    res.status(500).send("Erro ao processar a solicitação.");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) return res.status(400).send("Senha é obrigatória.");

  try {
    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) return res.status(400).send("Token inválido ou expirado.");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    await User.update(
      {
        password: hash,
        reset_password_token: null,
        reset_password_expires: null,
      },
      { where: { id: user.id } }
    );

    res.send("Senha redefinida com sucesso!");
  } catch (err) {
    res.status(500).send("Erro ao processar a solicitação.");
  }
};

export const activateAccount = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      where: {
        activationToken: token,
      },
    });

    if (!user) {
      return res.status(400).send("Token inválido ou expirado.");
    }

    await User.update(
      { status: "active", activationToken: null },
      { where: { id: user.id } }
    );

    res.send({ message: "Conta ativada com sucesso!" });
  } catch (err) {
    console.error("Erro ao ativar conta:", err);
    res.status(500).send("Erro ao ativar conta.");
  }
};
