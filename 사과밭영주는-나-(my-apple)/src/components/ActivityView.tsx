import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Users, MapPin } from 'lucide-react';
import { MissionsView } from './Missions';
import { CommunityView } from './Community';
import { ChatbotView } from './ChatbotView';
import { TravelCourse } from './TravelCourse';
import { cn } from '../lib/utils';
import { Course, MissionStatus, VisitedPlace } from '../types';

interface ActivityViewProps {
  onAddPoints: (points: number) => void;
  lives: number;
  onDeductLife: () => void;
  onRestoreLife: (amount?: number) => void;
  missionProgress: Record<string, MissionStatus>;
  onUpdateProgress: (missionId: string, status: MissionStatus) => void;
  points: number;
  weather: string;
  chatHistory: { role: 'user' | 'model'; text: string }[];
  onUpdateChatHistory: (history: { role: 'user' | 'model'; text: string }[]) => void;
  userName: string;
  visitHistory?: VisitedPlace[];
  activeCourse: Course | null;
  onEditCourse: () => void;
  onAIAction?: (name: string, args: any) => void;
  onNavigate?: (tab: string, subTab?: string) => void;
  requestedSubTab?: string | null;
  onSubTabChange?: (tab: string | null) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = (props) => {
  const [activeSubTab, setActiveSubTab] = useState<'missions' | 'community' | 'course'>('missions');
  const [courseViewMode, setCourseViewMode] = useState<'status' | 'design' | 'manual'>('status');

  useEffect(() => {
    if (props.requestedSubTab && (props.requestedSubTab === 'missions' || props.requestedSubTab === 'community' || props.requestedSubTab === 'course')) {
      setActiveSubTab(props.requestedSubTab as any);
      if (props.onSubTabChange) {
        props.onSubTabChange(null);
      }
    }
  }, [props.requestedSubTab]);

  return (
    <div className="py-4">
      {/* Sub-navigation */}
      <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveSubTab('missions')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black transition-all",
            activeSubTab === 'missions' ? "bg-white text-apple-red shadow-sm" : "text-stone-400"
          )}
        >
          <Gamepad2 size={14} />
          퀘스트
        </button>
        <button
          onClick={() => setActiveSubTab('community')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black transition-all",
            activeSubTab === 'community' ? "bg-white text-apple-green shadow-sm" : "text-stone-400"
          )}
        >
          <Users size={14} />
          이웃
        </button>
        <button
          onClick={() => setActiveSubTab('course')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black transition-all",
            activeSubTab === 'course' ? "bg-white text-blue-500 shadow-sm" : "text-stone-400"
          )}
        >
          <MapPin size={14} />
          코스설계
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'missions' && (
          <motion.div
            key="missions"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <MissionsView {...props} />
          </motion.div>
        )}
        {activeSubTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
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
          >
            {props.activeCourse ? (
              <div className="space-y-4">
                <div className="flex bg-blue-50/50 p-1 rounded-xl mb-4">
                  <button 
                    onClick={() => setCourseViewMode('status')}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all",
                      courseViewMode === 'status' ? "bg-blue-500 text-white shadow-sm" : "text-blue-400"
                    )}
                  >
                    진행 상태
                  </button>
                  <button 
                    onClick={() => setCourseViewMode('design')}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all",
                      courseViewMode === 'design' ? "bg-blue-500 text-white shadow-sm" : "text-blue-400"
                    )}
                  >
                    AI 상담
                  </button>
                  <button 
                    onClick={() => setCourseViewMode('manual')}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all",
                      courseViewMode === 'manual' ? "bg-blue-500 text-white shadow-sm" : "text-blue-400"
                    )}
                  >
                    직접 편집
                  </button>
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
                    chatHistory={props.chatHistory}
                    onUpdateHistory={props.onUpdateChatHistory}
                    userName={props.userName}
                    visitHistory={props.visitHistory}
                    hideHeader={true}
                    onAction={props.onAIAction}
                    onNavigate={(tab, subTab) => {
                      if (props.onNavigate) props.onNavigate(tab, subTab);
                      if (tab === 'activity' && subTab === 'course') {
                        setCourseViewMode('status');
                      }
                    }}
                  />
                ) : (
                  <TravelCourse 
                    isEditable={true}
                    course={props.activeCourse} 
                    onEditCourse={() => {}}
                    onCreateSpontaneous={() => {}} 
                    onUpdateCourseItems={(items) => {
                      if (props.onAIAction) {
                        props.onAIAction('manage_travel_course', { action: 'update', items });
                      }
                    }}
                  />
                )}
              </div>
            ) : (
              <ChatbotView 
                points={props.points}
                completedMissions={Object.keys(props.missionProgress).filter(k => props.missionProgress[k] === 'completed')}
                weather={props.weather}
                chatHistory={props.chatHistory}
                onUpdateHistory={props.onUpdateChatHistory}
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
