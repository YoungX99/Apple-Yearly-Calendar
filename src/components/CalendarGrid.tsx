import { forwardRef } from 'react'
import type { CalendarEvent } from '../types'
import { MONTHS } from '../constants'
import MonthRow from './MonthRow'

interface CalendarGridProps {
  events: CalendarEvent[]
  onDeleteEvent: (id: number) => void
  onEditEvent: (event: CalendarEvent) => void
}

const CalendarGrid = forwardRef<HTMLDivElement, CalendarGridProps>(({ events, onDeleteEvent, onEditEvent }, ref) => {
  return (
    <main className="flex-1 overflow-auto relative flex flex-col no-scrollbar" ref={ref}>
      {/* Sticky Day Numbers Header */}
      <div className="sticky-header border-b border-ios-border min-w-max">
        <div className="grid-calendar">
          <div className="h-8 border-r border-ios-border bg-white/50" />
          {Array.from({ length: 31 }, (_, i) => (
            <div
              key={i + 1}
              className="h-8 border-r border-ios-border flex items-center justify-center text-[10px] font-semibold text-gray-400 bg-white"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable Months Grid */}
      <div className="min-w-max pb-10">
        {MONTHS.map((monthName, idx) => (
          <MonthRow
            key={monthName}
            monthName={monthName}
            monthIndex={idx}
            events={events}
            onDeleteEvent={onDeleteEvent}
            onEditEvent={onEditEvent}
          />
        ))}
      </div>
    </main>
  )
})

CalendarGrid.displayName = 'CalendarGrid'

export default CalendarGrid
