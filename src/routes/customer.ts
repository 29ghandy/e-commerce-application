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
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure images folder exists
const uploadDir = path.join(__dirname, "..", "..", "images");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};
const upload = multer({ storage: storage, fileFilter });

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

router.post("/checkout", isAuth, checkOut);

export default router;
