/**
 * IndexedDB backing store for large course-export-metadata imports.
 * Units are stored one-by-one (exact objects via structured clone) so the
 * browser never holds the full 700MB+ mapping in JS heap at once.
 */

const DB_NAME = 'course-export-metadata-import-v1';
const DB_VERSION = 1;
const UNIT_STORE = 'units';
const META_STORE = 'meta';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error('Failed to open import metadata DB'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(UNIT_STORE)) {
        const units = db.createObjectStore(UNIT_STORE, { keyPath: 'id' });
        units.createIndex('byStoreId', 'storeId', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'storeId' });
      }
    };
  });
}

function idbReq(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

/**
 * @returns {Promise<string>} storeId
 */
export async function createMetadataImportStore(meta = {}) {
  const storeId = `store_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const db = await openDb();
  try {
    const tx = db.transaction(META_STORE, 'readwrite');
    await idbReq(tx.objectStore(META_STORE).put({
      storeId,
      createdAt: Date.now(),
      ...meta,
    }));
  } finally {
    db.close();
  }
  return storeId;
}

/**
 * Persist one unit exactly (structured clone — no JSON.stringify of the whole course).
 * @param {string} storeId
 * @param {string} unitRecordId
 * @param {object} unitData - full mapping entry (rubricData, qaStates, indexes, ...)
 */
export async function putImportUnit(storeId, unitRecordId, unitData) {
  const db = await openDb();
  try {
    const tx = db.transaction(UNIT_STORE, 'readwrite');
    await idbReq(tx.objectStore(UNIT_STORE).put({
      id: unitRecordId,
      storeId,
      data: unitData,
    }));
  } finally {
    db.close();
  }
}

/**
 * @param {string} unitRecordId
 * @returns {Promise<object|null>}
 */
export async function getImportUnit(unitRecordId) {
  const db = await openDb();
  try {
    const tx = db.transaction(UNIT_STORE, 'readonly');
    const row = await idbReq(tx.objectStore(UNIT_STORE).get(unitRecordId));
    return row?.data ?? null;
  } finally {
    db.close();
  }
}

/**
 * @param {string} unitRecordId
 */
export async function deleteImportUnit(unitRecordId) {
  const db = await openDb();
  try {
    const tx = db.transaction(UNIT_STORE, 'readwrite');
    await idbReq(tx.objectStore(UNIT_STORE).delete(unitRecordId));
  } finally {
    db.close();
  }
}

/**
 * Remove all units + meta for a store after import finishes.
 * @param {string} storeId
 */
export async function clearMetadataImportStore(storeId) {
  if (!storeId) {
    return;
  }
  const db = await openDb();
  try {
    const tx = db.transaction([UNIT_STORE, META_STORE], 'readwrite');
    const unitStore = tx.objectStore(UNIT_STORE);
    const index = unitStore.index('byStoreId');
    const keys = await idbReq(index.getAllKeys(IDBKeyRange.only(storeId)));
    await Promise.all((keys || []).map((key) => idbReq(unitStore.delete(key))));
    await idbReq(tx.objectStore(META_STORE).delete(storeId));
  } finally {
    db.close();
  }
}

export const IMPORT_STORE_MARKER = '__importUnitStore';
