import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Checkbox } from "../ui/checkbox"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { Eye, Calendar, DollarSign, Package } from "lucide-react"

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

interface CardTableProps {
  cards: Card[]
  selectedCards: string[]
  onCardSelect: (cardId: string, selected: boolean) => void
  onCardClick: (card: Card) => void
  loading: boolean
}

export function CardTable({ cards, selectedCards, onCardSelect, onCardClick, loading }: CardTableProps) {
  console.log('=== CARD TABLE RENDER DEBUG ===')
  console.log('Cards prop:', cards)
  console.log('Cards is array:', Array.isArray(cards))
  console.log('Cards length:', cards?.length)
  console.log('Selected cards:', selectedCards)
  console.log('Selected cards is array:', Array.isArray(selectedCards))
  console.log('Loading:', loading)

  // Ensure cards is always an array
  const safeCards = Array.isArray(cards) ? cards : []
  const safeSelectedCards = Array.isArray(selectedCards) ? selectedCards : []

  console.log('Safe cards:', safeCards.length)
  console.log('Safe selected cards:', safeSelectedCards.length)

  if (loading) {
    console.log('Rendering loading skeleton')
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (safeCards.length === 0) {
    console.log('Rendering empty state')
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No cards found in your collection.</p>
        <p className="text-sm mt-2">
          Start processing card images to build your collection.
        </p>
      </div>
    )
  }

  console.log('Rendering table with', safeCards.length, 'cards')

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>Card</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Set</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeCards.map((card, index) => {
            console.log(`Rendering card ${index}:`, card)

            if (!card || typeof card !== 'object') {
              console.warn(`Invalid card at index ${index}:`, card)
              return null
            }

            const isSelected = safeSelectedCards.includes(card._id)

            return (
              <TableRow
                key={card._id || `card-${index}`}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      console.log(`Card selection changed: ${card._id}, selected: ${checked}`)
                      onCardSelect(card._id, checked as boolean)
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded border overflow-hidden">
                      {card.frontImage ? (
                        <img
                          src={card.frontImage}
                          alt={`${card.playerName || 'Unknown'} card`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">#{card.cardNumber || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{card.manufacturer || 'Unknown'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{card.playerName || 'Unknown Player'}</p>
                    <div className="flex gap-1 mt-1">
                      {Array.isArray(card.specialFeatures) && card.specialFeatures.length > 0 ? (
                        card.specialFeatures.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{card.team || 'Unknown Team'}</span>
                    <Badge variant="outline" className="text-xs">
                      {card.sport || 'Unknown'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{card.setName || 'Unknown Set'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {card.year || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {card.estimatedValue ? card.estimatedValue.toFixed(2) : '0.00'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={card.condition === 'Mint' ? 'default' : 'secondary'}>
                    {card.condition || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('View card clicked:', card)
                      onCardClick(card)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}