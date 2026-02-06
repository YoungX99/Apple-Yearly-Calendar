import { useState, useRef, useEffect } from 'react'
import type { CalendarEvent } from '../types'
import { COLOR_MAP } from '../constants'

interface EventBarProps {
  event: CalendarEvent
  monthIndex: number
  daysInMonth: number
  stackIndex: number
  onDelete: (id: number) => void
}

export default function EventBar({ event, monthIndex, daysInMonth, stackIndex, onDelete }: EventBarProps) {
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const startDate = new Date(event.start)
  const endDate = new Date(event.end)

  let startDay = 1
  if (startDate.getMonth() === monthIndex) {
    startDay = startDate.getDate()
  }

  let endDay = daysInMonth
  if (endDate.getMonth() === monthIndex) {
    endDay = endDate.getDate()
  }

  const duration = endDay - startDay + 1
  const leftCalc = `calc(80px + ((100% - 80px) / 31 * ${startDay - 1}) + 2px)`
  const widthCalc = `calc(((100% - 80px) / 31 * ${duration}) - 5px)`
  const topOffset = 10 + stackIndex * 28

  // Close popover when clicking outside
  useEffect(() => {
    if (!showPopover) return
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPopover])

  if (topOffset >= 70) return null

  const theme = COLOR_MAP[event.color] || COLOR_MAP['gray']

  const handleBarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPopover(prev => !prev)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete "${event.title}"?`)) {
      setShowPopover(false)
      onDelete(event.id)
    }
  }

  const colorDot = `bg-${event.color}-500`

  return (
    <div
      className={`absolute h-6 rounded px-2 text-[10px] font-bold flex items-center truncate border pointer-events-auto cursor-pointer shadow-sm event-bar ${theme}`}
      style={{ left: leftCalc, width: widthCalc, top: `${topOffset}px` }}
      title={`${event.title} (${event.start} to ${event.end})`}
      onClick={handleBarClick}
    >
      <span className="truncate">{event.title}</span>

      {showPopover && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-7 z-[100] w-56 rounded-lg shadow-xl border border-ios-border bg-white p-3 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full ${colorDot} shrink-0`} />
            <span className="text-xs font-semibold text-gray-800 truncate">{event.title}</span>
          </div>
          <div className="text-[10px] text-gray-500 mb-3">
            {event.start === event.end ? event.start : `${event.start} — ${event.end}`}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="text-[10px] text-gray-500 hover:text-gray-800 px-2 py-1 rounded transition-colors"
              onClick={() => setShowPopover(false)}
            >
              Close
            </button>
            <button
              className="text-[10px] text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors font-semibold"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
