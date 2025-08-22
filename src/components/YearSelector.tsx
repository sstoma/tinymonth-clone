"use client";
import React from "react";
import { useAppData } from "./AppDataContext";
import { useYear } from "./YearContext";

export default function YearSelector() {
  const { calendars, assignments } = useAppData();
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
      stats[calendar.name] = count;
    });
    
    return stats;
  }, [calendars, assignments, selectedYear]);

  const stats = getAnnualStats();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 w-full max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Annual Statistics ({selectedYear})
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {calendars.map((calendar) => (
          <div key={calendar.id} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: calendar.color }}
              />
              <span className="text-sm font-medium text-gray-700">
                {calendar.name}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats[calendar.name] || 0}
            </div>
            <div className="text-xs text-gray-500">days</div>
          </div>
        ))}
      </div>
    </div>
  );
}
