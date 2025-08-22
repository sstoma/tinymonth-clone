import CalendarList from "../components/CalendarList";
import YearCalendar from "../components/YearCalendar";
import { DragProvider } from "../components/DragContext";
import YearSelector from "../components/YearSelector";
import { YearProvider } from "../components/YearContext";
import { AppDataProvider } from "../components/AppDataContext";

export default function Home() {
  return (
    <AppDataProvider>
      <DragProvider>
        <YearProvider>
          <main className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
            <h1 className="text-2xl font-bold mb-6">TinyMonth</h1>
            
            <YearSelector />
            
            <div className="flex gap-6 w-full max-w-7xl">
              <CalendarList />
              <YearCalendar />
            </div>
          </main>
        </YearProvider>
      </DragProvider>
    </AppDataProvider>
  );
}
