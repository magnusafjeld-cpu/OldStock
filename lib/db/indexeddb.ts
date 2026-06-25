import type { Snapshot } from "@/types/domain";

/**
 * Minimal IndexedDB wrapper — all snapshots live entirely on the user's machine.
 * Nothing is ever sent over the network. Each upload is one dated daily snapshot
 * (keyed `${store}__${date}`), so re-uploading the same day replaces that day and
 * a new day appends to the history used for movement tracking.
 */

const DB_NAME = "elkjop-old-stock";
const DB_VERSION = 2;
const STORE = "snapshots";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // v1 used an object store named "datasets"; drop it and create "snapshots".
      if (db.objectStoreNames.contains("datasets")) db.deleteObjectStore("datasets");
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const request = run(transaction.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
      })
  );
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  await tx("readwrite", (s) => s.put(snapshot));
}

export async function getAllSnapshots(): Promise<Snapshot[]> {
  try {
    const all = await tx<Snapshot[]>("readonly", (s) => s.getAll());
    return all.sort((a, b) => a.date.localeCompare(b.date) || a.uploadedAt - b.uploadedAt);
  } catch {
    return [];
  }
}

export async function deleteSnapshot(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

export async function clearAllSnapshots(): Promise<void> {
  await tx("readwrite", (s) => s.clear());
}
