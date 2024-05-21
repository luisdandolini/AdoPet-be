"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("./database"));
function default_1(passport) {
    passport.use(new passport_local_1.Strategy({ usernameField: "username" }, (username, password, done) => {
        database_1.default.query("SELECT * FROM usuarios WHERE username = ?", [username], (err, results) => {
            if (err)
                return done(err);
            if (results.length === 0) {
                return done(null, false, { message: "Incorrect username." });
            }
            const user = results[0];
            bcryptjs_1.default.compare(password, user.password, (err, isMatch) => {
                if (err)
                    return done(err);
                if (!isMatch) {
                    return done(null, false, { message: "Incorrect password." });
                }
                return done(null, user);
            });
        });
    }));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        database_1.default.query("SELECT * FROM usuarios WHERE id = ?", [id], (err, results) => {
            if (err)
                return done(err);
            done(null, results[0]);
        });
    });
}
exports.default = default_1;
