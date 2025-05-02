"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ImageIcon,
  MoreHorizontal,
  Paperclip,
  Send
} from "lucide-react";

function ChatSection() {
  return (
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
                <Button variant="ghost" size="icon" className="ml-auto h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg inline-block">
                <p>Hi, how long does it take to finalize the page?</p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400">Today, 8 July</div>

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
            <div className="text-xs text-gray-500">Nickolay is typing ...</div>
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
  );
}

export default ChatSection;
