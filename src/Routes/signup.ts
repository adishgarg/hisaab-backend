import { Router } from "express";
import signnupController from "../Controllers/signup.js";

const router = Router();

router.post("/company", signnupController.companySignup);

export default router;