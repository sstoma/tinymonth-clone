"use client";
import React from "react";
import { useAppData } from "./AppDataContext";
import { useYear } from "./YearContext";

type CalendarItem = {
  id: string;
  name: string;
  color: string;
};

export default function CalendarList() {
  const { calendars, activeId, setActive, addCalendar, updateCalendar, assignments } = useAppData();
  const { selectedYear } = useYear();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newCalendarName, setNewCalendarName] = React.useState("");
  const [newCalendarColor, setNewCalendarColor] = React.useState("#3B82F6");
  const [colorPickerId, setColorPickerId] = React.useState<string | null>(null);

  const getAnnualDayCount = React.useCallback((calendarId: string) => {
    // assignments is Record<string, string[]> where key is date (YYYY-MM-DD) and value is array of calendar IDs
    let count = 0;
    Object.entries(assignments).forEach(([date, calendarIds]) => {
      // Check if the date is in the selected year and if this calendar is assigned to this date
      if (date.startsWith(selectedYear.toString()) && calendarIds.includes(calendarId)) {
        count++;
      }
    });
    return count;
  }, [assignments, selectedYear]);

  const handleNameDoubleClick = (calendar: CalendarItem) => {
    setEditingId(calendar.id);
    setEditingName(calendar.name);
  };

  const handleNameSave = () => {
    if (editingId && editingName.trim()) {
      updateCalendar(editingId, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleNameCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleColorChange = (calendarId: string, color: string) => {
    updateCalendar(calendarId, { color });
    setColorPickerId(null);
  };

  const handleAddCalendar = () => {
    if (newCalendarName.trim()) {
      addCalendar(newCalendarName.trim(), newCalendarColor);
      setNewCalendarName("");
      setNewCalendarColor("#3B82F6");
      setShowAddForm(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      handleNameCancel();
    }
  };

  const handleAddKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCalendar();
    } else if (e.key === "Escape") {
      setShowAddForm(false);
      setNewCalendarName("");
    }
  };

  if (calendars.length === 0 && !showAddForm) {
    return (
      <aside className="w-56 p-4 bg-white rounded shadow flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Calendars ({selectedYear})</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="text-blue-600 hover:text-blue-800 font-bold text-lg"
            title="Add new calendar"
          >
            +
          </button>
        </div>
        <div className="text-gray-500 text-sm">No calendars available</div>
      </aside>
    );
  }

  if (calendars.length === 0 && showAddForm) {
    return (
      <aside className="w-56 p-4 bg-white rounded shadow flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Calendars ({selectedYear})</h2>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-600 hover:text-gray-800 font-bold text-lg"
            title="Cancel"
          >
            ×
          </button>
        </div>
        
        <div className="border border-gray-300 rounded p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={newCalendarColor}
              onChange={(e) => setNewCalendarColor(e.target.value)}
              className="w-6 h-6 rounded border"
            />
            <input
              type="text"
              value={newCalendarName}
              onChange={(e) => setNewCalendarName(e.target.value)}
              onKeyDown={handleAddKeyPress}
              placeholder="Calendar name"
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCalendar}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCalendarName("");
              }}
              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-56 p-4 bg-white rounded shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Calendars ({selectedYear})</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="text-blue-600 hover:text-blue-800 font-bold text-lg"
          title="Add new calendar"
        >
          +
        </button>
      </div>
      
      {showAddForm && (
        <div className="border border-gray-300 rounded p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={newCalendarColor}
              onChange={(e) => setNewCalendarColor(e.target.value)}
              className="w-6 h-6 rounded border"
            />
            <input
              type="text"
              value={newCalendarName}
              onChange={(e) => setNewCalendarName(e.target.value)}
              onKeyDown={handleAddKeyPress}
              placeholder="Calendar name"
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddCalendar}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCalendarName("");
              }}
              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {calendars.map((calendar: CalendarItem) => {
          const dayCount = getAnnualDayCount(calendar.id);
          return (
            <div
              key={calendar.id}
              className={`flex items-center justify-between p-2 rounded transition-colors ${
                activeId === calendar.id
                  ? "bg-blue-100 border border-blue-300"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1" onClick={() => setActive(calendar.id)}>
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full cursor-pointer border border-gray-300"
                    style={{ backgroundColor: calendar.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColorPickerId(colorPickerId === calendar.id ? null : calendar.id);
                    }}
                  />
                  {colorPickerId === calendar.id && (
                    <div className="absolute top-6 left-0 z-10 bg-white border border-gray-300 rounded p-2 shadow-lg">
                      <input
                        type="color"
                        value={calendar.color}
                        onChange={(e) => handleColorChange(calendar.id, e.target.value)}
                        className="w-16 h-8"
                      />
                      <button
                        onClick={() => setColorPickerId(null)}
                        className="block text-xs text-gray-500 mt-1"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
                
                {editingId === calendar.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onBlur={handleNameSave}
                    className="text-sm font-medium bg-white border border-blue-300 rounded px-1 py-0.5 flex-1"
                    autoFocus
                  />
                ) : (
                  <span
                    className="text-sm font-medium cursor-pointer"
                    onDoubleClick={() => handleNameDoubleClick(calendar)}
                    title="Double-click to edit"
                  >
                    {calendar.name}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {dayCount} days
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}