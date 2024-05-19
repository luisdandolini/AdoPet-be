const express = require("express");
const router = express.Router();
const passport = require("passport");
const pool = require("../config/database");
const speakeasy = require("speakeasy");
const bcrypt = require("bcryptjs");

router.post("/register", (req, res) => {
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
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.send("Logged in!");
  }
);

router.get("/setup-2fa", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Login required");
  }

  const secret = speakeasy.generateSecret({ length: 20 });
  pool.query(
    "UPDATE usuarios SET secret=? WHERE id=?",
    [secret.base32, req.user.id],
    (err, results) => {
      if (err) throw err;
      res.send({ secret: secret.base32 });
    }
  );
});

router.post("/verify-2fa", (req, res) => {
  const { token } = req.body;
  if (!req.isAuthenticated()) {
    return res.status(401).send("Login required");
  }

  pool.query(
    "SELECT secret FROM usuarios WHERE id = ?",
    [req.user.id],
    (err, results) => {
      if (err) throw err;
      const userSecret = results[0].secret;
      const verified = speakeasy.totp.verify({
        secret: userSecret,
        encoding: "base32",
        token: token,
      });

      if (verified) {
        res.send("2FA token is valid");
      } else {
        res.send("Invalid 2FA token");
      }
    }
  );
});

module.exports = router;
