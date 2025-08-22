"use client";
import React from "react";
import DayCell from "./DayCell";

type MonthCalendarProps = {
  year: number;
  month: number; // 0-based
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // Convert JS Sunday-first (0=Sun) to Monday-first index (0=Mon)
  const jsDay = new Date(year, month, 1).getDay();
  return (jsDay + 6) % 7; // 0 = Monday, 6 = Sunday
}

export default function MonthCalendar({ year, month }: MonthCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const days: (number | null)[] = [];

  // Fill empty days before the 1st
  for (let i = 0; i < firstDay; i++) days.push(null);
  // Fill days of month
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  // Fill to complete 6 rows (max 42 cells)
  while (days.length < 42) days.push(null);

  return (
    <div className="grid grid-cols-7 gap-0.5 text-xs">
      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
        <div key={d} className="text-center font-medium text-gray-500 pb-1">{d}</div>
      ))}
      {days.map((day, idx) => (
        <DayCell
          key={idx}
          day={day}
          year={year}
          month={month}
        />
      ))}
    </div>
  );
}