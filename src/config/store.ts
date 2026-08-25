import { mkdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import writeFileAtomic from "write-file-atomic";
import { DATA_DIR } from "./env.js";

/**
 * A small JSON-file-backed key/value store, keyed by Discord snowflake
 * (user ID, guild ID, or a fixed key for the single bot-wide record).
 *
 * Node is single-threaded and every write goes through one promise chain
 * per store, so writes never interleave — no file lock is needed. Writes
 * are atomic (write-then-rename) so a crash mid-write can't corrupt data.
 */
export class JsonStore<T> {
  private readonly filePath: string;
  private cache: Record<string, T> = {};
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(fileName: string) {
    this.filePath = path.join(DATA_DIR, fileName);
  }

  load(): void {
    if (!existsSync(this.filePath)) {
      this.cache = {};
      return;
    }
    const raw = readFileSync(this.filePath, "utf8");
    this.cache = raw.trim() ? (JSON.parse(raw) as Record<string, T>) : {};
  }

  get(id: string): T | undefined {
    return this.cache[id];
  }

  async set(id: string, value: T): Promise<void> {
    this.cache[id] = value;
    await this.persist();
  }

  async delete(id: string): Promise<void> {
    delete this.cache[id];
    await this.persist();
  }

  private persist(): Promise<void> {
    const snapshot = JSON.stringify(this.cache, null, 2);
    this.writeQueue = this.writeQueue.then(async () => {
      mkdirSync(DATA_DIR, { recursive: true });
      await writeFileAtomic(this.filePath, snapshot);
    });
    return this.writeQueue;
  }
}
