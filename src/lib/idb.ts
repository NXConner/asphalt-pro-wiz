// Lightweight IndexedDB helper for storing blobs and JSON per job key.
// Namespace: Pavement Performance Suite (pps)

const DB_NAME = 'pps-db';
// Bump version when adding new stores or indexes
const DB_VERSION = 2;
const FILE_STORE = 'files';
const DOC_STORE = 'docs';
const JOB_STORE = 'jobs';

export function openDb(): Promise<IDBDatabase> {
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
      // Jobs store for persisting job/site markers and status
      if (!db.objectStoreNames.contains(JOB_STORE)) {
        const store = db.createObjectStore(JOB_STORE, { keyPath: 'id' });
        store.createIndex('byStatus', 'status', { unique: false });
        store.createIndex('byCompetitor', 'competitor', { unique: false });
        store.createIndex('byUpdatedAt', 'updatedAt', { unique: false });
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

// Low-level job store utilities (kept here to avoid circular deps)
export type JobStatus = 'need_estimate' | 'estimated' | 'active' | 'completed' | 'lost';
export type SavedJob = {
  id: string; // jobKey
  jobKey: string;
  name: string;
  address: string;
  coords: [number, number] | null;
  status: JobStatus;
  competitor?: string;
  createdAt: number;
  updatedAt: number;
};

export async function getJob(jobKey: string): Promise<SavedJob | undefined> {
  const db = await openDb();
  const value: SavedJob | undefined = await new Promise((resolve, reject) => {
    const tx = db.transaction(JOB_STORE, 'readonly');
    const req = tx.objectStore(JOB_STORE).get(jobKey);
    req.onsuccess = () => resolve(req.result as SavedJob | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return value;
}

export async function upsertJob(job: Omit<SavedJob, 'createdAt' | 'updatedAt'> & Partial<Pick<SavedJob, 'createdAt' | 'updatedAt'>>): Promise<SavedJob> {
  const existing = await getJob(job.id);
  const now = Date.now();
  const record: SavedJob = existing
    ? { ...existing, ...job, updatedAt: now }
    : {
        id: job.id,
        jobKey: job.jobKey,
        name: job.name,
        address: job.address,
        coords: job.coords ?? null,
        status: job.status ?? 'need_estimate',
        competitor: job.competitor,
        createdAt: now,
        updatedAt: now,
      };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(JOB_STORE, 'readwrite');
    tx.objectStore(JOB_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return record;
}

export async function listJobs(): Promise<SavedJob[]> {
  const db = await openDb();
  const jobs: SavedJob[] = [];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(JOB_STORE, 'readonly');
    const store = tx.objectStore(JOB_STORE);
    const req = store.openCursor(undefined, 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        jobs.push(cursor.value as SavedJob);
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
  db.close();
  return jobs;
}

export async function setJobStatus(jobKey: string, status: JobStatus, competitor?: string): Promise<SavedJob | undefined> {
  const job = await getJob(jobKey);
  if (!job) return undefined;
  return upsertJob({ ...job, status, competitor });
}
