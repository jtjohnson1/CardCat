import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Switch } from "../components/ui/switch"
import {
  Settings as SettingsIcon,
  Globe,
  Brain,
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Key,
  Image,
  Trash2,
  Download,
  Upload
} from "lucide-react"
import { getEbaySettings, saveEbaySettings, getOllamaSettings, saveOllamaSettings } from "../api/settings"
import { useToast } from "../hooks/useToast"

interface EbaySettings {
  appId: string
  certId: string
  devId: string
  configured: boolean
}

interface OllamaSettings {
  url: string
  model: string
  configured: boolean
}

export function Settings() {
  const [ebaySettings, setEbaySettings] = useState<EbaySettings>({
    appId: '',
    certId: '',
    devId: '',
    configured: false
  })
  const [ollamaSettings, setOllamaSettings] = useState<OllamaSettings>({
    url: 'http://localhost:11434',
    model: 'llava',
    configured: false
  })
  const [processingSettings, setProcessingSettings] = useState({
    imageQuality: "high",
    batchSize: 10,
    autoProcess: false,
    saveOriginals: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      console.log('Loading settings...')

      const [ebayData, ollamaData] = await Promise.all([
        getEbaySettings(),
        getOllamaSettings()
      ])

      setEbaySettings(ebayData)
      setOllamaSettings(ollamaData)

      console.log('Settings loaded successfully')
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEbaySettings = async () => {
    setSaving(true)
    try {
      console.log('Saving eBay settings...')

      const result = await saveEbaySettings({
        appId: ebaySettings.appId,
        certId: ebaySettings.certId,
        devId: ebaySettings.devId
      })

      setEbaySettings(prev => ({ ...prev, configured: result.configured }))

      toast({
        title: "Success",
        description: "eBay API settings saved successfully"
      })

      console.log('eBay settings saved successfully')
    } catch (error) {
      console.error('Failed to save eBay settings:', error)
      toast({
        title: "Error",
        description: `Failed to save eBay settings: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOllamaSettings = async () => {
    setSaving(true)
    try {
      console.log('Saving Ollama settings...')

      const result = await saveOllamaSettings({
        url: ollamaSettings.url,
        model: ollamaSettings.model
      })

      setOllamaSettings(prev => ({ ...prev, configured: result.configured }))

      toast({
        title: "Success",
        description: "Ollama settings saved successfully"
      })

      console.log('Ollama settings saved successfully')
    } catch (error) {
      console.error('Failed to save Ollama settings:', error)
      toast({
        title: "Error",
        description: `Failed to save Ollama settings: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProcessingSettings = () => {
    console.log('Saving processing settings:', processingSettings)
    toast({
      title: "Settings Saved",
      description: "Processing preferences have been updated"
    })
  }

  const handleDatabaseMaintenance = (action: string) => {
    console.log('Database maintenance action:', action)
    toast({
      title: "Database Maintenance",
      description: `${action} operation started`
    })
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure your CardCat application
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mr-4" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your CardCat application
          </p>
        </div>
        <Button onClick={loadSettings} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="ebay" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ebay" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            eBay API
          </TabsTrigger>
          <TabsTrigger value="ollama" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Ollama
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            Processing
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ebay" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    eBay API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your eBay Developer Program credentials for price comparisons
                  </CardDescription>
                </div>
                <Badge variant={ebaySettings.configured ? "default" : "secondary"}>
                  {ebaySettings.configured ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {ebaySettings.configured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ebay-app-id">Application ID (App ID)</Label>
                <Input
                  id="ebay-app-id"
                  type="text"
                  placeholder="Enter your eBay App ID"
                  value={ebaySettings.appId}
                  onChange={(e) => setEbaySettings(prev => ({ ...prev, appId: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Your eBay Application ID from the eBay Developer Program
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ebay-cert-id">Certificate ID (Cert ID)</Label>
                <Input
                  id="ebay-cert-id"
                  type="text"
                  placeholder="Enter your eBay Certificate ID"
                  value={ebaySettings.certId}
                  onChange={(e) => setEbaySettings(prev => ({ ...prev, certId: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Your eBay Certificate ID from the eBay Developer Program
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ebay-dev-id">Developer ID (Dev ID)</Label>
                <Input
                  id="ebay-dev-id"
                  type="text"
                  placeholder="Enter your eBay Developer ID"
                  value={ebaySettings.devId}
                  onChange={(e) => setEbaySettings(prev => ({ ...prev, devId: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Your eBay Developer ID from the eBay Developer Program
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Save Configuration</p>
                  <p className="text-xs text-gray-500">
                    Settings will be saved to the server environment file
                  </p>
                </div>
                <Button
                  onClick={handleSaveEbaySettings}
                  disabled={saving || !ebaySettings.appId || !ebaySettings.certId || !ebaySettings.devId}
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save eBay Settings
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">How to get eBay API credentials:</h4>
                <ol className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>1. Visit the eBay Developer Program website</li>
                  <li>2. Create a developer account or sign in</li>
                  <li>3. Create a new application</li>
                  <li>4. Copy your App ID, Certificate ID, and Developer ID</li>
                  <li>5. Paste them into the fields above and save</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ollama" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Ollama Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Ollama AI service for card image analysis
                  </CardDescription>
                </div>
                <Badge variant={ollamaSettings.configured ? "default" : "secondary"}>
                  {ollamaSettings.configured ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {ollamaSettings.configured ? 'Configured' : 'Not Configured'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ollama-url">Ollama Server URL</Label>
                <Input
                  id="ollama-url"
                  type="text"
                  placeholder="http://localhost:11434"
                  value={ollamaSettings.url}
                  onChange={(e) => setOllamaSettings(prev => ({ ...prev, url: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  The URL where your Ollama server is running
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ollama-model">Model Name</Label>
                <Input
                  id="ollama-model"
                  type="text"
                  placeholder="llava"
                  value={ollamaSettings.model}
                  onChange={(e) => setOllamaSettings(prev => ({ ...prev, model: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  The Ollama model to use for image analysis (e.g., llava, llava:13b)
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Save Configuration</p>
                  <p className="text-xs text-gray-500">
                    Settings will be saved to the server environment file
                  </p>
                </div>
                <Button
                  onClick={handleSaveOllamaSettings}
                  disabled={saving || !ollamaSettings.url || !ollamaSettings.model}
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Ollama Settings
                </Button>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Recommended Ollama setup:</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Install Ollama on your system</li>
                  <li>• Pull the llava model: ollama pull llava</li>
                  <li>• Start Ollama service</li>
                  <li>• Test the connection above</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Processing Preferences
              </CardTitle>
              <CardDescription>
                Configure image processing and recognition settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageQuality">Image Quality</Label>
                  <select
                    id="imageQuality"
                    value={processingSettings.imageQuality}
                    onChange={(e) => setProcessingSettings({...processingSettings, imageQuality: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="low">Low (Faster)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Better Accuracy)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Batch Size</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="50"
                    value={processingSettings.batchSize}
                    onChange={(e) => setProcessingSettings({...processingSettings, batchSize: parseInt(e.target.value)})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoProcess"
                    checked={processingSettings.autoProcess}
                    onCheckedChange={(checked) => setProcessingSettings({...processingSettings, autoProcess: checked})}
                  />
                  <Label htmlFor="autoProcess">Auto-process new images</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="saveOriginals"
                    checked={processingSettings.saveOriginals}
                    onCheckedChange={(checked) => setProcessingSettings({...processingSettings, saveOriginals: checked})}
                  />
                  <Label htmlFor="saveOriginals">Save original image files</Label>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveProcessingSettings} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Maintain and manage your card database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Backup & Restore</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDatabaseMaintenance('Backup')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Database
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDatabaseMaintenance('Restore')}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Database
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Maintenance</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleDatabaseMaintenance('Optimize')}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Optimize Database
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={() => handleDatabaseMaintenance('Clear')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Database Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Cards</p>
                    <p className="font-semibold">1,247</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Database Size</p>
                    <p className="font-semibold">45.2 MB</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Backup</p>
                    <p className="font-semibold">2 days ago</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}