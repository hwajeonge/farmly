import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, MapPin, Gamepad2, Info, Gift, Trash2, ChevronRight } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (notif: AppNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onRead,
  onDelete,
  onAction
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] max-w-md mx-auto"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[3rem] shadow-2xl z-[101] max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-800">알림 센터</h2>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Notification Center</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-stone-100 text-stone-400 rounded-xl hover:bg-stone-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {notifications.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="text-6xl mb-4">🔕</div>
                  <p className="font-black text-stone-400">도착한 알림이 없습니다.</p>
                </div>
              ) : (
                notifications.slice().reverse().map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`relative p-4 rounded-3xl border-2 transition-all cursor-pointer group ${
                      notif.isRead ? 'bg-stone-50 border-stone-50' : 'bg-white border-blue-100 shadow-sm'
                    }`}
                    onClick={() => {
                      onRead(notif.id);
                      onAction(notif);
                    }}
                  >
                    {!notif.isRead && (
                      <div className="absolute top-4 right-4 w-2 h-2 bg-apple-red rounded-full" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        notif.type === 'location' ? 'bg-blue-100 text-blue-600' :
                        notif.type === 'mission' ? 'bg-apple-red/10 text-apple-red' :
                        notif.type === 'reward' ? 'bg-yeoju-gold/10 text-yeoju-gold' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {notif.type === 'location' && <MapPin size={22} />}
                        {notif.type === 'mission' && <Gamepad2 size={22} />}
                        {notif.type === 'reward' && <Gift size={22} />}
                        {notif.type === 'info' && <Info size={22} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={`text-sm font-black truncate ${notif.isRead ? 'text-stone-500' : 'text-stone-800'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] font-bold text-stone-400 whitespace-nowrap ml-2">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-xs font-bold leading-relaxed mb-3 ${notif.isRead ? 'text-stone-400' : 'text-stone-600'}`}>
                          {notif.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 group-hover:translate-x-1 transition-transform">
                            자세히 보기 <ChevronRight size={10} />
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notif.id);
                            }}
                            className="p-1.5 text-stone-300 hover:text-stone-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            <div className="p-8">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-stone-100 text-stone-500 rounded-2xl font-black transition-all active:scale-95"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
