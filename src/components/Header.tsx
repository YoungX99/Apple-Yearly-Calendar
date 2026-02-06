import { YEAR } from '../constants'

interface HeaderProps {
  onTodayClick: () => void
  onAddEvent: () => void
}

export default function Header({ onTodayClick, onAddEvent }: HeaderProps) {
  return (
    <header className="h-16 border-b border-ios-border flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-40 relative">
      <div className="flex items-center gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{YEAR}</h1>
        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1 hover:bg-gray-100 rounded-full transition">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={onTodayClick}
            className="px-3 py-1 text-sm font-medium border border-ios-border rounded-md hover:bg-gray-50 transition bg-white shadow-sm text-black"
          >
            Today
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full transition">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="flex items-center bg-ios-grid rounded-lg p-1">
        <button className="px-4 py-1 text-sm text-gray-500 rounded hover:text-gray-900 transition">Day</button>
        <button className="px-4 py-1 text-sm text-gray-500 rounded hover:text-gray-900 transition">Week</button>
        <button className="px-4 py-1 text-sm text-gray-500 rounded hover:text-gray-900 transition">Month</button>
        <button className="px-4 py-1 text-sm font-semibold bg-white shadow-sm rounded text-gray-900 transition">
          Year
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2 top-1.5 text-gray-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Search"
            className="pl-9 pr-4 py-1.5 bg-ios-grid rounded-md text-sm border-none focus:ring-2 focus:ring-ios-blue/50 outline-none w-48 transition"
          />
        </div>
        <button
          onClick={onAddEvent}
          className="flex items-center gap-1 bg-ios-red hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition"
        >
          <span className="material-symbols-outlined text-lg">add</span> Event
        </button>
      </div>
    </header>
  )
}
