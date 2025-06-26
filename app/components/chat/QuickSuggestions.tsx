interface QuickSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
}

export const QuickSuggestions = ({ suggestions, onSuggestionClick, isLoading }: QuickSuggestionsProps) => {
  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-600 mb-3 text-center">Try these examples:</p>
      <div className="flex flex-wrap justify-center gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="group px-4 py-2.5 text-sm bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 hover:text-blue-800 rounded-xl border border-blue-200/60 hover:border-blue-300/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 shadow-sm hover:shadow-md font-medium"
            disabled={isLoading}
          >
            <span className="group-hover:scale-105 transition-transform duration-200 inline-block">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
