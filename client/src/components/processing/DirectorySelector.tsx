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
    // For web applications, we can't directly open a file dialog for directory selection
    // Users need to manually enter the directory path
    // Set a common default path as example
    const exampleDirectory = "/home/user/card-images"
    setInputValue(exampleDirectory)
  }

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      onDirectorySelect(inputValue.trim())
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter directory path (e.g., /home/user/cards or C:\Users\User\Cards)"
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
          title="Set example path"
        >
          <FolderOpen className="w-4 h-4" />
          Example
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
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Note: Enter the full path to your card images directory. The server must have access to this path.
      </p>
    </div>
  )
}