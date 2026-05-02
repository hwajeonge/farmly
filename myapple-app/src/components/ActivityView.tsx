import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MissionsView } from './Missions';
import { CommunityView } from './Community';
import { ChatbotView } from './ChatbotView';
import { TravelCourse } from './TravelCourse';
import { cn } from '../lib/utils';
import { Course, MissionStatus, VisitedPlace, ChatConversation } from '../types';

interface ActivityViewProps {
  onAddPoints: (points: number) => void;
  lives: number;
  onDeductLife: () => void;
  onRestoreLife: (amount?: number) => void;
  missionProgress: Record<string, MissionStatus>;
  onUpdateProgress: (missionId: string, status: MissionStatus) => void;
  points: number;
  weather: string;
  conversations: ChatConversation[];
  onUpdateConversations: (conversations: ChatConversation[]) => void;
  userName: string;
  visitHistory?: VisitedPlace[];
  activeCourse: Course | null;
  onEditCourse: () => void;
  onAIAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
  requestedSubTab?: string | null;
  onSubTabChange?: (tab: string | null) => void;
}

const SUB_TABS = [
  { id: 'missions',  emoji: '🎯', label: '퀘스트'  },
  { id: 'community', emoji: '🤝', label: '이웃'    },
  { id: 'course',    emoji: '🗺️', label: '코스설계' },
] as const;

type SubTab = typeof SUB_TABS[number]['id'];

export const ActivityView: React.FC<ActivityViewProps> = (props) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('missions');
  const [courseViewMode, setCourseViewMode] = useState<'status' | 'design' | 'manual'>('status');

  useEffect(() => {
    const req = props.requestedSubTab;
    if (req && (req === 'missions' || req === 'community' || req === 'course')) {
      setActiveSubTab(req);
      props.onSubTabChange?.(null);
    }
  }, [props.requestedSubTab]);

  return (
    <div className="py-4">

      {/* 서브 네비게이션 */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-6 gap-1">
        {SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-black transition-all',
                isActive
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-400 hover:text-stone-500',
              )}
            >
              {isActive && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-sm"
                >
                  {tab.emoji}
                </motion.span>
              )}
              {!isActive && <span className="text-sm opacity-60">{tab.emoji}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 컨텐츠 */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'missions' && (
          <motion.div
            key="missions"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <MissionsView {...props} />
          </motion.div>
        )}

        {activeSubTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <CommunityView />
          </motion.div>
        )}

        {activeSubTab === 'course' && (
          <motion.div
            key="course"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {props.activeCourse ? (
              <div className="space-y-4">
                {/* 코스 뷰모드 탭 */}
                <div className="flex bg-blue-50 p-1 rounded-2xl gap-1">
                  {([
                    { id: 'status', label: '진행 상태' },
                    { id: 'design', label: 'AI 상담'  },
                    { id: 'manual', label: '직접 편집' },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setCourseViewMode(m.id)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-[11px] font-black transition-all',
                        courseViewMode === m.id
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'text-sky-400 hover:text-sky-500',
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {courseViewMode === 'status' ? (
                  <TravelCourse
                    course={props.activeCourse}
                    onEditCourse={() => setCourseViewMode('design')}
                    onCreateSpontaneous={() => {}}
                  />
                ) : courseViewMode === 'design' ? (
                  <ChatbotView
                    points={props.points}
                    completedMissions={Object.keys(props.missionProgress).filter(k => props.missionProgress[k] === 'completed')}
                    weather={props.weather}
                    conversations={props.conversations}
                    onUpdateConversations={props.onUpdateConversations}
                    userName={props.userName}
                    visitHistory={props.visitHistory}
                    hideHeader={true}
                    onAction={props.onAIAction}
                    onNavigate={(tab, subTab) => {
                      props.onNavigate?.(tab, subTab);
                      if (tab === 'activity' && subTab === 'course') setCourseViewMode('status');
                    }}
                  />
                ) : (
                  <TravelCourse
                    isEditable={true}
                    course={props.activeCourse}
                    onEditCourse={() => {}}
                    onCreateSpontaneous={() => {}}
                    onUpdateCourseItems={(items) => {
                      props.onAIAction?.('manage_travel_course', { action: 'update', items });
                    }}
                  />
                )}
              </div>
            ) : (
              <ChatbotView
                points={props.points}
                completedMissions={Object.keys(props.missionProgress).filter(k => props.missionProgress[k] === 'completed')}
                weather={props.weather}
                conversations={props.conversations}
                onUpdateConversations={props.onUpdateConversations}
                userName={props.userName}
                visitHistory={props.visitHistory}
                hideHeader={true}
                onAction={props.onAIAction}
                onNavigate={props.onNavigate}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
