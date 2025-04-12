import { Router } from "express";
import { signup, login, forgetPassword } from "../controllers/authContorller";
import {
  getProduct,
  createOrder,
  cancelOrder,
} from "../controllers/customerController";
const router = Router();

router.post("/create-order", createOrder);

router.get("/product/:id", getProduct);

router.post("/cancel-order/:id", cancelOrder);

export default router;
