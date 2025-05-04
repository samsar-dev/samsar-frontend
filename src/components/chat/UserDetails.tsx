"use client";

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { User } from "@/types";
import { AccordionItem } from "@radix-ui/react-accordion";
import { motion } from "framer-motion";
import { Copy, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

function getInitials(name: string | undefined) {
  if (!name) return "US";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserDetails({
  setInfoOpen,
  participant,
}: {
  setInfoOpen: Dispatch<SetStateAction<boolean>>;
  participant: User | null | undefined;
}) {
  if (!participant) {
    return (
      <div className="w-1/4 h-[calc(100vh-3.5rem)] border-l border-gray-100 flex items-center justify-center text-gray-500">
        No user selected
      </div>
    );
  }

  return (
    <div
      className="w-1/4 h-[calc(100vh-3.5rem)] border-l border-gray-100"
    >
      <ScrollArea>
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
          <Avatar className="h-20 w-20 mb-2">
            {participant.profilePicture ? (
              <AvatarImage src={participant.profilePicture} />
            ) : (
              <AvatarFallback className="text-2xl">
                {getInitials(participant.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="font-medium">{participant.name}</div>
          <div className="text-xs text-gray-500 mb-4">{participant.email}</div>
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
              {participant.email}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Phone Accordion (if available, otherwise fallback) */}
        <Accordion
          type="single"
          collapsible
          defaultValue="phone"
          className="w-full mb-4"
        >
          <AccordionItem
            value="phone"
            className="border-b border-gray-100 -mt-4"
          >
            <AccordionTrigger className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Phone</div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm">
              N/A {/* You can add phone field in the User type if available */}
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
          <AccordionItem value="bio" className="border-b border-gray-100 -mt-4">
            <AccordionTrigger className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Bio</div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm">
              <p>{participant.bio || "No bio provided."}</p>
              <div className="flex items-center mt-2">
                <div className="text-sm text-gray-500">
                  @{participant.username}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-blue-500 text-xs h-6 flex items-center"
                  onClick={() =>
                    navigator.clipboard.writeText(participant.username)
                  }
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy link
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}
