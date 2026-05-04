import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronRight, Gamepad2, Gift, Info, MapPin, Trash2, X } from 'lucide-react';
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
  onAction,
}) => {
  const handleOpenNotification = (notif: AppNotification) => {
    onRead(notif.id);
    onAction(notif);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] mx-auto max-w-md bg-stone-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 bottom-0 left-0 z-[101] mx-auto flex max-h-[85vh] max-w-md flex-col overflow-hidden rounded-t-[3rem] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-stone-100 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-stone-800">알림 센터</h2>
                  <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
                    Notification Center
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-stone-100 p-2 text-stone-400 transition-colors hover:bg-stone-200"
                aria-label="알림 닫기"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="mb-4 text-6xl">🔕</div>
                  <p className="font-black text-stone-400">도착한 알림이 없습니다.</p>
                </div>
              ) : (
                notifications.slice().reverse().map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group relative cursor-pointer rounded-3xl border-2 p-4 transition-all ${
                      notif.isRead ? 'border-stone-50 bg-stone-50' : 'border-blue-100 bg-white shadow-sm'
                    }`}
                    onClick={() => handleOpenNotification(notif)}
                  >
                    {!notif.isRead && (
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-apple-red" />
                    )}

                    <div className="flex gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                          notif.type === 'location'
                            ? 'bg-blue-100 text-blue-600'
                            : notif.type === 'mission'
                              ? 'bg-apple-red/10 text-apple-red'
                              : notif.type === 'reward'
                                ? 'bg-yeoju-gold/10 text-yeoju-gold'
                                : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {notif.type === 'location' && <MapPin size={22} />}
                        {notif.type === 'mission' && <Gamepad2 size={22} />}
                        {notif.type === 'reward' && <Gift size={22} />}
                        {notif.type === 'info' && <Info size={22} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between">
                          <h4 className={`truncate text-sm font-black ${notif.isRead ? 'text-stone-500' : 'text-stone-800'}`}>
                            {notif.title}
                          </h4>
                          <span className="ml-2 whitespace-nowrap text-[10px] font-bold text-stone-400">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`mb-3 text-xs leading-relaxed font-bold ${notif.isRead ? 'text-stone-400' : 'text-stone-600'}`}>
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenNotification(notif);
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 transition-transform group-hover:translate-x-1"
                          >
                            자세히 보기 <ChevronRight size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notif.id);
                            }}
                            className="p-1.5 text-stone-300 transition-colors hover:text-stone-400"
                            aria-label={`${notif.title} 알림 삭제`}
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
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-stone-100 py-4 font-black text-stone-500 transition-all active:scale-95"
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
