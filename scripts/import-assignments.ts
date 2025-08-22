/*
  One-off import from a simple CSV file into data/tinymonth-data.json

  CSV format (img_import/import.csv):
  date,calendars
  2024-06-01,lanzarote
  2024-06-02,lanzarote;zurich

  - date: YYYY-MM-DD
  - calendars: semicolon-separated calendar ids

  The script will:
  - Read current data/tinymonth-data.json (creates if missing)
  - Merge/overwrite assignments for the listed dates
  - Optionally create calendars if they don't exist (with default color)
*/

import { promises as fs } from "fs";
import path from "path";

type CalendarItem = { id: string; name: string; color: string };
type AssignmentsMap = Record<string, string[]>;
type DataShape = { calendars: CalendarItem[]; assignments: AssignmentsMap; activeId: string | null; version?: number };

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tinymonth-data.json");
const CSV_FILE = path.join(process.cwd(), "img_import", "import.csv");

function parseCsv(text: string): Array<{ date: string; calendars: string[] }> {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const [header, ...rows] = lines;
  const cols = header.split(",").map(s => s.trim().toLowerCase());
  const dateIdx = cols.indexOf("date");
  const calsIdx = cols.indexOf("calendars");
  if (dateIdx === -1 || calsIdx === -1) throw new Error("CSV header must contain 'date,calendars'");
  return rows.map(r => {
    const parts = r.split(",");
    const date = (parts[dateIdx] || "").trim();
    const calendars = (parts[calsIdx] || "").split(";").map(s => s.trim()).filter(Boolean);
    return { date, calendars };
  }).filter(row => /\d{4}-\d{2}-\d{2}/.test(row.date) && row.calendars.length > 0);
}

async function ensureData(): Promise<DataShape> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const initial: DataShape = { calendars: [], assignments: {}, activeId: null, version: 1 };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function ensureCalendars(calendars: CalendarItem[], ids: string[]): CalendarItem[] {
  const existingIds = new Set(calendars.map(c => c.id));
  const toAdd = ids.filter(id => !existingIds.has(id));
  if (toAdd.length === 0) return calendars;
  const appended = [...calendars];
  for (const id of toAdd) {
    appended.push({ id, name: id.replace(/-/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()), color: "#3b82f6" });
  }
  return appended;
}

async function main() {
  const csv = await fs.readFile(CSV_FILE, "utf-8").catch(() => {
    throw new Error(`CSV not found: ${CSV_FILE}`);
  });
  const rows = parseCsv(csv);
  if (rows.length === 0) {
    console.log("No rows to import.");
    return;
  }
  const data = await ensureData();

  // Ensure calendars exist for all referenced ids
  const allIds = Array.from(new Set(rows.flatMap(r => r.calendars)));
  data.calendars = ensureCalendars(data.calendars, allIds);

  // Merge assignments - preserve existing assignments and add new ones
  const updated: AssignmentsMap = { ...data.assignments };
  for (const { date, calendars } of rows) {
    // If date already has assignments, merge them; otherwise create new array
    if (updated[date]) {
      updated[date] = Array.from(new Set([...updated[date], ...calendars]));
    } else {
      updated[date] = Array.from(new Set(calendars));
    }
  }

  // Set a default activeId if none exists
  const nextActiveId = data.activeId || (data.calendars.length > 0 ? data.calendars[0].id : null);

  const next: DataShape = { ...data, assignments: updated, activeId: nextActiveId };
  await fs.writeFile(DATA_FILE, JSON.stringify(next, null, 2), "utf-8");
  console.log(`Imported ${rows.length} rows into ${DATA_FILE}`);
  console.log(`Total assignments: ${Object.keys(updated).length}`);
  console.log(`Active calendar: ${nextActiveId}`);
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});


