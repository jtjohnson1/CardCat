import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { AlertTriangle, CheckCircle } from "lucide-react"

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
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card
          key={file.id}
          className={`transition-all duration-200 hover:shadow-lg ${
            file.selected
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'hover:shadow-md'
          } ${
            !file.valid
              ? 'border-red-200 dark:border-red-800'
              : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Checkbox
                checked={file.selected}
                onCheckedChange={(checked) => onFileSelect(file.id, checked as boolean)}
                disabled={!file.valid}
              />
              <Badge variant={file.valid ? 'default' : 'destructive'} className="text-xs">
                {file.valid ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {file.valid ? 'Valid' : 'Invalid'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={file.frontImage}
                  alt="Card front"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTMzLjVMMTIwIDExMy41TDEwMCA5My41TDgwIDExMy41TDEwMCAxMzMuNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                  }}
                />
              </div>
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={file.backImage}
                  alt="Card back"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NyIgdmlld0JveD0iMCAwIDIwMCAyNjciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjY3IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTMzLjVMMTIwIDExMy41TDEwMCA5My41TDgwIDExMy41TDEwMCAxMzMuNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                  }}
                />
              </div>
            </div>

            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {file.filename}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}