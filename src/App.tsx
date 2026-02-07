import { useState, useRef, useCallback } from 'react'
import type { CalendarEvent } from './types'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import Footer from './components/Footer'
import EventModal from './components/EventModal'
import { useEvents } from './hooks/useEvents'
import { useDeleteEvent } from './hooks/useDeleteEvent'

export default function App() {
  const { events, addEvent, deleteEvent, updateEvent, storageMode, fileName, fsSupported, connectFile, createFile, disconnectFile, downloadEvents } =
    useEvents()
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const modalOpen = newModalOpen || editingEvent !== null

  const handleModalClose = useCallback(() => {
    setNewModalOpen(false)
    setEditingEvent(null)
  }, [])

  const handleModalSubmit = useCallback(
    (data: { title: string; start: string; end: string; color: string }) => {
      if (editingEvent) {
        updateEvent(editingEvent.id, data)
      } else {
        addEvent(data)
      }
    },
    [editingEvent, updateEvent, addEvent],
  )

  const confirmDelete = useDeleteEvent(deleteEvent)

  const handleTodayClick = useCallback(() => {
    const todayCell = document.getElementById('cell-today')
    if (todayCell) {
      todayCell.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      todayCell.classList.add('ring-4')
      setTimeout(() => todayCell.classList.remove('ring-4'), 1000)
    } else {
      alert('Current date is not in the year 2026.')
    }
  }, [])

  return (
    <div className="bg-white text-gray-800 h-screen flex flex-col font-sans antialiased">
      <Header onTodayClick={handleTodayClick} onAddEvent={() => setNewModalOpen(true)} />
      <CalendarGrid ref={calendarRef} events={events} onDeleteEvent={deleteEvent} onEditEvent={setEditingEvent} />
      <Footer
        storageMode={storageMode}
        fileName={fileName}
        fsSupported={fsSupported}
        onConnectFile={connectFile}
        onCreateFile={createFile}
        onDisconnectFile={disconnectFile}
        onDownloadEvents={downloadEvents}
      />
      <EventModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingEvent={editingEvent}
        onDelete={confirmDelete}
      />
    </div>
  )
}
