"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getChatRooms } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ChatRoom } from "@/types";

export default function ChatsPage() {
   const router = useRouter();
   const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
   const [error, setError] = useState<string | null>(null);
   const token = localStorage.getItem("token");

   useEffect(() => {
      const fetchChatRooms = async () => {
         try {
            const response = await getChatRooms(token!);
            if (response.status === "success") {
               setChatRooms(response.data!.chatRooms);
            } else {
               setError(response.message || "Failed to load chat rooms");
            }
         } catch (err) {
            setError("Error loading chat rooms");
         }
      };
      fetchChatRooms();
   }, [token]);

   const handleChatClick = (roomId: string) => {
      router.push(`/chat?roomId=${roomId}`);
   };

   return (
      <div className="container mx-auto p-4 max-w-2xl">
         <h1 className="text-3xl font-bold mb-6">Your Chats</h1>

         {error && (
            <Alert variant="destructive" className="mb-6">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
            </Alert>
         )}

         {chatRooms.length === 0 && !error && (
            <p className="text-gray-500">No chats yet. Start a conversation!</p>
         )}

         <div className="space-y-4">
            {chatRooms.map((room) => (
               <Card
                  key={room.roomId}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleChatClick(room.roomId)}
               >
                  <CardHeader className="flex flex-row items-center space-x-4">
                     <Avatar className="h-12 w-12">
                        <AvatarImage
                           src={room.participants[0].profilePicture}
                        />
                        <AvatarFallback>
                           {room.participants[0].username[0].toUpperCase()}
                        </AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        <p className="text-sm text-gray-500 truncate">
                           {room.lastMessage}
                        </p>
                     </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                     <span className="text-sm text-gray-400">
                        {new Date(room.lastMessageTime).toLocaleString(
                           "en-US",
                           {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                           }
                        )}
                     </span>
                     {room.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs font-semibold">
                           {room.unreadCount}
                        </span>
                     )}
                  </CardContent>
               </Card>
            ))}
         </div>
      </div>
   );
}
