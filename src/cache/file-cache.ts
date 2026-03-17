import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = path.resolve(process.cwd(), ".cache");

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.json`);
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function get<T>(key: string, maxAgeMs: number): T | null {
  try {
    const filePath = getCachePath(key);
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const entry: CacheEntry<T> = JSON.parse(raw);

    if (Date.now() - entry.timestamp > maxAgeMs) {
      return null; // Cache expired
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function getStale<T>(key: string): T | null {
  try {
    const filePath = getCachePath(key);
    if (!fs.existsSync(filePath)) return null;

    const raw = fs.readFileSync(filePath, "utf-8");
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

export function set<T>(key: string, data: T): void {
  try {
    ensureCacheDir();
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    fs.writeFileSync(getCachePath(key), JSON.stringify(entry, null, 2));
  } catch (error) {
    console.error(`Cache write error for key "${key}":`, error);
  }
}
