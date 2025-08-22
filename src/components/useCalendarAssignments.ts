"use client";
import { useCallback, useState, useEffect } from "react";

const ASSIGNMENTS_KEY = "tinymonth_assignments";
// assignments: { [date: string]: string[] } (date: YYYY-MM-DD, value: array of calendar ids)
type AssignmentsMap = Record<string, string[]>;

function getAssignmentsFromStorage(): AssignmentsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    console.log("Loading assignments from storage:", raw);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    console.log("Loaded assignments:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error loading assignments:", error);
    return {};
  }
}

function saveAssignmentsToStorage(assignments: AssignmentsMap) {
  if (typeof window === "undefined") return;
  console.log("Saving assignments:", assignments);
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

export default function useCalendarAssignments() {
  const [assignments, setAssignments] = useState<AssignmentsMap>({});

  useEffect(() => {
    const loadedAssignments = getAssignmentsFromStorage();
    console.log("Loaded assignments:", loadedAssignments);
    console.log("Total assignments count:", Object.keys(loadedAssignments).length);
    setAssignments(loadedAssignments);
  }, []);

  const addAssignment = useCallback((date: string, calendarId: string) => {
    console.log("useCalendarAssignments: Adding assignment:", date, calendarId);
    setAssignments(prev => {
      console.log("useCalendarAssignments: Previous assignments for", date, ":", prev[date]);
      const arr = prev[date] ? Array.from(new Set([...prev[date], calendarId])) : [calendarId];
      const updated = { ...prev, [date]: arr };
      console.log("useCalendarAssignments: Updated assignments for", date, ":", updated[date]);
      saveAssignmentsToStorage(updated);
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
      saveAssignmentsToStorage(updated);
      return updated;
    });
  }, []);

  const getAssignments = useCallback((date: string) => {
    const result = assignments[date] || [];
    console.log(`Getting assignments for ${date}:`, result);
    return result;
  }, [assignments]);

  const addMultipleAssignments = useCallback((dates: string[], calendarId: string) => {
    setAssignments(prev => {
      const updated = { ...prev };
      dates.forEach(date => {
        const arr = updated[date] ? Array.from(new Set([...updated[date], calendarId])) : [calendarId];
        updated[date] = arr;
      });
      saveAssignmentsToStorage(updated);
      return updated;
    });
  }, []);

  const replaceAllAssignments = useCallback((next: AssignmentsMap) => {
    setAssignments(next);
    saveAssignmentsToStorage(next);
  }, []);

  const clearAllAssignments = useCallback(() => {
    replaceAllAssignments({});
  }, [replaceAllAssignments]);

  // Debug function to check expected counts
  const debugExpectedCounts = useCallback(() => {
    // No-op in production; kept for optional debugging
    console.log("Assignments keys:", Object.keys(assignments).length);
  }, [assignments]);

  // Call debug on mount
  useEffect(() => {
    debugExpectedCounts();
  }, [assignments, debugExpectedCounts]);

  return { assignments, addAssignment, removeAssignment, getAssignments, addMultipleAssignments, replaceAllAssignments, clearAllAssignments };
}