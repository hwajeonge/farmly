import React from 'react';
import { motion, Reorder } from 'framer-motion';
import { Clock, Navigation, CheckCircle2, MoreVertical, Plus, Trash2, X, GripVertical, Heart } from 'lucide-react';
import { Course } from '../types';
import { PLACES } from '../constants';
import { cn } from '../lib/utils';

interface TravelCourseProps {
  course: Course | null;
  onEditCourse: () => void;
  onCreateSpontaneous: () => void;
  isEditable?: boolean;
  onUpdateCourseItems?: (items: any[]) => void;
  favoritePlaceIds?: string[];
  onToggleFavorite?: (placeId: string) => void;
}

export const TravelCourse: React.FC<TravelCourseProps> = ({ 
  course, 
  onEditCourse, 
  onCreateSpontaneous,
  isEditable = false,
  onUpdateCourseItems,
  favoritePlaceIds = [],
  onToggleFavorite
}) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const favoriteSet = React.useMemo(() => new Set(favoritePlaceIds), [favoritePlaceIds]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-stone-50 rounded-[2.5rem] border-4 border-dashed border-stone-200">
        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-3xl mb-4 text-blue-500">🗺️</div>
        <h3 className="font-black text-lg mb-2 text-stone-700">활성화된 여행 코스가 없네요!</h3>
        <p className="text-stone-400 text-xs font-bold leading-relaxed mb-6">
          챗봇과 대화하여 나만의 코스를 만들거나<br />
          첫 방문 장소를 인증하면 자동으로 생성해 드려요.
        </p>
        <button 
          onClick={onCreateSpontaneous}
          className="w-full py-4 bg-blue-500 text-white rounded-2xl font-black shadow-[0_4px_0_0_#2b6cb0] active:shadow-none active:translate-y-1 transition-all"
        >
          즉흥 여행 시작하기 (자동 코스 생성)
        </button>
      </div>
    );
  }

  const handleReorder = (newItems: any[]) => {
    if (!onUpdateCourseItems) return;
    const reordered = newItems.map((item, i) => ({ ...item, order: i }));
    onUpdateCourseItems(reordered);
  };

  const handleRemove = (placeId: string) => {
    if (!onUpdateCourseItems) return;
    const newItems = course.items.filter(item => item.placeId !== placeId);
    const reordered = newItems.map((item, i) => ({ ...item, order: i }));
    onUpdateCourseItems(reordered);
  };

  const handleAddPlace = (placeId: string) => {
    if (!onUpdateCourseItems) return;
    const newItem = {
      placeId,
      order: course.items.length,
      status: 'none' as const
    };
    onUpdateCourseItems([...course.items, newItem]);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-stone-800">{course.name}</h2>
          <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest">{course.theme || '영주 감성 여행'}</p>
          {favoritePlaceIds.length > 0 && (
            <p className="mt-1 text-[10px] font-black text-apple-red">찜한 장소 {favoritePlaceIds.length}곳을 추천에 반영 중</p>
          )}
        </div>
        {!isEditable && (
          <button 
            onClick={onEditCourse}
            className="p-2 bg-stone-100 text-stone-500 rounded-xl hover:bg-stone-200 transition-colors"
          >
            <MoreVertical size={20} />
          </button>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-stone-100" />
        
        <Reorder.Group axis="y" values={course.items} onReorder={handleReorder} className="space-y-8">
          {course.items.map((item, idx) => {
            const place = PLACES.find(p => p.id === item.placeId);
            if (!place) return null;
            const isFavorite = favoriteSet.has(place.id);

            return (
              <Reorder.Item 
                key={item.placeId} 
                value={item}
                dragListener={isEditable}
                className="relative flex gap-4"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm z-10 shrink-0 ${idx === 0 ? 'bg-apple-red text-white' : 'bg-white border-4 border-stone-100 text-stone-400'}`}>
                  {idx + 1}
                </div>
                
                <div className={`flex-1 bg-white p-4 rounded-2xl border-2 border-stone-50 shadow-sm transition-all ${isEditable ? 'cursor-grab active:cursor-grabbing hover:border-blue-200' : ''}`}>
                  <div className="flex gap-3 mb-3">
                    <img src={place.image} alt={place.name} className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {isEditable && <GripVertical size={14} className="text-stone-300 shrink-0" />}
                          <h4 className="font-black text-stone-800 truncate">{place.name}</h4>
                        </div>
                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite?.(place.id);
                            }}
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-xl border-2 transition-all active:scale-90',
                              isFavorite
                                ? 'border-red-100 bg-red-50 text-apple-red'
                                : 'border-stone-100 bg-white text-stone-300 hover:text-apple-red',
                            )}
                            aria-label={isFavorite ? `${place.name} 찜 해제` : `${place.name} 찜하기`}
                          >
                            <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} />
                          </button>
                          <span className="text-[10px] font-black text-apple-red bg-apple-red/5 px-2 py-0.5 rounded-lg whitespace-nowrap">
                            {place.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
                        <Clock size={10} /> {place.estimatedStayTime}분 체류 예정
                      </p>
                    </div>
                  </div>
                  
                  {item.memo && (
                    <div className="bg-stone-50 p-2.5 rounded-xl mb-3">
                      <p className="text-[10px] font-bold text-stone-500">💬 {item.memo}</p>
                    </div>
                  )}

                  {isEditable ? (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-50">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(item.placeId);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-apple-red/10 text-apple-red rounded-xl hover:bg-apple-red hover:text-white transition-all text-[10px] font-black"
                      >
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-3 border-t border-stone-50">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-100 text-stone-600 text-[10px] font-black hover:bg-stone-200">
                        <Navigation size={12} /> 이동방법
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-apple-green text-white text-[10px] font-black shadow-[0_3px_0_0_#2f855a] active:shadow-none active:translate-y-0.5 transition-all">
                        <CheckCircle2 size={12} /> 방문완료
                      </button>
                    </div>
                  )}
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        {isEditable && (
          <div className="mt-8 space-y-3">
            {isAdding ? (
              <div className="p-4 bg-stone-50 rounded-3xl border-2 border-stone-100">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h5 className="text-xs font-black text-stone-500">추가할 장소를 선택하세요</h5>
                  <button onClick={() => setIsAdding(false)} className="text-stone-400 hover:text-stone-600">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                  {PLACES
                    .filter(p => !course.items.some(ci => ci.placeId === p.id))
                    .sort((a, b) => Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id)))
                    .map(place => {
                      const isFavorite = favoriteSet.has(place.id);
                      return (
                        <div
                          key={place.id}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border-2 bg-white p-2 transition-all',
                            isFavorite ? 'border-red-100' : 'border-transparent hover:border-blue-200',
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => handleAddPlace(place.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <img src={place.image} alt={place.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[10px] font-black text-stone-800 truncate">{place.name}</p>
                                {isFavorite && <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[8px] font-black text-apple-red">찜</span>}
                              </div>
                              <p className="text-[8px] text-stone-400 font-bold">{place.category}</p>
                            </div>
                            <Plus size={14} className="text-stone-300" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleFavorite?.(place.id)}
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-90',
                              isFavorite ? 'border-red-100 bg-red-50 text-apple-red' : 'border-stone-100 text-stone-300',
                            )}
                            aria-label={isFavorite ? `${place.name} 찜 해제` : `${place.name} 찜하기`}
                          >
                            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAdding(true)}
                className="w-full py-4 border-4 border-dashed border-stone-100 rounded-3xl text-stone-400 font-black text-xs flex items-center justify-center gap-2 hover:border-blue-200 hover:text-blue-400 transition-all group"
              >
                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 장소 추가하기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
