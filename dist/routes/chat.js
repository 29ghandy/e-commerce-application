"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatContorller_1 = require("../controllers/chatContorller");
const router = (0, express_1.Router)();
router.post("/connect", chatContorller_1.connectChat);
router.get("/get-chat/:chatID", chatContorller_1.getMessages);
exports.default = router;
