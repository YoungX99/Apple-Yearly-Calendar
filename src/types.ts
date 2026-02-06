export interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
  color: string
}

export interface ColorOption {
  name: string
  hex: string
}

export interface CalendarFile {
  version: number
  app: string
  lastModified: string
  events: CalendarEvent[]
}
