"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const register = (req, res) => {
    const { username, password, email, phone, birthdate, cep, state, city, neighborhood, street, } = req.body;
    if (!username ||
        !password ||
        !email ||
        !phone ||
        !birthdate ||
        !cep ||
        !state ||
        !city ||
        !neighborhood ||
        !street) {
        return res.status(400).send("Todos os campos são obrigatórios.");
    }
    const [day, month, year] = birthdate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    const salt = bcryptjs_1.default.genSaltSync(10);
    const hash = bcryptjs_1.default.hashSync(password, salt);
    database_1.default.query("INSERT INTO usuarios (username, password, email, phone, birthdate, cep, state, city, neighborhood, street) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
        username,
        hash,
        email,
        phone,
        formattedDate,
        cep,
        state,
        city,
        neighborhood,
        street,
    ], (err, results) => {
        if (err)
            throw err;
        res.send("User registered!");
    });
};
exports.register = register;
const login = (req, res, next) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err)
            return next(err);
        if (!user)
            return res
                .status(401)
                .json({ message: "Usuário ou Senha estão incorretas!" });
        req.logIn(user, function (err) {
            if (err)
                return next(err);
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            return res.json({ message: "Logged in successfully!", token: token });
        });
    })(req, res, next);
};
exports.login = login;
const forgotPassword = (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).send("Email é obrigatório.");
    database_1.default.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, results) => {
        if (err)
            throw err;
        if (!results[0])
            return res.status(404).send("Email não encontrado.");
        const token = crypto_1.default.randomBytes(20).toString("hex");
        const expireTime = new Date(Date.now() + 3600000);
        database_1.default.query("UPDATE usuarios SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?", [token, expireTime, email], (err, results) => {
            if (err)
                throw err;
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT, 10),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            transporter.verify((error, success) => {
                if (error) {
                    console.error("Erro ao verificar a conexão com o servidor de email:", error);
                    return res
                        .status(500)
                        .send("Erro ao verificar a conexão com o servidor de email.");
                }
                else {
                    console.log("Servidor de email está pronto para enviar mensagens");
                }
            });
            const mailOptions = {
                to: email,
                from: process.env.SMTP_USER,
                subject: "Password Reset",
                text: `Você está recebendo este e-mail porque você (ou alguém) solicitou a redefinição da senha para sua conta.\n\n` +
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
        });
    });
};
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password)
        return res.status(400).send("Senha é obrigatória.");
    database_1.default.query("SELECT * FROM usuarios WHERE reset_password_token = ? AND reset_password_expires > NOW()", [token], (err, results) => {
        if (err)
            throw err;
        if (!results[0])
            return res.status(400).send("Token inválido ou expirado.");
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hash = bcryptjs_1.default.hashSync(password, salt);
        database_1.default.query("UPDATE usuarios SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?", [hash, results[0].id], (err) => {
            if (err)
                throw err;
            res.send("Senha redefinida com sucesso!");
        });
    });
};
exports.resetPassword = resetPassword;
