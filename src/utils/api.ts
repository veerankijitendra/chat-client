import axios from "axios";
import { ChatRoom, IResponse, Message, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
   baseURL: API_URL,
   headers: { "Content-Type": "application/json" },
});

export const createUser = async (data: {
   username: string;
   email: string;
   password: string;
}): Promise<IResponse<{ user: User }>> => {
   const response = await api.post("/auth/signup", data);
   return response.data;
};

export const verifyOTP = async (data: {
   email: string;
   otp: string;
}): Promise<IResponse<null>> => {
   const response = await api.post("/auth/verify-otp", data);
   return response.data;
};

export const login = async (data: {
   email: string;
   password: string;
}): Promise<IResponse<{ token: string }>> => {
   const response = await api.post("/auth/login", data);
   return response.data;
};

export const validateToken = async (
   token: string
): Promise<IResponse<{ userId: string }>> => {
   const response = await api.get("/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
   });
   return response.data;
};

export const getChatRooms = async (
   token: string
): Promise<IResponse<{ chatRooms: ChatRoom[] }>> => {
   const response = await api.get("/chat/rooms", {
      headers: { Authorization: `Bearer ${token}` },
   });
   return response.data;
};

export const getMessages = async (
   roomId: string,
   token: string
): Promise<IResponse<{ messages: Message[] }>> => {
   const response = await api.get(`/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
   });
   return response.data;
};

export const markMessagesAsRead = async (
   roomId: string,
   token: string
): Promise<IResponse<null>> => {
   const response = await api.post(
      `/chat/rooms/${roomId}/read`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
   );
   return response.data;
};
