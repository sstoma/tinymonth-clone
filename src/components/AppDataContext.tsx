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
type CommentsMap = Record<string, string>; // date -> comment

type AppData = {
  calendars: CalendarsMap;
  activeId: string | null;
  assignments: AssignmentsMap;
  comments: CommentsMap;
  isLoading: boolean;
};

type AppDataContextType = {
  // Data
  calendars: CalendarsMap;
  activeId: string | null;
  assignments: AssignmentsMap;
  comments: CommentsMap;
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
  
  // Comment actions
  getComment: (date: string) => string;
  setComment: (date: string, comment: string) => void;
  removeComment: (date: string) => void;
  
  // Other actions
  refreshData: () => void;
  importData: (importedData: { calendars: CalendarsMap; assignments: AssignmentsMap; activeId?: string | null; comments?: CommentsMap }) => void;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

// API functions
async function fetchData(): Promise<AppData> {
  try {
    const res = await fetch("/api/data", { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    
    const rawData = await res.json();
    
    // Handle the API response structure
    const data = {
      calendars: rawData.calendars || [],
      activeId: rawData.activeId || null,
      assignments: rawData.assignments || {},
      comments: rawData.comments || {}
    };
    
    return {
      ...data,
      isLoading: false
    };
  } catch (error) {
    console.error("Error in fetchData:", error);
    throw error;
  }
}

async function writeData(updates: Partial<{ calendars: CalendarsMap; activeId: string | null; assignments: AssignmentsMap; comments: CommentsMap }>) {
  const res = await fetch("/api/data", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to write data");
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  console.log("AppDataProvider: Initializing...");
  
  const [data, setData] = useState<AppData>({
    calendars: [],
    activeId: null,
    assignments: {},
    comments: {},
    isLoading: true
  });

  // Debug: show current data state only when needed
  // console.log("AppDataProvider: Current data state:", data);

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const newData = await fetchData();
      setData(newData);
    } catch (error) {
      console.error("AppDataProvider: Failed to load data:", error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, []);

  // Calendar actions
  const setActive = useCallback((id: string) => {
    setData(prev => {
      const newData = { ...prev, activeId: id };
      // Debounce API writes
      setTimeout(() => {
        writeData({ 
          calendars: newData.calendars,
          activeId: newData.activeId,
          assignments: newData.assignments,
          comments: newData.comments
        }).catch(console.error);
      }, 100);
      
      return newData;
    });
  }, []);

  const addCalendar = useCallback((name: string, color: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    const newCalendar = { id, name, color };
    
    setData(prev => {
      const updatedCalendars = [...prev.calendars, newCalendar];
      // Write to API with all current data
      writeData({ 
        calendars: updatedCalendars, 
        activeId: id,
        assignments: prev.assignments,
        comments: prev.comments
      }).catch(console.error);
      
      return {
        ...prev,
        calendars: updatedCalendars,
        activeId: id
      };
    });
  }, []);

  const updateCalendar = useCallback((id: string, updates: Partial<CalendarItem>) => {
    setData(prev => {
      const updatedCalendars = prev.calendars.map(cal => 
        cal.id === id ? { ...cal, ...updates } : cal
      );
      
      // Write to API with all current data
      writeData({ 
        calendars: updatedCalendars,
        assignments: prev.assignments,
        comments: prev.comments
      }).catch(console.error);
      
      return { ...prev, calendars: updatedCalendars };
    });
  }, []);

  // Assignment actions
  const getAssignments = useCallback((date: string) => {
    return data.assignments[date] || [];
  }, [data.assignments]);

  const addAssignment = useCallback((date: string, calendarId: string) => {
    setData(prev => {
      const updatedAssignments = {
        ...prev.assignments,
        [date]: [...(prev.assignments[date] || []), calendarId]
      };
      
      // Write to API with all current data
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: updatedAssignments,
        comments: prev.comments
      }).catch(console.error);
      
      return { ...prev, assignments: updatedAssignments };
    });
  }, []);

  const removeAssignment = useCallback((date: string, calendarId: string) => {
    setData(prev => {
      const updatedAssignments = {
        ...prev.assignments,
        [date]: (prev.assignments[date] || []).filter(id => id !== calendarId)
      };
      
      // Write to API with all current data
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: updatedAssignments,
        comments: prev.comments
      }).catch(console.error);
      
      return { ...prev, assignments: updatedAssignments };
    });
  }, []);

  const toggleMultipleAssignments = useCallback((dates: string[], calendarId: string) => {
    setData(prev => {
      const updatedAssignments = { ...prev.assignments };
      
      let shouldAdd = false;
      if (dates.length > 0) {
        const firstDate = dates[0];
        shouldAdd = !prev.assignments[firstDate] || !prev.assignments[firstDate].includes(calendarId);
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

      // Write to API with all current data
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: updatedAssignments,
        comments: prev.comments
      }).catch(console.error);
      
      return { ...prev, assignments: updatedAssignments };
    });
  }, []);

  // Comment actions
  const getComment = useCallback((date: string) => {
    return data.comments[date] || "";
  }, [data.comments]);

  const setComment = useCallback((date: string, comment: string) => {
    setData(prev => {
      const updatedComments = { ...prev.comments, [date]: comment };
      
      // Write to API with all current data
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: prev.assignments,
        comments: updatedComments
      }).catch(console.error);
      
      return { ...prev, comments: updatedComments };
    });
  }, []);

  const removeComment = useCallback((date: string) => {
    setData(prev => {
      const updatedComments = { ...prev.comments };
      delete updatedComments[date];
      
      // Write to API with all current data
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: prev.assignments,
        comments: updatedComments
      }).catch(console.error);
      
      return { ...prev, comments: updatedComments };
    });
  }, []);

  const importData = useCallback((importedData: { calendars: CalendarsMap; assignments: AssignmentsMap; activeId?: string | null; comments?: CommentsMap }) => {
    setData(prev => {
      const newData = {
        calendars: importedData.calendars,
        activeId: importedData.activeId || prev.activeId,
        assignments: importedData.assignments,
        comments: importedData.comments || {},
        isLoading: false
      };
      writeData(newData).catch(console.error);
      return newData;
    });
  }, []);

  const contextValue: AppDataContextType = {
    // Data
    calendars: data.calendars,
    activeId: data.activeId,
    assignments: data.assignments,
    comments: data.comments,
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
    
    // Comment actions
    getComment,
    setComment,
    removeComment,
    
    // Other actions
    refreshData,
    importData,
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
