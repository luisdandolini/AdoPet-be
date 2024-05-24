import express from "express";
import auth from "../middleware/auth";
import { registerPet } from "../controllers/petController";

const router = express.Router();

router.post("/register-pet", auth, registerPet);

export default router;
