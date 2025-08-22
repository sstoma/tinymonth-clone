import CalendarList from "../components/CalendarList";
import YearCalendar from "../components/YearCalendar";
import { DragProvider } from "../components/DragContext";
import YearSelector from "../components/YearSelector";
import { YearProvider } from "../components/YearContext";

export default function Home() {
  return (
    <DragProvider>
      <YearProvider>
        <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
          <h1 className="text-2xl font-bold mb-6">TinyMonth</h1>
          <YearSelector />
          <div className="flex flex-row gap-8 w-full max-w-7xl mt-6">
            <CalendarList />
            <div className="flex-1 overflow-x-auto">
              <YearCalendar />
            </div>
          </div>
        </main>
      </YearProvider>
    </DragProvider>
  );
}
