"use client";

import CalendarList from "../components/CalendarList";
import YearCalendar from "../components/YearCalendar";
import { DragProvider } from "../components/DragContext";
import YearSelector from "../components/YearSelector";
import { YearProvider } from "../components/YearContext";
import { AppDataProvider, useAppData } from "../components/AppDataContext";
import CommentInfo from "../components/CommentInfo";

function HomeContent() {
  const { importData, calendars, assignments, activeId, comments, holidays } = useAppData();

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const importedData = JSON.parse(text);

          // Import the data
          importData({
            calendars: importedData.calendars || [],
            assignments: importedData.assignments || {},
            activeId: importedData.activeId || null,
            comments: importedData.comments || {},
            holidays: importedData.holidays || []
          });

          alert("Data imported successfully!");
        } catch (error) {
          console.error("Error importing data:", error);
          alert("Error importing data");
        }
      }
    };
    input.click();
  };

  const handleExport = () => {
    const dataToExport = {
      calendars,
      assignments,
      activeId,
      comments,
      holidays,
      exportedAt: new Date().toISOString(),
      version: 1
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tinymonth-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-6">TinyMonth</h1>

      <div className="mb-4 flex gap-3">
        <button
          onClick={handleImport}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          📥 Import from file
        </button>
        <button
          onClick={handleExport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          📤 Export to file
        </button>
      </div>

      <YearSelector />

      <CommentInfo />

      <div className="flex gap-6 w-full max-w-7xl">
        <CalendarList />
        <YearCalendar />
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AppDataProvider>
      <DragProvider>
        <YearProvider>
          <HomeContent />
        </YearProvider>
      </DragProvider>
    </AppDataProvider>
  );
}
