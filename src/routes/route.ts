import express from "express";
const router = express.Router()
import { Identify } from "../controller/Identify";

router.post("/identify",Identify)

export default router