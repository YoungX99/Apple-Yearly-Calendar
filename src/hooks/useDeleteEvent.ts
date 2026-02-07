import { useCallback } from 'react'
import type { CalendarEvent } from '../types'

export function useDeleteEvent(onDelete: (id: number) => void) {
  return useCallback(
    (event: CalendarEvent) => {
      if (confirm(`Delete "${event.title}"?`)) {
        onDelete(event.id)
      }
    },
    [onDelete],
  )
}
