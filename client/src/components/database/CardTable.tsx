import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Trash2,
  AlertCircle
} from "lucide-react"

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

interface CardTableProps {
  cards: CardData[]
  selectedCards: string[]
  onCardSelect: (cardId: string, selected: boolean) => void
  onSelectAll: () => void
  onCardDetail: (card: CardData) => void
  onDeleteSelected: () => void
  onDeleteCard: (cardId: string) => void
}

type SortField = keyof CardData
type SortDirection = 'asc' | 'desc'

export function CardTable({
  cards,
  selectedCards,
  onCardSelect,
  onSelectAll,
  onCardDetail,
  onDeleteSelected,
  onDeleteCard
}: CardTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedCards = [...cards].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  const getImageUrl = (card: CardData, type: 'front' | 'back') => {
    if (type === 'front') {
      return card.frontImageUrl || `/api/images/${encodeURIComponent(card.frontImagePath)}`
    } else {
      return card.backImageUrl || `/api/images/${encodeURIComponent(card.backImagePath)}`
    }
  }

  const handleDeleteClick = (card: CardData) => {
    console.log('\n=== DELETE BUTTON CLICKED ===')
    console.log('Card to delete:', {
      _id: card._id,
      id: card.id,
      playerName: card.playerName,
      manufacturer: card.manufacturer
    })
    console.log('onDeleteCard function type:', typeof onDeleteCard)
    console.log('onDeleteCard function:', onDeleteCard)
    
    try {
      console.log('Calling onDeleteCard with card._id:', card._id)
      onDeleteCard(card._id)
      console.log('✅ onDeleteCard called successfully')
    } catch (error) {
      console.error('❌ Error calling onDeleteCard:', error)
    }
  }

  const allSelected = cards.length > 0 && selectedCards.length === cards.length

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Cards Found</h3>
          <p className="text-gray-500 text-center">
            No cards match your current filters. Try adjusting your search criteria or process some card images.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead className="w-32">Images</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('manufacturer')}
                    className="h-auto p-0 font-semibold"
                  >
                    Manufacturer {getSortIcon('manufacturer')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('sport')}
                    className="h-auto p-0 font-semibold"
                  >
                    Sport {getSortIcon('sport')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('setName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Set Name {getSortIcon('setName')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('cardNumber')}
                    className="h-auto p-0 font-semibold"
                  >
                    Card # {getSortIcon('cardNumber')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('playerName')}
                    className="h-auto p-0 font-semibold"
                  >
                    Player {getSortIcon('playerName')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('year')}
                    className="h-auto p-0 font-semibold"
                  >
                    Year {getSortIcon('year')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('estimatedValue')}
                    className="h-auto p-0 font-semibold"
                  >
                    Value {getSortIcon('estimatedValue')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('processedAt')}
                    className="h-auto p-0 font-semibold"
                  >
                    Processed {getSortIcon('processedAt')}
                  </Button>
                </TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCards.map((card) => (
                <TableRow key={card._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell>
                    <Checkbox
                      checked={selectedCards.includes(card._id)}
                      onCheckedChange={(checked) => onCardSelect(card._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <img
                        src={getImageUrl(card, 'front')}
                        alt={`${card.playerName} front`}
                        className="w-12 h-16 object-cover rounded border"
                        onError={(e) => {
                          console.error('Failed to load front image:', getImageUrl(card, 'front'))
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMiAyMCAyNCAyMiAyNCAyNFYyOEMyNCAzMCAyMiAzMiAyMCAzMkgxNkMxNCAzMiAxMiAzMCAxMiAyOFYyNEMxMiAyMiAxNCAyMCAxNiAyMEgyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                      <img
                        src={getImageUrl(card, 'back')}
                        alt={`${card.playerName} back`}
                        className="w-12 h-16 object-cover rounded border"
                        onError={(e) => {
                          console.error('Failed to load back image:', getImageUrl(card, 'back'))
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMyMiAyMCAyNCAyMiAyNCAyNFYyOEMyNCAzMCAyMiAzMiAyMCAzMkgxNkMxNCAzMiAxMiAzMCAxMiAyOFYyNEMxMiAyMiAxNCAyMCAxNiAyMEgyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{card.manufacturer}</TableCell>
                  <TableCell>{card.sport}</TableCell>
                  <TableCell>{card.setName}</TableCell>
                  <TableCell>{card.cardNumber}</TableCell>
                  <TableCell>{card.playerName}</TableCell>
                  <TableCell>{card.year}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ${card.estimatedValue.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      {new Date(card.processedAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log('View details button clicked for card:', card._id)
                          onCardDetail(card)
                        }}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(card)}
                        title="Delete Card"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}