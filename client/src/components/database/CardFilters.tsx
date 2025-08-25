import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Slider } from "../ui/slider"
import { Label } from "../ui/label"

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

interface CardFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  cards: CardData[]
}

export function CardFilters({ filters, onFiltersChange, cards }: CardFiltersProps) {
  const manufacturers = Array.from(new Set(cards.map(card => card.manufacturer))).sort()
  const sports = Array.from(new Set(cards.map(card => card.sport))).sort()

  const minYear = Math.min(...cards.map(card => card.year))
  const maxYear = Math.max(...cards.map(card => card.year))
  const minValue = Math.min(...cards.map(card => card.estimatedValue))
  const maxValue = Math.max(...cards.map(card => card.estimatedValue))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Manufacturer</Label>
        <Select
          value={filters.manufacturer}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, manufacturer: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <SelectValue placeholder="All manufacturers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All manufacturers</SelectItem>
            {manufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer} value={manufacturer}>
                {manufacturer}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sport</Label>
        <Select
          value={filters.sport}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, sport: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <SelectValue placeholder="All sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sports</SelectItem>
            {sports.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Year Range: {filters.yearRange[0]} - {filters.yearRange[1]}</Label>
        <Slider
          value={filters.yearRange}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, yearRange: value as [number, number] })
          }
          min={minYear}
          max={maxYear}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Value Range: ${filters.valueRange[0]} - ${filters.valueRange[1]}</Label>
        <Slider
          value={filters.valueRange}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, valueRange: value as [number, number] })
          }
          min={minValue}
          max={maxValue}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}