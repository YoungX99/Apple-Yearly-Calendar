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
  downloadEventsAsJson,
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
  const storageModeRef = useRef<StorageMode>('localStorage')
  const fsSupported = isFileSystemAccessSupported()

  const updateMode = useCallback((mode: StorageMode) => {
    storageModeRef.current = mode
    setStorageMode(mode)
  }, [])

  // Persist helper: mode-exclusive — file OR localStorage, never both
  const persist = useCallback((evts: CalendarEvent[]) => {
    if (storageModeRef.current === 'file' && fileHandleRef.current) {
      writeFileHandle(fileHandleRef.current, evts).catch(err => {
        console.error('Failed to write to file:', err)
      })
    } else {
      saveToLocalStorage(evts)
    }
  }, [])

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

  const updateEvent = useCallback(
    (id: number, data: Omit<CalendarEvent, 'id'>) => {
      setEvents(prev => {
        const next = prev.map(e => (e.id === id ? { ...data, id } : e))
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
      updateMode('file')
      setFileName(handle.name)
      setEvents(fileEvents)
      await saveHandleToDB(handle)
    } catch (err) {
      console.error('Failed to read file:', err)
    }
  }, [updateMode])

  // Create a new JSON file and write current events to it
  const createFile = useCallback(async () => {
    const handle = await createJsonFile()
    if (!handle) return

    try {
      await writeFileHandle(handle, events)
      fileHandleRef.current = handle
      updateMode('file')
      setFileName(handle.name)
      await saveHandleToDB(handle)
    } catch (err) {
      console.error('Failed to create file:', err)
    }
  }, [events, updateMode])

  // Disconnect from file, safely save to localStorage first
  const disconnectFile = useCallback(async () => {
    setEvents(current => {
      saveToLocalStorage(current)
      return current
    })
    fileHandleRef.current = null
    updateMode('localStorage')
    setFileName('')
    await clearHandleFromDB().catch(() => {})
  }, [updateMode])

  // Download events as JSON (works in any mode)
  const downloadEvents = useCallback(() => {
    downloadEventsAsJson(events)
  }, [events])

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
        updateMode('file')
        setFileName(handle.name)
        setEvents(fileEvents)
      } catch {
        // Silent fallback to localStorage
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fsSupported, updateMode])

  return {
    events,
    addEvent,
    deleteEvent,
    updateEvent,
    storageMode,
    fileName,
    fsSupported,
    connectFile,
    createFile,
    disconnectFile,
    downloadEvents,
  }
}
