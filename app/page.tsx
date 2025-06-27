"use client";

import { useRef } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { ChatContainer, ChatContainerRef } from "./components/chat/ChatContainer";

export default function Home() {
  const chatRef = useRef<ChatContainerRef>(null);

  const handleNewChat = () => {
    chatRef.current?.resetChat();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
      {/* Sidebar */}
      <Sidebar onNewChat={handleNewChat} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer ref={chatRef} />
      </main>
    </div>
  );
}
