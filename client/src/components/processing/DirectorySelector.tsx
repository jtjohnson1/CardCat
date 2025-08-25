import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { FolderOpen, Search } from "lucide-react"

interface DirectorySelectorProps {
  onDirectorySelect: (directory: string) => void
  selectedDirectory: string
}

export function DirectorySelector({ onDirectorySelect, selectedDirectory }: DirectorySelectorProps) {
  const [inputValue, setInputValue] = useState(selectedDirectory)

  const handleBrowse = () => {
    // In a real implementation, this would open a file dialog
    // For now, we'll simulate selecting a directory
    const mockDirectory = "/home/user/card-images"
    setInputValue(mockDirectory)
    onDirectorySelect(mockDirectory)
  }

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      onDirectorySelect(inputValue.trim())
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Enter directory path or click Browse..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
          className="bg-white dark:bg-gray-800"
        />
      </div>
      <Button
        variant="outline"
        onClick={handleBrowse}
        className="flex items-center gap-2"
      >
        <FolderOpen className="w-4 h-4" />
        Browse
      </Button>
      {inputValue !== selectedDirectory && (
        <Button
          onClick={handleInputSubmit}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Load
        </Button>
      )}
    </div>
  )
}