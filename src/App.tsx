import { useState, useRef, useCallback } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import Footer from './components/Footer'
import EventModal from './components/EventModal'
import { useEvents } from './hooks/useEvents'

export default function App() {
  const { events, addEvent, deleteEvent, storageMode, fileName, fsSupported, connectFile, createFile, disconnectFile, downloadEvents } =
    useEvents()
  const [modalOpen, setModalOpen] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

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
      <Header onTodayClick={handleTodayClick} onAddEvent={() => setModalOpen(true)} />
      <CalendarGrid ref={calendarRef} events={events} onDeleteEvent={deleteEvent} />
      <Footer
        storageMode={storageMode}
        fileName={fileName}
        fsSupported={fsSupported}
        onConnectFile={connectFile}
        onCreateFile={createFile}
        onDisconnectFile={disconnectFile}
        onDownloadEvents={downloadEvents}
      />
      <EventModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmit={addEvent} />
    </div>
  )
}
