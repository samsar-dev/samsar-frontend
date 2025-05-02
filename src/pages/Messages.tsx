// import React, { useState, useEffect } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useSocket } from "@/hooks/useSocket";
// import { MessagesAPI } from "@/api/messaging.api";
// import apiClient from "@/api/apiClient";
// import type {
//   Message,
//   Conversation,
//   ListingMessageInput,
//   MessageEvent,
//   ErrorEvent,
// } from "@/types/messaging";
// import type { User } from "@/types";
// import { toast } from "react-toastify";

// const Messages: React.FC = () => {
//   const { user } = useAuth() as { user: User | null };
//   const { on, off } = useSocket();
//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
//   const [activeConversation, setActiveConversation] =
//     useState<Conversation | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [recipientId, setRecipientId] = useState<string | null>(null);
//   const [listingId, setListingId] = useState<string | null>(null);

//   // Get recipient and listing IDs from URL params
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const recipient = params.get("recipientId");
//     const listing = params.get("listingId");
//     if (recipient) setRecipientId(recipient);
//     if (listing) setListingId(listing);
//   }, []);

//   useEffect(() => {
//     const fetchConversations = async () => {
//       try {
//         setLoading(true);
//         const response = await MessagesAPI.getConversations();
//         console.log("API response for conversations:", response);
//         if (response.success && response.data) {
//           let conversations = response.data.items || [];
//           // Normalize conversation data and ensure _id is always present
//           conversations = conversations.map((conv) => {
//             // Use the conversation's actual ID from the backend
//             const conversationId = conv._id || conv._id;
//             // Debug each conversation
//             console.log("Processing conversation:", {
//               original: conv,
//               id: conversationId,
//             });

//             return {
//               ...conv,
//               _id: conversationId, // Use the actual ID
//             };
//           });

//           console.log("Normalized conversations:", conversations);
//           setConversations(conversations);

//           if (conversations.length > 0) {
//             const firstConversation = conversations[0];
//             console.log("Setting active conversation:", firstConversation);
//             setActiveConversation(firstConversation);

//             if (firstConversation._id) {
//               await loadMessages(firstConversation._id);
//             } else {
//               console.error(
//                 "First conversation has no _id:",
//                 firstConversation
//               );
//             }
//           }
//         }
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error
//             ? error.message
//             : "Failed to load conversations";
//         setError(errorMessage);
//         console.error("Error fetching conversations:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchConversations();
//   }, []);

//   const loadMessages = async (
//     conversationId: string | undefined,
//     silent = false
//   ) => {
//     if (!conversationId) {
//       console.error("Cannot load messages: conversationId is undefined");
//       return;
//     }

//     try {
//       if (!silent)
//         console.log("Loading messages for conversation:", conversationId);
//       const response = await MessagesAPI.getMessages(conversationId);
//       if (!silent) console.log("API response for messages:", response);

//       // Check if the response has messages directly (backend format)
//       if (response.success && response.messages) {
//         if (!silent)
//           console.log(
//             "Found messages in response.messages:",
//             response.messages.length
//           );
//         setCurrentMessages(response.messages);
//         return;
//       }

//       // Check standard format
//       if (response.success && response.data) {
//         const messageList = response.data.items || [];
//         if (!silent)
//           console.log("Loaded messages:", messageList.length, "messages");
//         if (messageList.length > 0 && !silent) {
//           console.log("First message:", messageList[0]);
//         }
//         setCurrentMessages(messageList);
//       } else {
//         if (!silent)
//           console.log(
//             "No messages found or API returned unsuccessful response"
//           );
//       }
//     } catch (error) {
//       console.error("Error loading messages:", error);
//       if (!silent) toast.error("Failed to load messages");
//     }
//   };

//   // Handle deleting a conversation
//   const handleDeleteConversation = async (
//     conversationId: string | undefined,
//     e: React.MouseEvent
//   ) => {
//     e.stopPropagation(); // Prevent triggering conversation selection

//     if (!conversationId) {
//       toast.error("Cannot delete: Invalid conversation");
//       return;
//     }

//     if (window.confirm("Are you sure you want to delete this conversation?")) {
//       try {
//         const response = await MessagesAPI.deleteConversation(conversationId);
//         if (response.success) {
//           toast.success("Conversation deleted");
//           // Remove from conversations list
//           setConversations((prev) =>
//             prev.filter(
//               (conv) =>
//                 conv.id !== conversationId && conv._id !== conversationId
//             )
//           );

//           // Clear active conversation if it was deleted
//           if (
//             activeConversation &&
//             (activeConversation.id === conversationId ||
//               activeConversation._id === conversationId)
//           ) {
//             setActiveConversation(null);
//             setCurrentMessages([]);
//           }
//         } else {
//           toast.error("Failed to delete conversation");
//         }
//       } catch (error) {
//         console.error("Error deleting conversation:", error);
//         toast.error("Failed to delete conversation");
//       }
//     }
//   };

//   // Handle photo upload
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setSelectedFile(e.target.files[0]);
//     }
//   };

//   const handleFileUpload = async () => {
//     if (!selectedFile) return;

//     // Create a FormData object to send the file
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       // First upload the file
//       const uploadResponse = await apiClient.post("/uploads", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       if (uploadResponse.data.success) {
//         const fileUrl = uploadResponse.data.url;
//         // Now send a message with the file URL
//         await handleSendMessage(`[Image](${fileUrl})`);
//         setSelectedFile(null);
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       toast.error("Failed to upload image");
//     }
//   };

//   // Set up WebSocket for real-time updates
//   useEffect(() => {
//     if (!user) return;

//     const handleNewMessage = (data: MessageEvent) => {
//       if (data.type === "message" && data.payload) {
//         const newMessage = data.payload;
//         // Add message to current messages if it's part of the active conversation
//         if (
//           activeConversation &&
//           ((newMessage.senderId === user.id &&
//             newMessage.recipientId ===
//               activeConversation.participants.find((p) => p.id !== user.id)
//                 ?.id) ||
//             (newMessage.recipientId === user.id &&
//               newMessage.senderId ===
//                 activeConversation.participants.find((p) => p.id !== user.id)
//                   ?.id))
//         ) {
//           // Play notification sound for new messages
//           const audio = new Audio("/message-notification.mp3");
//           audio.volume = 0.5;
//           audio.play().catch((e) => console.log("Audio play failed:", e));

//           setCurrentMessages((prev) => [...prev, newMessage]);
//           // Update last message in conversations list
//           setConversations((prev) =>
//             prev.map((conv) =>
//               conv._id === activeConversation._id
//                 ? { ...conv, lastMessage: newMessage }
//                 : conv
//             )
//           );
//         } else {
//           // If message is for another conversation, update that conversation's last message
//           setConversations((prev) => {
//             return prev.map((conv) => {
//               const otherUserId = conv.participants.find(
//                 (p) => p.id !== user.id
//               )?.id;
//               if (
//                 (newMessage.senderId === otherUserId &&
//                   newMessage.recipientId === user.id) ||
//                 (newMessage.recipientId === otherUserId &&
//                   newMessage.senderId === user.id)
//               ) {
//                 return { ...conv, lastMessage: newMessage };
//               }
//               return conv;
//             });
//           });
//         }
//       }
//     };

//     const handleNewConversation = (data: {
//       type: string;
//       payload: Conversation;
//     }) => {
//       if (data.type === "new_conversation" && data.payload) {
//         const newConversation = data.payload;
//         setConversations((prev) => [newConversation, ...prev]);
//         // If this is a new conversation and we're waiting for one, activate it
//         if (
//           !activeConversation &&
//           newConversation.participants.some((p: User) => p.id === recipientId)
//         ) {
//           setActiveConversation(newConversation);
//           loadMessages(newConversation._id);
//         }
//       }
//     };

//     // Set up socket event listeners
//     on("message", handleNewMessage);
//     on("new_conversation", handleNewConversation);

//     // Poll for new messages every 10 seconds as a fallback
//     const intervalId = setInterval(() => {
//       if (activeConversation) {
//         const conversationId = activeConversation.id || activeConversation._id;
//         if (conversationId) {
//           loadMessages(conversationId, true); // silent refresh
//         }
//       }
//     }, 10000);

//     return () => {
//       off("message", handleNewMessage);
//       off("new_conversation", handleNewConversation);
//       clearInterval(intervalId);
//     };
//   }, [on, off, user, activeConversation?._id, recipientId]);

//   useEffect(() => {
//     if (!user) return;

//     const handleConnect = () => {
//       console.log("Connected to socket server");
//     };

//     const handleDisconnect = () => {
//       console.log("Disconnected from socket server");
//     };

//     const handleError = (data: ErrorEvent) => {
//       const errorMessage =
//         data.payload instanceof Error ? data.payload.message : data.payload;
//       console.error("Socket error:", errorMessage);
//       toast.error(errorMessage);
//     };

//     on("connect", handleConnect);
//     on("disconnect", handleDisconnect);
//     on("error", handleError);

//     return () => {
//       off("connect", handleConnect);
//       off("disconnect", handleDisconnect);
//       off("error", handleError);
//     };
//   }, [on, off, user]);

//   const handleSendMessage = async (content: string) => {
//     if (!content.trim() || !user || !recipientId) return;

//     try {
//       // Check if a conversation already exists for this listing
//       let existingConversation = null;

//       if (listingId) {
//         // Find an existing conversation for this listing
//         existingConversation = conversations.find(
//           (conv) =>
//             conv.listingId === listingId &&
//             conv.participants.some((p) => p.id === recipientId)
//         );

//         if (existingConversation) {
//           console.log(
//             "Found existing conversation for this listing:",
//             existingConversation
//           );
//           setActiveConversation(existingConversation);
//         }
//       }

//       // Always send message with the right data
//       const messageInput: ListingMessageInput = {
//         content: content.trim(),
//         recipientId: recipientId,
//         listingId: listingId || "",
//       };

//       const response = await MessagesAPI.sendMessage(messageInput);
//       if (response.success && response.data) {
//         const newMessage = response.data;

//         // If we don't have an active conversation yet, create one
//         if (!activeConversation && !existingConversation) {
//           // Create a new conversation
//           const response = await MessagesAPI.createConversation({
//             participantIds: [user.id, recipientId],
//             initialMessage: content.trim(),
//           });

//           if (response.success && response.data) {
//             const newConversation = response.data;
//             setActiveConversation(newConversation);
//             setConversations((prev) => [newConversation, ...prev]);
//             setCurrentMessages([newMessage]);
//           }
//         } else {
//           // Add the new message to the current messages
//           setCurrentMessages((prev) => [...prev, newMessage]);

//           // Update the conversation's last message
//           const convId =
//             (activeConversation || existingConversation)?.id ||
//             (activeConversation || existingConversation)?._id;

//           setConversations((prev) =>
//             prev.map((conv) =>
//               conv.id === convId || conv._id === convId
//                 ? { ...conv, lastMessage: newMessage }
//                 : conv
//             )
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       toast.error("Failed to send message");
//     }
//   };

//   const handleConversationSelect = async (conversation: Conversation) => {
//     console.log("Selecting conversation:", conversation);

//     if (!conversation) {
//       console.error("Invalid conversation selected:", conversation);
//       toast.error("Could not load conversation");
//       return;
//     }

//     // Use either id or _id, whichever is available
//     const conversationId = conversation.id || conversation._id;

//     if (!conversationId) {
//       console.error("Conversation has no ID:", conversation);
//       toast.error("Could not load conversation");
//       return;
//     }

//     setActiveConversation(conversation);
//     setCurrentMessages([]); // Clear messages while loading

//     console.log("Loading messages for conversation ID:", conversationId);
//     await loadMessages(conversationId);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-red-500">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
//         <div className="px-4 py-3 font-bold text-lg border-b border-gray-200">
//           Messages
//         </div>
//         <div className="flex-1 overflow-y-auto">
//           {conversations.map((conversation, index) => {
//             // Ensure each conversation has a unique key
//             const conversationKey = conversation._id || `conversation-${index}`;
//             const otherUser = conversation.participants.find(
//               (p) => p.id !== user?.id
//             );
//             return (
//               <button
//                 key={conversationKey}
//                 onClick={() => handleConversationSelect(conversation)}
//                 className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition relative ${
//                   activeConversation?._id === conversation._id
//                     ? "bg-blue-50"
//                     : ""
//                 }`}
//               >
//                 <button
//                   onClick={(e) =>
//                     handleDeleteConversation(
//                       conversation.id || conversation._id,
//                       e
//                     )
//                   }
//                   className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
//                   title="Delete conversation"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-4 w-4"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                     />
//                   </svg>
//                 </button>
//                 <img
//                   src={otherUser?.profilePicture || "/default-avatar.png"}
//                   alt={otherUser?.username || "User"}
//                   className="w-10 h-10 rounded-full object-cover"
//                 />
//                 <div className="flex-1 min-w-0">
//                   <div className="flex justify-between items-baseline">
//                     <p className="text-sm font-medium text-gray-900 truncate">
//                       {otherUser?.username || "Unknown User"}
//                       {otherUser?.id === user?.id && (
//                         <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
//                           User
//                         </span>
//                       )}
//                     </p>
//                     {conversation.lastMessage && (
//                       <span className="text-xs text-gray-500">
//                         {new Date(
//                           conversation.lastMessage.createdAt
//                         ).toLocaleDateString()}
//                       </span>
//                     )}
//                   </div>
//                   {conversation.lastMessage && (
//                     <p className="text-xs text-gray-500 truncate">
//                       {conversation.lastMessage.content}
//                     </p>
//                   )}
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </div>
//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {(activeConversation || recipientId) && user ? (
//           <>
//             {/* Chat Header */}
//             <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white">
//               <img
//                 src={
//                   activeConversation?.participants.find((p) => p.id !== user.id)
//                     ?.profilePicture || "/default-avatar.png"
//                 }
//                 alt={
//                   activeConversation?.participants.find((p) => p.id !== user.id)
//                     ?.username || "User"
//                 }
//                 className="w-10 h-10 rounded-full object-cover mr-3"
//               />
//               <div>
//                 <div className="font-semibold text-lg">
//                   {activeConversation?.participants.find(
//                     (p) => p.id !== user.id
//                   )?.username || "New Conversation"}
//                 </div>
//                 <div className="text-xs text-green-500">Online</div>
//               </div>
//             </div>
//             {/* Messages */}
//             <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col space-y-2">
//               {currentMessages.map((msg) => {
//                 const isMe = msg.senderId === user.id;
//                 return (
//                   <div
//                     key={msg.id}
//                     className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${isMe ? "bg-blue-500 text-white" : "bg-white text-gray-900"} flex flex-col`}
//                     >
//                       <span>{msg.content}</span>
//                       <span className="text-xs text-gray-400 mt-1 self-end">
//                         {new Date(msg.createdAt).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//             {/* Input Bar */}
//             <div className="px-6 py-4 bg-white border-t border-gray-200">
//               <form
//                 className="flex items-center space-x-2"
//                 onSubmit={async (e) => {
//                   e.preventDefault();
//                   const input = e.currentTarget.elements.namedItem(
//                     "messageInput"
//                   ) as HTMLInputElement;
//                   if (input && input.value.trim()) {
//                     await handleSendMessage(input.value);
//                     input.value = "";
//                   } else if (selectedFile) {
//                     await handleFileUpload();
//                   }
//                 }}
//               >
//                 <div className="relative flex-1">
//                   <input
//                     name="messageInput"
//                     type="text"
//                     autoComplete="off"
//                     className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                     placeholder="Type a message..."
//                   />
//                   {selectedFile && (
//                     <div className="absolute -top-8 left-0 bg-gray-100 p-1 rounded-md text-xs flex items-center">
//                       <span className="truncate max-w-[150px]">
//                         {selectedFile.name}
//                       </span>
//                       <button
//                         type="button"
//                         className="ml-1 text-red-500"
//                         onClick={() => setSelectedFile(null)}
//                       >
//                         ×
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                     />
//                   </svg>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleFileSelect}
//                   />
//                 </label>

//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
//                 >
//                   Send
//                 </button>
//               </form>
//             </div>
//           </>
//         ) : (
//           <div className="flex justify-center items-center h-full text-gray-500">
//             Select a conversation to start messaging
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Messages;

"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Edit,
  File,
  Grid,
  Heart,
  ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pause,
  Phone,
  Search,
  Send,
  Smile,
  Star,
  Video,
  X,
  ThumbsUp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";

export default function ChatInterface() {
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen">
      <div className="mx-auto w-full overflow-hidden rounded-xl bg-white shadow-xl flex">
        {/* Contacts/chats sidebar */}
        <div className="w-1/4 h-full border-r border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                Message <span className="text-gray-400">(12)</span>
              </h2>
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-9 pr-9 py-2 text-sm rounded-md"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
              >
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)] flex-1 pr-3">
              <div className="">
                <div className="flex items-start space-x-3 bg-gray-100 py-2 px-2 rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>EL</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Elena</div>
                      <div className="text-xs text-gray-400">12:35</div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Edit className="h-3 w-3 mr-1" />
                      Elena is typing...
                      <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-xs">
                        2
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 py-2 px-2 rounded">
                  <Avatar className="h-8 w-8 bg-blue-500">
                    <AvatarFallback>DC</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Design Chat</div>
                      <div className="text-xs text-gray-400">16:03</div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="text-xs text-gray-400 mr-1">
                        vitaly:
                      </span>
                      Hi, how long does...
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-6 w-6"
                      >
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center">
              <h2 className="text-lg font-medium">Design Chat</h2>
              <Badge variant="outline" className="ml-2 bg-white">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-6 w-px bg-gray-200"></div>
              <Button variant="ghost" size="icon">
                <div className="w-5 h-5 rounded bg-blue-100"></div>
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>

          {/* Chat messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>RE</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <div className="font-medium">Renat</div>
                    <div className="text-xs text-gray-400 ml-2">5:29</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-6 w-6"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg inline-block">
                    <p>Hi, how long does it take to finalize the page?</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-400">
                Today, 8 July
              </div>

              <div className="flex justify-end">
                <div className="flex items-center space-x-2 max-w-md">
                  <div className="text-xs text-gray-400">15:29</div>
                  <div className="font-medium">You</div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>S</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg inline-block max-w-md">
                  <p>Super, we will definitely use!</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 absolute bottom-0 ">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="/placeholder.svg?height=24&width=24" />
                  <AvatarFallback>NI</AvatarFallback>
                </Avatar>
                <div className="text-xs text-gray-500">
                  Nickolay is typing ...
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Chat input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 mx-3 relative">
                <Input
                  placeholder="Type Something ..."
                  className="pr-20 py-2 rounded-full border-gray-200"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <Button
                size="icon"
                className="rounded-full bg-blue-500 hover:bg-blue-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar - group info */}
        {infoOpen && (
          <ScrollArea className="w-1/4 h-[calc(100vh-3.5rem)] border-l border-gray-100 ">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <div className="font-medium text-blue-500">About User</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setInfoOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Notifications */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm">Notifications</div>
                <Switch />
              </div>
            </div>

            <div className="p-4 flex flex-col items-center justify-center">
              <Avatar className="h-20 w-20 bg-blue-500 mb-2">
                <AvatarFallback className="text-2xl">DC</AvatarFallback>
              </Avatar>
              <div className="font-medium">Name-User</div>
              <div className="text-xs text-gray-500 mb-4">
                username@gmali.comm
              </div>
            </div>

            {/* Email Accordion */}
            <Accordion
              type="single"
              collapsible
              defaultValue="email"
              className="w-full mb-4"
            >
              <AccordionItem
                value="email"
                className="border-b border-gray-100 -mt-4"
              >
                <AccordionTrigger className="p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">Email</div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm">
                  treeloversultan0987@gmail.com
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Phone Accordion */}
            <Accordion
              type="single"
              collapsible
              defaultValue="phone"
              className="w-full mb-4 "
            >
              <AccordionItem
                value="phone"
                className="border-b border-gray-100 -mt-4"
              >
                <AccordionTrigger className="p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">Phone</div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm">
                  +91 1234567890
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Bio Accordion */}
            <Accordion
              type="single"
              collapsible
              defaultValue="bio"
              className="w-full"
            >
              <AccordionItem
                value="bio"
                className="border-b border-gray-100 -mt-4 "
              >
                <AccordionTrigger className="p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">Bio</div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm">
                  <p>
                    There are super creative people in the chat, everyone’s
                    favorite designers who make this world a better place.
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="text-sm text-gray-500">@UserName</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-blue-500 text-xs h-6 flex items-center"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy link
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
function Check(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
