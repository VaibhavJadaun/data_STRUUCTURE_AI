import { Router } from "express";
import { getQuizQuestions, submitQuiz } from "../controllers/quiz-controllers.js";

const quizRoutes = Router();

quizRoutes.get("/quiz-questions", getQuizQuestions);
quizRoutes.post("/submit-quiz", submitQuiz);

export default quizRoutes;

