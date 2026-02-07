import type { CalendarEvent } from '../types'
import { COLOR_MAP } from '../constants'

interface EventBarProps {
  event: CalendarEvent
  monthIndex: number
  daysInMonth: number
  slot: number
  startDay: number
  endDay: number
  startsInMonth: boolean
  endsInMonth: boolean
  onEdit: (event: CalendarEvent) => void
}

export default function EventBar({
  event,
  slot,
  startDay,
  endDay,
  startsInMonth,
  endsInMonth,
  onEdit,
}: EventBarProps) {
  const duration = endDay - startDay + 1
  const leftGap = startsInMonth ? 2 : 0
  const rightGap = endsInMonth ? 3 : 0
  const leftCalc = `calc(80px + ((100% - 80px) / 31 * ${startDay - 1}) + ${leftGap}px)`
  const widthCalc = `calc(((100% - 80px) / 31 * ${duration}) - ${leftGap + rightGap}px)`
  const topOffset = (slot - 1) * 28 + 18

  // Border radius based on cross-month position
  let roundedClass: string
  if (startsInMonth && endsInMonth) {
    roundedClass = 'rounded'
  } else if (startsInMonth) {
    roundedClass = 'rounded-l'
  } else if (endsInMonth) {
    roundedClass = 'rounded-r'
  } else {
    roundedClass = ''
  }

  const theme = COLOR_MAP[event.color] || COLOR_MAP['gray']

  const handleBarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(event)
  }

  return (
    <div
      className={`absolute h-6 ${roundedClass} px-2 text-[10px] font-bold flex items-center truncate border pointer-events-auto cursor-pointer shadow-sm event-bar ${theme}`}
      style={{ left: leftCalc, width: widthCalc, top: `${topOffset}px` }}
      title={`${event.title} (${event.start} to ${event.end})`}
      onClick={handleBarClick}
    >
      <span className="truncate">{event.title}</span>
    </div>
  )
}
