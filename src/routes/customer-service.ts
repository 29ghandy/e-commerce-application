import { Router } from "express";
import { signup, login, forgetPassword } from "../controllers/authContorller";
import {
  refundOrder,
  getOrders,
  getPayments,
} from "../controllers/customerServiceController";

const router = Router();

router.delete("/cancel-order/:orderID", refundOrder);

router.get("/payments/:userID", getPayments);

router.get("/orders/:userID", getOrders);

export default router;
