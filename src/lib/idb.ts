// Lightweight IndexedDB helper for storing blobs and JSON per job key.
// Namespace: Pavement Performance Suite (pps)

const DB_NAME = 'pps-db';
const DB_VERSION = 1;
const FILE_STORE = 'files';
const DOC_STORE = 'docs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        const store = db.createObjectStore(FILE_STORE, { keyPath: 'id' });
        store.createIndex('byJob', 'jobKey', { unique: false });
      }
      if (!db.objectStoreNames.contains(DOC_STORE)) {
        const store = db.createObjectStore(DOC_STORE, { keyPath: 'id' });
        store.createIndex('byJob', 'jobKey', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export type SavedFile = {
  id: string; // `${jobKey}:${timestamp}:${name}`
  jobKey: string;
  name: string;
  type: string;
  size: number;
  createdAt: number;
  blob: Blob;
};

export async function saveFile(jobKey: string, file: File): Promise<SavedFile> {
  const db = await openDb();
  const id = `${jobKey}:${Date.now()}:${file.name}`;
  const record: SavedFile = {
    id,
    jobKey,
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: Date.now(),
    blob: file,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return record;
}

export async function listFiles(jobKey: string): Promise<SavedFile[]> {
  const db = await openDb();
  const files: SavedFile[] = [];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readonly');
    const index = tx.objectStore(FILE_STORE).index('byJob');
    const req = index.openCursor(IDBKeyRange.only(jobKey), 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        files.push(cursor.value as SavedFile);
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return files;
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export type SavedDoc = {
  id: string; // `${jobKey}:doc:${timestamp}`
  jobKey: string;
  title: string;
  createdAt: number;
  data: any; // JSON serializable
};

export async function saveDoc(jobKey: string, title: string, data: any): Promise<SavedDoc> {
  const db = await openDb();
  const record: SavedDoc = {
    id: `${jobKey}:doc:${Date.now()}`,
    jobKey,
    title,
    createdAt: Date.now(),
    data,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    tx.objectStore(DOC_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return record;
}

export async function listDocs(jobKey: string): Promise<SavedDoc[]> {
  const db = await openDb();
  const docs: SavedDoc[] = [];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readonly');
    const index = tx.objectStore(DOC_STORE).index('byJob');
    const req = index.openCursor(IDBKeyRange.only(jobKey), 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        docs.push(cursor.value as SavedDoc);
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return docs;
}

export async function deleteDoc(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DOC_STORE, 'readwrite');
    tx.objectStore(DOC_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export function makeJobKey(jobName: string, customerAddress: string): string {
  return `${(jobName || 'job').trim().toLowerCase()}|${(customerAddress || 'address').trim().toLowerCase()}`;
}
