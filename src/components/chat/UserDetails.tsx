"use client";

import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { AccordionItem } from "@radix-ui/react-accordion";
import { Copy, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

function UserDetails({
  setInfoOpen,
}: {
  setInfoOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="w-1/4 h-[calc(100vh-3.5rem)] border-l border-gray-100 ">
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
          <Avatar className="h-20 w-20 bg-blue-500 mb-2">
            <AvatarFallback className="text-2xl">DC</AvatarFallback>
          </Avatar>
          <div className="font-medium">Name-User</div>
          <div className="text-xs text-gray-500 mb-4">username@gmali.comm</div>
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
                There are super creative people in the chat, everyone’s favorite
                designers who make this world a better place.
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
    </div>
  );
}

export default UserDetails;
