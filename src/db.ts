import { Dexie, type Table } from 'dexie';

export interface Entry {
  id?: number; // Primary key. Optional: auto-incremented
  content: string;
  createdAt: Date;
  updatedAt: Date;
  font?: string;
  size?: number;
}

export class FreewriteDB extends Dexie {
  entries!: Table<Entry>;

  constructor() {
    super('freewriteDB');
    this.version(1).stores({
      entries: '++id, createdAt, updatedAt' // Primary key and indexed props
    });
  }
}

export const db = new FreewriteDB(); 