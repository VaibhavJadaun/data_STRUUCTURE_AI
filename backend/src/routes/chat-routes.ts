import { Router } from "express";
import { verifyToken } from "../utils/token-manager.js";
import {
  chatCompletionValidator,
  chatEditValidator,
  validate,
} from "../utils/validators.js";
import {
  deleteChats,
  deleteChatById,
  editChatById,
  generateChatCompletion,
  sendChatsToUser,
} from "../controllers/chat-controllers.js";

//Protected API
const chatRoutes = Router();
chatRoutes.post(
  "/new",
  validate(chatCompletionValidator),
  verifyToken,
  generateChatCompletion
);
chatRoutes.get("/all-chats", verifyToken, sendChatsToUser);
chatRoutes.delete("/delete", verifyToken, deleteChats);
chatRoutes.patch(
  "/message/:id",
  validate(chatEditValidator),
  verifyToken,
  editChatById
);
chatRoutes.delete("/message/:id", verifyToken, deleteChatById);

export default chatRoutes;