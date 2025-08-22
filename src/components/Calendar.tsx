"use client";

import React, { useState } from "react";
import DayCell from "./DayCell";
import NoteModal from "./NoteModal";

const DAYS_IN_WEEK = 7;
const WEEKS_IN_MONTH = 5;

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Prosty przykład: generujemy dni od 1 do 35 (5 tygodni)
  const days = Array.from({ length: DAYS_IN_WEEK * WEEKS_IN_MONTH }, (_, i) => i + 1);

  const handleDayClick = (day: number) => {
    // W prawdziwej aplikacji wyliczamy datę, tu uproszczenie:
    setSelectedDate(`2024-06-${String(day).padStart(2, "0")}`);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => (
        <DayCell key={day} day={day} onClick={() => handleDayClick(day)} />
      ))}
      {modalOpen && selectedDate && (
        <NoteModal date={selectedDate} onClose={closeModal} />
      )}
    </div>
  );
}