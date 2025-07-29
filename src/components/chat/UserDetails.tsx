"use client";

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OptimizedAvatar from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import type { User } from "@/types/user";
import { AccordionItem } from "@radix-ui/react-accordion";
import { Copy, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";

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
    <div className="fixed inset-0 md:relative md:inset-auto md:w-1/4 h-[calc(100vh-3.5rem)] border-l border-gray-100 bg-white z-50 md:z-auto">
      <ScrollArea>
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="font-medium text-blue-500">About User</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInfoOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setInfoOpen(false)}
            className="hidden md:flex"
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
          <Link
            to={`/profile/${participant.id}`}
            className="flex flex-col items-center"
          >
            <OptimizedAvatar 
              src={participant?.profilePicture}
              fallback={participant?.name || participant?.username || 'U'}
              size="lg"
              className="h-24 w-24 mb-4"
            />
            <div className="font-medium">{participant.name}</div>
            {participant.showEmail && (
              <div className="text-xs text-gray-500 mb-4">
                {participant.email}
              </div>
            )}
          </Link>
        </div>

        {/* Email Accordion */}
        <Accordion
          type="single"
          collapsible
          defaultValue={participant.showEmail ? "email" : ""}
          disabled={participant.showEmail ? false : true}
          className="w-full mb-4"
        >
          <AccordionItem
            value="email"
            className="border-b border-gray-100 -mt-4"
          >
            <AccordionTrigger className="p-4 flex items-center justify-between">
              <div
                className={`text-sm ${participant.showEmail ? "text-gray-500" : "text-gray-500/50"}`}
              >
                Email
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm">
              {participant.email || "No email provided."}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Phone Accordion (if available, otherwise fallback) */}
        <Accordion
          type="single"
          collapsible
          defaultValue={participant.showPhoneNumber ? "phone" : ""}
          disabled={!participant.showPhoneNumber}
          className="w-full mb-4"
        >
          <AccordionItem
            value="phone"
            className="border-b border-gray-100 -mt-4"
          >
            <AccordionTrigger className="p-4 flex items-center justify-between">
              <div
                className={`text-sm ${participant.showPhoneNumber ? "text-gray-500" : "text-gray-500/50"}`}
              >
                Phone
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm">
              {participant.phone || "No phone provided."}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* Bio Accordion */}
        <Accordion
          type="single"
          collapsible
          defaultValue="bio"
          className="w-full mb-4"
        >
          <AccordionItem value="bio" className="border-b border-gray-100 -mt-4">
            <AccordionTrigger className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Bio</div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm">
              <p>{participant.bio || "Empty bio"}</p>
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

        {/* Location Accordion */}
        <Accordion
          type="single"
          collapsible
          defaultValue="city"
          className="w-full"
        >
          <AccordionItem
            value="city"
            className="border-b border-gray-100 -mt-4"
          >
            <AccordionTrigger className="p-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">City</div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 text-sm">
              {participant.location || "No city provided."}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}
