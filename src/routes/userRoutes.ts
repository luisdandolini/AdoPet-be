import express from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/userController";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset/:token", resetPassword);
router.get("/protected", auth, (req, res) => {
  res.json({ message: "This is a protected route", userId: req.user });
});

export default router;
