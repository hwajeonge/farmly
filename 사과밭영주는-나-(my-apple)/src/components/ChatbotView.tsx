import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, MapPin, Clock, CloudSun } from 'lucide-react';
import { getChatResponseStream } from '../services/geminiService';

import { VisitedPlace } from '../types';

interface ChatbotViewProps {
  points: number;
  completedMissions: string[];
  weather: string;
  chatHistory: { role: 'user' | 'model'; text: string; action?: string }[];
  onUpdateHistory: (history: { role: 'user' | 'model'; text: string; action?: string }[]) => void;
  hideHeader?: boolean;
  userName: string;
  visitHistory?: VisitedPlace[];
  onAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ 
  points, 
  completedMissions, 
  weather, 
  chatHistory, 
  onUpdateHistory,
  hideHeader = false,
  userName,
  visitHistory = [],
  onAction,
  onNavigate
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newHistory = [...chatHistory, { role: 'user' as const, text: userMsg }];
    onUpdateHistory(newHistory);
    setIsLoading(true);

    const context = {
      time: new Date().toLocaleTimeString(),
      weather,
      completedMissions,
      points,
      userName,
      visitHistory
    };

    try {
      // Add a placeholder for the AI response
      const historyWithPlaceholder = [...newHistory, { role: 'model' as const, text: '', action: '' }];
      onUpdateHistory(historyWithPlaceholder);

      let detectedAction = '';

      await getChatResponseStream(
        userMsg, 
        chatHistory, 
        context,
        {
          onChunk: (partialText) => {
            // Update the last message in history with partial text and current detected action
            onUpdateHistory([...newHistory, { role: 'model' as const, text: partialText, action: detectedAction }]);
          },
          onAction: (name, args) => {
            console.log("AI Action:", name, args);
            detectedAction = name;
            if (onAction) onAction(name, args);
          }
        }
      );
      
      setIsLoading(false);
    } catch (error) {
      console.error("Chat Error:", error);
      onUpdateHistory([...newHistory, { role: 'model' as const, text: "죄송합니다. 오류가 발생했습니다." }]);
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${hideHeader ? 'h-full' : 'h-[calc(100dvh-180px)]'} py-4`}>
      {!hideHeader && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black mb-1">영주 톡톡 🤖</h2>
            <p className="text-stone-500 text-xs font-medium">AI에게 영주 여행 코스를 물어보세요.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-[10px] font-black text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">
              <Clock size={10} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 bg-blue-50 px-2 py-1 rounded-lg">
              <CloudSun size={10} /> {weather}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide"
      >
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-apple-red/10 rounded-3xl flex items-center justify-center text-3xl mb-4 animate-bounce-gentle">🤖</div>
            <h3 className="font-black text-lg mb-2">안녕하세요! 영주 톡톡입니다.</h3>
            <p className="text-stone-400 text-xs font-bold leading-relaxed">
              "부석사 근처 맛집 알려줘"<br />
              "비 오는 날 가기 좋은 곳 추천해줘"<br />
              "2시간 동안 둘러볼 코스 짜줘"
            </p>
          </div>
        )}

        {chatHistory.map((msg, i) => {
          if (msg.role === 'model' && msg.text === '' && isLoading) return null;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-yeoju-gold text-white' : 'bg-apple-red text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-yeoju-gold text-white rounded-tr-none' 
                    : 'bg-white text-stone-700 border-2 border-stone-50 rounded-tl-none'
                }`}>
                  {msg.text}

                  {msg.role === 'model' && msg.action === 'manage_travel_course' && onNavigate && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-2"
                    >
                      <button 
                        onClick={() => onNavigate('activity', 'course')}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        <MapPin size={12} />
                        생성된 코스 바로 확인하기
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {isLoading && chatHistory[chatHistory.length - 1]?.text === '' && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl border-2 border-stone-50 shadow-sm">
              <div className="w-2 h-2 bg-apple-red/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-apple-red/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-apple-red/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="영주 여행에 대해 물어보세요..."
          className="w-full p-4 pr-14 bg-white rounded-2xl border-4 border-stone-100 font-bold text-sm focus:outline-none focus:border-apple-red transition-all shadow-sm"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-apple-red text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:bg-stone-200"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
