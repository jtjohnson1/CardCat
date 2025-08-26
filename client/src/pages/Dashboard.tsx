import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  Database,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { getDashboardStats } from "../api/dashboard"
import { useToast } from "../hooks/useToast"

interface DashboardStats {
  totalCards: number
  totalValue: number
  averageValue: number
  cardsProcessedToday: number
  cardsByManufacturer: Array<{ _id: string; count: number }>
  cardsBySport: Array<{ _id: string; count: number }>
  recentCards: Array<{
    _id: string
    playerName: string
    manufacturer: string
    year: number
    estimatedValue: number
    createdAt: string
  }>
  mostValuableCards: Array<{
    _id: string
    playerName: string
    manufacturer: string
    year: number
    estimatedValue: number
    frontImageUrl?: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Loading dashboard stats...')
      const data = await getDashboardStats()
      console.log('Dashboard stats loaded:', data)
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard statistics'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your card collection
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mr-4" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your card collection
            </p>
          </div>
          <Button onClick={loadDashboardStats} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Failed to Load Dashboard</h3>
            <p className="text-gray-500 text-center mb-4">
              {error || 'Unable to load dashboard statistics'}
            </p>
            <Button onClick={loadDashboardStats}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of your card collection
          </p>
        </div>
        <Button onClick={loadDashboardStats} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cardsProcessedToday} processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              estimated collection value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              per card
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentCards.length}</div>
            <p className="text-xs text-muted-foreground">
              cards added this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cards by Manufacturer */}
        <Card>
          <CardHeader>
            <CardTitle>Cards by Manufacturer</CardTitle>
            <CardDescription>
              Distribution of cards across different manufacturers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.cardsByManufacturer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cards by Sport */}
        <Card>
          <CardHeader>
            <CardTitle>Cards by Sport</CardTitle>
            <CardDescription>
              Breakdown of your collection by sport
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.cardsBySport}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.cardsBySport.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cards and Most Valuable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recently Added Cards
            </CardTitle>
            <CardDescription>
              Cards added to your collection this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCards.length > 0 ? (
                stats.recentCards.slice(0, 5).map((card) => (
                  <div key={card._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{card.playerName}</p>
                      <p className="text-sm text-gray-500">
                        {card.year} {card.manufacturer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${card.estimatedValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No cards added this week
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Most Valuable Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Valuable Cards
            </CardTitle>
            <CardDescription>
              Your highest valued cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.mostValuableCards.length > 0 ? (
                stats.mostValuableCards.map((card) => (
                  <div key={card._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{card.playerName}</p>
                      <p className="text-sm text-gray-500">
                        {card.year} {card.manufacturer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${card.estimatedValue.toFixed(2)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        Top Value
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No cards in collection
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}