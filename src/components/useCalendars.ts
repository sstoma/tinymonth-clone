"use client";

import { useCallback, useEffect, useState } from "react";

export type CalendarItem = {
  id: string;
  name: string;
  color: string;
};

type CalendarsMap = CalendarItem[];

const CALENDARS_KEY = "tinymonth_calendars";
const ACTIVE_CAL_KEY = "tinymonth_active_calendar";

const DEFAULT_CALENDARS: CalendarsMap = [];

function readCalendars(): CalendarsMap {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CALENDARS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeCalendars(calendars: CalendarsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CALENDARS_KEY, JSON.stringify(calendars));
}

function readActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ACTIVE_CAL_KEY);
  } catch {
    return null;
  }
}

function writeActiveId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_CAL_KEY, id);
  else localStorage.removeItem(ACTIVE_CAL_KEY);
}

export default function useCalendars() {
  const [calendars, setCalendars] = useState<CalendarsMap>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const initial = readCalendars();
    setCalendars(initial);
    const initialActive = readActiveId() ?? initial[0]?.id ?? null;
    setActiveId(initialActive);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACTIVE_CAL_KEY) {
        setActiveId(e.newValue);
      }
      if (e.key === CALENDARS_KEY && e.newValue) {
        try { setCalendars(JSON.parse(e.newValue)); } catch {}
      }
    };

    const handleActiveEvent = (e: Event) => {
      const id = (e as CustomEvent<string | null>).detail ?? null;
      setActiveId(id);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("tm:active-calendar-changed", handleActiveEvent as EventListener);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("tm:active-calendar-changed", handleActiveEvent as EventListener);
    };
  }, []);

  const addCalendar = useCallback((name: string, color: string) => {
    setCalendars(prev => {
      const id = name.toLowerCase().replace(/\s+/g, "-");
      const next = [...prev, { id, name, color }];
      writeCalendars(next);
      return next;
    });
  }, []);

  const updateCalendar = useCallback((id: string, name?: string, color?: string) => {
    setCalendars(prev => {
      const next = prev.map(c => (c.id === id ? { ...c, name: name ?? c.name, color: color ?? c.color } : c));
      writeCalendars(next);
      return next;
    });
  }, []);

  const replaceAllCalendars = useCallback((next: CalendarsMap, nextActiveId: string | null) => {
    setCalendars(next);
    writeCalendars(next);
    setActiveId(nextActiveId);
    writeActiveId(nextActiveId);
    try { window.dispatchEvent(new CustomEvent("tm:active-calendar-changed", { detail: nextActiveId })); } catch {}
  }, []);

  const clearAllCalendars = useCallback(() => {
    replaceAllCalendars([], null);
  }, [replaceAllCalendars]);

  const setActive = useCallback((id: string | null) => {
    setActiveId(id);
    writeActiveId(id);
    try {
      window.dispatchEvent(new CustomEvent("tm:active-calendar-changed", { detail: id }));
    } catch {}
  }, []);

  return { calendars, addCalendar, updateCalendar, activeId, setActive, replaceAllCalendars, clearAllCalendars };
}


