import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import {
  Calendar,
  DollarSign,
  Hash,
  Trophy,
  User,
  Building,
  TrendingUp,
  ExternalLink
} from "lucide-react"

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
}

interface CardDetailModalProps {
  card: CardData
  open: boolean
  onClose: () => void
}

export function CardDetailModal({ card, open, onClose }: CardDetailModalProps) {
  const mockPriceData = [
    { source: "eBay", price: card.estimatedValue * 0.9, lastSold: "2 days ago" },
    { source: "COMC", price: card.estimatedValue * 1.1, lastSold: "1 week ago" },
    { source: "PWCC", price: card.estimatedValue * 1.05, lastSold: "3 days ago" }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {card.year} {card.setName} #{card.cardNumber}
          </DialogTitle>
          <DialogDescription>
            {card.player} • {card.manufacturer} • {card.sport}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Card Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pricing">Price Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Card Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Player</p>
                      <p className="font-medium">{card.player}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Manufacturer</p>
                      <Badge variant="outline">{card.manufacturer}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Sport</p>
                      <Badge variant="secondary">{card.sport}</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Card Number</p>
                      <p className="font-medium">#{card.cardNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium">{card.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Estimated Value</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${card.estimatedValue.toFixed(2)}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Processing Date</p>
                    <p className="font-medium">
                      {new Date(card.processingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Front Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={card.frontImage}
                      alt="Card front"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Back Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img
                      src={card.backImage}
                      alt="Card back"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Price Comparison
                </CardTitle>
                <CardDescription>
                  Current market prices from various sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPriceData.map((price, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{price.source}</Badge>
                        <div>
                          <p className="font-medium">${price.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-500">Last sold: {price.lastSold}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}