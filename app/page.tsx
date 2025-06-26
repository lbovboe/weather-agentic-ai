"use client";

import { useRef } from "react";
import { Header } from "./components/layout/Header";
import { ChatContainer, ChatContainerRef } from "./components/chat/ChatContainer";

export default function Home() {
  const chatRef = useRef<ChatContainerRef>(null);

  const handleNewChat = () => {
    chatRef.current?.resetChat();
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 grid grid-rows-[auto_1fr_auto]">
      {/* Header */}
      <Header onNewChat={handleNewChat} />

      {/* Main Content */}
      <main className="overflow-hidden">
        <ChatContainer ref={chatRef} />
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-blue-100/50 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-gray-500">
            Powered by OpenAI GPT-4o Mini • Get real-time weather data from around the world
          </p>
        </div>
      </footer>
    </div>
  );
}
