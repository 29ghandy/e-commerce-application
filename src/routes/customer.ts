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
const router = Router();

router.get("/my-products", viewCustomerProducts);

router.get("/product/:id", viewProduct);

router.post("/post-product", createProduct);

router.put("/product/:id", updateProduct);

router.delete("/product/:id", deleteProduct);

router.post("/create-order", createOrder);

router.delete("/order/:id", cancelOrder);

router.put("/order/:id", updateOrder);

router.post("/checkout", checkOut);

export default router;
