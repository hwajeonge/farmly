import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot } from 'lucide-react';
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
  favoritePlaces?: string[];
  onAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-20 left-0 right-0 z-200 max-w-md mx-auto w-full pointer-events-none">
            <div className="flex justify-end px-4">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="pointer-events-auto w-12 h-12 bg-apple-red text-white rounded-full shadow-xl flex items-center justify-center border-4 border-white relative"
              >
                <Bot size={22} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yeoju-gold rounded-full border-2 border-white"
                />
              </motion.button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[250] bg-black/10 backdrop-blur-[1px]"
            />

            <div className="fixed bottom-20 left-0 right-0 z-300 max-w-md mx-auto w-full pointer-events-none px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 16 }}
                style={{ transformOrigin: 'bottom right' }}
                className="pointer-events-auto ml-auto w-[340px] h-[560px] bg-stone-50 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border-4 border-white"
              >
                <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-stone-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-apple-red/10 rounded-xl flex items-center justify-center text-apple-red">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-xs">영주 톡톡</h3>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[8px] font-bold text-stone-400 uppercase">AI Guide</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 bg-stone-100 text-stone-400 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden px-3 min-h-0">
                  <ChatbotView
                    points={props.points}
                    completedMissions={props.completedMissions}
                    weather={props.weather}
                    conversations={props.conversations}
                    onUpdateConversations={props.onUpdateConversations}
                    userName={props.userName}
                    visitHistory={props.visitHistory}
                    favoritePlaces={props.favoritePlaces}
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
