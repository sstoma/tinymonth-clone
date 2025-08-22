"use client";
import React, { useState } from "react";
import MonthCalendar from "./MonthCalendar";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function YearCalendar() {
  const now = new Date();
  const [year, setYear] = useState(2024); // Default to 2024 where we have data

  console.log("YearCalendar render:", { year });

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setYear(y => y - 1)} className="px-2 py-1 border rounded">&lt;</button>
        <span className="text-xl font-bold">{year}</span>
        <button onClick={() => setYear(y => y + 1)} className="px-2 py-1 border rounded">&gt;</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {MONTHS.map((month, idx) => (
          <div key={month}>
            <h2 className="text-center font-semibold mb-2">{month}</h2>
            <MonthCalendar year={year} month={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}