
import React from 'react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  onSuggestionClick?: (text: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onSuggestionClick }) => {
  const isAssistant = message.role === 'assistant';

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-black mt-8 mb-3 text-white tracking-wide uppercase">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black mt-10 mb-4 text-white tracking-tight border-l-4 border-blue-600 pl-6">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black mt-12 mb-6 text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">{line.slice(2)}</h1>;
      
      // Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={i} className="flex gap-4 mb-3 ml-2 group/list">
            <span className="text-blue-600 mt-2 text-[10px] group-hover/list:scale-150 transition-transform duration-300"><i className="fas fa-square-full rotate-45"></i></span>
            <span className="text-gray-300 text-[16px] leading-relaxed flex-1 font-medium">{line.trim().slice(2)}</span>
          </div>
        );
      }
      
      // Basic Bold/Italic
      let formattedLine = line;
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-black">$1</strong>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em class="text-blue-400 font-medium not-italic">$1</em>');

      if (line.trim() === '') return <div key={i} className="h-6"></div>;

      return (
        <p key={i} className="text-gray-300 leading-[1.8] mb-5 text-[16px] font-medium opacity-90" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div className={`group w-full py-16 transition-all duration-500 ${isAssistant ? 'bg-white/[0.015] tony-message-glow border-y border-white/[0.02]' : 'bg-transparent'}`}>
      <div className="max-w-4xl mx-auto px-6 md:px-12 flex gap-8 md:gap-14 w-full">
        <div className="shrink-0 pt-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isAssistant 
            ? 'bg-gradient-to-br from-blue-700 to-indigo-900 text-white ring-2 ring-blue-500/20 shadow-blue-900/40 group-hover:scale-110 group-hover:rotate-6' 
            : 'bg-white/5 text-gray-500 ring-1 ring-white/10 group-hover:bg-white/10'
          }`}>
            {isAssistant ? (
              <i className="fas fa-shield-halved text-lg"></i>
            ) : (
              <i className="fas fa-fingerprint text-lg"></i>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-8">
            <span className={`text-[11px] font-black uppercase tracking-[0.4em] ${isAssistant ? 'text-blue-500' : 'text-gray-600'}`}>
              {isAssistant ? 'SYSTEM AUTHENTICATED' : 'LOCAL TERMINAL'}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/[0.05] to-transparent"></div>
            {isAssistant && (
                <span className="text-[10px] px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 font-black tracking-widest uppercase">
                    v1.5-FLASH
                </span>
            )}
          </div>

          <div className="message-content">
            {renderContent(message.content)}
          </div>

          {isAssistant && message.suggestions && message.suggestions.length > 0 && (
            <div className="pt-12 mt-12 border-t border-white/[0.03] animate-in">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em] px-2 whitespace-nowrap">Neural Branches</span>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-900 via-gray-900 to-transparent"></div>
              </div>
              <div className="flex flex-wrap gap-4">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSuggestionClick?.(suggestion)}
                    className="group/btn relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-blue-500/40 text-gray-500 hover:text-white py-4 px-8 rounded-2xl transition-all duration-500 text-sm font-black uppercase tracking-widest active:scale-[0.97] shadow-lg"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    <span className="relative z-10 flex items-center gap-3">
                      {suggestion}
                      <i className="fas fa-chevron-right text-[10px] opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all"></i>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
