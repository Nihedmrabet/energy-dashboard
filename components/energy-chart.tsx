// components/energy-chart.tsx - VERSION DYNAMIQUE
"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { energyDataService, EnergyDataPoint } from "@/lib/energy-data-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { weatherbitService } from '@/lib/weatherbit-service'
// PAS d'autre import weatherbit !

interface EnergyChartProps {
  timeRange: string
}

export function EnergyChart({ timeRange }: EnergyChartProps) {
  const [data, setData] = useState<EnergyDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchChartData = async () => {
    try {
      setLoading(true)
      console.log("📊 Chargement des données du graphique...")
      
      let hours = 24
      switch (timeRange) {
        case "1h": hours = 1; break
        case "24h": hours = 24; break
        case "7d": hours = 168; break
        case "30d": hours = 720; break
      }
      
      const historicalData = await energyDataService.getHistoricalData(hours)
      setData(historicalData)
      setLastUpdated(new Date())
      
      console.log(`✅ ${historicalData.length} points de données chargés`)
    } catch (error) {
      console.error("❌ Erreur chargement graphique:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
    
    // Rafraîchir toutes les 10 minutes
    const interval = setInterval(fetchChartData, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [timeRange])

  // Formater les données pour le graphique
  const formatChartData = () => {
    if (timeRange === "7d" || timeRange === "30d") {
      // Grouper par jour pour les longues périodes
      const groupedData: { [key: string]: any } = {}
      
      data.forEach(point => {
        const date = new Date(point.timestamp)
        const dayKey = date.toLocaleDateString('fr-FR', { 
          day: '2-digit',
          month: '2-digit'
        })
        
        if (!groupedData[dayKey]) {
          groupedData[dayKey] = {
            timestamp: dayKey,
            solarPower: 0,
            windPower: 0,
            gridInjection: 0,
            count: 0
          }
        }
        
        groupedData[dayKey].solarPower += point.solarPower
        groupedData[dayKey].windPower += point.windPower
        groupedData[dayKey].gridInjection += point.gridInjection
        groupedData[dayKey].count++
      })
      
      return Object.values(groupedData).map(item => ({
        ...item,
        solarPower: parseFloat((item.solarPower / item.count).toFixed(1)),
        windPower: parseFloat((item.windPower / item.count).toFixed(1)),
        gridInjection: parseFloat((item.gridInjection / item.count).toFixed(1))
      }))
    }
    
    // Pour 1h et 24h, garder toutes les données
    return data.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: timeRange === "1h" ? '2-digit' : undefined
      }).replace(':', 'h')
    }))
  }

  const chartData = formatChartData()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-400">
          {loading ? "Chargement..." : 
           lastUpdated ? `Mise à jour: ${lastUpdated.toLocaleTimeString('fr-FR', { 
             hour: '2-digit', 
             minute: '2-digit' 
           })}` : "Données en temps réel"}
        </div>
        <button
          onClick={fetchChartData}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-800 mx-auto"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-800 mx-auto"></div>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis 
              stroke="#94a3b8"
              fontSize={12}
              label={{ 
                value: 'kW', 
                angle: -90, 
                position: 'insideLeft',
                offset: -10,
                style: { fill: '#94a3b8' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              formatter={(value: number) => [`${value} kW`, 'Production']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="gridInjection" 
              name="Grid Injection" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="solarPower" 
              name="Solar Power" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="windPower" 
              name="Wind Power" 
              stroke="#0ea5e9" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      
      {/* Statistiques en bas */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <div className="text-slate-400">Max Solaire</div>
            <div className="text-xl font-bold text-yellow-400">
              {Math.max(...data.map(d => d.solarPower)).toFixed(1)} kW
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <div className="text-slate-400">Max Éolien</div>
            <div className="text-xl font-bold text-cyan-400">
              {Math.max(...data.map(d => d.windPower)).toFixed(1)} kW
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-800/30">
            <div className="text-slate-400">Production totale</div>
            <div className="text-xl font-bold text-emerald-400">
              {data.reduce((sum, d) => sum + d.solarPower + d.windPower, 0).toFixed(1)} kW
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
