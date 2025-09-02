import { Router } from "express";
import { connectChat, getMessages } from "../controllers/chatContorller";
const router = Router();

router.post("/connect", connectChat);
router.get("/get-chat/:chatID", getMessages);

export default router;
