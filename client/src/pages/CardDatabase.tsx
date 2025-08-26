import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { CardTable } from "../components/database/CardTable"
import { CardFilters } from "../components/database/CardFilters"
import { CardDetailModal } from "../components/database/CardDetailModal"
import { DeleteConfirmDialog } from "../components/database/DeleteConfirmDialog"
import {
  Database,
  Search,
  Filter,
  Trash2,
  RefreshCw
} from "lucide-react"
import { getCards, deleteSelectedCards } from "../api/cards"
import { useToast } from "../hooks/useToast"

interface Card {
  _id: string
  manufacturer: string
  sport: string
  setName: string
  cardNumber: string
  playerName: string
  team: string
  year: number
  estimatedValue: number
  frontImage?: string
  backImage?: string
  condition?: string
  specialFeatures?: string[]
  processedAt: string
}

interface Filters {
  manufacturer: string
  sport: string
  yearRange: [number, number]
  valueRange: [number, number]
}

export function CardDatabase() {
  const [cards, setCards] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({
    manufacturer: "",
    sport: "",
    yearRange: [1980, 2024],
    valueRange: [0, 1000]
  })
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadCards = async () => {
    setLoading(true)
    try {
      const response = await getCards()
      setCards(response.data.cards || [])
      setFilteredCards(response.data.cards || [])
    } catch (error) {
      console.error('Failed to load cards:', error)
      toast({
        title: "Error",
        description: "Failed to load cards from database",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCards()
  }, [])

  useEffect(() => {
    let filtered = cards.filter(card => {
      const matchesSearch = searchTerm === "" || 
        card.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.setName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesManufacturer = filters.manufacturer === "" || 
        card.manufacturer === filters.manufacturer

      const matchesSport = filters.sport === "" || 
        card.sport === filters.sport

      const matchesYear = card.year >= filters.yearRange[0] && 
        card.year <= filters.yearRange[1]

      const matchesValue = card.estimatedValue >= filters.valueRange[0] && 
        card.estimatedValue <= filters.valueRange[1]

      return matchesSearch && matchesManufacturer && matchesSport && 
             matchesYear && matchesValue
    })

    setFilteredCards(filtered)
  }, [cards, searchTerm, filters])

  const handleDeleteSelected = async () => {
    if (selectedCards.length === 0) return

    try {
      await deleteSelectedCards(selectedCards)
      toast({
        title: "Success",
        description: `Deleted ${selectedCards.length} cards`
      })
      setSelectedCards([])
      setShowDeleteDialog(false)
      await loadCards()
    } catch (error) {
      console.error('Failed to delete cards:', error)
      toast({
        title: "Error",
        description: "Failed to delete selected cards",
        variant: "destructive"
      })
    }
  }

  const handleSelectAll = () => {
    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(filteredCards.map(card => card._id))
    }
  }

  const handleCardSelect = (cardId: string, selected: boolean) => {
    if (selected) {
      setSelectedCards([...selectedCards, cardId])
    } else {
      setSelectedCards(selectedCards.filter(id => id !== cardId))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Card Database
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and browse your card collection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadCards}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedCards.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedCards.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific cards in your collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by player name, team, or set..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
          </div>
          <CardFilters filters={filters} onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Card Collection
              </CardTitle>
              <CardDescription>
                {filteredCards.length} of {cards.length} cards
              </CardDescription>
            </div>
            {filteredCards.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedCards.length === filteredCards.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardTable
            cards={filteredCards}
            selectedCards={selectedCards}
            onCardSelect={handleCardSelect}
            onCardClick={setSelectedCard}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSelected}
        itemCount={selectedCards.length}
        itemType="cards"
      />
    </div>
  )
}