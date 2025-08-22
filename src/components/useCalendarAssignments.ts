"use client";
import { useCallback, useState, useEffect } from "react";

// assignments: { [date: string]: string[] } (date: YYYY-MM-DD, value: array of calendar ids)
type AssignmentsMap = Record<string, string[]>;

async function fetchData() {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch data");
  return (await res.json()) as { calendars: unknown; activeId: string | null; assignments: AssignmentsMap };
}

async function writeData(partial: Partial<{ assignments: AssignmentsMap }>) {
  const current = await fetchData();
  const next = { ...current, ...partial };
  await fetch("/api/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
  return next;
}

export default function useCalendarAssignments() {
  const [assignments, setAssignments] = useState<AssignmentsMap>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log("useCalendarAssignments: Starting data fetch...");
        const data = await fetchData();
        console.log("useCalendarAssignments: Fetch response:", data);
        if (!mounted) return;
        console.log("useCalendarAssignments: Loaded data:", {
          assignmentsCount: Object.keys(data.assignments || {}).length,
          sampleAssignments: Object.entries(data.assignments || {}).slice(0, 3)
        });
        setAssignments(data.assignments ?? {});
        // Temporary debug alert to ensure we can see this
        if (Object.keys(data.assignments || {}).length > 0) {
          console.log("SUCCESS: useCalendarAssignments loaded", Object.keys(data.assignments).length, "assignment entries");
        }
      } catch (error) {
        console.error("useCalendarAssignments: Failed to load data:", error);
        console.error("useCalendarAssignments: Error details:", {
          message: error?.message || 'Unknown error',
          stack: error?.stack || 'No stack trace',
          name: error?.name || 'Unknown error name'
        });
        if (!mounted) return;
        setAssignments({});
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Force refresh assignments when component mounts
  useEffect(() => {
    const refreshData = async () => {
      try {
        const data = await fetchData();
        console.log("useCalendarAssignments: Force refresh data:", {
          assignmentsCount: Object.keys(data.assignments || {}).length,
          sampleAssignments: Object.entries(data.assignments || {}).slice(0, 3)
        });
        setAssignments(data.assignments ?? {});
      } catch (error) {
        console.error("useCalendarAssignments: Force refresh failed:", error);
      }
    };

    // Refresh after a short delay to ensure other components are ready
    const timer = setTimeout(refreshData, 100);
    return () => clearTimeout(timer);
  }, []);

  const addAssignment = useCallback((date: string, calendarId: string) => {
    console.log("useCalendarAssignments: Adding assignment:", date, calendarId);
    setAssignments(prev => {
      console.log("useCalendarAssignments: Previous assignments for", date, ":", prev[date]);
      const arr = prev[date] ? Array.from(new Set([...prev[date], calendarId])) : [calendarId];
      const updated = { ...prev, [date]: arr };
      console.log("useCalendarAssignments: Updated assignments for", date, ":", updated[date]);
      writeData({ assignments: updated }).then(() => {
        console.log("useCalendarAssignments: Successfully wrote data to API");
      }).catch((error) => {
        console.error("useCalendarAssignments: Failed to write data:", error);
      });
      return updated;
    });
  }, []);

  const removeAssignment = useCallback((date: string, calendarId: string) => {
    console.log("useCalendarAssignments: Removing assignment:", date, calendarId);
    setAssignments(prev => {
      console.log("useCalendarAssignments: Previous assignments for", date, ":", prev[date]);
      if (!prev[date]) return prev;
      const arr = prev[date].filter(id => id !== calendarId);
      const updated = { ...prev, [date]: arr };
      console.log("useCalendarAssignments: Updated assignments for", date, ":", updated[date]);
      writeData({ assignments: updated }).catch(() => {});
      return updated;
    });
  }, []);

  const getAssignments = useCallback((date: string) => {
    const result = assignments[date] || [];
    console.log(`Getting assignments for ${date}:`, result);
    return result;
  }, [assignments]);

  const addMultipleAssignments = useCallback((dates: string[], calendarId: string) => {
    console.log("useCalendarAssignments: Adding multiple assignments:", { dates, calendarId });
    setAssignments(prev => {
      const updated = { ...prev };
      dates.forEach(date => {
        const arr = updated[date] ? Array.from(new Set([...updated[date], calendarId])) : [calendarId];
        updated[date] = arr;
      });
      writeData({ assignments: updated }).catch(() => {});
      return updated;
    });
  }, []);

  const removeMultipleAssignments = useCallback((dates: string[], calendarId: string) => {
    console.log("useCalendarAssignments: Removing multiple assignments:", { dates, calendarId });
    setAssignments(prev => {
      const updated = { ...prev };
      dates.forEach(date => {
        if (updated[date]) {
          const arr = updated[date].filter(id => id !== calendarId);
          updated[date] = arr;
        }
      });
      writeData({ assignments: updated }).catch(() => {});
      return updated;
    });
  }, []);

  const toggleMultipleAssignments = useCallback((dates: string[], calendarId: string) => {
    console.log("useCalendarAssignments: Toggling multiple assignments:", { dates, calendarId });
    setAssignments(prev => {
      const updated = { ...prev };
      let shouldAdd = false;
      
      // Check if we should add or remove based on the first date
      if (dates.length > 0) {
        const firstDate = dates[0];
        shouldAdd = !prev[firstDate] || !prev[firstDate].includes(calendarId);
      }
      
      dates.forEach(date => {
        if (shouldAdd) {
          const arr = updated[date] ? Array.from(new Set([...updated[date], calendarId])) : [calendarId];
          updated[date] = arr;
        } else {
          if (updated[date]) {
            const arr = updated[date].filter(id => id !== calendarId);
            updated[date] = arr;
          }
        }
      });
      
      writeData({ assignments: updated }).catch(() => {});
      return updated;
    });
  }, []);

  const replaceAllAssignments = useCallback((next: AssignmentsMap) => {
    console.log("useCalendarAssignments: Replacing all assignments:", {
      count: Object.keys(next).length,
      sample: Object.entries(next).slice(0, 3)
    });
    setAssignments(next);
    writeData({ assignments: next }).catch(() => {});
  }, []);

  const clearAllAssignments = useCallback(() => {
    replaceAllAssignments({});
  }, [replaceAllAssignments]);

  // Debug function to check expected counts
  const debugExpectedCounts = useCallback(() => {
    console.log("useCalendarAssignments: Current state:", {
      assignmentsCount: Object.keys(assignments).length,
      sampleAssignments: Object.entries(assignments).slice(0, 3),
      totalDates: Object.keys(assignments).length,
      assignments: assignments
    });
  }, [assignments]);

  // Call debug on mount and when assignments change
  useEffect(() => {
    debugExpectedCounts();
  }, [assignments, debugExpectedCounts]);

  return { assignments, addAssignment, removeAssignment, getAssignments, addMultipleAssignments, removeMultipleAssignments, toggleMultipleAssignments, replaceAllAssignments, clearAllAssignments };
}