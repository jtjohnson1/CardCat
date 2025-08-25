import { Activity, Wifi, WifiOff } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { Badge } from "./ui/badge"
import { useSystemStatus } from "../hooks/useSystemStatus"

export function Header() {
  const { ollamaStatus, databaseStatus } = useSystemStatus()

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CardCataloger
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={ollamaStatus === 'connected' ? 'default' : 'destructive'} className="text-xs">
              {ollamaStatus === 'connected' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              Ollama
            </Badge>
            <Badge variant={databaseStatus === 'connected' ? 'default' : 'destructive'} className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Database
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}