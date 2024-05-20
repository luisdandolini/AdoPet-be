const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.register = (req, res) => {
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
  const [day, month, year] = birthdate.split("/");
  const formattedDate = `${year}-${month}-${day}`;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  pool.query(
    "INSERT INTO usuarios (username, password, email, phone, birthdate, cep, state, city, neighborhood, street) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
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
    ],
    (err, results) => {
      if (err) throw err;
      res.send("User registered!");
    }
  );
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ message: "Usuário ou Senha estão incorretas!" });
    req.logIn(user, function (err) {
      if (err) return next(err);
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return res.json({ message: "Logged in successfully!", token: token });
    });
  })(req, res, next);
};
