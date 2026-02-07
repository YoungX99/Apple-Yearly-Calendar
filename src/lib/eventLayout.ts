import type { CalendarEvent } from '../types'

export const MAX_VISIBLE_SLOTS = 3

export interface EventLayoutInfo {
  eventId: number
  slot: number
  startDay: number
  endDay: number
  startsInMonth: boolean
  endsInMonth: boolean
}

export interface MonthLayoutResult {
  eventLayouts: EventLayoutInfo[]
  overflowCounts: Map<number, number>
  dayEvents: Map<number, CalendarEvent[]>
}

interface EventMeta {
  event: CalendarEvent
  startDay: number
  endDay: number
  startsInMonth: boolean
  endsInMonth: boolean
  totalDuration: number
}

function findLowestAvailableSlot(
  slotOccupancy: Set<number>[],
  startDay: number,
  endDay: number,
): number {
  for (let slot = 0; slot < slotOccupancy.length; slot++) {
    let conflict = false
    for (let d = startDay; d <= endDay; d++) {
      if (slotOccupancy[slot].has(d)) {
        conflict = true
        break
      }
    }
    if (!conflict) return slot
  }
  slotOccupancy.push(new Set())
  return slotOccupancy.length - 1
}

export function computeMonthLayout(
  events: CalendarEvent[],
  monthIndex: number,
  year: number,
): MonthLayoutResult {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  // Step 1: Filter relevant events and compute metadata
  const metas: EventMeta[] = []
  for (const event of events) {
    const s = new Date(event.start)
    const e = new Date(event.end)
    if (s.getFullYear() !== year) continue
    if (s.getMonth() > monthIndex || e.getMonth() < monthIndex) continue

    const startsInMonth = s.getMonth() === monthIndex
    const endsInMonth = e.getMonth() === monthIndex
    const startDay = startsInMonth ? s.getDate() : 1
    const endDay = endsInMonth ? e.getDate() : daysInMonth
    const totalDuration =
      Math.round((e.getTime() - s.getTime()) / 86400000) + 1

    metas.push({
      event,
      startDay,
      endDay,
      startsInMonth,
      endsInMonth,
      totalDuration,
    })
  }

  // Step 2: Sort — longer duration first, then earlier start, then by id
  metas.sort((a, b) => {
    if (b.totalDuration !== a.totalDuration)
      return b.totalDuration - a.totalDuration
    if (a.startDay !== b.startDay) return a.startDay - b.startDay
    return a.event.id - b.event.id
  })

  // Step 3: Build dayEvents map (all events per day, for detail popover)
  const dayEvents = new Map<number, CalendarEvent[]>()
  for (const meta of metas) {
    for (let d = meta.startDay; d <= meta.endDay; d++) {
      let list = dayEvents.get(d)
      if (!list) {
        list = []
        dayEvents.set(d, list)
      }
      list.push(meta.event)
    }
  }

  // Step 4: Greedy slot assignment
  const slotOccupancy: Set<number>[] = [new Set()]
  const slotAssignments: { meta: EventMeta; slot: number }[] = []

  for (const meta of metas) {
    const slot = findLowestAvailableSlot(
      slotOccupancy,
      meta.startDay,
      meta.endDay,
    )
    for (let d = meta.startDay; d <= meta.endDay; d++) {
      slotOccupancy[slot].add(d)
    }
    slotAssignments.push({ meta, slot })
  }

  // Step 5: Split into visible layouts and overflow counts
  const eventLayouts: EventLayoutInfo[] = []
  const overflowCounts = new Map<number, number>()

  for (const { meta, slot } of slotAssignments) {
    if (slot < MAX_VISIBLE_SLOTS) {
      eventLayouts.push({
        eventId: meta.event.id,
        slot,
        startDay: meta.startDay,
        endDay: meta.endDay,
        startsInMonth: meta.startsInMonth,
        endsInMonth: meta.endsInMonth,
      })
    } else {
      for (let d = meta.startDay; d <= meta.endDay; d++) {
        overflowCounts.set(d, (overflowCounts.get(d) || 0) + 1)
      }
    }
  }

  return { eventLayouts, overflowCounts, dayEvents }
}
