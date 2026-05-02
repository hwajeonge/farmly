import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Bot } from 'lucide-react';
import { ChatbotView } from './ChatbotView';

import { VisitedPlace, ChatConversation } from '../types';

interface FloatingChatbotProps {
  points: number;
  completedMissions: string[];
  weather: string;
  conversations: ChatConversation[];
  onUpdateConversations: (conversations: ChatConversation[]) => void;
  userName: string;
  visitHistory?: VisitedPlace[];
  onAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-20 left-0 right-0 z-[200] max-w-md mx-auto w-full pointer-events-none">
        <div className="flex justify-end px-2 sm:px-4">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto w-10 h-10 bg-apple-red text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white relative"
          >
            <Bot size={20} />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-yeoju-gold rounded-full border-2 border-white"
            />
          </motion.button>
        </div>
      </div>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Transparent Backdrop for outside click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[250] bg-black/10 backdrop-blur-[1px]"
            />
            
            <div className="fixed top-20 left-0 right-0 z-[300] max-w-md mx-auto w-full pointer-events-none px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="pointer-events-auto ml-auto w-[280px] h-[420px] bg-stone-50 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border-4 border-white"
              >
                <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-apple-red/10 rounded-lg flex items-center justify-center text-apple-red">
                      <Bot size={18} />
                    </div>
                    <div>
                      <h3 className="font-black text-[11px]">영주 톡톡</h3>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[7px] font-bold text-stone-400 uppercase">AI Guide</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 bg-stone-100 text-stone-400 rounded-lg flex items-center justify-center hover:bg-stone-200 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden px-3">
                  <ChatbotView
                    points={props.points}
                    completedMissions={props.completedMissions}
                    weather={props.weather}
                    conversations={props.conversations}
                    onUpdateConversations={props.onUpdateConversations}
                    userName={props.userName}
                    visitHistory={props.visitHistory}
                    hideHeader={true}
                    onAction={props.onAction}
                    onNavigate={(tab, subTab) => {
                      if (props.onNavigate) props.onNavigate(tab, subTab);
                      setIsOpen(false);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
