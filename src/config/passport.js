const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const pool = require("./database");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      (username, password, done) => {
        pool.query(
          "SELECT * FROM usuarios WHERE username = ?",
          [username],
          (err, results) => {
            if (err) return done(err);
            if (results.length === 0) {
              return done(null, false, { message: "Incorrect username." });
            }

            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) return done(err);
              if (!isMatch) {
                return done(null, false, { message: "Incorrect password." });
              }
              return done(null, user);
            });
          }
        );
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    pool.query("SELECT * FROM usuarios WHERE id = ?", [id], (err, results) => {
      if (err) return done(err);
      done(null, results[0]);
    });
  });
};
