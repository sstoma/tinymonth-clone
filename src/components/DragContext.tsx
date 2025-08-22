"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type DragState = {
  isDragging: boolean;
  startDate: string | null;
  currentDate: string | null;
  activeCalendarId: string | null;
};

type DragContextType = {
  dragState: DragState;
  startDrag: (date: string, calendarId: string) => void;
  updateDrag: (date: string) => void;
  endDrag: () => void;
  getDragDates: () => string[];
};

const DragContext = createContext<DragContextType | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDate: null,
    currentDate: null,
    activeCalendarId: null,
  });

  // Global mouse up handler to end drag
  React.useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const handleGlobalMouseUp = () => {
      if (dragState.isDragging) {
        setDragState({
          isDragging: false,
          startDate: null,
          currentDate: null,
          activeCalendarId: null,
        });
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState.isDragging]);

  const startDrag = useCallback((date: string, calendarId: string) => {
    setDragState({
      isDragging: true,
      startDate: date,
      currentDate: date,
      activeCalendarId: calendarId,
    });
  }, []);

  const updateDrag = useCallback((date: string) => {
    setDragState(prev => ({
      ...prev,
      currentDate: date,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      startDate: null,
      currentDate: null,
      activeCalendarId: null,
    });
  }, []);

  const getDragDates = useCallback(() => {
    if (!dragState.startDate || !dragState.currentDate || !dragState.activeCalendarId) {
      return [];
    }

    let start = new Date(dragState.startDate);
    let end = new Date(dragState.currentDate);
    
    // Ensure start is before end
    if (start > end) {
      [start, end] = [end, start];
    }

    const dates: string[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, [dragState.startDate, dragState.currentDate, dragState.activeCalendarId]);

  return (
    <DragContext.Provider value={{
      dragState,
      startDrag,
      updateDrag,
      endDrag,
      getDragDates,
    }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error('useDrag must be used within a DragProvider');
  }
  return context;
}
