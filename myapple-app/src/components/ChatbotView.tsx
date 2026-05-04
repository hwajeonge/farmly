import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, MapPin, Clock, CloudSun, Plus, ChevronLeft, MessageSquare } from 'lucide-react';
import { getChatResponseStream } from '../services/geminiService';
import { ChatConversation, ChatMessage, VisitedPlace } from '../types';

interface ChatbotViewProps {
  points: number;
  completedMissions: string[];
  weather: string;
  conversations: ChatConversation[];
  onUpdateConversations: (conversations: ChatConversation[]) => void;
  hideHeader?: boolean;
  userName: string;
  visitHistory?: VisitedPlace[];
  favoritePlaces?: string[];
  onAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
  requestedChatId?: string | null;
  onRequestedChatHandled?: () => void;
  activeCourseName?: string | null;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({
  points,
  completedMissions,
  weather,
  conversations,
  onUpdateConversations,
  hideHeader = false,
  userName,
  visitHistory = [],
  favoritePlaces = [],
  onAction,
  onNavigate,
  requestedChatId,
  onRequestedChatHandled,
  activeCourseName,
}) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef(conversations);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeChatId) ?? null;

  useEffect(() => {
    if (!requestedChatId) return;
    const exists = conversations.some(conversation => conversation.id === requestedChatId);
    setActiveChatId(exists ? requestedChatId : null);
    onRequestedChatHandled?.();
  }, [requestedChatId, conversations, onRequestedChatHandled]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isLoading]);

  const handleStartNewChat = () => {
    const newConv: ChatConversation = {
      id: 'chat_' + Date.now(),
      title: '새 대화',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    onUpdateConversations([newConv, ...conversations]);
    setActiveChatId(newConv.id);
  };

  const handleEndChat = () => {
    setActiveChatId(null);
    setInput('');
  };

  const updateActiveConv = (messages: ChatMessage[], title?: string) => {
    onUpdateConversations(
      conversations.map(c =>
        c.id === activeChatId
          ? { ...c, messages, updatedAt: new Date().toISOString(), ...(title ? { title } : {}) }
          : c
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeChatId || !activeConversation) return;

    const userMsg = input.trim();
    setInput('');

    const isFirstMessage = activeConversation.messages.length === 0;
    const newTitle = isFirstMessage ? userMsg.slice(0, 28) : undefined;
    const messagesWithUser: ChatMessage[] = [...activeConversation.messages, { role: 'user', text: userMsg }];

    // Add user message immediately
    onUpdateConversations(
      conversations.map(c =>
        c.id === activeChatId
          ? { ...c, messages: messagesWithUser, updatedAt: new Date().toISOString(), ...(newTitle ? { title: newTitle } : {}) }
          : c
      )
    );
    setIsLoading(true);

    const context = {
      time: new Date().toLocaleTimeString(),
      weather,
      completedMissions,
      points,
      userName,
      visitHistory,
      favoritePlaces,
    };

    try {
      let detectedAction = '';
      const messagesWithPlaceholder: ChatMessage[] = [...messagesWithUser, { role: 'model', text: '' }];

      onUpdateConversations(
        conversations.map(c =>
          c.id === activeChatId
            ? { ...c, messages: messagesWithPlaceholder, updatedAt: new Date().toISOString(), ...(newTitle ? { title: newTitle } : {}) }
            : c
        )
      );

      await getChatResponseStream(
        userMsg,
        activeConversation.messages,
        context,
        {
          onChunk: (partialText) => {
            onUpdateConversations(
              conversationsRef.current.map(c =>
                c.id === activeChatId
                  ? {
                      ...c,
                      updatedAt: new Date().toISOString(),
                      ...(newTitle ? { title: newTitle } : {}),
                      messages: [
                        ...messagesWithUser,
                        { role: 'model' as const, text: partialText, action: detectedAction },
                      ],
                    }
                  : c
              )
            );
          },
          onAction: (name, args) => {
            detectedAction = name;
            if (onAction) {
              const actionArgs = args && typeof args === 'object'
                ? { ...args, sourceChatId: activeChatId }
                : { sourceChatId: activeChatId };
              onAction(name, actionArgs);
            }
          },
        }
      );
    } catch {
      onUpdateConversations(
        conversationsRef.current.map(c =>
          c.id === activeChatId
            ? {
                ...c,
                updatedAt: new Date().toISOString(),
                messages: [...messagesWithUser, { role: 'model', text: '죄송합니다. 오류가 발생했습니다.' }],
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // ── CHAT VIEW ────────────────────────────────────────────────
  if (activeChatId && activeConversation) {
    const messages = activeConversation.messages;
    return (
      <div className={`flex flex-col ${hideHeader ? 'h-full' : 'h-[calc(100dvh-180px)]'} py-4`}>
        {/* Back bar */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleEndChat}
            className="flex items-center gap-1.5 text-xs font-black text-stone-500 bg-stone-100 px-3 py-2 rounded-xl hover:bg-stone-200 transition-all active:scale-95"
          >
            <ChevronLeft size={14} />
            대화 종료
          </button>
          <span className="text-xs font-bold text-stone-400 truncate flex-1">{activeConversation.title}</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-14 h-14 bg-apple-red/10 rounded-3xl flex items-center justify-center text-3xl mb-3 animate-bounce-gentle">🤖</div>
              <p className="text-stone-400 text-xs font-bold leading-relaxed">
                "부석사 근처 맛집 알려줘"<br />
                "2시간 코스 짜줘"
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            if (msg.role === 'model' && msg.text === '' && isLoading) return null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-yeoju-gold text-white' : 'bg-apple-red text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
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
                        className="mt-3 pt-3 border-t border-stone-100"
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

          {isLoading && messages[messages.length - 1]?.text === '' && (
            <div className="flex justify-start">
              <div className="flex gap-2 items-center bg-white p-3 rounded-2xl border-2 border-stone-50 shadow-sm">
                <div className="w-2 h-2 bg-apple-red/40 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-apple-red/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-apple-red/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
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
  }

  // ── LIST VIEW ────────────────────────────────────────────────
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

      {/* New Chat Button */}
      <button
        onClick={handleStartNewChat}
        className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-apple-red text-white rounded-2xl font-black text-sm shadow-lg shadow-apple-red/20 active:scale-95 transition-all"
      >
        <Plus size={18} />
        새로운 채팅 시작
      </button>

      {activeCourseName && (
        <div className="mb-3 rounded-2xl border-2 border-blue-100 bg-blue-50 p-3">
          <p className="text-[11px] font-bold leading-relaxed text-blue-600">
            지금 코스는 <span className="font-black">{activeCourseName}</span>예요. 새 채팅에서 새 코스를 만들면 활성 코스가 새 코스로 바뀔 수 있고, 이전 코스 상담은 대화 목록에 남아 다시 열 수 있어요.
          </p>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-stone-100 rounded-3xl flex items-center justify-center text-3xl mb-4">💬</div>
            <p className="text-stone-400 text-xs font-bold leading-relaxed">
              아직 대화 기록이 없어요.<br />새로운 채팅을 시작해보세요!
            </p>
          </div>
        ) : (
          sortedConversations.map(conv => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            const dateStr = new Date(conv.updatedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
            return (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setActiveChatId(conv.id)}
                className="w-full text-left bg-white border-2 border-stone-100 rounded-2xl p-3.5 shadow-sm hover:border-apple-red/30 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 bg-apple-red/10 rounded-xl flex items-center justify-center shrink-0">
                      <MessageSquare size={14} className="text-apple-red" />
                    </div>
                    <span className="font-black text-sm text-stone-800 truncate">{conv.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-stone-300 shrink-0">{dateStr}</span>
                </div>
                {lastMsg && (
                  <p className="text-[11px] font-medium text-stone-400 truncate pl-9">
                    {lastMsg.role === 'user' ? '나: ' : 'AI: '}{lastMsg.text}
                  </p>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};
