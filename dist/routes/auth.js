"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authContorller_1 = require("../controllers/authContorller");
const isAuth_1 = __importDefault(require("../middlewares/isAuth"));
const router = (0, express_1.Router)();
router.post("/signup", authContorller_1.signup);
router.post("/login", authContorller_1.login);
router.post("/forgetpassword", authContorller_1.forgetPassword);
router.delete("/delete-account", isAuth_1.default, authContorller_1.deleteAccount);
exports.default = router;
