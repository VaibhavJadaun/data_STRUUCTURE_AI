import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import { reviewCode } from "../controllers/review-code-controllers.js";
import { reviewCodeValidator, validate } from "../utils/validators.js";

const reviewCodeRoutes = Router();

// Protected: requires login cookie
reviewCodeRoutes.post("/review-code", validate(reviewCodeValidator), verifyToken, reviewCode);

export default reviewCodeRoutes;

