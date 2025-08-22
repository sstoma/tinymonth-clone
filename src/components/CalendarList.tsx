"use client";
import React, { useState, useEffect } from "react";
import useCalendars, { CalendarItem } from "./useCalendars";
import useCalendarAssignments from "./useCalendarAssignments";

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#eab308", // yellow
  "#a21caf", // purple
  "#f59e42", // orange
  "#14b8a6", // teal
];

export default function CalendarList() {
  const { calendars, addCalendar, updateCalendar, activeId, setActive, replaceAllCalendars, clearAllCalendars } = useCalendars();
  const { assignments, replaceAllAssignments, clearAllAssignments } = useCalendarAssignments();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState<string | null>(null);

  console.log("CalendarList render:", { calendars, activeId, assignmentsCount: Object.keys(assignments).length });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCalendar(name, color);
    setName("");
    setColor(COLORS[0]);
    setShowForm(false);
  };

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      updateCalendar(id, editingName);
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleColorEdit = (id: string, currentColor: string) => {
    setEditingColor(id);
  };

  const handleColorSave = (id: string, newColor: string) => {
    updateCalendar(id, calendars.find((c: CalendarItem) => c.id === id)?.name || "", newColor);
    setEditingColor(null);
  };

  const handleResetData = () => {
    clearAllAssignments();
    clearAllCalendars();
  };

  const handleActiveSelect = (id: string) => {
    console.log("CalendarList: Setting active calendar:", id);
    setActive(id);
  };

  const getDayCount = (calendarId: string) => {
    const count = Object.values(assignments).filter(ids => ids.includes(calendarId)).length;
    console.log(`Day count for ${calendarId}:`, count);
    return count;
  };

  const exportData = () => {
    const data = {
      calendars,
      assignments,
      activeId,
      version: 1,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tinymonth-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") return;
      const nextCalendars = Array.isArray(parsed.calendars) ? parsed.calendars : [];
      const nextAssignments = parsed.assignments && typeof parsed.assignments === "object" ? parsed.assignments : {};
      const nextActiveId = typeof parsed.activeId === "string" ? parsed.activeId : null;
      replaceAllCalendars(nextCalendars, nextActiveId);
      replaceAllAssignments(nextAssignments);
    } catch (e) {
      console.error("Import failed", e);
    }
  };

  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) importData(file);
    };
    input.click();
  };

  // Debug assignments changes
  useEffect(() => {
    console.log("CalendarList: assignments changed:", assignments);
    calendars.forEach((cal: CalendarItem) => {
      const count = Object.values(assignments).filter(ids => ids.includes(cal.id)).length;
      console.log(`${cal.name}: ${count} days`);
    });
  }, [assignments, calendars]);

  return (
    <aside className="w-56 p-4 bg-white rounded shadow flex flex-col gap-4">
      <h2 className="font-bold text-lg mb-2">Kalendarze</h2>
      <div className="text-xs text-gray-500 mb-2">Aktywny: {activeId ? calendars.find((c: CalendarItem) => c.id === activeId)?.name : 'brak'}</div>
      <ul className="flex flex-col gap-2">
        {calendars.map((cal: CalendarItem) => (
          <li key={cal.id}>
            <button
              className={`flex items-center gap-2 w-full px-2 py-1 rounded ${activeId === cal.id ? "bg-gray-200" : "hover:bg-gray-100"}`}
              onClick={() => handleActiveSelect(cal.id)}
            >
              {editingColor === cal.id ? (
                <div className="flex gap-1">
                  {COLORS.map((c: string) => (
                    <button
                      key={c}
                      className={`w-4 h-4 rounded-full border-2 ${cal.color === c ? "border-black" : "border-transparent"}`}
                      style={{ background: c }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorSave(cal.id, c);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span 
                  className="inline-block w-3 h-3 rounded-full cursor-pointer" 
                  style={{ background: cal.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleColorEdit(cal.id, cal.color);
                  }}
                />
              )}
              {editingId === cal.id ? (
                <input
                  className="flex-1 border rounded px-1 py-0.5 text-sm"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={() => handleSaveEdit(cal.id)}
                  onKeyDown={e => e.key === "Enter" && handleSaveEdit(cal.id)}
                  autoFocus
                />
              ) : (
                <span 
                  className="truncate flex-1 text-left"
                  onDoubleClick={() => handleEdit(cal.id, cal.name)}
                >
                  {cal.name}
                </span>
              )}
              <span className="text-xs text-gray-500">{getDayCount(cal.id)} dni</span>
            </button>
          </li>
        ))}
      </ul>
      {showForm ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-2 mt-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Nazwa kalendarza"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                type="button"
                key={c}
                className={`w-6 h-6 rounded-full border-2 ${color === c ? "border-black" : "border-transparent"}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Dodaj</button>
            <button type="button" className="px-3 py-1 rounded" onClick={() => setShowForm(false)}>Anuluj</button>
          </div>
        </form>
      ) : (
        <button className="bg-gray-100 px-3 py-1 rounded" onClick={() => setShowForm(true)}>+ Dodaj kalendarz</button>
      )}
      <div className="flex gap-2 mt-2">
        <button className="bg-gray-100 px-3 py-1 rounded text-sm" onClick={exportData}>
          Export JSON
        </button>
        <button className="bg-gray-100 px-3 py-1 rounded text-sm" onClick={handleImportClick}>
          Import JSON
        </button>
        <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm" onClick={handleResetData}>
          Wyczyść wszystko
        </button>
      </div>
    </aside>
  );
}