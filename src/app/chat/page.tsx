"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSocket } from "@/utils/socket";
import { getMessages, markMessagesAsRead } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle } from "lucide-react";
import { Message } from "@/types";

const messageFormSchema = z.object({
   content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export default function ChatPage() {
   const searchParams = useSearchParams();
   const roomId = searchParams.get("roomId");
   const [messages, setMessages] = useState<Message[]>([]);
   const [error, setError] = useState<string | null>(null);
   const token = localStorage.getItem("token");
   const messagesEndRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!roomId) {
         setError("Missing room ID");
         return;
      }

      const fetchMessages = async () => {
         try {
            const response = await getMessages(roomId, token!);
            if (response.status === "success") {
               setMessages(response.data!.messages);
               await markMessagesAsRead(roomId, token!);
               const socket = getSocket(token!);
               socket.emit("markRead", { roomId });
            } else {
               setError(response.message || "Failed to load messages");
            }
         } catch (err: unknown) {
            setError(
               (err as { response?: { data?: { message?: string } } }).response
                  ?.data?.message || "Error loading messages"
            );
         }
      };
      fetchMessages();

      const socket = getSocket(token!);
      socket.emit("join");

      socket.on("privateMessage", (msg: Message) => {
         setMessages((prev) => [...prev, msg]);
      });

      socket.on(
         "messageRead",
         ({ roomId: updatedRoomId }: { roomId: string }) => {
            if (updatedRoomId === roomId) {
               setMessages((prev) =>
                  prev.map((msg) =>
                     msg.status === "sent" || msg.status === "delivered"
                        ? { ...msg, status: "read" }
                        : msg
                  )
               );
            }
         }
      );
      socket.on("error", (err: unknown) => {
         setError(
            (err as { message: string }).message || "Socket operation failed"
         );
      });

      return () => {
         socket.off("privateMessage");
         socket.off("messageRead");
         socket.off("error");
      };
   }, [roomId, token]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const onSubmit = async (data: MessageFormData) => {
      if (!roomId || !token) return;

      try {
         const socket = getSocket(token);
         socket.emit("privateMessage", { roomId, content: data.content });
         form.reset();
      } catch (err) {
         setError("Error sending message");
         console.log(err);
      }
   };

   const form = useForm<MessageFormData>({
      resolver: zodResolver(messageFormSchema),
      defaultValues: { content: "" },
   });
   return (
      <div className="container mx-auto p-4 max-w-2xl">
         <h1 className="text-3xl font-bold mb-6">Chat</h1>

         {error && (
            <Alert variant="destructive" className="mb-6">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
            </Alert>
         )}

         <ul className="border rounded-lg p-4 h-[60vh] overflow-y-auto mb-6 space-y-4 bg-gray-50">
            {messages.map((msg) => (
               <li
                  key={msg.id}
                  className={`flex ${msg.senderId === roomId?.split("-")[0] ? "justify-end" : "justify-start"}`}
               >
                  <div
                     className={`flex items-start space-x-2 max-w-[70%] ${
                        msg.senderId === roomId?.split("-")[0]
                           ? "flex-row-reverse space-x-reverse"
                           : ""
                     }`}
                  >
                     <Avatar className="h-10 w-10">
                        <AvatarImage
                           src={
                              msg.senderId === roomId?.split("-")[1]
                                 ? "/avatars/default.png"
                                 : ""
                           }
                        />
                        <AvatarFallback>
                           {msg?.senderId?.at(0)?.toUpperCase()}
                        </AvatarFallback>
                     </Avatar>
                     <div>
                        <div
                           className={`p-3 rounded-lg ${
                              msg.senderId === roomId?.split("-")[0]
                                 ? "bg-blue-500 text-white"
                                 : "bg-gray-200"
                           }`}
                        >
                           <p>{msg.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                           {new Date(msg.timestamp).toLocaleString("en-US", {
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true,
                           })}
                           {" • "}
                           {msg.status}
                        </p>
                     </div>
                  </div>
               </li>
            ))}
            <div ref={messagesEndRef} />
         </ul>

         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                           <Input placeholder="Type your message" {...field} />
                        </FormControl>
                        <FormMessage />
                     </FormItem>
                  )}
               />
               <Button type="submit" className="w-full">
                  Send
               </Button>
            </form>
         </Form>
      </div>
   );
}
