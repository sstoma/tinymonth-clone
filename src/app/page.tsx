import CalendarList from "../components/CalendarList";
import YearCalendar from "../components/YearCalendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <h1 className="text-2xl font-bold mb-6">TinyMonth Clone</h1>
      <div className="flex flex-row gap-8 w-full max-w-7xl">
        <CalendarList />
        <div className="flex-1 overflow-x-auto">
          <YearCalendar />
        </div>
      </div>
    </main>
  );
}
