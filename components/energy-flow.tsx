// components/energy-flow.tsx - VERSION DYNAMIQUE
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { energyDataService, EnergyFlowData } from "@/lib/energy-data-service"
import { RefreshCw, Battery, Sun, Wind, Zap, TrendingUp, Activity } from "lucide-react"

export function EnergyFlow() {
  const [flowData, setFlowData] = useState<EnergyFlowData | null>(null)
  const [totals, setTotals] = useState<{ today: number; thisMonth: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchFlowData = async () => {
    try {
      setLoading(true)
      console.log("⚡ Chargement des données de flux énergétique...")
      
      const [flow, energyTotals] = await Promise.all([
        energyDataService.getEnergyFlowData(),
        energyDataService.getEnergyTotals()
      ])
      
      setFlowData(flow)
      setTotals(energyTotals)
      setLastUpdated(new Date())
      
      console.log("✅ Données de flux chargées:", flow)
    } catch (error) {
      console.error("❌ Erreur chargement flux:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFlowData()
    
    // Rafraîchir toutes les 2 minutes
    const interval = setInterval(fetchFlowData, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Calculer les pourcentages pour les indicateurs visuels
  const calculatePercentages = () => {
    if (!flowData) return null
    
    const totalProduction = flowData.solar + flowData.wind
    const totalEnergy = totalProduction + flowData.consumption
    
    return {
      solarPercent: totalEnergy > 0 ? (flowData.solar / totalEnergy) * 100 : 0,
      windPercent: totalEnergy > 0 ? (flowData.wind / totalEnergy) * 100 : 0,
      consumptionPercent: totalEnergy > 0 ? (flowData.consumption / totalEnergy) * 100 : 0,
      batteryWidth: flowData.battery
    }
  }

  const percentages = calculatePercentages()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-slate-400">
          {loading ? "Chargement..." : 
           lastUpdated ? `Mise à jour: ${lastUpdated.toLocaleTimeString('fr-FR', { 
             hour: '2-digit', 
             minute: '2-digit' 
           })}` : "État en temps réel"}
        </div>
        <button
          onClick={fetchFlowData}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Diagramme de flux simplifié */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-800/50"></div>
          ))}
        </div>
      ) : flowData && (
        <div className="space-y-4">
          {/* Production Solaire */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Sun className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300">Solar</div>
                <div className="text-xs text-slate-500">Production actuelle</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-yellow-400">{flowData.solar.toFixed(1)} kW</div>
              {percentages && (
                <div className="text-xs text-slate-500">
                  {percentages.solarPercent.toFixed(1)}% du total
                </div>
              )}
            </div>
          </div>

          {/* Production Éolienne */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Wind className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300">Wind</div>
                <div className="text-xs text-slate-500">Production actuelle</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-cyan-400">{flowData.wind.toFixed(1)} kW</div>
              {percentages && (
                <div className="text-xs text-slate-500">
                  {percentages.windPercent.toFixed(1)}% du total
                </div>
              )}
            </div>
          </div>

          {/* Batterie */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Battery className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-300">Battery</span>
                  <span className="text-emerald-400 font-bold">{flowData.battery}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ width: `${flowData.battery}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Injection Réseau */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-300">Grid Injection</div>
                <div className="text-xs text-slate-500">
                  {flowData.gridInjection > 0 ? 'Export vers réseau' : 'Import depuis réseau'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${flowData.gridInjection > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {Math.abs(flowData.gridInjection).toFixed(1)} kW
              </div>
              <div className="text-xs text-slate-500">
                {flowData.gridInjection > 0 ? 'Export' : 'Import'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Totaux */}
      {!loading && totals && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="text-sm font-medium text-slate-300">Today</div>
            </div>
            <div className="text-2xl font-bold text-white">{totals.today} kWh</div>
            <div className="text-xs text-slate-500 mt-1">Production totale</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div className="text-sm font-medium text-slate-300">This Month</div>
            </div>
            <div className="text-2xl font-bold text-white">{totals.thisMonth} kWh</div>
            <div className="text-xs text-slate-500 mt-1">Estimation mensuelle</div>
          </div>
        </div>
      )}
    </div>
  )
}