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
      console.log('Loading cards from API...')
      const response = await getCards()
      console.log('API response:', response)
      
      // Safely extract cards array with proper fallback
      const cardsData = response?.data?.cards || []
      console.log('Extracted cards data:', cardsData)
      
      // Ensure cardsData is always an array
      const safeCardsArray = Array.isArray(cardsData) ? cardsData : []
      console.log('Safe cards array:', safeCardsArray)
      
      setCards(safeCardsArray)
      setFilteredCards(safeCardsArray)
    } catch (error) {
      console.error('Failed to load cards:', error)
      // Set empty arrays on error to prevent undefined issues
      setCards([])
      setFilteredCards([])
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
    // Ensure cards is always an array before filtering
    if (!Array.isArray(cards)) {
      console.warn('Cards is not an array:', cards)
      setFilteredCards([])
      return
    }

    console.log('Filtering cards, total:', cards.length)
    
    let filtered = cards.filter(card => {
      // Ensure card object exists and has required properties
      if (!card || typeof card !== 'object') {
        console.warn('Invalid card object:', card)
        return false
      }

      const matchesSearch = searchTerm === "" ||
        (card.playerName && card.playerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.team && card.team.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.setName && card.setName.toLowerCase().includes(searchTerm.toLowerCase()))

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

    console.log('Filtered cards:', filtered.length)
    setFilteredCards(filtered)
  }, [cards, searchTerm, filters])

  const handleDeleteSelected = async () => {
    if (!Array.isArray(selectedCards) || selectedCards.length === 0) return

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
    if (!Array.isArray(filteredCards)) {
      console.warn('FilteredCards is not an array:', filteredCards)
      return
    }

    if (selectedCards.length === filteredCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(filteredCards.map(card => card._id).filter(id => id))
    }
  }

  const handleCardSelect = (cardId: string, selected: boolean) => {
    if (!cardId) return
    
    if (selected) {
      setSelectedCards([...selectedCards, cardId])
    } else {
      setSelectedCards(selectedCards.filter(id => id !== cardId))
    }
  }

  // Ensure arrays are always defined for safe rendering
  const safeCards = Array.isArray(cards) ? cards : []
  const safeFilteredCards = Array.isArray(filteredCards) ? filteredCards : []
  const safeSelectedCards = Array.isArray(selectedCards) ? selectedCards : []

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
          {safeSelectedCards.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({safeSelectedCards.length})
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
                {safeFilteredCards.length} of {safeCards.length} cards
              </CardDescription>
            </div>
            {safeFilteredCards.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center gap-2"
              >
                {safeSelectedCards.length === safeFilteredCards.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <CardTable
            cards={safeFilteredCards}
            selectedCards={safeSelectedCards}
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
        itemCount={safeSelectedCards.length}
        itemType="cards"
      />
    </div>
  )
}