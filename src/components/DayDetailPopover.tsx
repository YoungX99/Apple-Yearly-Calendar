import { useRef, useEffect } from 'react'
import type { CalendarEvent } from '../types'
import { MONTHS, YEAR, COLOR_DOT_MAP } from '../constants'

interface DayDetailPopoverProps {
  day: number
  monthIndex: number
  events: CalendarEvent[]
  onDelete: (id: number) => void
  onClose: () => void
}

export default function DayDetailPopover({ day, monthIndex, events, onDelete, onClose }: DayDetailPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const leftCalc = `calc(80px + ((100% - 80px) / 31 * ${day - 0.5}))`

  return (
    <div
      ref={popoverRef}
      className="absolute z-[110] w-60 rounded-lg shadow-xl border border-ios-border bg-white p-3 pointer-events-auto"
      style={{ left: leftCalc, top: '80px', transform: 'translateX(-50%)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-800">
          {MONTHS[monthIndex]} {day}, {YEAR}
        </span>
        <button
          className="text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {events.map(evt => {
          const dotClass = COLOR_DOT_MAP[evt.color] || COLOR_DOT_MAP['gray']
          return (
            <div key={evt.id} className="flex items-center gap-2 group">
              <span className={`w-2.5 h-2.5 rounded-full ${dotClass} shrink-0`} />
              <span className="text-[11px] text-gray-700 truncate flex-1">{evt.title}</span>
              <span className="text-[9px] text-gray-400 shrink-0">
                {evt.start === evt.end ? '' : `${evt.start} ~ ${evt.end}`}
              </span>
              <button
                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={() => {
                  if (confirm(`Delete "${evt.title}"?`)) onDelete(evt.id)
                }}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          )
        })}
      </div>

      {events.length === 0 && (
        <p className="text-[10px] text-gray-400 text-center py-2">No events</p>
      )}
    </div>
  )
}
