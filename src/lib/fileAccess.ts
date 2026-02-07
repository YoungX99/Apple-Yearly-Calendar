import type { CalendarEvent, CalendarFile } from '../types'

const DB_NAME = 'yearly-calendar-db'
const DB_VERSION = 1
const STORE_NAME = 'file-handles'
const HANDLE_KEY = 'current-file'

const JSON_FILE_TYPES = [
  {
    description: 'JSON Files',
    accept: { 'application/json': ['.json'] },
  },
]

export function isFileSystemAccessSupported(): boolean {
  return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window
}

export async function openJsonFile(): Promise<FileSystemFileHandle | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: JSON_FILE_TYPES,
    })
    return handle
  } catch {
    // User cancelled the picker
    return null
  }
}

export async function createJsonFile(suggestedName = 'calendar-2026.json'): Promise<FileSystemFileHandle | null> {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: JSON_FILE_TYPES,
    })
    return handle
  } catch {
    // User cancelled the picker
    return null
  }
}

export async function readFileHandle(handle: FileSystemFileHandle): Promise<CalendarEvent[]> {
  const file = await handle.getFile()
  const text = await file.text()
  const parsed = JSON.parse(text)

  // Support both CalendarFile envelope and plain array
  if (Array.isArray(parsed)) {
    return parsed as CalendarEvent[]
  }
  if (parsed && Array.isArray(parsed.events)) {
    return (parsed as CalendarFile).events
  }
  throw new Error('Invalid calendar file format')
}

export async function writeFileHandle(handle: FileSystemFileHandle, events: CalendarEvent[]): Promise<void> {
  const data: CalendarFile = {
    version: 1,
    app: 'yearly-calendar',
    lastModified: new Date().toISOString(),
    events,
  }
  const writable = await handle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export async function verifyPermission(
  handle: FileSystemFileHandle,
  mode: 'read' | 'readwrite' = 'readwrite',
): Promise<boolean> {
  const opts = { mode }
  if ((await handle.queryPermission(opts)) === 'granted') {
    return true
  }
  if ((await handle.requestPermission(opts)) === 'granted') {
    return true
  }
  return false
}

// --- IndexedDB helpers for persisting file handles across sessions ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveHandleToDB(handle: FileSystemFileHandle): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadHandleFromDB(): Promise<FileSystemFileHandle | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export async function clearHandleFromDB(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function downloadEventsAsJson(events: CalendarEvent[]): void {
  const data: CalendarFile = {
    version: 1,
    app: 'yearly-calendar',
    lastModified: new Date().toISOString(),
    events,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'calendar-2026.json'
  a.click()
  URL.revokeObjectURL(url)
}
