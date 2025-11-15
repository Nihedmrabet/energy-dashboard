"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { EnergyChart } from "./energy-chart"
import { KPICard } from "./kpi-card"
import { AlertsPanel } from "./alerts-panel"
import { ParametersTable } from "./parameters-table"
import { PredictionChart } from "./prediction-chart"
import { EnergyFlow } from "./energy-flow"

import { AlertTriangle, Sun, Moon, Wind, Zap, TrendingUp } from "lucide-react"
import { Chatbot } from "./chatbot"

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("24h")
  const [isDark, setIsDark] = useState(true)

  // Ajouter/classe dark au <html>
  useEffect(() => {
    const root = document.documentElement
    if (isDark) root.classList.add("dark")
    else root.classList.remove("dark")
  }, [isDark])

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
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Smart Energy Monitor</h1>
                <p className="text-sm opacity-70">Solar & Wind Systems</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Live
              </Badge>
              <span className="text-sm opacity-70">Last updated: now</span>

              {/* 🔥 Bouton Light/Dark */}
              <Button
                variant="outline"
                onClick={() => setIsDark(!isDark)}
                className="flex items-center gap-2"
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
          <Alert
            className={`mb-6 border-red-500/50 
              ${isDark ? "bg-red-500/10 text-red-400" : "bg-red-100 text-red-700"}
            `}
          >
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription>
              Wind turbine temperature exceeds threshold (85°C). Automatic shutdown initiated.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* KPI Cards */}
{/* KPI Cards */}
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
  {(
    [
      {
        title: "Solar Power",
        value: "5.2",
        unit: "kW",
        icon: <Sun />,
        trend: "+12%",
        status: "normal",
        color: "from-yellow-400 to-orange-500"
      },
      {
        title: "Wind Power",
        value: "3.8",
        unit: "kW",
        icon: <Wind />,
        trend: "-5%",
        status: "warning",
        color: "from-cyan-400 to-blue-500"
      },
      {
        title: "Grid Injection",
        value: "7.1",
        unit: "kW",
        icon: <TrendingUp />,
        trend: "+8%",
        status: "normal",
        color: "from-emerald-400 to-teal-500"
      },
      {
        title: "System Efficiency",
        value: "94.2",
        unit: "%",
        icon: <Zap />,
        trend: "+2%",
        status: "normal",
        color: "from-purple-400 to-pink-500"
      }
    ] as const
  ).map((kpi, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45 } }
      }}
    >
      <KPICard {...kpi} />
    </motion.div>
  ))}
</motion.div>


        {/* Time Range Selector */}
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
                  <AlertsPanel />
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
