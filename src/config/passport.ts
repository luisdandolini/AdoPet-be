import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import pool from "./database";

interface User {
  id: number;
  username: string;
  password: string;
}

export default function (passport: PassportStatic) {
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

            const user = results[0] as User;
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

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser((id: number, done) => {
    pool.query("SELECT * FROM usuarios WHERE id = ?", [id], (err, results) => {
      if (err) return done(err);
      done(null, results[0]);
    });
  });
}
