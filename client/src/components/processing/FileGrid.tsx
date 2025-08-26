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

  const handleImageError = (imageId: string, imagePath: string, error: any) => {
    console.error('=== IMAGE ERROR DEBUG ===')
    console.error(`Image failed to load: ${imageId}`)
    console.error(`Image path: ${imagePath}`)
    console.error('Error details:', error)
    console.error('Error target src:', error.target?.src)
    console.error('Error target naturalWidth:', error.target?.naturalWidth)
    console.error('Error target naturalHeight:', error.target?.naturalHeight)
    console.error('=== END IMAGE ERROR DEBUG ===')
    setImageErrors(prev => new Set(prev).add(imageId))
  }

  const getImageUrl = (imagePath: string) => {
    console.log('=== IMAGE URL CONSTRUCTION DEBUG ===')
    console.log('Original image path:', imagePath)
    
    // Encode the file path to handle spaces and special characters
    const encodedPath = encodeURIComponent(imagePath)
    console.log('Encoded path:', encodedPath)
    
    const url = `http://localhost:3000/api/images/${encodedPath}`
    console.log('Final constructed URL:', url)
    console.log('=== END IMAGE URL CONSTRUCTION DEBUG ===')
    
    return url
  }

  console.log('=== FILEGRID RENDER DEBUG ===')
  console.log(`FileGrid rendering with ${files.length} files`)
  console.log('Files data:', files)
  console.log('Loading state:', loading)
  console.log('Image errors:', Array.from(imageErrors))
  console.log('=== END FILEGRID RENDER DEBUG ===')

  if (loading) {
    console.log('FileGrid: Rendering loading skeletons')
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
    console.log('FileGrid: No files to display')
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

  console.log('FileGrid: Rendering file grid with', files.length, 'files')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        console.log('=== FILE CARD RENDER DEBUG ===')
        console.log('Rendering file card for:', file.filename)
        console.log('File data:', file)
        console.log('Front image path:', file.frontImage)
        console.log('Back image path:', file.backImage)
        console.log('File valid:', file.valid)
        console.log('File selected:', file.selected)
        
        const frontImageUrl = getImageUrl(file.frontImage)
        const backImageUrl = getImageUrl(file.backImage)
        console.log('Front image URL:', frontImageUrl)
        console.log('Back image URL:', backImageUrl)
        console.log('=== END FILE CARD RENDER DEBUG ===')
        
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
                  onCheckedChange={(checked) => {
                    console.log('=== CHECKBOX CHANGE DEBUG ===')
                    console.log('File ID:', file.id)
                    console.log('New checked state:', checked)
                    console.log('=== END CHECKBOX CHANGE DEBUG ===')
                    onFileSelect(file.id, checked as boolean)
                  }}
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
                        src={frontImageUrl}
                        alt={`${file.filename} front`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(error) => {
                          console.log('=== FRONT IMAGE ERROR ===')
                          handleImageError(`${file.id}-front`, file.frontImage, error)
                        }}
                        onLoad={() => {
                          console.log('=== FRONT IMAGE SUCCESS ===')
                          console.log(`Front image loaded successfully: ${file.frontImage}`)
                          console.log('Image URL that loaded:', frontImageUrl)
                          console.log('=== END FRONT IMAGE SUCCESS ===')
                        }}
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
                        src={backImageUrl}
                        alt={`${file.filename} back`}
                        className="w-full h-20 object-cover rounded border"
                        onError={(error) => {
                          console.log('=== BACK IMAGE ERROR ===')
                          handleImageError(`${file.id}-back`, file.backImage, error)
                        }}
                        onLoad={() => {
                          console.log('=== BACK IMAGE SUCCESS ===')
                          console.log(`Back image loaded successfully: ${file.backImage}`)
                          console.log('Image URL that loaded:', backImageUrl)
                          console.log('=== END BACK IMAGE SUCCESS ===')
                        }}
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