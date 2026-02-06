import type { CalendarEvent } from '../types'
import { YEAR } from '../constants'
import EventBar from './EventBar'

interface MonthRowProps {
  monthName: string
  monthIndex: number
  events: CalendarEvent[]
  onDeleteEvent: (id: number) => void
}

export default function MonthRow({ monthName, monthIndex, events, onDeleteEvent }: MonthRowProps) {
  const daysInMonth = new Date(YEAR, monthIndex + 1, 0).getDate()
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  const currentDay = today.getDate()

  const relevantEvents = events.filter(e => {
    const s = new Date(e.start)
    const end = new Date(e.end)
    return s.getFullYear() === YEAR && s.getMonth() <= monthIndex && end.getMonth() >= monthIndex
  })

  const dayCells = []
  for (let day = 1; day <= 31; day++) {
    const dateObj = new Date(YEAR, monthIndex, day)
    const dayOfWeek = dateObj.getDay()
    let cellClasses = 'border-r border-ios-border relative h-full '

    if (day > daysInMonth) {
      cellClasses += 'pattern-diagonal '
    } else {
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        cellClasses += 'bg-ios-weekend '
      } else {
        cellClasses += 'bg-white hover:bg-gray-50 transition-colors '
      }
      if (YEAR === currentYear && monthIndex === currentMonth && day === currentDay) {
        cellClasses += 'bg-red-50/50 ring-inset ring-2 ring-red-500 z-10 '
      }
    }

    dayCells.push(
      <div
        key={day}
        className={cellClasses}
        id={YEAR === currentYear && monthIndex === currentMonth && day === currentDay ? 'cell-today' : undefined}
      />
    )
  }

  return (
    <div className="grid-calendar border-b border-ios-border h-24 relative group" id={`month-${monthIndex}`}>
      <div className="sticky-col border-r border-ios-border flex items-center justify-center font-semibold text-xs text-gray-500 tracking-wide group-hover:text-black transition-colors">
        {monthName}
      </div>
      {dayCells}
      <div className="absolute inset-0 pointer-events-none top-4 bottom-1">
        {relevantEvents.map((evt, idx) => (
          <EventBar key={evt.id} event={evt} monthIndex={monthIndex} daysInMonth={daysInMonth} stackIndex={idx} onDelete={onDeleteEvent} />
        ))}
      </div>
    </div>
  )
}
