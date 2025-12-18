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

  // Fetch weather data
  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      console.log("🌤️ Loading weather data...")
      
      const newMetrics = await weatherbitService.getEnergyMetrics()
      
      // Determine if it's daytime based on current hour
      const now = new Date()
      const currentHour = now.getHours()
      const isDay = currentHour >= 7 && currentHour < 18
      setIsDaytime(isDay)
      
      // Update metrics with extended data
      const extendedMetrics: ExtendedMetrics = {
        ...newMetrics,
        isDaytime: isDay,
        windSpeed: 5.1, // Average value, replace with real data
        cloudCover: 45  // Average value
      }
      
      setMetrics(extendedMetrics)
      setLastUpdated(newMetrics.lastUpdated || new Date())
      
      console.log("✅ Weather data loaded:", extendedMetrics)
      console.log(`🌅 ${isDay ? 'Day ☀️' : 'Night 🌙'} - Time: ${currentHour}:00`)
      
    } catch (error) {
      console.error("❌ Error loading data:", error)
      
      // Determine if it's daytime for default data
      const now = new Date()
      const currentHour = now.getHours()
      const isDay = currentHour >= 7 && currentHour < 18
      setIsDaytime(isDay)
      
      // Use realistic default data based on time
      const defaultMetrics: ExtendedMetrics = {
        solarPower: isDay ? 3.8 : 0.1,
        windPower: isDay ? 2.5 : 3.2,
        gridInjection: isDay ? 1.5 : 0.2,
        systemEfficiency: isDay ? 82.5 : 65.0,
        lastUpdated: new Date(),
        isDaytime: isDay,
        windSpeed: isDay ? 4.2 : 5.1,
        cloudCover: isDay ? 35 : 70
      }
      
      setMetrics(defaultMetrics)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }

  // Load data on startup
  useEffect(() => {
    fetchWeatherData()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Add/remove dark class to <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add("dark")
    else root.classList.remove("dark")
  }, [isDark])

  // Helper function to check status with correct typing
  const getWindPowerStatus = (): KPIStatus => {
    return metrics.windPower < 1.5 ? "warning" : "normal"
  }

  const getEfficiencyStatus = (): KPIStatus => {
    return metrics.systemEfficiency < 75 ? "warning" : 
           metrics.systemEfficiency < 60 ? "critical" : "normal"
  }

  const getSolarPowerStatus = (): KPIStatus => {
    if (!isDaytime) return "normal" // Night = normal (no production)
    return metrics.solarPower < 1.0 ? "warning" : "normal"
  }

  // Alert data
  const getAlertMessage = (): string => {
    if (metrics.windPower < 1.5) {
      return "Low wind production. Insufficient wind speed."
    }
    if (!isDaytime && metrics.solarPower > 0.5) {
      return "Nighttime solar production detected. Check sensors."
    }
    if (metrics.systemEfficiency < 60) {
      return "Critical system efficiency. Maintenance required."
    }
    return "Wind turbine temperature exceeds threshold (85°C). Automatic shutdown initiated."
  }

  const getAlertType = () => {
    if (metrics.windPower < 1.5 || metrics.systemEfficiency < 60) {
      return "critical"
    }
    return "warning"
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
      status: metrics.gridInjection < 0.5 ? "warning" : "normal" as KPIStatus,
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
                {/* Pulsing effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/30 to-cyan-400/20 animate-pulse group-hover:animate-none" />
                
                {/* Double icon for depth effect */}
                <div className="relative">
                  {/* Shadow */}
                  <svg 
                    className="w-6 h-6 text-white/30 absolute -top-0.5 -left-0.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                  </svg>
                  {/* Main icon */}
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
                
                {/* Light dots */}
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
            <AlertDescription>
              {getAlertMessage()}
            </AlertDescription>
          </Alert>
        </motion.div>

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

        {/* Current weather section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          
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