"use client";

import React from "react";
import useCalendars from "./useCalendars";
import useCalendarAssignments from "./useCalendarAssignments";
import { useDrag } from "./DragContext";

type DayCellProps = {
  day: number | null;
  year: number;
  month: number; // 0-based
};

export default function DayCell({ day, year, month }: DayCellProps) {
  const { calendars, activeId } = useCalendars();
  const { getAssignments, addAssignment, removeAssignment, toggleMultipleAssignments } = useCalendarAssignments();
  const { dragState, startDrag, updateDrag, endDrag, getDragDates } = useDrag();

  if (day === null) {
    return <div className="h-8 sm:h-9 md:h-10 rounded border border-transparent" />;
  }

  const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const assigned = getAssignments(date);

  const handleClick = () => {
    if (!activeId) return;
    if (assigned.includes(activeId)) removeAssignment(date, activeId);
    else addAssignment(date, activeId);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeId) return;
    e.preventDefault();
    startDrag(date, activeId);
  };

  const handleMouseEnter = () => {
    if (dragState.isDragging && activeId) {
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

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      className={`h-8 sm:h-9 md:h-10 flex flex-col justify-between rounded border border-gray-200 bg-white hover:bg-gray-50 focus:outline-none ${
        dragState.isDragging && dragState.currentDate === date ? 'bg-blue-100' : ''
      }`}
      title={date}
    >
      <span className="self-end pr-1 pt-0.5 text-[10px] text-gray-700">{day}</span>
      <div className="flex gap-0.5 px-1 pb-1">
        {badges.slice(0, 4).map(b => (
          <span key={b.id} className="w-2 h-2 rounded-full" style={{ background: b.color }} />
        ))}
      </div>
    </button>
  );
}


