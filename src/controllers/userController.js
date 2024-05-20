const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

exports.register = (req, res) => {
  const { username, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  pool.query(
    "INSERT INTO usuarios (username, password) VALUES (?, ?)",
    [username, hash],
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
