// Storage interface - not used in this Firebase-based application
// All data persistence is handled by Firebase Firestore
// This file is kept for compatibility with the template structure

export interface IStorage {
  // Placeholder interface
}

export class MemStorage implements IStorage {
  constructor() {
    // No-op constructor
  }
}

export const storage = new MemStorage();
