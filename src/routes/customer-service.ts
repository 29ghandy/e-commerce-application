import { Router } from "express";
import { signup, login, forgetPassword } from "../controllers/authContorller";
import {
  cancelOrder,
  updateOrder,
  getOrders,
  getPayments,
} from "../controllers/customerServiceController";

const router = Router();

router.post("/update-order/:orderID", updateOrder);

router.delete("/cancel-order/:orderID", cancelOrder);

router.get("/payments/:userID", getPayments);

router.get("/orders/:userID", getOrders);

export default router;
