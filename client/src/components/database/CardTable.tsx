import { Checkbox } from "../ui/checkbox"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Eye, ChevronUp, ChevronDown } from "lucide-react"

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

interface CardTableProps {
  cards: CardData[]
  loading: boolean
  sortField: keyof CardData
  sortDirection: "asc" | "desc"
  onSort: (field: keyof CardData) => void
  onCardSelect: (cardId: string, selected: boolean) => void
  onCardView: (card: CardData) => void
}

export function CardTable({
  cards,
  loading,
  sortField,
  sortDirection,
  onSort,
  onCardSelect,
  onCardView
}: CardTableProps) {
  const SortIcon = ({ field }: { field: keyof CardData }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 ml-1" /> :
      <ChevronDown className="w-4 h-4 ml-1" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-12 h-16 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead className="w-24">Images</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('manufacturer')}
            >
              <div className="flex items-center">
                Manufacturer
                <SortIcon field="manufacturer" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('sport')}
            >
              <div className="flex items-center">
                Sport
                <SortIcon field="sport" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('setName')}
            >
              <div className="flex items-center">
                Set Name
                <SortIcon field="setName" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('cardNumber')}
            >
              <div className="flex items-center">
                Card #
                <SortIcon field="cardNumber" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('player')}
            >
              <div className="flex items-center">
                Player
                <SortIcon field="player" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('year')}
            >
              <div className="flex items-center">
                Year
                <SortIcon field="year" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('estimatedValue')}
            >
              <div className="flex items-center">
                Value
                <SortIcon field="estimatedValue" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onSort('processingDate')}
            >
              <div className="flex items-center">
                Processed
                <SortIcon field="processingDate" />
              </div>
            </TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cards.map((card) => (
            <TableRow key={card._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell>
                <Checkbox
                  checked={card.selected || false}
                  onCheckedChange={(checked) => onCardSelect(card._id, checked as boolean)}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Avatar className="w-8 h-10 rounded">
                    <AvatarImage src={card.frontImage} alt="Front" />
                    <AvatarFallback>F</AvatarFallback>
                  </Avatar>
                  <Avatar className="w-8 h-10 rounded">
                    <AvatarImage src={card.backImage} alt="Back" />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {card.manufacturer}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {card.sport}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{card.setName}</TableCell>
              <TableCell className="text-center">{card.cardNumber}</TableCell>
              <TableCell className="font-medium">{card.player}</TableCell>
              <TableCell>{card.year}</TableCell>
              <TableCell className="font-semibold text-green-600 dark:text-green-400">
                ${card.estimatedValue.toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(card.processingDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCardView(card)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}