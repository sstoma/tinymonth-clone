"use client";
import React from "react";
import useCalendars from "./useCalendars";
import useCalendarAssignments from "./useCalendarAssignments";
import { useYear } from "./YearContext";
import type { CalendarItem } from "./useCalendars";

export default function CalendarList() {
  const { calendars, activeId, setActive } = useCalendars();
  const { assignments } = useCalendarAssignments();
  const { selectedYear } = useYear();

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

  return (
    <aside className="w-56 p-4 bg-white rounded shadow flex flex-col gap-4">
      <h2 className="font-bold text-lg mb-2">Calendars ({selectedYear})</h2>
      
      <div className="flex flex-col gap-2">
        {calendars.map((calendar: CalendarItem) => {
          const dayCount = getAnnualDayCount(calendar.id);
          return (
            <div
              key={calendar.id}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                activeId === calendar.id
                  ? "bg-blue-100 border border-blue-300"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setActive(calendar.id)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: calendar.color }}
                />
                <span className="text-sm font-medium">{calendar.name}</span>
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