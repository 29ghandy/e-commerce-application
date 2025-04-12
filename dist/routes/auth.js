"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authContorller_1 = require("../controllers/authContorller");
const router = (0, express_1.Router)();
router.post("/signup", authContorller_1.signup);
router.post("/login", authContorller_1.login);
router.post("/forgetpassword", authContorller_1.forgetPassword);
exports.default = router;
