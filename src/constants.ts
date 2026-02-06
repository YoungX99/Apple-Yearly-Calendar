import type { CalendarEvent, ColorOption } from './types'

export const YEAR = 2026

export const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export const COLORS: ColorOption[] = [
  { name: 'red', hex: 'bg-red-500' },
  { name: 'orange', hex: 'bg-orange-500' },
  { name: 'yellow', hex: 'bg-yellow-400' },
  { name: 'green', hex: 'bg-green-500' },
  { name: 'blue', hex: 'bg-blue-500' },
  { name: 'purple', hex: 'bg-purple-500' },
  { name: 'gray', hex: 'bg-gray-500' },
]

export const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: 1, title: 'Project Kickoff', start: '2026-02-10', end: '2026-02-12', color: 'blue' },
  { id: 2, title: 'Holiday', start: '2026-05-01', end: '2026-05-03', color: 'red' },
  { id: 3, title: 'Conference', start: '2026-08-15', end: '2026-08-15', color: 'purple' },
]

export const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-200 text-red-800 border-red-300',
  blue: 'bg-blue-200 text-blue-800 border-blue-300',
  green: 'bg-green-200 text-green-800 border-green-300',
  purple: 'bg-purple-200 text-purple-800 border-purple-300',
  orange: 'bg-orange-200 text-orange-800 border-orange-300',
  yellow: 'bg-yellow-200 text-yellow-800 border-yellow-300',
  gray: 'bg-gray-200 text-gray-800 border-gray-300',
}
