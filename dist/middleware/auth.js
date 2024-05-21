"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function default_1(req, res, next) {
    const token = req.headers["authorization"];
    if (!token)
        return res.status(401).json({ message: "No token provided" });
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err)
            return res.status(500).json({ message: "Failed to authenticate token" });
        req.userId = decoded.id;
        next();
    });
}
exports.default = default_1;
