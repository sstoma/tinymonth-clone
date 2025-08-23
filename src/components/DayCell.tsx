"use client";

import React, { useState } from "react";
import { useAppData } from "./AppDataContext";
import { useDrag } from "./DragContext";
import CommentModal from "./CommentModal";

type DayCellProps = {
  day: number | null;
  year: number;
  month: number; // 0-based
};

export default function DayCell({ day, year, month }: DayCellProps) {
  const { 
    calendars, 
    activeId, 
    getAssignments, 
    addAssignment, 
    removeAssignment, 
    toggleMultipleAssignments,
    getComment,
    isHoliday
  } = useAppData();
  const { dragState, startDrag, updateDrag, endDrag, getDragDates } = useDrag();
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  // Check if this is the current month and current day
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const isCurrentDay = day !== null && isCurrentMonth && now.getDate() === day;

  if (day === null) {
    return <div className="h-8 sm:h-9 md:h-10 rounded border border-transparent" />;
  }

  const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const assigned = getAssignments(date);
  const comment = getComment(date);
  const isHolidayDay = isHoliday(date);

  const handleClick = (e: React.MouseEvent) => {
    // If Ctrl/Cmd is pressed, open comment modal
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setIsCommentModalOpen(true);
      return;
    }

    // Don't allow calendar assignments on holidays
    if (isHolidayDay) return;

    // Otherwise, handle calendar assignment
    if (!activeId) return;
    if (assigned.includes(activeId)) removeAssignment(date, activeId);
    else addAssignment(date, activeId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeId || isHolidayDay) return;
    e.preventDefault();
    startDrag(date, activeId);
  };

  const handleMouseEnter = () => {
    if (dragState.isDragging && activeId && !isHolidayDay) {
      updateDrag(date);
    }
  };

  const handleMouseUp = () => {
    if (dragState.isDragging) {
      const dragDates = getDragDates();
      if (dragDates.length > 1) {
        toggleMultipleAssignments(dragDates, activeId!);
      }
      endDrag();
    }
  };

  const badges = assigned
    .map(id => calendars.find(c => c.id === id))
    .filter(Boolean) as { id: string; color: string }[];

  // Create tooltip content
  const tooltipContent = [
    date,
    isHolidayDay && "Swiss Holiday",
    comment && `Comment: ${comment}`,
    assigned.length > 0 && `Calendars: ${assigned.map(id => calendars.find(c => c.id === id)?.name).filter(Boolean).join(', ')}`
  ].filter(Boolean).join('\n');

  // Determine cell styling
  let cellClassName = `h-8 sm:h-9 md:h-10 flex flex-col justify-between rounded border focus:outline-none relative `;
  
  if (isHolidayDay) {
    // Holiday styling - grayed out
    cellClassName += 'bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed ';
  } else if (isCurrentDay) {
    // Current day styling
    cellClassName += 'bg-blue-200 border-blue-500 border-2 ';
  } else if (isCurrentMonth) {
    // Current month styling
    cellClassName += 'bg-gray-100 border-gray-300 ';
  } else {
    // Other months styling
    cellClassName += 'bg-white border-gray-200 ';
  }

  // Add hover effect only for non-holiday days
  if (!isHolidayDay) {
    cellClassName += 'hover:bg-gray-50 ';
  }

  // Add drag state styling
  if (dragState.isDragging && dragState.currentDate === date && !isHolidayDay) {
    cellClassName += 'bg-blue-100 ';
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
        className={cellClassName}
        title={tooltipContent}
      >
                <span className={`self-end pr-1 pt-0.5 text-[10px] ${isHolidayDay ? 'text-gray-500' : 'text-gray-700'}`}>
          {day}
        </span>

        {!isHolidayDay && (
          <div className="flex gap-0.5 px-1 pb-1">
            {badges.slice(0, 4).map(b => (
              <span key={b.id} className="w-2 h-2 rounded-full" style={{ background: b.color }} />
            ))}
          </div>
        )}

        {/* Comment indicator */}
        {comment && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-white" />
        )}
      </button>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        date={date}
        initialComment={comment}
      />
    </>
  );
}


