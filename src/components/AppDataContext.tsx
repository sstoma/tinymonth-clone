"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Types
type CalendarItem = {
  id: string;
  name: string;
  color: string;
};

type Holiday = {
  date: string;
  name: string;
  type: 'swiss';
};

type CalendarsMap = CalendarItem[];
type AssignmentsMap = Record<string, string[]>;
type CommentsMap = Record<string, string>; // date -> comment
type HolidaysMap = Holiday[];

type AppData = {
  calendars: CalendarsMap;
  activeId: string | null;
  assignments: AssignmentsMap;
  comments: CommentsMap;
  holidays: HolidaysMap;
  isLoading: boolean;
};

type AppDataContextType = {
  // Data
  calendars: CalendarsMap;
  activeId: string | null;
  assignments: AssignmentsMap;
  comments: CommentsMap;
  holidays: HolidaysMap;
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

  // Holiday actions
  isHoliday: (date: string) => boolean;

  // Other actions
  refreshData: () => void;
  importData: (importedData: { calendars: CalendarsMap; assignments: AssignmentsMap; activeId?: string | null; comments?: CommentsMap; holidays?: HolidaysMap }) => void;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

// Swiss holidays generation functions
const generateSwissHolidays = (year: number): Holiday[] => {
  // Fixed Swiss national holidays (widely observed across Switzerland)
  const fixedHolidays: Holiday[] = [
    { date: `${year}-01-01`, name: 'Neujahr', type: 'swiss' },
    { date: `${year}-01-02`, name: 'Berchtoldstag', type: 'swiss' }, // Observed in many cantons
    { date: `${year}-01-06`, name: 'Dreikönigstag', type: 'swiss' }, // Epiphany, observed in some cantons
    { date: `${year}-05-01`, name: 'Tag der Arbeit', type: 'swiss' }, // Labor Day, observed in many cantons
    { date: `${year}-08-01`, name: 'Bundesfeier', type: 'swiss' },
    { date: `${year}-08-15`, name: 'Mariä Himmelfahrt', type: 'swiss' }, // Assumption, observed in many cantons
    { date: `${year}-11-01`, name: 'Allerheiligen', type: 'swiss' }, // All Saints Day, observed in many cantons
    { date: `${year}-12-25`, name: 'Weihnachten', type: 'swiss' },
    { date: `${year}-12-26`, name: 'Stephanstag', type: 'swiss' },
  ];

  // Variable holidays (Easter-based)
  const easter = getEasterDate(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);

  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  const pentecostMonday = new Date(easter);
  pentecostMonday.setDate(easter.getDate() + 50);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  const variableHolidays: Holiday[] = [
    { date: formatDate(easter), name: 'Ostersonntag', type: 'swiss' },
    { date: formatDate(easterMonday), name: 'Ostermontag', type: 'swiss' },
    { date: formatDate(ascension), name: 'Auffahrt', type: 'swiss' },
    { date: formatDate(pentecost), name: 'Pfingstsonntag', type: 'swiss' },
    { date: formatDate(pentecostMonday), name: 'Pfingstmontag', type: 'swiss' },
    { date: formatDate(corpusChristi), name: 'Fronleichnam', type: 'swiss' },
  ];

  return [...fixedHolidays, ...variableHolidays];
};

const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate all Swiss holidays for years 2022-2030
const generateAllSwissHolidays = (): Holiday[] => {
  const allHolidays: Holiday[] = [];
  for (let year = 2022; year <= 2030; year++) {
    allHolidays.push(...generateSwissHolidays(year));
  }
  return allHolidays;
};

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
    
    // Always generate fresh Swiss holidays for all years 2022-2030
    const swissHolidays = generateAllSwissHolidays();
    
    const data = {
      calendars: rawData.calendars || [],
      activeId: rawData.activeId || null,
      assignments: rawData.assignments || {},
      comments: rawData.comments || {},
      holidays: swissHolidays
    };
    
    // Ensure holidays are saved to the data file along with other data
    writeData(data).catch(console.error);
    
    return {
      ...data,
      isLoading: false
    };
  } catch (error) {
    console.error("Error in fetchData:", error);
    throw error;
  }
}

async function writeData(updates: Partial<{ calendars: CalendarsMap; activeId: string | null; assignments: AssignmentsMap; comments: CommentsMap; holidays: HolidaysMap }>) {
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
    comments: {},
    holidays: generateAllSwissHolidays(),
    isLoading: true
  });

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
      setTimeout(() => {
        writeData({ 
          calendars: newData.calendars,
          activeId: newData.activeId,
          assignments: newData.assignments,
          comments: newData.comments,
          holidays: newData.holidays
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
      writeData({ 
        calendars: updatedCalendars, 
        activeId: id,
        assignments: prev.assignments,
        comments: prev.comments,
        holidays: prev.holidays
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
      
      writeData({ 
        calendars: updatedCalendars,
        assignments: prev.assignments,
        comments: prev.comments,
        holidays: prev.holidays
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
      
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: updatedAssignments,
        comments: prev.comments,
        holidays: prev.holidays
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
      
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: updatedAssignments,
        comments: prev.comments,
        holidays: prev.holidays
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

      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: updatedAssignments,
        comments: prev.comments,
        holidays: prev.holidays
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
      
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: prev.assignments,
        comments: updatedComments,
        holidays: prev.holidays
      }).catch(console.error);
      
      return { ...prev, comments: updatedComments };
    });
  }, []);

  const removeComment = useCallback((date: string) => {
    setData(prev => {
      const updatedComments = { ...prev.comments };
      delete updatedComments[date];
      
      writeData({ 
        calendars: prev.calendars,
        activeId: prev.activeId,
        assignments: prev.assignments,
        comments: updatedComments,
        holidays: prev.holidays
      }).catch(console.error);
      
      return { ...prev, comments: updatedComments };
    });
  }, []);

  // Holiday actions
  const isHoliday = useCallback((date: string) => {
    return data.holidays.some(holiday => holiday.date === date);
  }, [data.holidays]);

  // Import data
  const importData = useCallback((importedData: { calendars: CalendarsMap; assignments: AssignmentsMap; activeId?: string | null; comments?: CommentsMap; holidays?: HolidaysMap }) => {
    setData(prev => {
      const newData = {
        calendars: importedData.calendars,
        activeId: importedData.activeId || prev.activeId,
        assignments: importedData.assignments,
        comments: importedData.comments || {},
        holidays: importedData.holidays || generateAllSwissHolidays(),
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
    holidays: data.holidays,
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

    // Holiday actions
    isHoliday,

    // Other actions
    refreshData,
    importData
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
