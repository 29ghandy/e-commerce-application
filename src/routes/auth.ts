import { Router } from "express";
import {
  signup,
  login,
  forgetPassword,
  deleteAccount,
} from "../controllers/authContorller";
import isAuth from "../middlewares/isAuth";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgetpassword", forgetPassword);

router.delete("/delete-account", isAuth, deleteAccount);

export default router;
