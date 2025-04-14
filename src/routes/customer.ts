import { Router } from "express";
import { signup, login, forgetPassword } from "../controllers/authContorller";
import {
  viewProduct,
  createOrder,
  cancelOrder,
  checkOut,
  updateOrder,
  updateProduct,
  deleteProduct,
  createProduct,
  viewCustomerProducts,
} from "../controllers/customerController";
import isAuth from "../middlewares/isAuth";

const router = Router();

router.get("/my-products/:userID", viewCustomerProducts);

router.get("/product/:productID", viewProduct);

router.post("/post-product", createProduct);

router.put("/product/:productID", updateProduct);

router.delete("/product/:productID", deleteProduct);

router.post("/create-order", createOrder);

router.delete("/order/:orderID", cancelOrder);

router.put("/order/:orderID", updateOrder);

router.post("/checkout", checkOut);

export default router;
