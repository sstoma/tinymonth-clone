"use client";

import React, { useState } from "react";
import useNotes from "./useNotes";

type NoteModalProps = {
  date: string;
  onClose: () => void;
};

export default function NoteModal({ date, onClose }: NoteModalProps) {
  const { getNote, saveNote } = useNotes();
  const [note, setNote] = useState(getNote(date) || "");

  const handleSave = () => {
    saveNote(date, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-4 rounded shadow w-80">
        <h2 className="text-lg font-bold mb-2">Notatka na {date}</h2>
        <textarea
          className="w-full border rounded p-2 mb-2"
          rows={4}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Anuluj</button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={handleSave}>Zapisz</button>
        </div>
      </div>
    </div>
  );
}