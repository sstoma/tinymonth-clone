import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type CalendarItem = {
  id: string;
  name: string;
  color: string;
};

type AssignmentsMap = Record<string, string[]>;

type DataShape = {
  calendars: CalendarItem[];
  assignments: AssignmentsMap;
  activeId: string | null;
  version?: number;
  exportedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tinymonth-data.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    const initial: DataShape = { calendars: [], assignments: {}, activeId: null, version: 1 };
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

export async function GET() {
  console.log("API: GET /api/data called at", new Date().toISOString());
  try {
    await ensureDataFile();
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    console.log("API: Successfully read data, calendars count:", data.calendars?.length || 0);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("API: Error reading data:", e);
    return NextResponse.json({ error: "Failed to read data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDataFile();
    const incoming: DataShape = await request.json();
    const toWrite = { ...incoming, version: incoming.version ?? 1 };
    await fs.writeFile(DATA_FILE, JSON.stringify(toWrite, null, 2), "utf-8");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to write data" }, { status: 500 });
  }
}


