import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Progress } from "../ui/progress"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import {
  Activity,
  Clock,
  AlertCircle,
  Pause,
  Square,
  Zap
} from "lucide-react"

interface ProcessingStatus {
  isProcessing: boolean
  currentCard: string
  completed: number
  total: number
  speed: number
  estimatedTime: number
  errors: string[]
}

interface ProcessingProgressProps {
  status: ProcessingStatus
}

export function ProcessingProgress({ status }: ProcessingProgressProps) {
  console.log('=== PROCESSING PROGRESS DEBUG ===')
  console.log('Processing status received:', status)
  console.log('Is processing:', status.isProcessing)
  console.log('Current card:', status.currentCard)
  console.log('Progress:', status.completed, '/', status.total)
  console.log('Speed:', status.speed, 'cards/min')
  console.log('Estimated time:', status.estimatedTime, 'seconds')
  console.log('Errors count:', status.errors.length)

  const progressPercentage = status.total > 0 ? (status.completed / status.total) * 100 : 0
  console.log('Calculated progress percentage:', progressPercentage)

  const formatTime = (seconds: number) => {
    console.log('Formatting time for seconds:', seconds)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    let formattedTime = ''
    if (hours > 0) {
      formattedTime = `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      formattedTime = `${minutes}m ${secs}s`
    } else {
      formattedTime = `${secs}s`
    }
    console.log('Formatted time result:', formattedTime)
    return formattedTime
  }

  console.log('Rendering ProcessingProgress component')

  return (
    <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 animate-pulse text-blue-500" />
              Processing Progress
            </CardTitle>
            <CardDescription>
              Processing card images and extracting information
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {status.completed} of {status.total} cards
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-center text-2xl font-bold text-blue-600 dark:text-blue-400">
            {progressPercentage.toFixed(1)}%
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Current Card
              </span>
            </div>
            <p className="text-sm text-blue-900 dark:text-blue-100 truncate">
              {status.currentCard || "Initializing..."}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Processing Speed
              </span>
            </div>
            <p className="text-sm text-green-900 dark:text-green-100">
              {status.speed.toFixed(1)} cards/min
            </p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Time Remaining
              </span>
            </div>
            <p className="text-sm text-orange-900 dark:text-orange-100">
              {formatTime(status.estimatedTime)}
            </p>
          </div>
        </div>

        {/* Error Log */}
        {status.errors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Error Log</span>
              <Badge variant="destructive" className="text-xs">
                {status.errors.length}
              </Badge>
            </div>
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {status.errors.map((error, index) => {
                      console.log(`Rendering error ${index}:`, error)
                      return (
                        <div key={index}>
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {error}
                          </p>
                          {index < status.errors.length - 1 && <Separator className="my-2" />}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}