import { Router } from "express";
import {signup} from "../controllers/authContorller"

const router = Router();

router.post('/signup',signup);


export default router;