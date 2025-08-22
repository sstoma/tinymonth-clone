"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Types
type CalendarItem = {
  id: string;
  name: string;
  color: string;
};

type CalendarsMap = CalendarItem[];
type AssignmentsMap = Record<string, string[]>;

type AppData = {
  calendars: CalendarsMap;
  activeId: string | null;
  assignments: AssignmentsMap;
  isLoading: boolean;
};

type AppDataContextType = {
  // Data
  calendars: CalendarsMap;
  activeId: string | null;
  assignments: AssignmentsMap;
  isLoading: boolean;
  
  // Calendar actions
  setActive: (id: string) => void;
  addCalendar: (name: string, color: string) => void;
  updateCalendar: (id: string, updates: Partial<CalendarItem>) => void;
  
  // Assignment actions
  getAssignments: (date: string) => string[];
  addAssignment: (date: string, calendarId: string) => void;
  removeAssignment: (date: string, calendarId: string) => void;
  toggleMultipleAssignments: (dates: string[], calendarId: string) => void;
  
  // Other actions
  refreshData: () => void;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

// API functions
async function fetchData(): Promise<AppData> {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch data");
  const data = await res.json() as { calendars: CalendarsMap; activeId: string | null; assignments: AssignmentsMap };
  return {
    calendars: data.calendars || [],
    activeId: data.activeId || null,
    assignments: data.assignments || {},
    isLoading: false
  };
}

async function writeData(updates: Partial<{ calendars: CalendarsMap; activeId: string | null; assignments: AssignmentsMap }>) {
  const res = await fetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to write data");
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({
    calendars: [],
    activeId: null,
    assignments: {},
    isLoading: true
  });

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const newData = await fetchData();
      setData(newData);
    } catch (error) {
      console.error("Failed to load data:", error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Calendar actions
  const setActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, activeId: id }));
    writeData({ activeId: id }).catch(console.error);
  }, []);

  const addCalendar = useCallback((name: string, color: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const newCalendar = { id, name, color };
    
    setData(prev => ({
      ...prev,
      calendars: [...prev.calendars, newCalendar],
      activeId: id
    }));
    
    writeData({ 
      calendars: [...data.calendars, newCalendar], 
      activeId: id 
    }).catch(console.error);
  }, [data.calendars]);

  const updateCalendar = useCallback((id: string, updates: Partial<CalendarItem>) => {
    const updatedCalendars = data.calendars.map(cal => 
      cal.id === id ? { ...cal, ...updates } : cal
    );
    
    setData(prev => ({ ...prev, calendars: updatedCalendars }));
    writeData({ calendars: updatedCalendars }).catch(console.error);
  }, [data.calendars]);

  // Assignment actions
  const getAssignments = useCallback((date: string) => {
    return data.assignments[date] || [];
  }, [data.assignments]);

  const addAssignment = useCallback((date: string, calendarId: string) => {
    const updatedAssignments = {
      ...data.assignments,
      [date]: [...(data.assignments[date] || []), calendarId]
    };
    
    setData(prev => ({ ...prev, assignments: updatedAssignments }));
    writeData({ assignments: updatedAssignments }).catch(console.error);
  }, [data.assignments]);

  const removeAssignment = useCallback((date: string, calendarId: string) => {
    const updatedAssignments = {
      ...data.assignments,
      [date]: (data.assignments[date] || []).filter(id => id !== calendarId)
    };
    
    setData(prev => ({ ...prev, assignments: updatedAssignments }));
    writeData({ assignments: updatedAssignments }).catch(console.error);
  }, [data.assignments]);

  const toggleMultipleAssignments = useCallback((dates: string[], calendarId: string) => {
    const updatedAssignments = { ...data.assignments };
    
    let shouldAdd = false;
    if (dates.length > 0) {
      const firstDate = dates[0];
      shouldAdd = !data.assignments[firstDate] || !data.assignments[firstDate].includes(calendarId);
    }

    dates.forEach(date => {
      if (shouldAdd) {
        const existing = updatedAssignments[date] || [];
        if (!existing.includes(calendarId)) {
          updatedAssignments[date] = [...existing, calendarId];
        }
      } else {
        if (updatedAssignments[date]) {
          updatedAssignments[date] = updatedAssignments[date].filter(id => id !== calendarId);
        }
      }
    });

    setData(prev => ({ ...prev, assignments: updatedAssignments }));
    writeData({ assignments: updatedAssignments }).catch(console.error);
  }, [data.assignments]);

  const contextValue: AppDataContextType = {
    // Data
    calendars: data.calendars,
    activeId: data.activeId,
    assignments: data.assignments,
    isLoading: data.isLoading,
    
    // Calendar actions
    setActive,
    addCalendar,
    updateCalendar,
    
    // Assignment actions
    getAssignments,
    addAssignment,
    removeAssignment,
    toggleMultipleAssignments,
    
    // Other actions
    refreshData,
  };

  return (
    <AppDataContext.Provider value={contextValue}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
