import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FileItem {
  id: string
  frontImage: string
  backImage: string
  filename: string
  valid: boolean
  selected: boolean
}

interface FileGridProps {
  files: FileItem[]
  onFileSelect: (fileId: string, selected: boolean) => void
  loading: boolean
}

export function FileGrid({ files, onFileSelect, loading }: FileGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleImageError = (imageId: string, imagePath: string) => {
    console.error(`Image failed to load: ${imageId} - Path: ${imagePath}`)
    setImageErrors(prev => new Set(prev).add(imageId))
  }

  const getImageUrl = (imagePath: string) => {
    // Encode the file path to handle spaces and special characters
    const encodedPath = encodeURIComponent(imagePath)
    const url = `http://localhost:3000/api/images/${encodedPath}`
    console.log(`Constructed image URL: ${url} for path: ${imagePath}`)
    return url
  }

  console.log(`FileGrid rendering with ${files.length} files:`, files)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-32 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No card pairs found in the selected directory.</p>
        <p className="text-sm mt-2">
          Make sure your images follow the naming convention: filename-front.jpg and filename-back.jpg
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        console.log(`Rendering file card:`, file)
        return (
          <Card
            key={file.id}
            className={`relative transition-all duration-200 hover:shadow-lg ${
              file.selected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Checkbox
                  checked={file.selected}
                  onCheckedChange={(checked) => onFileSelect(file.id, checked as boolean)}
                  className="mt-1"
                />
                <Badge variant={file.valid ? "default" : "destructive"} className="text-xs">
                  {file.valid ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {file.valid ? 'Valid' : 'Invalid'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Front</p>
                    {imageErrors.has(`${file.id}-front`) ? (
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(file.frontImage)}
                        alt={`${file.filename} front`}
                        className="w-full h-20 object-cover rounded border"
                        onError={() => handleImageError(`${file.id}-front`, file.frontImage)}
                        onLoad={() => console.log(`Front image loaded successfully: ${file.frontImage}`)}
                      />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Back</p>
                    {imageErrors.has(`${file.id}-back`) ? (
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(file.backImage)}
                        alt={`${file.filename} back`}
                        className="w-full h-20 object-cover rounded border"
                        onError={() => handleImageError(`${file.id}-back`, file.backImage)}
                        onLoad={() => console.log(`Back image loaded successfully: ${file.backImage}`)}
                      />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {file.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}