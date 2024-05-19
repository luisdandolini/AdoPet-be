const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/protected", auth, (req, res) => {
  res.json({ message: "This is a protected route", userId: req.userId });
});

module.exports = router;
