const DATABASE_NAME = "arpis-local-files";
const STORE_NAME = "pdfs";

type StoredPdf = { id: string; blob: Blob; fileName: string };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Persistent browser file storage is unavailable."));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local file storage."));
  });
}

export async function savePdf(id: string, file: File): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ id, blob: file, fileName: file.name } satisfies StoredPdf);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save this PDF."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Saving this PDF was cancelled."));
  });
  database.close();
}

export async function loadPdfUrl(id: string): Promise<string | null> {
  const database = await openDatabase();
  const record = await new Promise<StoredPdf | undefined>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result as StoredPdf | undefined);
    request.onerror = () => reject(request.error ?? new Error("Could not read the saved PDF."));
  });
  database.close();
  return record?.blob ? URL.createObjectURL(record.blob) : null;
}

export async function deletePdf(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not remove the saved PDF."));
  });
  database.close();
}
