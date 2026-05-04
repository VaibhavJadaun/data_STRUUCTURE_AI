import axios from "axios";

export type QuizAnswerPayload = {
  questionId: string;
  selectedOptionIndex: number;
};

export type CodeReviewFeedback = {
  time_complexity: string;
  space_complexity: string;
  issues: string[];
  optimizations: string[];
  clean_code_suggestions: string[];
  improved_code: string;
};
export const loginUser = async (email: string, password: string) => {
  const res = await axios.post("/user/login", { email, password });
  if (res.status !== 200) {
    throw new Error("Unable to login");
  }
  const data = await res.data;
  return data;
};

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await axios.post("/user/signup", { name, email, password });
  if (res.status !== 201) {
    throw new Error("Unable to Signup");
  }
  const data = await res.data;
  return data;
};

export const checkAuthStatus = async () => {
  const res = await axios.get("/user/auth-status", {
    validateStatus: (status) => status === 200 || status === 401,
  });
  if (res.status === 401) return null;
  return res.data;
};

export const sendChatRequest = async (message: string) => {
  try {
    const res = await axios.post("/chat/new", { message });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const body = err.response.data as { message?: string };
      if (typeof body.message === "string") {
        throw new Error(body.message);
      }
    }
    throw err instanceof Error ? err : new Error("Unable to send chat");
  }
};

export const getUserChats = async () => {
  const res = await axios.get("/chat/all-chats");
  if (res.status !== 200) {
    throw new Error("Unable to send chat");
  }
  const data = await res.data;
  return data;
};

export const deleteUserChats = async () => {
  const res = await axios.delete("/chat/delete");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  const data = await res.data;
  return data;
};

export const editUserChatMessage = async (id: string, content: string) => {
  const res = await axios.patch(`/chat/message/${encodeURIComponent(id)}`, {
    content,
  });
  if (res.status !== 200) {
    throw new Error("Unable to edit chat");
  }
  return res.data;
};

export const deleteUserChatMessage = async (id: string) => {
  const res = await axios.delete(`/chat/message/${encodeURIComponent(id)}`);
  if (res.status !== 200) {
    throw new Error("Unable to delete chat message");
  }
  return res.data;
};

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  const data = await res.data;
  return data;
};

export const getQuizQuestions = async (limit = 5) => {
  const res = await axios.get(`/quiz/quiz-questions?limit=${limit}`);
  if (res.status !== 200) {
    throw new Error("Unable to fetch quiz questions");
  }
  return res.data;
};

export const submitQuizAnswers = async (answers: QuizAnswerPayload[]) => {
  const res = await axios.post("/quiz/submit-quiz", { answers });
  if (res.status !== 200) {
    throw new Error("Unable to submit quiz");
  }
  return res.data;
};

export const reviewCodeRequest = async (code: string, language?: string) => {
  try {
    const res = await axios.post("/review-code", { code, language });
    return res.data as CodeReviewFeedback;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const body = err.response.data as { message?: string };
      if (typeof body.message === "string") throw new Error(body.message);
    }
    throw err instanceof Error ? err : new Error("Unable to review code");
  }
};
