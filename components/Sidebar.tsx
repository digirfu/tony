
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isOpen: boolean;
  user: { email: string; name: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onClose: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  isOpen,
  user,
  onLogin,
  onLogout,
  onClose,
  onSelectSession, 
  onNewChat,
  onDeleteSession
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`fixed md:static inset-y-0 left-0 w-80 glass-sidebar border-r border-white/5 flex flex-col h-full z-50 transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 pb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-white font-black tracking-tighter text-3xl uppercase italic leading-none">TONY</span>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1 ml-1 opacity-70">Workspace</span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-white p-2 transition-colors"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>

        <div className="px-8 my-8">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between group bg-white text-black font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-[0_15px_30px_-5px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center gap-3 text-sm uppercase tracking-widest">
              <i className="fas fa-plus text-xs"></i>
              New Chat
            </span>
            <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-black/10 bg-black/5 px-2 font-mono text-[10px] font-black opacity-40">
              K
            </kbd>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-1 custom-scrollbar">
          <div className="flex items-center justify-between px-3 mb-6 mt-4">
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Operational History</span>
          </div>
          
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] flex items-center justify-center mb-6 ring-1 ring-white/5 shadow-inner">
                  <i className="fas fa-folder-open text-gray-800 text-xl"></i>
              </div>
              <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest">Vault Empty</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  currentSessionId === session.id 
                    ? 'bg-blue-500/10 text-white active-glow border border-blue-500/30' 
                    : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-300 border border-transparent'
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 768) onClose();
                }}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${currentSessionId === session.id ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6]' : 'bg-gray-800 group-hover:bg-gray-600'}`}></div>
                  <span className="truncate text-xs font-bold tracking-wide uppercase">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-xl transition-all text-gray-600 hover:text-red-500"
                >
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-8 mt-auto border-t border-white/5 space-y-6">
          {!user ? (
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-gray-400 font-black py-4 rounded-2xl transition-all active:scale-[0.98]"
            >
              <i className="fab fa-google text-xs text-blue-500"></i>
              <span className="text-[10px] uppercase tracking-[0.2em]">Authorize Persistence</span>
            </button>
          ) : (
            <div className="bg-gradient-to-br from-white/[0.04] to-transparent rounded-[2rem] p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-sm font-black shadow-xl group-hover:scale-110 transition-transform text-white ring-2 ring-white/10">
                        {user.name[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-green-500 border-4 border-[#0d1117] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-white truncate uppercase tracking-widest">{user.name}</p>
                  <p className="text-[9px] text-gray-500 font-bold truncate opacity-60 uppercase tracking-tighter">{user.email}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onLogout(); }}
                  className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <i className="fas fa-power-off text-xs"></i>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-1 px-2">
            <div className="flex justify-between items-center text-[8px] font-black text-gray-700 uppercase tracking-widest">
                <span>Core Latency</span>
                <span className="text-green-500/50">24ms</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/30 w-1/4"></div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
