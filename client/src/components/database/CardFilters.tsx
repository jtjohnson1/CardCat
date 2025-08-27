import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Slider } from "../ui/slider"
import { Label } from "../ui/label"

interface Filters {
  manufacturer: string
  sport: string
  yearRange: [number, number]
  valueRange: [number, number]
}

interface CardFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function CardFilters({ filters, onFiltersChange }: CardFiltersProps) {
  console.log('=== CARD FILTERS RENDER DEBUG ===')
  console.log('Filters prop:', filters)
  console.log('Filters is object:', typeof filters === 'object')
  console.log('Year range:', filters?.yearRange)
  console.log('Value range:', filters?.valueRange)

  // Ensure filters object exists with safe defaults
  const safeFilters = {
    manufacturer: filters?.manufacturer || "",
    sport: filters?.sport || "",
    yearRange: Array.isArray(filters?.yearRange) ? filters.yearRange : [1980, 2024],
    valueRange: Array.isArray(filters?.valueRange) ? filters.valueRange : [0, 1000]
  }

  console.log('Safe filters:', safeFilters)

  const manufacturers = [
    "Topps",
    "Panini",
    "Upper Deck",
    "Bowman",
    "Donruss",
    "Fleer"
  ]

  const sports = [
    "Baseball",
    "Basketball",
    "Football",
    "Hockey",
    "Soccer"
  ]

  console.log('Manufacturers array:', manufacturers)
  console.log('Sports array:', sports)

  const handleFilterChange = (key: keyof Filters, value: any) => {
    console.log(`Filter change: ${key} = ${value}`)
    // Convert "all" values back to empty strings for filtering logic
    const filterValue = value === "all-manufacturers" || value === "all-sports" ? "" : value
    const newFilters = { ...safeFilters, [key]: filterValue }
    console.log('New filters:', newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="space-y-2">
        <Label>Manufacturer</Label>
        <Select
          value={safeFilters.manufacturer || "all-manufacturers"}
          onValueChange={(value) => handleFilterChange('manufacturer', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All manufacturers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-manufacturers">All manufacturers</SelectItem>
            {manufacturers.map((manufacturer) => {
              console.log(`Rendering manufacturer option: ${manufacturer}`)
              return (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sport</Label>
        <Select
          value={safeFilters.sport || "all-sports"}
          onValueChange={(value) => handleFilterChange('sport', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All sports" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-sports">All sports</SelectItem>
            {sports.map((sport) => {
              console.log(`Rendering sport option: ${sport}`)
              return (
                <SelectItem key={sport} value={sport}>
                  {sport}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Year Range: {safeFilters.yearRange[0]} - {safeFilters.yearRange[1]}</Label>
        <Slider
          value={safeFilters.yearRange}
          onValueChange={(value) => {
            console.log('Year range change:', value)
            handleFilterChange('yearRange', value as [number, number])
          }}
          min={1950}
          max={2024}
          step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Value Range: ${safeFilters.valueRange[0]} - ${safeFilters.valueRange[1]}</Label>
        <Slider
          value={safeFilters.valueRange}
          onValueChange={(value) => {
            console.log('Value range change:', value)
            handleFilterChange('valueRange', value as [number, number])
          }}
          min={0}
          max={1000}
          step={10}
          className="w-full"
        />
      </div>
    </div>
  )
}