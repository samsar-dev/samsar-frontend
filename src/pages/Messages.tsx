"use client";

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
  X
} from "lucide-react";
import { useState } from "react";

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
