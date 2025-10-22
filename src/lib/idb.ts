// Lightweight IndexedDB helper for storing blobs and JSON per job key.
// Namespace: Pavement Performance Suite (pps)

const DB_NAME = 'pps-db';
// Bump version when adding new stores or indexes
const DB_VERSION = 2;
const FILE_STORE = 'files';
const DOC_STORE = 'docs';
const RECEIPT_STORE = 'receipts';

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
      if (!db.objectStoreNames.contains(RECEIPT_STORE)) {
        const store = db.createObjectStore(RECEIPT_STORE, { keyPath: 'id' });
        store.createIndex('byCategory', 'category', { unique: false });
        store.createIndex('byDate', 'date', { unique: false });
        store.createIndex('byVendor', 'vendorLower', { unique: false });
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

// ===== Receipts Store =====

export type ReceiptCategory =
  | 'SealMaster'
  | 'Fuel'
  | 'Payroll'
  | 'Parts'
  | 'Equipment'
  | 'Tools'
  | 'Materials'
  | 'Supplies'
  | 'Entertainment'
  | 'Meals'
  | 'Lodging'
  | 'Travel'
  | 'Permits'
  | 'Insurance'
  | 'Utilities'
  | 'Marketing'
  | 'Office'
  | 'Other';

export type SavedReceipt = {
  id: string; // `rcpt:${timestamp}:${name}`
  name: string;
  type: string;
  size: number;
  createdAt: number; // ms epoch
  updatedAt: number; // ms epoch
  blob: Blob; // original file/image
  // Metadata
  category: ReceiptCategory;
  vendor: string;
  vendorLower: string; // for indexing/search
  date: string; // ISO date (yyyy-mm-dd)
  subtotal?: number | null;
  tax?: number | null;
  total?: number | null;
  paymentMethod?: string | null; // e.g., Cash, Card, Check
  notes?: string | null;
  jobKey?: string | null; // optionally associate to a job
  ocrText?: string | null; // raw OCR/AI output for reference/search
};

export type ReceiptUpdate = Partial<Omit<SavedReceipt, 'id' | 'name' | 'type' | 'size' | 'createdAt' | 'blob'>>;

export async function saveReceipt(file: File, meta?: Partial<SavedReceipt>): Promise<SavedReceipt> {
  const db = await openDb();
  const now = Date.now();
  const id = `rcpt:${now}:${file.name}`;
  const record: SavedReceipt = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: now,
    updatedAt: now,
    blob: file,
    category: (meta?.category as ReceiptCategory) || 'Other',
    vendor: (meta?.vendor || '').trim(),
    vendorLower: (meta?.vendor || '').trim().toLowerCase(),
    date: meta?.date || new Date(now).toISOString().slice(0, 10),
    subtotal: meta?.subtotal ?? null,
    tax: meta?.tax ?? null,
    total: meta?.total ?? null,
    paymentMethod: meta?.paymentMethod ?? null,
    notes: meta?.notes ?? null,
    jobKey: meta?.jobKey ?? null,
    ocrText: meta?.ocrText ?? null,
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(RECEIPT_STORE, 'readwrite');
    tx.objectStore(RECEIPT_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return record;
}

export type ReceiptFilters = {
  category?: ReceiptCategory | 'All';
  startDate?: string; // inclusive yyyy-mm-dd
  endDate?: string; // inclusive yyyy-mm-dd
  vendorQuery?: string; // case-insensitive substring
};

export async function listReceipts(filters?: ReceiptFilters): Promise<SavedReceipt[]> {
  const db = await openDb();
  const receipts: SavedReceipt[] = [];
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(RECEIPT_STORE, 'readonly');
    const store = tx.objectStore(RECEIPT_STORE);
    const req = store.openCursor(null, 'prev');
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (cursor) {
        receipts.push(cursor.value as SavedReceipt);
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
  db.close();

  if (!filters) return receipts;
  const { category, startDate, endDate, vendorQuery } = filters;
  const q = (vendorQuery || '').trim().toLowerCase();
  return receipts.filter((r) => {
    if (category && category !== 'All' && r.category !== category) return false;
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (q && !r.vendorLower.includes(q)) return false;
    return true;
  });
}

export async function deleteReceipt(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(RECEIPT_STORE, 'readwrite');
    tx.objectStore(RECEIPT_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function updateReceiptMeta(id: string, updates: ReceiptUpdate): Promise<SavedReceipt | null> {
  const db = await openDb();
  const record = await new Promise<SavedReceipt | null>((resolve, reject) => {
    const tx = db.transaction(RECEIPT_STORE, 'readwrite');
    const store = tx.objectStore(RECEIPT_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const current = getReq.result as SavedReceipt | undefined;
      if (!current) {
        resolve(null);
        return;
      }
      const next: SavedReceipt = {
        ...current,
        ...updates,
        vendorLower: (updates.vendor ?? current.vendor).trim().toLowerCase(),
        updatedAt: Date.now(),
      };
      const putReq = store.put(next);
      putReq.onsuccess = () => resolve(next);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
  db.close();
  return record;
}
