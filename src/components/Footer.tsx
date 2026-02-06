interface FooterProps {
  storageMode: 'localStorage' | 'file'
  fileName: string
  fsSupported: boolean
  onConnectFile: () => void
  onCreateFile: () => void
  onDisconnectFile: () => void
}

export default function Footer({
  storageMode,
  fileName,
  fsSupported,
  onConnectFile,
  onCreateFile,
  onDisconnectFile,
}: FooterProps) {
  return (
    <footer className="h-8 border-t border-ios-border bg-ios-bg text-xs text-gray-500 flex items-center justify-between px-6 z-40">
      <span>
        {storageMode === 'file' ? (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-green-600">description</span>
            <span className="text-gray-700 font-semibold">{fileName}</span>
          </span>
        ) : (
          'localStorage'
        )}
      </span>
      <div className="flex gap-4 items-center">
        {storageMode === 'file' ? (
          <button className="hover:text-gray-800 transition-colors" onClick={onDisconnectFile}>
            Disconnect
          </button>
        ) : fsSupported ? (
          <>
            <button className="hover:text-gray-800 transition-colors" onClick={onConnectFile}>
              Open JSON
            </button>
            <button className="hover:text-gray-800 transition-colors" onClick={onCreateFile}>
              Save as JSON
            </button>
          </>
        ) : (
          <span className="text-gray-400">File API: Chrome/Edge only</span>
        )}
        <button className="hover:text-gray-800 transition-colors">Calendar Settings</button>
      </div>
    </footer>
  )
}
