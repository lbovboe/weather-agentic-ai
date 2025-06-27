interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar = ({ onNewChat }: SidebarProps) => {
  return (
    <div className="w-16 bg-gradient-to-b from-blue-600 to-blue-700 shadow-xl flex flex-col items-center py-6">
      {/* Logo/Brand area */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <span className="text-white text-xl font-bold">🌤️</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-105 group"
        aria-label="Start new chat"
        title="New Chat"
      >
        <svg
          className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom decorative element */}
      <div className="w-8 h-1 bg-white/20 rounded-full"></div>
    </div>
  );
};
