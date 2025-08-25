import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import { Badge } from "../components/ui/badge"
import { Checkbox } from "../components/ui/checkbox"
import { DirectorySelector } from "../components/processing/DirectorySelector"
import { FileGrid } from "../components/processing/FileGrid"
import { ProcessingProgress } from "../components/processing/ProcessingProgress"
import { 
  FolderOpen, 
  Play, 
  Pause, 
  Square,
  CheckSquare,
  Square as SquareIcon
} from "lucide-react"
import { getDirectoryContents, processSelectedCards } from "../api/processing"
import { useToast } from "../hooks/useToast"

interface FileItem {
  id: string
  frontImage: string
  backImage: string
  filename: string
  valid: boolean
  selected: boolean
}

interface ProcessingStatus {
  isProcessing: boolean
  currentCard: string
  completed: number
  total: number
  speed: number
  estimatedTime: number
  errors: string[]
}

export function FileProcessing() {
  const [selectedDirectory, setSelectedDirectory] = useState<string>("")
  const [includeSubdirectories, setIncludeSubdirectories] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    currentCard: "",
    completed: 0,
    total: 0,
    speed: 0,
    estimatedTime: 0,
    errors: []
  })
  const { toast } = useToast()

  const handleDirectorySelect = async (directory: string) => {
    console.log('Selected directory:', directory)
    setSelectedDirectory(directory)
    setLoading(true)
    
    try {
      const contents = await getDirectoryContents(directory, includeSubdirectories)
      setFiles(contents.files)
      toast({
        title: "Directory Loaded",
        description: `Found ${contents.files.length} card pairs`
      })
    } catch (error) {
      console.error('Failed to load directory contents:', error)
      toast({
        title: "Error",
        description: "Failed to load directory contents",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    const allSelected = files.every(file => file.selected)
    setFiles(files.map(file => ({ ...file, selected: !allSelected })))
  }

  const handleFileSelect = (fileId: string, selected: boolean) => {
    setFiles(files.map(file => 
      file.id === fileId ? { ...file, selected } : file
    ))
  }

  const handleStartProcessing = async () => {
    const selectedFiles = files.filter(file => file.selected)
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one card pair to process",
        variant: "destructive"
      })
      return
    }

    console.log('Starting processing for', selectedFiles.length, 'files')
    setProcessingStatus({
      isProcessing: true,
      currentCard: "",
      completed: 0,
      total: selectedFiles.length,
      speed: 0,
      estimatedTime: 0,
      errors: []
    })

    try {
      await processSelectedCards(selectedFiles.map(f => f.id))
      toast({
        title: "Processing Complete",
        description: `Successfully processed ${selectedFiles.length} cards`
      })
    } catch (error) {
      console.error('Processing failed:', error)
      toast({
        title: "Processing Failed",
        description: "Some cards failed to process. Check the error log for details.",
        variant: "destructive"
      })
    } finally {
      setProcessingStatus(prev => ({ ...prev, isProcessing: false }))
    }
  }

  const selectedCount = files.filter(file => file.selected).length
  const validCount = files.filter(file => file.valid).length

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            File Processing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select and process card images for cataloging
          </p>
        </div>
      </div>

      {/* Directory Selection */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Directory Selection
          </CardTitle>
          <CardDescription>
            Choose the source directory containing your card images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DirectorySelector 
            onDirectorySelect={handleDirectorySelect}
            selectedDirectory={selectedDirectory}
          />
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="subdirectories"
              checked={includeSubdirectories}
              onCheckedChange={(checked) => setIncludeSubdirectories(checked as boolean)}
            />
            <label htmlFor="subdirectories" className="text-sm font-medium">
              Include subdirectories (recursive scan)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      {files.length > 0 && (
        <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  File Selection
                </CardTitle>
                <CardDescription>
                  {files.length} card pairs found • {validCount} valid • {selectedCount} selected
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {files.every(file => file.selected) ? (
                    <SquareIcon className="w-4 h-4" />
                  ) : (
                    <CheckSquare className="w-4 h-4" />
                  )}
                  {files.every(file => file.selected) ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  onClick={handleStartProcessing}
                  disabled={selectedCount === 0 || processingStatus.isProcessing}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Process Selected Cards
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FileGrid 
              files={files}
              onFileSelect={handleFileSelect}
              loading={loading}
            />
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {processingStatus.isProcessing && (
        <ProcessingProgress status={processingStatus} />
      )}
    </div>
  )
}