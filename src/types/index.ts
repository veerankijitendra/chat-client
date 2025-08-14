export interface User {
   id: string;
   username: string;
   email: string;
   profilePicture: string;
   createdAt: string;
}

export interface Message {
   id: string;
   senderId: string;
   recipientId: string;
   content: string;
   timestamp: string;
   status: "sent" | "delivered" | "read";
}

export interface ChatRoom {
   roomId: string;
   name: string;
   lastMessage: string;
   lastMessageTime: string;
   unreadCount: number;
   participants: { id: string; username: string; profilePicture: string }[];
}

export interface IResponse<T> {
   status: "success" | "fail" | "error";
   message?: string;
   data?: T;
   errors?: Array<{ field: string; message: string }>;
}
