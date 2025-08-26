import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { ExternalLink, Calendar, Tag, TrendingUp, Loader2 } from "lucide-react"
import { getPriceComparisons } from "../../api/prices"
import { useToast } from "../../hooks/useToast"

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

interface PriceComparison {
  source: string
  price: number
  condition: string
  url: string
  lastUpdated: string
}

interface CardDetailModalProps {
  card: CardData | null
  isOpen: boolean
  onClose: () => void
}

export function CardDetailModal({ card, isOpen, onClose }: CardDetailModalProps) {
  const [activeImage, setActiveImage] = useState<'front' | 'back'>('front')
  const [priceComparisons, setPriceComparisons] = useState<PriceComparison[]>([])
  const [averagePrice, setAveragePrice] = useState<number>(0)
  const [loadingPrices, setLoadingPrices] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (card && isOpen) {
      loadPriceComparisons()
    }
  }, [card, isOpen])

  const loadPriceComparisons = async () => {
    if (!card) return

    setLoadingPrices(true)
    try {
      const result = await getPriceComparisons({
        manufacturer: card.manufacturer,
        playerName: card.playerName,
        year: card.year,
        cardNumber: card.cardNumber
      })
      setPriceComparisons(result.priceComparisons)
      setAveragePrice(result.averagePrice)
    } catch (error) {
      console.error('Failed to load price comparisons:', error)
      toast({
        title: "Error",
        description: "Failed to load price comparisons",
        variant: "destructive"
      })
    } finally {
      setLoadingPrices(false)
    }
  }

  const getImageUrl = (type: 'front' | 'back') => {
    if (!card) return ''

    if (type === 'front') {
      return card.frontImageUrl || `/api/images/${encodeURIComponent(card.frontImagePath)}`
    } else {
      return card.backImageUrl || `/api/images/${encodeURIComponent(card.backImagePath)}`
    }
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (!card) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {card.playerName} - {card.year} {card.manufacturer}
          </DialogTitle>
          <DialogDescription>
            {card.setName} #{card.cardNumber}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Card Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="prices">Price Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Player:</span>
                    <span>{card.playerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Team:</span>
                    <span>{card.team}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sport:</span>
                    <span>{card.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Manufacturer:</span>
                    <span>{card.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Year:</span>
                    <span>{card.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Card Number:</span>
                    <span>{card.cardNumber}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Set Name:</span>
                    <span className="text-right">{card.setName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Condition:</span>
                    <span>{card.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated Value:</span>
                    <span className="font-semibold text-green-600">
                      ${card.estimatedValue.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Special Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {card.specialFeatures.length > 0 ? (
                        card.specialFeatures.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">None</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Processed:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(card.processedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="flex justify-center space-x-4 mb-4">
              <Button
                variant={activeImage === 'front' ? 'default' : 'outline'}
                onClick={() => setActiveImage('front')}
              >
                Front
              </Button>
              <Button
                variant={activeImage === 'back' ? 'default' : 'outline'}
                onClick={() => setActiveImage('back')}
              >
                Back
              </Button>
            </div>

            <div className="flex justify-center">
              <div className="max-w-md">
                <img
                  src={getImageUrl(activeImage)}
                  alt={`${card.playerName} ${activeImage}`}
                  className="w-full h-auto rounded-lg border shadow-lg"
                  onError={(e) => {
                    console.error(`Failed to load ${activeImage} image:`, getImageUrl(activeImage))
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMjAwQzE3MCAyMDAgMTkwIDIyMCAxOTAgMjQwVjI2MEMxOTAgMjgwIDE3MCAzMDAgMTUwIDMwMEgxMzBDMTEwIDMwMCA5MCAyODAgOTAgMjYwVjI0MEM5MCAyMjAgMTEwIDIwMCAxMzAgMjAwSDE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Price Comparisons
                </CardTitle>
                <CardDescription>
                  Current market prices from various sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPrices ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading price data...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {averagePrice > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Average Market Price:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ${averagePrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      {priceComparisons.map((comparison, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{comparison.source}</span>
                              <Badge variant="outline" className="text-xs">
                                {comparison.condition}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              Updated: {new Date(comparison.lastUpdated).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-green-600">
                              ${comparison.price.toFixed(2)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExternalLink(comparison.url)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}