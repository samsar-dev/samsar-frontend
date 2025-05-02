"use client";

import ChatSection from "@/components/chat/ChatSection";
import ConversationsList from "@/components/chat/ConversationsList";
import UserDetails from "@/components/chat/UserDetails";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { AccordionItem } from "@radix-ui/react-accordion";
import {
  ChevronDown,
  Copy,
  Edit,
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  Search,
  Send,
  X,
} from "lucide-react";
import { useState } from "react";

export default function ChatInterface() {
  const [infoOpen, setInfoOpen] = useState(true);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-screen">
      <div className="mx-auto w-full overflow-hidden rounded-xl bg-white shadow-xl flex">
        {/* Contacts/chats sidebar */}
        <ConversationsList />

        {/* Main chat area */}
        <ChatSection />

        {/* Right sidebar - group info */}
        {infoOpen && <UserDetails setInfoOpen={setInfoOpen} />}
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
