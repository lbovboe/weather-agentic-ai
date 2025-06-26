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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      <Header onNewChat={handleNewChat} />

      <ChatContainer ref={chatRef} />

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-blue-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Powered by OpenAI GPT-4o Mini • Get real-time weather data from around the world
          </p>
        </div>
      </footer>
    </div>
  );
}
