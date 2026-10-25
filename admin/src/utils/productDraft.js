// Local draft persistence for the admin product form.
//
// Text state (fields, flags, variants, pending reviews) goes to localStorage;
// picked image files go to IndexedDB as Blobs so a session drop / reload / forced
// re-login never loses an unsubmitted product. Keyed per form ("new" or the id).

const LS_PREFIX = 'dundu_product_draft:';
const DB_NAME = 'dundu_admin_drafts';
const STORE = 'images';

const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };

const openDb = () => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB unavailable'));
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const idb = async (mode, run) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = run(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req?.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
};

export const loadDraftMeta = (key) =>
  safe(() => JSON.parse(localStorage.getItem(LS_PREFIX + key) || 'null'), null);

export const saveDraftMeta = (key, data) =>
  safe(() => localStorage.setItem(LS_PREFIX + key, JSON.stringify({ ...data, savedAt: Date.now() })), undefined);

// images: [{ file: File, color }] → stored as [{ name, type, color, blob }]
export const saveDraftImages = async (key, images) => {
  try {
    const rows = images.map(({ file, color }) => ({ name: file.name, type: file.type, color: color || null, blob: file }));
    await idb('readwrite', (store) => store.put(rows, key));
  } catch { /* quota / private mode — text draft still saved */ }
};

export const loadDraftImages = async (key) => {
  try {
    const rows = (await idb('readonly', (store) => store.get(key))) || [];
    return rows.map((r) => ({
      file: new File([r.blob], r.name || 'image', { type: r.type || r.blob?.type || 'image/jpeg' }),
      color: r.color || null,
    }));
  } catch { return []; }
};

export const clearDraft = async (key) => {
  safe(() => localStorage.removeItem(LS_PREFIX + key), undefined);
  try { await idb('readwrite', (store) => store.delete(key)); } catch { /* ignore */ }
};
