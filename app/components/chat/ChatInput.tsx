import { useRef } from "react";
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

    // Auto-resize textarea with smooth transition
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
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
      {/* Main input container with flexbox layout */}
      <div className="flex items-end gap-3 p-1">
        <div className="flex-1 relative">
          {/* Input wrapper with consistent border and background */}
          <div className="relative rounded-2xl border-2 border-blue-200/60 bg-white/95 backdrop-blur-sm shadow-lg shadow-blue-100/50 hover:shadow-blue-200/60 transition-all duration-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-200/30">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me about the weather... (e.g., 'What's the weather in New York?')"
              className="w-full resize-none bg-transparent px-6 py-4 pr-16 text-gray-900 placeholder-gray-500 focus:outline-none transition-all duration-200 hide-scrollbar"
              rows={1}
              style={{
                minHeight: "56px",
                maxHeight: "200px",
                transition: "height 0.2s ease-out",
              }}
              disabled={isLoading}
            />

            {/* Send Button - Positioned consistently within the input wrapper */}
            <div className="absolute right-3 bottom-3 flex items-center">
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-600/30 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-none group"
              >
                <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
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
