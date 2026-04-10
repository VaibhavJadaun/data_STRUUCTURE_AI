import axios from "axios";
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

export const logoutUser = async () => {
  const res = await axios.get("/user/logout");
  if (res.status !== 200) {
    throw new Error("Unable to delete chats");
  }
  const data = await res.data;
  return data;
};
