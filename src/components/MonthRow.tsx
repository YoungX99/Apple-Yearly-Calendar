import { useState, useMemo } from 'react'
import type { CalendarEvent } from '../types'
import { YEAR } from '../constants'
import { computeMonthLayout } from '../lib/eventLayout'
import EventBar from './EventBar'
import DayDetailPopover from './DayDetailPopover'

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

  const [activeDay, setActiveDay] = useState<number | null>(null)

  const layout = useMemo(
    () => computeMonthLayout(events, monthIndex, YEAR),
    [events, monthIndex],
  )

  const eventMap = useMemo(
    () => new Map(events.map(e => [e.id, e])),
    [events],
  )

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

    const isValidDay = day <= daysInMonth
    const overflowCount = layout.overflowCounts.get(day) || 0
    const hasEvents = (layout.dayEvents.get(day)?.length || 0) > 0

    dayCells.push(
      <div
        key={day}
        className={cellClasses}
        id={YEAR === currentYear && monthIndex === currentMonth && day === currentDay ? 'cell-today' : undefined}
        onClick={isValidDay && hasEvents ? () => setActiveDay(day) : undefined}
        style={isValidDay && hasEvents ? { cursor: 'pointer' } : undefined}
      >
        {isValidDay && overflowCount > 0 && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-500 pointer-events-none select-none">
            +{overflowCount}
          </span>
        )}
      </div>,
    )
  }

  return (
    <div className="grid-calendar border-b border-ios-border h-24 relative group" id={`month-${monthIndex}`}>
      <div className="sticky-col border-r border-ios-border flex items-center justify-center font-semibold text-xs text-gray-500 tracking-wide group-hover:text-black transition-colors">
        {monthName}
      </div>
      {dayCells}
      <div className="absolute inset-0 pointer-events-none top-4 bottom-1">
        {layout.eventLayouts.map(info => {
          const evt = eventMap.get(info.eventId)
          if (!evt) return null
          return (
            <EventBar
              key={info.eventId}
              event={evt}
              monthIndex={monthIndex}
              daysInMonth={daysInMonth}
              slot={info.slot}
              startDay={info.startDay}
              endDay={info.endDay}
              startsInMonth={info.startsInMonth}
              endsInMonth={info.endsInMonth}
              onDelete={onDeleteEvent}
            />
          )
        })}
      </div>
      {activeDay !== null && (
        <DayDetailPopover
          day={activeDay}
          monthIndex={monthIndex}
          events={layout.dayEvents.get(activeDay) ?? []}
          onDelete={onDeleteEvent}
          onClose={() => setActiveDay(null)}
        />
      )}
    </div>
  )
}
