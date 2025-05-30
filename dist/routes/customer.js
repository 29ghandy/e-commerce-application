"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const orderController_1 = require("../controllers/orderController");
const isAuth_1 = __importDefault(require("../middlewares/isAuth"));
const validation_1 = require("../middlewares/validation");
const imagehandeller_1 = require("../middlewares/imagehandeller");
const router = (0, express_1.Router)();
router.get("/my-products/:userID", isAuth_1.default, productController_1.viewCustomerProducts);
router.get("/product/:productID", isAuth_1.default, productController_1.viewProduct);
router.post("/post-product", imagehandeller_1.upload.single("imageUrl"), validation_1.validateProduct, isAuth_1.default, productController_1.createProduct);
router.put("/product/:productID", isAuth_1.default, productController_1.updateProduct);
router.delete("/product/:productID", isAuth_1.default, productController_1.deleteProduct);
router.post("/product/give-review/:productID", isAuth_1.default, productController_1.giveRating);
router.post("/create-order", isAuth_1.default, orderController_1.createOrder);
router.delete("/order/:orderID", isAuth_1.default, orderController_1.cancelOrder);
router.put("/order/:orderID", isAuth_1.default, orderController_1.updateOrder);
router.post("/checkout/:orderID", isAuth_1.default, orderController_1.checkOut);
router.get("/my-orders/:userID", orderController_1.getOrders);
exports.default = router;
