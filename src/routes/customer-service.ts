import { Router } from "express";
import { signup, login, forgetPassword } from "../controllers/authContorller";
import {
  refundOrder,
  getOrders,
  getPayments,
} from "../controllers/customerServiceController";
import isAuth from "../middlewares/isAuth";

const router = Router();

router.delete("/cancel-order/:orderID", isAuth, refundOrder);

router.get("/payments/:userID", isAuth, getPayments);

router.get("/orders/:userID", isAuth, getOrders);

export default router;
