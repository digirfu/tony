
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MessageItem from './components/MessageItem';
import { Message, ChatSession } from './types';
import { generateTONYResponse } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('tony_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(() => {
    const saved = localStorage.getItem('tony_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('tony_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tony_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tony_user');
    }
  }, [user]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, isLoading]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const handleLogin = () => {
    // Simulate Gmail Login
    setUser({ email: 'user@gmail.com', name: 'Google User' });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    let targetSessionId = currentSessionId;
    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: text.length > 35 ? text.substring(0, 35) + '...' : text,
        messages: [],
        createdAt: Date.now(),
      };
      setSessions([newSession, ...sessions]);
      targetSessionId = newSession.id;
      setCurrentSessionId(newSession.id);
    }

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          title: s.messages.length === 0 ? (text.length > 35 ? text.substring(0, 35) + '...' : text) : s.title
        };
      }
      return s;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const sessionMessages = sessions.find(s => s.id === targetSessionId)?.messages || [];
      const tonyRes = await generateTONYResponse([...sessionMessages, userMsg], text);

      const tonyMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: tonyRes.content,
        suggestions: tonyRes.suggestions,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) {
          return { ...s, messages: [...s.messages, tonyMsg] };
        }
        return s;
      }));
    } catch (error) {
      const errMsg: Message = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: "Network interruption in cognitive layer. Please retry your transmission.",
        timestamp: Date.now(),
      };
      setSessions(prev => prev.map(s => {
        if (s.id === targetSessionId) return { ...s, messages: [...s.messages, errMsg] };
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#05070a] text-gray-200 overflow-hidden">
      <Sidebar 
        sessions={sessions} 
        currentSessionId={currentSessionId}
        isOpen={isSidebarOpen}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onClose={() => setIsSidebarOpen(false)}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top bar */}
        <header className="h-16 glass-header border-b border-white/5 flex items-center justify-between px-4 md:px-10 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-2 -ml-2 transition-colors"
            >
              <i className="fas fa-bars-staggered text-lg"></i>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-white font-black tracking-tighter text-2xl uppercase italic">TONY</span>
              {user && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span> Encrypted
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
             <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Active Session
             </div>
             <div className="hidden sm:block h-5 w-px bg-white/10"></div>
             {user ? (
               <div className="flex items-center gap-3 group cursor-pointer">
                 <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.name}</span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase">Cloud Sync Active</span>
                 </div>
                 <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xs font-black border border-white/20 shadow-lg group-hover:scale-105 transition-transform">
                   {user.name[0]}
                 </div>
               </div>
             ) : (
               <button 
                onClick={handleLogin}
                className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all hover:tracking-[0.3em] flex items-center gap-2"
               >
                 <i className="fab fa-google text-xs text-blue-500"></i> Sync Profile
               </button>
             )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-48 custom-scrollbar">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-8 max-w-5xl mx-auto">
              
              <div className="animate-stagger stagger-1 text-center mb-16">
                <h2 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter leading-none select-none uppercase italic">
                  I'M <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-600 text-glow">TONY</span>
                </h2>
                <div className="h-1.5 w-32 bg-blue-600 mx-auto rounded-full mb-12 shadow-[0_0_20px_rgba(37,99,235,0.5)]"></div>
                <p className="text-gray-400 text-xl md:text-3xl font-medium italic leading-relaxed max-w-3xl mx-auto px-4 opacity-90 tracking-tight">
                  "The best code is the code that goes unnoticed because it works so flawlessly."
                </p>
              </div>

              {!user && (
                <button 
                  onClick={handleLogin}
                  className="mt-4 px-10 py-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-all animate-stagger stagger-3 shadow-2xl hover:shadow-blue-500/10 active:scale-95"
                >
                  <i className="fab fa-google mr-4 text-blue-500"></i> Authorize Sync Layer
                </button>
              )}
            </div>
          ) : (
            <div className="pt-8">
              {currentSession.messages.map(msg => (
                <MessageItem 
                  key={msg.id} 
                  message={msg} 
                  onSuggestionClick={handleSendMessage}
                />
              ))}
            </div>
          )}
          
          {isLoading && (
            <div className="flex w-full py-16">
              <div className="max-w-4xl mx-auto px-6 md:px-12 flex gap-8 w-full">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center ring-1 ring-blue-500/20 shrink-0">
                   <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <div className="flex-1 space-y-6 pt-1">
                  <div className="flex items-center gap-4">
                    <div className="text-[11px] text-blue-400 font-black uppercase tracking-[0.3em] animate-pulse">Neural Processing</div>
                    <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 via-transparent to-transparent"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2.5 bg-white/5 rounded-full w-[90%] animate-pulse"></div>
                    <div className="h-2.5 bg-white/5 rounded-full w-[70%] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-10" />
        </div>

        {/* Floating Input area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-40 bg-gradient-to-t from-[#05070a] via-[#05070a]/90 to-transparent">
          <div className="max-w-4xl mx-auto w-full relative">
            {/* Command Bar Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
            
            <div className="relative group flex items-end gap-3 bg-[#0d1117]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 pl-6 pr-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all duration-500">
              <div className="flex items-center justify-center w-10 h-10 text-gray-600 mb-2">
                <i className="fas fa-terminal text-sm"></i>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(input);
                  }
                }}
                placeholder="Initialize Command..."
                className="w-full bg-transparent text-white py-4 px-1 max-h-60 min-h-[56px] focus:outline-none resize-none text-[16px] font-medium placeholder-gray-700 scrollbar-hide"
                rows={1}
              />
              <div className="flex items-center gap-2 mb-1.5">
                <button
                    className="p-3 text-gray-500 hover:text-white transition-colors hidden sm:flex items-center justify-center rounded-xl hover:bg-white/5"
                    title="Attach Data"
                >
                    <i className="fas fa-paperclip text-sm"></i>
                </button>
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className={`flex items-center justify-center w-12 h-12 rounded-[1.2rem] transition-all duration-500 shrink-0 ${
                    !input.trim() || isLoading 
                    ? 'bg-white/5 text-gray-800 border border-white/5' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_20px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <i className="fas fa-arrow-up text-sm"></i>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-between px-6 mt-5">
                <div className="flex gap-6">
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <i className="fas fa-bolt text-blue-500/50"></i>
                        Flash Optimized
                    </span>
                    <span className="hidden sm:flex text-[9px] text-gray-600 font-black uppercase tracking-[0.2em] items-center gap-2">
                        <i className="fas fa-shield-halved text-indigo-500/50"></i>
                        Secure Layer
                    </span>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="h-1 w-8 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500/50 w-2/3"></div>
                    </div>
                    <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.2em]">
                      v1.5.2-PRIME
                    </p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
