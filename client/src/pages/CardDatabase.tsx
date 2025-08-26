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
  RefreshCw,
  Download,
  Upload
} from "lucide-react"
import { getCards, deleteCards, deleteCard } from "../api/cards"
import { useToast } from "../hooks/useToast"

interface CardData {
  _id: string
  id: string
  manufacturer: string
  sport: string
  setName: string
  cardNumber: string
  playerName: string
  team: string
  year: number
  condition: string
  specialFeatures: string[]
  estimatedValue: number
  frontImagePath: string
  backImagePath: string
  frontImageUrl?: string
  backImageUrl?: string
  processedAt: string
  createdAt: string
  updatedAt: string
}

interface Filters {
  manufacturer: string
  sport: string
  yearRange: [number, number]
  valueRange: [number, number]
}

export function CardDatabase() {
  const [cards, setCards] = useState<CardData[]>([])
  const [filteredCards, setFilteredCards] = useState<CardData[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Filters>({
    manufacturer: "",
    sport: "",
    yearRange: [1950, 2024],
    valueRange: [0, 1000]
  })
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadCards()
  }, [])

  useEffect(() => {
    filterCards()
  }, [cards, searchQuery, filters])

  const loadCards = async () => {
    setLoading(true)
    try {
      const response = await getCards()

      if (response && response.cards) {
        setCards(response.cards)
      } else if (Array.isArray(response)) {
        setCards(response)
      } else {
        setCards([])
      }

      toast({
        title: "Cards Loaded",
        description: `Loaded ${response?.cards?.length || response?.length || 0} cards from database`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load cards: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      })
      setCards([])
    } finally {
      setLoading(false)
    }
  }

  const filterCards = () => {
    let filtered = [...cards]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        card.playerName?.toLowerCase().includes(query) ||
        card.manufacturer?.toLowerCase().includes(query) ||
        card.setName?.toLowerCase().includes(query) ||
        card.team?.toLowerCase().includes(query) ||
        card.cardNumber?.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.manufacturer) {
      filtered = filtered.filter(card =>
        card.manufacturer?.toLowerCase() === filters.manufacturer.toLowerCase()
      )
    }

    if (filters.sport) {
      filtered = filtered.filter(card =>
        card.sport?.toLowerCase() === filters.sport.toLowerCase()
      )
    }

    // Year range filter
    filtered = filtered.filter(card =>
      card.year >= filters.yearRange[0] && card.year <= filters.yearRange[1]
    )

    // Value range filter
    filtered = filtered.filter(card =>
      card.estimatedValue >= filters.valueRange[0] && card.estimatedValue <= filters.valueRange[1]
    )

    setFilteredCards(filtered)
  }

  const handleCardSelect = (cardId: string, selected: boolean) => {
    console.log('\n🔵 CARD SELECT EVENT')
    console.log('Card ID:', cardId)
    console.log('Selected:', selected)
    console.log('Current selectedCards before:', selectedCards)

    if (selected) {
      const newSelection = [...selectedCards, cardId]
      console.log('Adding to selection, new array:', newSelection)
      setSelectedCards(newSelection)
    } else {
      const newSelection = selectedCards.filter(id => id !== cardId)
      console.log('Removing from selection, new array:', newSelection)
      setSelectedCards(newSelection)
    }
  }

  const handleSelectAll = () => {
    console.log('\n🔵 SELECT ALL EVENT')
    console.log('Current selectedCards:', selectedCards)
    console.log('Current filteredCards count:', filteredCards.length)

    const allSelected = selectedCards.length === filteredCards.length && filteredCards.length > 0
    console.log('All selected?', allSelected)

    if (allSelected) {
      console.log('Deselecting all')
      setSelectedCards([])
    } else {
      // Use _id consistently for selection
      const newSelection = filteredCards.map(card => card._id).filter(id => id) // Filter out any undefined ids
      console.log('Selecting all, new selection:', newSelection)
      setSelectedCards(newSelection)
    }
  }

  const handleCardDetail = (card: CardData) => {
    setSelectedCard(card)
    setShowDetailModal(true)
  }

  const handleDeleteSelected = () => {
    console.log('\n🔴 DELETE SELECTED BUTTON CLICKED!')
    console.log('Function handleDeleteSelected called')
    console.log('Current selectedCards:', selectedCards)
    console.log('Selected cards length:', selectedCards.length)
    console.log('Current showDeleteDialog state:', showDeleteDialog)

    if (selectedCards.length === 0) {
      console.log('❌ No cards selected, showing toast')
      toast({
        title: "No Cards Selected",
        description: "Please select at least one card to delete",
        variant: "destructive"
      })
      return
    }

    console.log('✅ Cards are selected, setting showDeleteDialog to true')
    console.log('About to call setShowDeleteDialog(true)...')
    
    setShowDeleteDialog(true)
    
    console.log('✅ setShowDeleteDialog(true) called')
    console.log('showDeleteDialog should now be true')
  }

  const handleDeleteCard = (cardId: string) => {
    console.log('\n🔴 DELETE SINGLE CARD')
    console.log('Card ID to delete:', cardId)

    const cardToDeleteObj = cards.find(card => card._id === cardId)
    if (!cardToDeleteObj) {
      toast({
        title: "Error",
        description: "Card not found",
        variant: "destructive"
      })
      return
    }

    setCardToDelete(cardId)
    setSelectedCards([cardId])
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    console.log('\n🔴 CONFIRM DELETE CALLED')
    console.log('Cards to delete:', selectedCards)
    console.log('Single card to delete:', cardToDelete)

    try {
      let response

      if (cardToDelete) {
        // Single card delete
        console.log('Deleting single card:', cardToDelete)
        response = await deleteCard(cardToDelete)
      } else if (selectedCards.length > 0) {
        // Multiple cards delete
        console.log('Deleting multiple cards:', selectedCards)
        response = await deleteCards(selectedCards)
      } else {
        console.log('❌ No cards to delete')
        return
      }

      console.log('✅ Delete API response:', response)

      toast({
        title: "Cards Deleted",
        description: `Successfully deleted ${response.deletedCount || 1} cards`
      })

      // Reload cards
      await loadCards()

      // Reset state
      setSelectedCards([])
      setCardToDelete(null)
      setShowDeleteDialog(false)

    } catch (error) {
      console.error('❌ Delete error:', error)
      toast({
        title: "Error",
        description: `Failed to delete cards: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      })
    }
  }

  // Log render state
  console.log('\n=== RENDER STATE ===')
  console.log('selectedCards:', selectedCards)
  console.log('selectedCards.length:', selectedCards.length)
  console.log('showDeleteDialog:', showDeleteDialog)
  console.log('Delete button should be visible:', selectedCards.length > 0)

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
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cards.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredCards.length} filtered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Badge variant="secondary">{selectedCards.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCards.length}</div>
            <p className="text-xs text-muted-foreground">
              cards selected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredCards.reduce((sum, card) => sum + card.estimatedValue, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              estimated value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredCards.length > 0 ? (filteredCards.reduce((sum, card) => sum + card.estimatedValue, 0) / filteredCards.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              per card
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
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
                placeholder="Search by player, manufacturer, set, team, or card number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            {selectedCards.length > 0 && (
              <Button
                variant="destructive"
                onClick={(e) => {
                  console.log('\n🔴 DELETE BUTTON CLICK EVENT!')
                  console.log('Button clicked! Event:', e.type)
                  console.log('Event target:', e.target)
                  console.log('Current target:', e.currentTarget)
                  console.log('Calling handleDeleteSelected...')
                  
                  handleDeleteSelected()
                  
                  console.log('handleDeleteSelected call completed')
                }}
                onMouseDown={(e) => {
                  console.log('🔴 DELETE BUTTON MOUSE DOWN')
                }}
                onMouseUp={(e) => {
                  console.log('🔴 DELETE BUTTON MOUSE UP')
                }}
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedCards.length})
              </Button>
            )}
          </div>

          <CardFilters
            filters={filters}
            onFiltersChange={setFilters}
            cards={cards}
          />
        </CardContent>
      </Card>

      {/* Cards Table */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mr-4" />
            <span>Loading cards...</span>
          </CardContent>
        </Card>
      ) : (
        <CardTable
          cards={filteredCards}
          selectedCards={selectedCards}
          onCardSelect={handleCardSelect}
          onSelectAll={handleSelectAll}
          onCardDetail={handleCardDetail}
          onDeleteSelected={handleDeleteSelected}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedCard(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      {console.log('Rendering DeleteConfirmDialog with showDeleteDialog:', showDeleteDialog)}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          console.log('\n🔴 DELETE DIALOG CLOSE EVENT')
          setShowDeleteDialog(false)
          setCardToDelete(null)
          setSelectedCards([])
        }}
        onConfirm={() => {
          console.log('\n🔴 DELETE DIALOG CONFIRM EVENT')
          confirmDelete()
        }}
        itemCount={selectedCards.length}
      />
    </div>
  )
}