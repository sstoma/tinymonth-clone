"use client";

import { useCallback } from "react";

const NOTES_KEY = "tinymonth_notes";

type NotesMap = Record<string, string>;

function getNotesFromStorage(): NotesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotesToStorage(notes: NotesMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export default function useNotes() {
  const getNote = useCallback((date: string) => {
    const notes = getNotesFromStorage();
    return notes[date] || "";
  }, []);

  const saveNote = useCallback((date: string, note: string) => {
    const notes = getNotesFromStorage();
    notes[date] = note;
    saveNotesToStorage(notes);
  }, []);

  return { getNote, saveNote };
}