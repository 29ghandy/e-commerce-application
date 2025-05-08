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
  getOrders,
} from "../controllers/orderController";
import isAuth from "../middlewares/isAuth";
import { validateProduct } from "../middlewares/validation";
import { upload } from "../middlewares/imagehandeller";

const router = Router();

router.get("/my-products/:userID", isAuth, viewCustomerProducts);

router.get("/product/:productID", isAuth, viewProduct);

router.post(
  "/post-product",
  upload.single("imageUrl"),
  validateProduct as any,
  isAuth,
  createProduct
);

router.put("/product/:productID", isAuth, updateProduct);

router.delete("/product/:productID", isAuth, deleteProduct);

router.post("/product/give-review/:productID", isAuth, giveRating);

router.post("/create-order", isAuth, createOrder);

router.delete("/order/:orderID", isAuth, cancelOrder);

router.put("/order/:orderID", isAuth, updateOrder);

router.post("/checkout/:orderID", isAuth, checkOut);

router.get("/my-orders/:userID", getOrders);

export default router;
