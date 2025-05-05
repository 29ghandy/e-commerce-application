import { Router } from "express";
import { signup, login, forgetPassword } from "../controllers/authContorller";
import {
  viewProduct,
  updateProduct,
  deleteProduct,
  createProduct,
  viewCustomerProducts,
  giveRating,
} from "../controllers/productController";
import {
  createOrder,
  cancelOrder,
  updateOrder,
  checkOut,
} from "../controllers/orderController";
import isAuth from "../middlewares/isAuth";
import { validateProduct } from "../middlewares/validation";

const router = Router();

router.get("/my-products/:userID", isAuth, viewCustomerProducts);

router.get("/product/:productID", isAuth, viewProduct);

router.post("/post-product", validateProduct as any, isAuth, createProduct);

router.put("/product/:productID", isAuth, updateProduct);

router.delete("/product/:productID", isAuth, deleteProduct);

router.post("/product/give-review/:productID", isAuth, giveRating);

router.post("/create-order", isAuth, createOrder);

router.delete("/order/:orderID", isAuth, cancelOrder);

router.put("/order/:orderID", isAuth, updateOrder);

router.post("/checkout", isAuth, checkOut);

export default router;
