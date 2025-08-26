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
  console.log('=== CardDatabase component rendering ===')
  
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
    console.log('=== CardDatabase useEffect triggered ===')
    loadCards()
  }, [])

  useEffect(() => {
    console.log('=== Filtering cards ===')
    console.log('Total cards before filtering:', cards.length)
    console.log('Search query:', searchQuery)
    console.log('Filters:', filters)
    
    filterCards()
  }, [cards, searchQuery, filters])

  const loadCards = async () => {
    console.log('=== loadCards function called ===')
    setLoading(true)
    
    try {
      console.log('Making API call to getCards...')
      const response = await getCards()
      console.log('API response received:', response)
      console.log('Response type:', typeof response)
      console.log('Response keys:', Object.keys(response || {}))
      
      if (response && response.cards) {
        console.log('Cards array found in response:', response.cards.length, 'cards')
        console.log('First card sample:', response.cards[0])
        setCards(response.cards)
      } else if (Array.isArray(response)) {
        console.log('Response is array:', response.length, 'cards')
        console.log('First card sample:', response[0])
        setCards(response)
      } else {
        console.error('Unexpected response format:', response)
        setCards([])
      }
      
      toast({
        title: "Cards Loaded",
        description: `Loaded ${response?.cards?.length || response?.length || 0} cards from database`
      })
    } catch (error) {
      console.error('Error loading cards:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      
      toast({
        title: "Error",
        description: `Failed to load cards: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      })
      setCards([])
    } finally {
      console.log('loadCards completed, setting loading to false')
      setLoading(false)
    }
  }

  const filterCards = () => {
    console.log('=== filterCards function called ===')
    
    let filtered = [...cards]
    console.log('Starting with', filtered.length, 'cards')

    // Apply search query
    if (searchQuery.trim()) {
      console.log('Applying search query:', searchQuery)
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(card =>
        card.playerName?.toLowerCase().includes(query) ||
        card.manufacturer?.toLowerCase().includes(query) ||
        card.setName?.toLowerCase().includes(query) ||
        card.team?.toLowerCase().includes(query) ||
        card.cardNumber?.toLowerCase().includes(query)
      )
      console.log('After search filter:', filtered.length, 'cards')
    }

    // Apply filters
    if (filters.manufacturer) {
      console.log('Applying manufacturer filter:', filters.manufacturer)
      filtered = filtered.filter(card => 
        card.manufacturer?.toLowerCase() === filters.manufacturer.toLowerCase()
      )
      console.log('After manufacturer filter:', filtered.length, 'cards')
    }

    if (filters.sport) {
      console.log('Applying sport filter:', filters.sport)
      filtered = filtered.filter(card => 
        card.sport?.toLowerCase() === filters.sport.toLowerCase()
      )
      console.log('After sport filter:', filtered.length, 'cards')
    }

    // Year range filter
    filtered = filtered.filter(card => 
      card.year >= filters.yearRange[0] && card.year <= filters.yearRange[1]
    )
    console.log('After year filter:', filtered.length, 'cards')

    // Value range filter
    filtered = filtered.filter(card => 
      card.estimatedValue >= filters.valueRange[0] && card.estimatedValue <= filters.valueRange[1]
    )
    console.log('After value filter:', filtered.length, 'cards')

    console.log('Final filtered cards:', filtered.length)
    setFilteredCards(filtered)
  }

  const handleCardSelect = (cardId: string, selected: boolean) => {
    console.log('Card selection changed:', cardId, selected)
    if (selected) {
      setSelectedCards(prev => [...prev, cardId])
    } else {
      setSelectedCards(prev => prev.filter(id => id !== cardId))
    }
  }

  const handleSelectAll = () => {
    console.log('Select all toggled')
    const allSelected = selectedCards.length === filteredCards.length
    if (allSelected) {
      console.log('Deselecting all cards')
      setSelectedCards([])
    } else {
      console.log('Selecting all filtered cards:', filteredCards.length)
      setSelectedCards(filteredCards.map(card => card._id))
    }
  }

  const handleCardDetail = (card: CardData) => {
    console.log('Opening card detail for:', card._id, card.playerName)
    setSelectedCard(card)
    setShowDetailModal(true)
  }

  const handleDeleteSelected = () => {
    console.log('Delete selected clicked, selected cards:', selectedCards.length)
    if (selectedCards.length === 0) {
      toast({
        title: "No Cards Selected",
        description: "Please select at least one card to delete",
        variant: "destructive"
      })
      return
    }
    setShowDeleteDialog(true)
  }

  const handleDeleteCard = (cardId: string) => {
    console.log('\n=== HANDLE DELETE CARD CALLED ===')
    console.log('Card ID to delete:', cardId)
    console.log('Card ID type:', typeof cardId)
    console.log('Card ID length:', cardId?.length)
    
    // Find the card in our current cards array
    const cardToDeleteObj = cards.find(card => card._id === cardId)
    console.log('Found card object:', cardToDeleteObj)
    
    if (!cardToDeleteObj) {
      console.error('❌ Card not found in current cards array')
      toast({
        title: "Error",
        description: "Card not found",
        variant: "destructive"
      })
      return
    }

    console.log('Setting cardToDelete and showing delete dialog...')
    setCardToDelete(cardId)
    setSelectedCards([cardId])
    setShowDeleteDialog(true)
    console.log('✅ Delete dialog should now be visible')
  }

  const confirmDelete = async () => {
    console.log('\n=== CONFIRM DELETE CALLED ===')
    console.log('Cards to delete:', selectedCards)
    console.log('Single card to delete:', cardToDelete)
    
    try {
      let response
      
      if (cardToDelete) {
        // Single card delete
        console.log('Calling deleteCard API for single card:', cardToDelete)
        response = await deleteCard(cardToDelete)
        console.log('Single delete response:', response)
      } else if (selectedCards.length > 0) {
        // Multiple cards delete
        console.log('Calling deleteCards API for multiple cards:', selectedCards)
        response = await deleteCards(selectedCards)
        console.log('Multiple delete response:', response)
      } else {
        console.error('❌ No cards to delete')
        return
      }

      console.log('✅ Delete operation completed successfully')
      
      toast({
        title: "Cards Deleted",
        description: `Successfully deleted ${response.deletedCount || 1} cards`
      })

      // Reload cards
      console.log('Reloading cards after delete...')
      await loadCards()
      
      // Reset state
      setSelectedCards([])
      setCardToDelete(null)
      setShowDeleteDialog(false)
      
      console.log('✅ Delete operation and cleanup completed')
      
    } catch (error) {
      console.error('❌ Error during delete operation:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      
      toast({
        title: "Error",
        description: `Failed to delete cards: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      })
    }
  }

  console.log('=== CardDatabase render state ===')
  console.log('Loading:', loading)
  console.log('Total cards:', cards.length)
  console.log('Filtered cards:', filteredCards.length)
  console.log('Selected cards:', selectedCards.length)
  console.log('Show delete dialog:', showDeleteDialog)
  console.log('Card to delete:', cardToDelete)

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
                onClick={handleDeleteSelected}
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
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          console.log('Delete dialog closed')
          setShowDeleteDialog(false)
          setCardToDelete(null)
          setSelectedCards([])
        }}
        onConfirm={confirmDelete}
        itemCount={selectedCards.length}
      />
    </div>
  )
}