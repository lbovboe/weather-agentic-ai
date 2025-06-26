import { useRef, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ChatInput = ({ input, onInputChange, onSubmit, isLoading }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as React.FormEvent);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative"
    >
      <div className="flex items-end space-x-4">
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about the weather... (e.g., 'What's the weather in New York?')"
            className="w-full resize-none rounded-2xl border-2 border-blue-200/60 bg-white/95 backdrop-blur-sm px-6 py-4 pr-16 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-200/30 transition-all duration-300 shadow-lg shadow-blue-100/50 group-hover:shadow-blue-200/60"
            rows={1}
            style={{ minHeight: "56px", maxHeight: "200px" }}
            disabled={isLoading}
          />

          {/* Send Button - Positioned inside textarea */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 bottom-3 flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none group"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> to send,{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Shift + Enter</kbd> for new line
      </div>
    </form>
  );
};
