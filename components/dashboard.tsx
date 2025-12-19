"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { weatherbitService, EnergyMetrics } from "@/lib/weatherbit-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EnergyChart } from "./energy-chart"
import { KPICardDynamic } from "./kpi-card-dynamic"
import { AlertsPanelDynamic } from "./alerts-panel-dynamic"
import { ParametersTable } from "./parameters-table-dynamic"
import { PredictionChart } from "./prediction-chart"
import { EnergyFlow } from "./energy-flow"
import { AlertTriangle, Sun, Moon, Wind, Zap, TrendingUp, RefreshCw } from "lucide-react"
import { Chatbot } from "./chatbot"
import { createClient } from '@/lib/supabase-client'

// Type for KPI status
type KPIStatus = "normal" | "warning" | "critical"

// Extended interface to include weather data
interface ExtendedMetrics extends EnergyMetrics {
  isDaytime?: boolean
  sunrise?: string
  sunset?: string
  windSpeed?: number
  cloudCover?: number
}

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("24h")
  const [isDark, setIsDark] = useState(true)
  const [metrics, setMetrics] = useState<ExtendedMetrics>({
    solarPower: 0,
    windPower: 0,
    gridInjection: 0,
    systemEfficiency: 0,
    lastUpdated: new Date()
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isDaytime, setIsDaytime] = useState(true)
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])
  const [lastCriticalAlert, setLastCriticalAlert] = useState<any>(null)

  // ⭐⭐ CRÉER LE CLIENT SUPABASE ⭐⭐
  const supabase = createClient()

  // Fetch weather data


const fetchWeatherData = async () => {
  try {
    setLoading(true)
    
    // SIMPLE : Appeler le service qui gère tout
    const metrics = await weatherbitService.getEnergyMetrics()
    
    // Vos logs pour voir ce qui se passe
    console.log("✅ Données reçues du service:", {
      solaire: `${metrics.solarPower} kW`,
      éolien: `${metrics.windPower} kW`,
      injection: `${metrics.gridInjection} kW`,
      heure: metrics.lastUpdated.toLocaleTimeString()
    })
    
    // Mettre à jour l'état
    setMetrics({
      ...metrics,
      // Ajouter les champs ExtendedMetrics si besoin
      isDaytime: metrics.solarPower > 1, // Simple détection jour/nuit
      windSpeed: metrics.windPower / 0.8, // Estimation
      cloudCover: 35 // Valeur par défaut
    })
    
    setLastUpdated(metrics.lastUpdated)
    setIsDaytime(metrics.solarPower > 1)
    
    // Le reste de votre code reste IDENTIQUE
    await syncAlertsWithSupabase(metrics, metrics.solarPower > 1)
    await fetchActiveAlerts()
    
  } catch (error) {
    console.error("❌ Erreur globale:", error)
  } finally {
    setLoading(false)
  }
}
// APRÈS la fonction fetchWeatherData, AVANT le useEffect

const cleanInvalidAlerts = async () => {
  try {
    console.log('🧹 Nettoyage COMPLET des alertes...')
    
    // ÉTAPE 1: Supprimer TOUS les "System Operational" (doublons)
    const { data: systemOps } = await supabase
      .from('system_alerts')
      .select('id, timestamp')
      .eq('title', 'System Operational')
      .order('timestamp', { ascending: false })
    
    if (systemOps && systemOps.length > 0) {
      console.log(`🗑️ ${systemOps.length} alertes "System Operational" trouvées`)
      
      // Garder seulement la PLUS RÉCENTE
      const alertsToDelete = systemOps.slice(1).map(a => a.id)
      
      if (alertsToDelete.length > 0) {
        await supabase
          .from('system_alerts')
          .delete()
          .in('id', alertsToDelete)
        
        console.log(`✅ ${alertsToDelete.length} doublons "System Operational" supprimés`)
      }
    }
    
    // ÉTAPE 2: Nettoyer les 0.0
    const { error } = await supabase
      .from('system_alerts')
      .update({ resolved: true })
      .eq('resolved', false)
      .or('description.ilike.%0.0 kW%,description.ilike.%0.0%%,description.ilike.%0.0 %')
    
    if (error) {
      console.error('❌ Erreur nettoyage 0.0:', error.message)
    } else {
      console.log('✅ Alertes 0.0 marquées comme résolues')
    }
    
    // ÉTAPE 3: NE RIEN CRÉER DE PLUS - on garde les 3 alertes de démo
    console.log('✅ Nettoyage terminé - garde les 3 alertes de démo')
    
  } catch (error) {
    console.error('❌ Erreur globale:', error)
  }
}

// Méthode alternative
const cleanInvalidAlertsAlternative = async () => {
  try {
    console.log('🔄 Méthode alternative de nettoyage...')
    
    // 1. Récupérer toutes les alertes non résolues
    const { data: alerts } = await supabase
      .from('system_alerts')
      .select('id, description')
      .eq('resolved', false)
    
    if (!alerts || alerts.length === 0) {
      console.log('✅ Aucune alerte à nettoyer')
      return
    }
    
    // 2. Filtrer celles avec 0.0
    const alertsWithZero = alerts.filter(alert => 
      alert.description?.includes('0.0 kW') ||
      alert.description?.includes('0.0%') ||
      alert.description?.includes('0.0 ')
    )
    
    console.log(`📊 ${alertsWithZero.length} alertes 0.0 à nettoyer`)
    
    // 3. Les marquer comme résolues une par une
    for (const alert of alertsWithZero) {
      await supabase
        .from('system_alerts')
        .update({ resolved: true })
        .eq('id', alert.id)
    }
    
    console.log(`✅ ${alertsWithZero.length} alertes nettoyées`)
    
  } catch (error) {
    console.error('❌ Erreur alternative:', error)
  }
}
  // Synchronize alerts with Supabase
const syncAlertsWithSupabase = async (metrics: ExtendedMetrics, isDaytime: boolean) => {
  try {
    console.log('🔄 Synchronisation alertes avec métriques:', metrics)
    
    // Ne PAS créer d'alertes si c'est la nuit (solaire = 0 normal)
    if (!isDaytime && metrics.solarPower === 0) {
      console.log('🌙 Nuit - Pas d\'alerte solaire (normal)')
      // Continuer pour les autres alertes
    }
    
    // Ne PAS créer d'alerte éolienne si vent < 2.5 m/s (normal)
    if (metrics.windPower === 0) {
      console.log('💨 Vent faible - Pas d\'alerte éolienne (vent < 2.5 m/s)')
    }
    
    // Récupérer les alertes récentes
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    
    const { data: recentAlerts } = await supabase
      .from('system_alerts')
      .select('title, description, timestamp')
      .gte('timestamp', twoHoursAgo)
      .eq('resolved', false)
    
    const recentAlertKeys = recentAlerts?.map(a => `${a.title}`) || []
    
    const alertsToCreate = []
    
    // SOLAR (seulement si c'est le jour ET puissance faible)
    if (isDaytime && metrics.solarPower < 1.0 && metrics.solarPower > 0) {
      const title = 'Low Solar Production'
      if (!recentAlertKeys.includes(title)) {
        alertsToCreate.push({
          title,
          description: `Solar power is low: ${metrics.solarPower.toFixed(1)} kW (threshold: 1.0 kW)`,
          severity: 'warning'
        })
      }
    }
    
    // WIND (seulement si puissance > 0 mais < seuil)
    if (metrics.windPower > 0 && metrics.windPower < 1.5) {
      const title = 'Low Wind Production'
      if (!recentAlertKeys.includes(title)) {
        alertsToCreate.push({
          title,
          description: `Wind power insufficient: ${metrics.windPower.toFixed(1)} kW (threshold: 1.5 kW)`,
          severity: 'warning'
        })
      }
    }
    
    // EFFICIENCY (seulement si > 0)
    if (metrics.systemEfficiency > 0 && metrics.systemEfficiency < 75) {
      const severity = metrics.systemEfficiency < 60 ? 'critical' : 'warning'
      const title = severity === 'critical' ? 'Critical System Efficiency' : 'Low System Efficiency'
      
      if (!recentAlertKeys.includes(title)) {
        alertsToCreate.push({
          title,
          description: `System efficiency: ${metrics.systemEfficiency.toFixed(1)}% (threshold: ${severity === 'critical' ? '60%' : '75%'})`,
          severity
        })
      }
    }
    
    console.log(`📝 Alertes à créer: ${alertsToCreate.length}`)
    
    // Créer les alertes
    for (const alert of alertsToCreate) {
      const alertData: any = {
        title: alert.title,
        description: alert.description,
        timestamp: new Date().toISOString(),
        resolved: false
      }
      
      if (alert.severity) {
        alertData.severity = alert.severity
      }
      
      const { error } = await supabase
        .from('system_alerts')
        .insert(alertData)
      
      if (!error) {
        console.log(`✅ Alerte créée: ${alert.title}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Sync error:', error)
  }
}

  // Create alert only if it doesn't already exist
const createAlertIfNotExists = async (alert: any) => {
  try {
    // Vérifier si une alerte similaire existe déjà
    const { data: existingAlerts, error: checkError } = await supabase
      .from('system_alerts')
      .select('id')
      .eq('source', alert.source)
      .eq('resolved', false)
      .limit(1)
    
    if (checkError) {
      console.error('❌ Error checking existing alerts:', checkError)
      return
    }
    
    if (!existingAlerts || existingAlerts.length === 0) {
      const { error: insertError } = await supabase
        .from('system_alerts')
        .insert({
          ...alert,
          resolved: false,
          timestamp: new Date().toISOString()  // ← CHANGÉ ICI
        })
      
      if (insertError) {
        console.error('❌ Supabase insert error:', insertError)
        return
      }
      console.log(`✅ New alert created: ${alert.title}`)
    }
  } catch (error) {
    console.error('❌ Error creating alert:', error)
  }
}

const fetchActiveAlerts = async () => {
  try {
    const { data, error } = await supabase
      .from('system_alerts')
      .select('*')
      .eq('resolved', false)
      .order('timestamp', { ascending: false })  // ← CHANGÉ ICI
      .limit(10)
    
    if (error) {
      console.error('❌ Supabase fetch error:', error)
      return
    }
    
    setActiveAlerts(data || [])
    
    const criticalAlert = data?.find(a => a.severity === 'critical') || data?.[0]
    setLastCriticalAlert(criticalAlert || null)
    
    console.log(`📊 ${data?.length || 0} active alerts retrieved`)
    
  } catch (error) {
    console.error('❌ Error fetching alerts:', error)
  }
}
  // Load data on startup
// REMPLACEZ le useEffect actuel par :

useEffect(() => {
  console.log('🚀 Initialisation du dashboard...')
  
  // 1. Nettoyer les vieilles alertes invalides (une seule fois)
  cleanInvalidAlerts()
  
  // 2. Charger les données initiales
  fetchWeatherData()
  
  // 3. Configurer le rafraîchissement périodique (toutes les 5 minutes)
  const refreshInterval = setInterval(fetchWeatherData, 5 * 60 * 1000)
  
  // 4. Nettoyage quand le composant est détruit
  return () => {
    console.log('🧹 Nettoyage des intervalles...')
    clearInterval(refreshInterval)
  }
}, []) // ← IMPORTANT: tableau vide = exécuté une seule fois au montage

  // Add/remove dark class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add("dark")
    else root.classList.remove("dark")
  }, [isDark])

  // Helper function to check status with correct typing
  const getWindPowerStatus = (): KPIStatus => {
    // Check if there's a wind turbine alert in Supabase
    const hasWindAlert = activeAlerts.some(alert => 
      alert.source === 'wind_turbine' && !alert.resolved
    )
    return hasWindAlert ? "warning" : "normal"
  }

  const getEfficiencyStatus = (): KPIStatus => {
    // Check if there's an efficiency alert in Supabase
    const efficiencyAlert = activeAlerts.find(alert => 
      alert.source === 'system_controller'
    )
    
    if (!efficiencyAlert) return "normal"
    return efficiencyAlert.severity === 'critical' ? "critical" : "warning"
  }

  const getSolarPowerStatus = (): KPIStatus => {
    if (!isDaytime) return "normal" // Night = normal (no production)
    
    // Check if there's a solar alert in Supabase
    const hasSolarAlert = activeAlerts.some(alert => 
      alert.source === 'solar_panel' && !alert.resolved
    )
    return hasSolarAlert ? "warning" : "normal"
  }

  const getGridInjectionStatus = (): KPIStatus => {
    // Check if there's a grid alert in Supabase
    const hasGridAlert = activeAlerts.some(alert => 
      alert.source === 'grid_connection' && !alert.resolved
    )
    return hasGridAlert ? "warning" : "normal"
  }

  // Alert data from Supabase
  const getAlertMessage = (): string => {
    if (lastCriticalAlert) {
      return `${lastCriticalAlert.title}: ${lastCriticalAlert.description}`
    }
    
    if (activeAlerts.length > 0) {
      const firstAlert = activeAlerts[0]
      return `${firstAlert.title}: ${firstAlert.description}`
    }
    
    return "All systems operational"
  }

  const getAlertType = () => {
    if (lastCriticalAlert) {
      return 'critical'
    }
    
    if (activeAlerts.length > 0) {
      return 'warning'
    }
    
    return 'info'
  }

  // Calculate realistic trends
  const getSolarTrend = () => {
    if (!isDaytime) return "↗0%" // No trend at night
    return metrics.solarPower > 3 ? "↗+12%" : metrics.solarPower > 1 ? "↗+5%" : "↘-8%"
  }

  const getWindTrend = () => {
    return metrics.windPower > 3 ? "↗+8%" : metrics.windPower > 1.5 ? "→0%" : "↘-15%"
  }

  const getGridTrend = () => {
    const injection = metrics.gridInjection
    return injection > 2 ? "↗+15%" : injection > 0.5 ? "↗+5%" : "↘-20%"
  }

  const getEfficiencyTrend = () => {
    const efficiency = metrics.systemEfficiency
    return efficiency > 85 ? "↗+5%" : efficiency > 70 ? "→0%" : "↘-12%"
  }

  // Define KPIs with dynamic data and correct typing
  const kpiData = [
    {
      title: "Solar Power",
      value: metrics.solarPower.toFixed(1),
      unit: "kW",
      icon: isDaytime ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />,
      trend: getSolarTrend(),
      status: getSolarPowerStatus(),
      color: isDaytime ? "from-yellow-400 to-orange-500" : "from-blue-400 to-indigo-500",
      loading,
      subtitle: isDaytime ? "Daytime production" : "Night - No production"
    },
    {
      title: "Wind Power",
      value: metrics.windPower.toFixed(1),
      unit: "kW",
      icon: <Wind className="h-5 w-5" />,
      trend: getWindTrend(),
      status: getWindPowerStatus(),
      color: "from-cyan-400 to-blue-500",
      loading,
      subtitle: `Wind: ${metrics.windSpeed?.toFixed(1) || '0.0'} m/s`
    },
    {
      title: "Grid Injection",
      value: metrics.gridInjection.toFixed(1),
      unit: "kW",
      icon: <TrendingUp className="h-5 w-5" />,
      trend: getGridTrend(),
      status: getGridInjectionStatus(),
      color: "from-emerald-400 to-teal-500",
      loading,
      subtitle: metrics.gridInjection > 0 ? "Export to grid" : "Import from grid"
    },
    {
      title: "System Efficiency",
      value: metrics.systemEfficiency.toFixed(1),
      unit: "%",
      icon: <Zap className="h-5 w-5" />,
      trend: getEfficiencyTrend(),
      status: getEfficiencyStatus(),
      color: "from-purple-400 to-pink-500",
      loading,
      subtitle: `Conditions: ${isDaytime ? 'Daytime' : 'Nighttime'}`
    }
  ]

  // Get formatted current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get day/night indicator
  const getDayNightIndicator = () => {
    const now = new Date()
    const hour = now.getHours()
    
    if (hour >= 5 && hour < 12) return { icon: '🌅', text: 'Morning' }
    if (hour >= 12 && hour < 17) return { icon: '☀️', text: 'Afternoon' }
    if (hour >= 17 && hour < 21) return { icon: '🌆', text: 'Evening' }
    return { icon: '🌙', text: 'Night' }
  }

  const dayNight = getDayNightIndicator()

  // Refresh alerts function
  const refreshAlerts = async () => {
    await fetchActiveAlerts()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`min-h-screen transition-colors duration-500 
        ${isDark 
          ? "bg-slate-900 text-white" 
          : "bg-gray-100 text-gray-900"
        }`}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`border-b sticky top-0 z-50 backdrop-blur-sm transition-colors duration-500
          ${isDark ? "border-slate-700 bg-slate-900/50" : "border-gray-300 bg-white/40"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/30 to-cyan-400/20 animate-pulse group-hover:animate-none" />
                
                <div className="relative">
                  <svg 
                    className="w-6 h-6 text-white/30 absolute -top-0.5 -left-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                  <svg 
                    className="w-6 h-6 text-white relative z-10 group-hover:scale-110 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                </div>
                
                <div className="absolute top-1 left-1 w-1 h-1 bg-white/60 rounded-full blur-sm group-hover:scale-150 transition-transform" />
                <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/40 rounded-full blur-sm group-hover:scale-150 transition-transform" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Smart Energy Monitor</h1>
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <span>Solar & Wind Systems</span>
                  <span className="opacity-50">•</span>
                  <span className="flex items-center gap-1">
                    {dayNight.icon} {dayNight.text} ({getCurrentTime()})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${loading ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                {loading ? 'Loading...' : 'Live'}
              </Badge>
              
              {/* Alerts badge */}
              {activeAlerts.length > 0 && (
                <Badge variant="outline" className={`${
                  lastCriticalAlert 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  {activeAlerts.length} Alert{activeAlerts.length > 1 ? 's' : ''}
                </Badge>
              )}
              
              {/* Update indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-sm opacity-70">
                  {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'Loading...'}
                </span>
              </div>

              {/* Refresh button */}
              <Button
                variant="outline"
                onClick={fetchWeatherData}
                disabled={loading}
                className="flex items-center gap-2"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Light/Dark toggle */}
              <Button
                variant="outline"
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-2"
                size="sm"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4" /> Light
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" /> Dark
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Alerts */}
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Alert className={`mb-6 ${
              getAlertType() === 'critical' 
                ? `border-red-500/50 ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700'}`
                : `border-yellow-500/50 ${isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>{getAlertMessage()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshAlerts}
                  className="ml-4"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Dynamic KPI Cards */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.5 }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {kpiData.map((kpi, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
              }}
            >
              <KPICardDynamic {...kpi} />
            </motion.div>
          ))}
        </motion.div>

        {/* Time range buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex gap-2 mb-6"
        >
          {["1h", "24h", "7d", "30d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? "bg-emerald-500 hover:bg-emerald-600" : ""}
            >
              {range}
            </Button>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <Card className={`lg:col-span-2 backdrop-blur transition-colors duration-500 
            ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-300 bg-white/60"}
          `}>
            <CardHeader>
              <CardTitle>Energy Production</CardTitle>
              <CardDescription>Real-time power generation comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyChart timeRange={timeRange} />
            </CardContent>
          </Card>

          <Card className={`backdrop-blur transition-colors duration-500 
            ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-300 bg-white/60"}
          `}>
            <CardHeader>
              <CardTitle>Energy Flow</CardTitle>
              <CardDescription>Current system status</CardDescription>
            </CardHeader>
            <CardContent>
              <EnergyFlow />
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Tabs defaultValue="predictions" className="mb-8">
            <TabsList
              className={`grid w-full grid-cols-3 transition-colors duration-500
               ${isDark ? "bg-slate-800 border-slate-700" : "bg-gray-200 border-gray-300"}
              `}
            >
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="predictions" className="mt-6">
              <Card className={`backdrop-blur transition-colors duration-500
                ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-300 bg-white/60"}
              `}>
                <CardHeader>
                  <CardTitle>24-Hour Forecast</CardTitle>
                  <CardDescription>AI-powered production predictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <PredictionChart />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parameters" className="mt-6">
              <Card className={`backdrop-blur transition-colors duration-500
                ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-300 bg-white/60"}
              `}>
                <CardHeader>
                  <CardTitle>System Parameters</CardTitle>
                  <CardDescription>Detailed technical specifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <ParametersTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts" className="mt-6">
              <Card className={`backdrop-blur transition-colors duration-500
                ${isDark ? "border-slate-700 bg-slate-800/50" : "border-gray-300 bg-white/60"}
              `}>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Recent events and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertsPanelDynamic />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Chatbot />
    </motion.div>
  )
}