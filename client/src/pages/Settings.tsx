import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Separator } from "../components/ui/separator"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Settings as SettingsIcon,
  Key,
  Database,
  Image,
  Trash2,
  Download,
  Upload,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { useToast } from "../hooks/useToast"

export function Settings() {
  const [ebaySettings, setEbaySettings] = useState({
    developerId: "",
    appId: "",
    certId: "",
    token: "",
    sandbox: false
  })
  const [ollamaSettings, setOllamaSettings] = useState({
    host: "localhost",
    port: "11434",
    model: "llava:latest",
    gpuEnabled: true
  })
  const [processingSettings, setProcessingSettings] = useState({
    imageQuality: "high",
    batchSize: 10,
    autoProcess: false,
    saveOriginals: true
  })
  const { toast } = useToast()

  const handleSaveEbaySettings = () => {
    console.log('Saving eBay settings:', ebaySettings)
    toast({
      title: "Settings Saved",
      description: "eBay API configuration has been updated"
    })
  }

  const handleSaveOllamaSettings = () => {
    console.log('Saving Ollama settings:', ollamaSettings)
    toast({
      title: "Settings Saved",
      description: "Ollama configuration has been updated"
    })
  }

  const handleSaveProcessingSettings = () => {
    console.log('Saving processing settings:', processingSettings)
    toast({
      title: "Settings Saved",
      description: "Processing preferences have been updated"
    })
  }

  const handleTestConnection = (service: string) => {
    console.log('Testing connection for:', service)
    toast({
      title: "Connection Test",
      description: `Testing ${service} connection...`
    })
  }

  const handleDatabaseMaintenance = (action: string) => {
    console.log('Database maintenance action:', action)
    toast({
      title: "Database Maintenance",
      description: `${action} operation started`
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your CardCataloger application
          </p>
        </div>
      </div>

      <Tabs defaultValue="ebay" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ebay">eBay API</TabsTrigger>
          <TabsTrigger value="ollama">Ollama</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="ebay" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                eBay API Configuration
              </CardTitle>
              <CardDescription>
                Configure your eBay Developer credentials for price comparisons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="developerId">Developer ID</Label>
                  <Input
                    id="developerId"
                    placeholder="Enter your eBay Developer ID"
                    value={ebaySettings.developerId}
                    onChange={(e) => setEbaySettings({...ebaySettings, developerId: e.target.value})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appId">Application ID</Label>
                  <Input
                    id="appId"
                    placeholder="Enter your Application ID"
                    value={ebaySettings.appId}
                    onChange={(e) => setEbaySettings({...ebaySettings, appId: e.target.value})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certId">Certificate ID</Label>
                  <Input
                    id="certId"
                    placeholder="Enter your Certificate ID"
                    value={ebaySettings.certId}
                    onChange={(e) => setEbaySettings({...ebaySettings, certId: e.target.value})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">User Token</Label>
                  <Input
                    id="token"
                    type="password"
                    placeholder="Enter your User Token"
                    value={ebaySettings.token}
                    onChange={(e) => setEbaySettings({...ebaySettings, token: e.target.value})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sandbox"
                  checked={ebaySettings.sandbox}
                  onCheckedChange={(checked) => setEbaySettings({...ebaySettings, sandbox: checked})}
                />
                <Label htmlFor="sandbox">Use Sandbox Environment</Label>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveEbaySettings} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => handleTestConnection('eBay')}>
                  Test Connection
                </Button>
                <Badge variant="outline" className="ml-auto">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Not Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ollama" className="space-y-4">
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Ollama Configuration
              </CardTitle>
              <CardDescription>
                Configure Ollama AI service for image recognition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    placeholder="localhost"
                    value={ollamaSettings.host}
                    onChange={(e) => setOllamaSettings({...ollamaSettings, host: e.target.value})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    placeholder="11434"
                    value={ollamaSettings.port}
                    onChange={(e) => setOllamaSettings({...ollamaSettings, port: e.target.value})}
                    className="bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="llava:latest"
                  value={ollamaSettings.model}
                  onChange={(e) => setOllamaSettings({...ollamaSettings, model: e.target.value})}
                  className="bg-white dark:bg-gray-800"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="gpu"
                  checked={ollamaSettings.gpuEnabled}
                  onCheckedChange={(checked) => setOllamaSettings({...ollamaSettings, gpuEnabled: checked})}
                />
                <Label htmlFor="gpu">Enable GPU Acceleration (NVIDIA 3070ti)</Label>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button onClick={handleSaveOllamaSettings} className="bg-gradient-to-r from-blue-500 to-purple-600">
                  Save Configuration
                </Button>
                <Button variant="outline" onClick={() => handleTestConnection('Ollama')}>
                  Test Connection
                </Button>
                <Badge variant="default" className="ml-auto">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
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