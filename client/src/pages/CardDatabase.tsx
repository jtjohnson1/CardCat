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
  Eye
} from "lucide-react"
import { getCards, deleteCards } from "../api/cards"
import { useToast } from "../hooks/useToast"

interface CardData {
  _id: string
  frontImage: string
  backImage: string
  manufacturer: string
  sport: string
  setName: string
  cardNumber: string
  player: string
  year: number
  estimatedValue: number
  processingDate: string
  selected?: boolean
}

interface FilterOptions {
  manufacturer: string
  sport: string
  yearRange: [number, number]
  valueRange: [number, number]
}

export function CardDatabase() {
  const [cards, setCards] = useState<CardData[]>([])
  const [filteredCards, setFilteredCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    manufacturer: "",
    sport: "",
    yearRange: [1950, 2024],
    valueRange: [0, 1000]
  })
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [sortField, setSortField] = useState<keyof CardData>("processingDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { toast } = useToast()

  useEffect(() => {
    const fetchCards = async () => {
      try {
        console.log('Fetching cards from database...')
        const data = await getCards()
        setCards(data.cards)
        setFilteredCards(data.cards)
      } catch (error) {
        console.error('Failed to fetch cards:', error)
        toast({
          title: "Error",
          description: "Failed to load card database",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [toast])

  useEffect(() => {
    let filtered = [...cards]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card =>
        card.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.setName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.sport.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply filters
    if (filters.manufacturer) {
      filtered = filtered.filter(card => card.manufacturer === filters.manufacturer)
    }
    if (filters.sport) {
      filtered = filtered.filter(card => card.sport === filters.sport)
    }
    filtered = filtered.filter(card =>
      card.year >= filters.yearRange[0] && card.year <= filters.yearRange[1]
    )
    filtered = filtered.filter(card =>
      card.estimatedValue >= filters.valueRange[0] && card.estimatedValue <= filters.valueRange[1]
    )

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })

    setFilteredCards(filtered)
  }, [cards, searchQuery, filters, sortField, sortDirection])

  const handleSort = (field: keyof CardData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    const allSelected = filteredCards.every(card => card.selected)
    setFilteredCards(filteredCards.map(card => ({ ...card, selected: !allSelected })))
  }

  const handleCardSelect = (cardId: string, selected: boolean) => {
    setFilteredCards(filteredCards.map(card =>
      card._id === cardId ? { ...card, selected } : card
    ))
  }

  const handleDeleteSelected = async () => {
    const selectedCards = filteredCards.filter(card => card.selected)
    if (selectedCards.length === 0) {
      toast({
        title: "No Cards Selected",
        description: "Please select at least one card to delete",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Deleting selected cards:', selectedCards.length)
      await deleteCards(selectedCards.map(card => card._id))
      
      // Remove deleted cards from state
      const deletedIds = selectedCards.map(card => card._id)
      setCards(cards.filter(card => !deletedIds.includes(card._id)))
      
      toast({
        title: "Cards Deleted",
        description: `Successfully deleted ${selectedCards.length} cards`
      })
    } catch (error) {
      console.error('Failed to delete cards:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete selected cards",
        variant: "destructive"
      })
    }
    
    setShowDeleteDialog(false)
  }

  const selectedCount = filteredCards.filter(card => card.selected).length

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Card Database
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse and manage your processed card collection
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredCards.length} cards
          </Badge>
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedCount})
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
                placeholder="Search by player, set, manufacturer, or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </Button>
          </div>
          
          <CardFilters
            filters={filters}
            onFiltersChange={setFilters}
            cards={cards}
          />
        </CardContent>
      </Card>

      {/* Cards Table */}
      <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Card Collection
              </CardTitle>
              <CardDescription>
                {filteredCards.length} cards found
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              {filteredCards.every(card => card.selected) ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CardTable
            cards={filteredCards}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onCardSelect={handleCardSelect}
            onCardView={(card) => setSelectedCard(card)}
          />
        </CardContent>
      </Card>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSelected}
        count={selectedCount}
      />
    </div>
  )
}