"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerServiceController_1 = require("../controllers/customerServiceController");
const isAuth_1 = __importDefault(require("../middlewares/isAuth"));
const router = (0, express_1.Router)();
router.delete("/cancel-order/:orderID", isAuth_1.default, customerServiceController_1.refundOrder);
router.get("/payments/:userID", isAuth_1.default, customerServiceController_1.getPayments);
router.get("/orders/:userID", isAuth_1.default, customerServiceController_1.getOrders);
exports.default = router;
