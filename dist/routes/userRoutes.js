"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.post("/forgot-password", userController_1.forgotPassword);
router.post("/reset/:token", userController_1.resetPassword);
router.get("/protected", auth_1.default, (req, res) => {
    res.json({ message: "This is a protected route", userId: req.user });
});
exports.default = router;
