"use client";
import React from "react";
import MonthCalendar from "./MonthCalendar";
import { useYear } from "./YearContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function YearCalendar() {
  const { selectedYear, setSelectedYear } = useYear();

  console.log("YearCalendar render:", { selectedYear });

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setSelectedYear(selectedYear - 1)} className="px-2 py-1 border rounded">&lt;</button>
        <span className="text-xl font-bold">{selectedYear}</span>
        <button onClick={() => setSelectedYear(selectedYear + 1)} className="px-2 py-1 border rounded">&gt;</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {MONTHS.map((month, idx) => (
          <div key={month}>
            <h2 className="text-center font-semibold mb-2">{month}</h2>
            <MonthCalendar year={selectedYear} month={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}