import { Router } from "express";
import userRoutes from "./user-routes.js";
import chatRoutes from "./chat-routes.js";
import quizRoutes from "./quiz-routes.js";
import reviewCodeRoutes from "./review-code-routes.js";

const appRouter = Router();

appRouter.use("/user", userRoutes); //domain/api/v1/user
appRouter.use("/chat", chatRoutes); //domain/api/v1/chats
appRouter.use("/quiz", quizRoutes); //domain/api/v1/quiz
appRouter.use("/", reviewCodeRoutes); //domain/api/v1/review-code

export default appRouter;