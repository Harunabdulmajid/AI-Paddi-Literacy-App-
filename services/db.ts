import { LessonContent, User } from '../types';

const DB_NAME = 'AIKasahorowDB';
const DB_VERSION = 1;
const CONTENT_STORE = 'offlineContent';
const ACTIONS_STORE = 'actionsQueue';

export type OfflineAction = {
  id?: number;
  type: 'updateUser';
  payload: Partial<Omit<User, 'id' | 'email' | 'googleId'>>;
  timestamp: number;
};

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        db.createObjectStore(CONTENT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(ACTIONS_STORE)) {
        const store = db.createObjectStore(ACTIONS_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const dbService = {
  saveContent: async (moduleId: string, language: string, content: Omit<LessonContent, 'quiz' | 'title'>): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(CONTENT_STORE, 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    return new Promise((resolve, reject) => {
      const request = store.put({ id: `${moduleId}-${language}`, content });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getContent: async (moduleId: string, language: string): Promise<Omit<LessonContent, 'quiz' | 'title'> | null> => {
    const db = await initDB();
    const transaction = db.transaction(CONTENT_STORE, 'readonly');
    const store = transaction.objectStore(CONTENT_STORE);
    return new Promise((resolve, reject) => {
      const request = store.get(`${moduleId}-${language}`);
      request.onsuccess = () => {
        resolve(request.result ? request.result.content : null);
      };
      request.onerror = () => reject(request.error);
    });
  },

  getDownloadedModuleIds: async (): Promise<string[]> => {
     const db = await initDB();
     const transaction = db.transaction(CONTENT_STORE, 'readonly');
     const store = transaction.objectStore(CONTENT_STORE);
     return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => {
            const moduleIds = new Set(request.result.map(key => String(key).split('-')[0]));
            resolve(Array.from(moduleIds));
        };
        request.onerror = () => reject(request.error);
     });
  },

  addAction: async (action: Omit<OfflineAction, 'id'>): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(ACTIONS_STORE, 'readwrite');
    const store = transaction.objectStore(ACTIONS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.add(action);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getActions: async (): Promise<OfflineAction[]> => {
    const db = await initDB();
    const transaction = db.transaction(ACTIONS_STORE, 'readonly');
    const store = transaction.objectStore(ACTIONS_STORE);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  deleteAction: async (id: number): Promise<void> => {
    const db = await initDB();
    const transaction = db.transaction(ACTIONS_STORE, 'readwrite');
    const store = transaction.objectStore(ACTIONS_STORE);
     return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
