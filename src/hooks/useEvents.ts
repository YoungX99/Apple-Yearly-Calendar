import { useState, useCallback, useRef, useEffect } from 'react'
import type { CalendarEvent } from '../types'
import { DEFAULT_EVENTS } from '../constants'
import {
  isFileSystemAccessSupported,
  openJsonFile,
  createJsonFile,
  readFileHandle,
  writeFileHandle,
  verifyPermission,
  saveHandleToDB,
  loadHandleFromDB,
  clearHandleFromDB,
} from '../lib/fileAccess'

type StorageMode = 'localStorage' | 'file'

const LS_KEY = 'calendar_events'

function loadFromLocalStorage(): CalendarEvent[] {
  const stored = localStorage.getItem(LS_KEY)
  return stored ? JSON.parse(stored) : DEFAULT_EVENTS
}

function saveToLocalStorage(events: CalendarEvent[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(events))
}

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadFromLocalStorage)
  const [storageMode, setStorageMode] = useState<StorageMode>('localStorage')
  const [fileName, setFileName] = useState<string>('')
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null)
  const fsSupported = isFileSystemAccessSupported()

  // Write events to file if connected (fire-and-forget with error catch)
  const writeToFile = useCallback((evts: CalendarEvent[]) => {
    if (fileHandleRef.current) {
      writeFileHandle(fileHandleRef.current, evts).catch(err => {
        console.error('Failed to write to file:', err)
      })
    }
  }, [])

  // Persist helper: always write localStorage, then file if connected
  const persist = useCallback(
    (evts: CalendarEvent[]) => {
      saveToLocalStorage(evts)
      writeToFile(evts)
    },
    [writeToFile],
  )

  const addEvent = useCallback(
    (event: Omit<CalendarEvent, 'id'>) => {
      setEvents(prev => {
        const next = [...prev, { ...event, id: Date.now() }]
        persist(next)
        return next
      })
    },
    [persist],
  )

  const deleteEvent = useCallback(
    (id: number) => {
      setEvents(prev => {
        const next = prev.filter(e => e.id !== id)
        persist(next)
        return next
      })
    },
    [persist],
  )

  // Connect to an existing JSON file
  const connectFile = useCallback(async () => {
    const handle = await openJsonFile()
    if (!handle) return
    const granted = await verifyPermission(handle, 'readwrite')
    if (!granted) return

    try {
      const fileEvents = await readFileHandle(handle)
      fileHandleRef.current = handle
      setStorageMode('file')
      setFileName(handle.name)
      setEvents(fileEvents)
      saveToLocalStorage(fileEvents)
      await saveHandleToDB(handle)
    } catch (err) {
      console.error('Failed to read file:', err)
    }
  }, [])

  // Create a new JSON file and write current events to it
  const createFile = useCallback(async () => {
    const handle = await createJsonFile()
    if (!handle) return

    try {
      await writeFileHandle(handle, events)
      fileHandleRef.current = handle
      setStorageMode('file')
      setFileName(handle.name)
      await saveHandleToDB(handle)
    } catch (err) {
      console.error('Failed to create file:', err)
    }
  }, [events])

  // Disconnect from file, revert to localStorage mode
  const disconnectFile = useCallback(async () => {
    fileHandleRef.current = null
    setStorageMode('localStorage')
    setFileName('')
    await clearHandleFromDB().catch(() => {})
  }, [])

  // On mount: try to restore file handle from IndexedDB
  useEffect(() => {
    if (!fsSupported) return

    let cancelled = false
    ;(async () => {
      try {
        const handle = await loadHandleFromDB()
        if (!handle || cancelled) return
        const granted = await verifyPermission(handle, 'readwrite')
        if (!granted || cancelled) return
        const fileEvents = await readFileHandle(handle)
        if (cancelled) return

        fileHandleRef.current = handle
        setStorageMode('file')
        setFileName(handle.name)
        setEvents(fileEvents)
        saveToLocalStorage(fileEvents)
      } catch {
        // Silent fallback to localStorage
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fsSupported])

  return {
    events,
    addEvent,
    deleteEvent,
    storageMode,
    fileName,
    fsSupported,
    connectFile,
    createFile,
    disconnectFile,
  }
}
