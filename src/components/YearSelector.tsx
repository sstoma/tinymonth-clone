"use client";
import React from "react";
import useCalendars from "./useCalendars";
import useCalendarAssignments from "./useCalendarAssignments";
import { useYear } from "./YearContext";

export default function YearSelector() {
  const { calendars } = useCalendars();
  const { assignments } = useCalendarAssignments();
  const { selectedYear, setSelectedYear } = useYear();

  // Generate years from 2020 to 2030
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  // Calculate annual statistics for the selected year
  const getAnnualStats = React.useCallback(() => {
    const stats: Record<string, number> = {};
    
    calendars.forEach((calendar) => {
      let count = 0;
      Object.entries(assignments).forEach(([date, calendarIds]) => {
        // Check if the date is in the selected year and if this calendar is assigned to this date
        if (date.startsWith(selectedYear.toString()) && calendarIds.includes(calendar.id)) {
          count++;
        }
      });
      stats[calendar.id] = count;
    });
    
    return stats;
  }, [calendars, assignments, selectedYear]);

  const annualStats = getAnnualStats();

  return (
    <div className="w-full max-w-7xl bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Annual Statistics for {selectedYear}
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
            Select Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {calendars.map((calendar) => (
          <div
            key={calendar.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: calendar.color }}
              />
              <span className="font-medium text-gray-800">{calendar.name}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {annualStats[calendar.id] || 0}
              </div>
              <div className="text-xs text-gray-500">days</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
