import { Router } from "express";
import { validateUser } from "../middlewares/validation";
import {
  signup,
  login,
  forgetPassword,
  deleteAccount,
} from "../controllers/authContorller";
import isAuth from "../middlewares/isAuth";
import { check } from "express-validator";

const router = Router();

router.post("/signup", validateUser as any, signup);

router.post("/login", validateUser as any, login);

router.post("/forgetpassword", forgetPassword);

router.delete("/delete-account", isAuth, deleteAccount);

export default router;
