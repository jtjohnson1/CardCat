import { NavLink } from "react-router-dom"
import { cn } from "../lib/utils"
import { 
  LayoutDashboard, 
  FileImage, 
  Database, 
  Settings,
  ChevronRight
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'File Processing', href: '/processing', icon: FileImage },
  { name: 'Card Database', href: '/database', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50">
      <nav className="flex flex-col h-full p-4">
        <div className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}