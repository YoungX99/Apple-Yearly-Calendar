import { useState, useEffect, useRef } from 'react'
import { COLORS } from '../constants'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; start: string; end: string; color: string }) => void
}

export default function EventModal({ isOpen, onClose, onSubmit }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [color, setColor] = useState('red')
  const [visible, setVisible] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const todayStr = new Date().toISOString().split('T')[0]
      setStart(todayStr)
      setEnd(todayStr)
      setTitle('')
      setColor('red')
      setTimeout(() => {
        setVisible(true)
        titleRef.current?.focus()
      }, 10)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (new Date(start) > new Date(end)) {
      alert('End date must be after start date')
      return
    }
    onSubmit({ title, start, end, color })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden transform transition-transform duration-200 ${visible ? 'scale-100' : 'scale-95'}`}
      >
        <div className="px-4 py-3 border-b border-ios-border flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-900">New Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event Name"
              className="w-full text-lg border-b border-gray-200 focus:border-ios-blue outline-none py-1 bg-transparent placeholder-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input
                type="date"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-ios-blue outline-none text-gray-600 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
              <input
                type="date"
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1.5 focus:ring-1 focus:ring-ios-blue outline-none text-gray-600 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Color</label>
            <div className="flex gap-3">
              {COLORS.map(c => (
                <label key={c.name} className="cursor-pointer relative">
                  <input
                    type="radio"
                    name="color"
                    value={c.name}
                    checked={color === c.name}
                    onChange={() => setColor(c.name)}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-6 h-6 rounded-full ${c.hex} peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-gray-400 hover:opacity-80 transition`}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-md shadow-sm transition"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
