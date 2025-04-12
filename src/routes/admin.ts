import { Router } from "express";
import { login, forgetPassword } from "../controllers/authContorller";
import {
  addProduct,
  addCustomerService,
  removeCustomerService,
  updateProduct,
  deleteProduct,
  getProduct,
} from "../controllers/AdminContorller";
const router = Router();

router.get("product/:id", getProduct);

router.post("add-product", addProduct);

router.put("/product/:id", updateProduct);

router.delete("/product/:id", deleteProduct);

router.post("/add-customer-service", addCustomerService);

router.delete("/customer-service-account/:id", removeCustomerService);

export default router;
