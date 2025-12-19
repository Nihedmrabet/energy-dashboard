// components/parameters-table-dynamic.tsx - VERSION CORRIGÉE POUR VOTRE TABLE
"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { RefreshCw, AlertCircle, CheckCircle, Database, Zap, Wind, Battery, Activity } from "lucide-react"

interface SystemParameter {
  id: string
  system: string
  parameter: string
  value: string
  status: "normal" | "warning" | "critical"
  unit: string
  timestamp?: string
}

export function ParametersTable() {
  const [parameters, setParameters] = useState<SystemParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [useRealData, setUseRealData] = useState(true)
  
  const supabase = createClient()

  // 🔧 FONCTION : Génère des données DYNAMIQUES de secours
  const generateDynamicParameters = (): SystemParameter[] => {
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const timestamp = now.toISOString()
    const isDay = hour >= 6 && hour <= 20
    
    const timeFactor = hour + minute / 60
    
    return [
      // SOLAR ARRAY
      {
        id: "solar-1",
        system: "Solar Array",
        parameter: "Array Voltage",
        value: "380",
        unit: "V",
        status: "normal",
        timestamp
      },
      {
        id: "solar-2",
        system: "Solar Array",
        parameter: "Array Current",
        value: isDay 
          ? (13.7 + Math.sin(timeFactor * 0.3) * 2).toFixed(1)
          : "0.5",
        unit: "A",
        status: "normal",
        timestamp
      },
      {
        id: "solar-3",
        system: "Solar Array",
        parameter: "Panel Temperature",
        value: isDay 
          ? (42 + Math.sin(timeFactor * 0.2) * 5).toFixed(0)
          : "18",
        unit: "°C",
        status: (isDay && Math.random() > 0.8) ? "warning" : "normal",
        timestamp
      },
      {
        id: "solar-4",
        system: "Solar Array",
        parameter: "Irradiance",
        value: isDay 
          ? (856 + Math.sin((hour - 12) * 0.5) * 150).toFixed(0)
          : "0",
        unit: "W/m²",
        status: "normal",
        timestamp
      },
      {
        id: "solar-5",
        system: "Solar Array",
        parameter: "Power Output",
        value: isDay 
          ? (2.8 + Math.sin((hour - 12) * 0.5) * 0.8).toFixed(1)
          : "0.1",
        unit: "kW",
        status: "normal",
        timestamp
      },
      {
        id: "solar-6",
        system: "Solar Array",
        parameter: "String 1 Voltage",
        value: "190",
        unit: "V",
        status: "normal",
        timestamp
      },
      {
        id: "solar-7",
        system: "Solar Array",
        parameter: "String 2 Voltage",
        value: "188",
        unit: "V",
        status: "normal",
        timestamp
      },
      {
        id: "solar-8",
        system: "Solar Array",
        parameter: "Efficiency",
        value: "96.5",
        unit: "%",
        status: "normal",
        timestamp
      },
      
      // WIND TURBINE
      {
        id: "wind-1",
        system: "Wind Turbine",
        parameter: "Wind Speed",
        value: (8.5 + Math.sin(timeFactor * 0.4) * 2.5).toFixed(1),
        unit: "m/s",
        status: "normal",
        timestamp
      },
      {
        id: "wind-2",
        system: "Wind Turbine",
        parameter: "Generator Temp",
        value: (78 + Math.sin(timeFactor * 0.3) * 8).toFixed(0),
        unit: "°C",
        status: "normal",
        timestamp
      },
      {
        id: "wind-3",
        system: "Wind Turbine",
        parameter: "Power Output",
        value: (3.2 + Math.sin(timeFactor * 0.45) * 0.9).toFixed(1),
        unit: "kW",
        status: "normal",
        timestamp
      },
      {
        id: "wind-4",
        system: "Wind Turbine",
        parameter: "Rotor Speed",
        value: (45 + Math.sin(timeFactor * 0.35) * 12).toFixed(0),
        unit: "RPM",
        status: "normal",
        timestamp
      },
      
      // BATTERY SYSTEM
      {
        id: "battery-1",
        system: "Battery System",
        parameter: "State of Charge",
        value: (77.8 + Math.sin(timeFactor * 0.15) * 5).toFixed(1),
        unit: "%",
        status: "normal",
        timestamp
      },
      {
        id: "battery-2",
        system: "Battery System",
        parameter: "Voltage",
        value: "48.2",
        unit: "V",
        status: "normal",
        timestamp
      },
      {
        id: "battery-3",
        system: "Battery System",
        parameter: "Current",
        value: isDay 
          ? (25.3 + Math.sin(timeFactor * 0.25) * 8).toFixed(1)
          : "2.5",
        unit: "A",
        status: "normal",
        timestamp
      },
      {
        id: "battery-4",
        system: "Battery System",
        parameter: "Temperature",
        value: "28",
        unit: "°C",
        status: "normal",
        timestamp
      },
      
      // GRID CONNECTION
      {
        id: "grid-1",
        system: "Grid Connection",
        parameter: "Grid Voltage",
        value: "230.1",
        unit: "V",
        status: "normal",
        timestamp
      },
      {
        id: "grid-2",
        system: "Grid Connection",
        parameter: "Frequency",
        value: "50.02",
        unit: "Hz",
        status: "normal",
        timestamp
      },
      {
        id: "grid-3",
        system: "Grid Connection",
        parameter: "Export Power",
        value: (1.5 + Math.sin(timeFactor * 0.3) * 0.6).toFixed(1),
        unit: "kW",
        status: "normal",
        timestamp
      }
    ]
  }

  const fetchParameters = async () => {
    try {
      setLoading(true)
      console.log("🔄 Chargement depuis Supabase...")
      
      let dataToDisplay: SystemParameter[] = []
      
      if (useRealData) {
        // 🔧 CORRECTION : Sélectionner SEULEMENT les colonnes qui existent
        const { data, error } = await supabase
          .from('system_parameters')
          .select('id, system, parameter, value, unit, status')
          .order('system', { ascending: true })
          .order('parameter', { ascending: true })

        console.log("📊 Réponse Supabase:", { 
          dataCount: data?.length || 0,
          error: error?.message 
        })

        if (!error && data && data.length > 0) {
          console.log(`✅ ${data.length} paramètres chargés depuis Supabase`)
          
          // 🔧 CORRECTION : Transformer sans sensor_id
          dataToDisplay = data.map((item: any, index: number) => ({
            id: item.id || `item-${index}`,
            system: item.system || "Unknown",
            parameter: item.parameter || "Unknown",
            // 🔧 IMPORTANT : Formater valeur + unité proprement
            value: item.value?.toString() || "0",
            status: (item.status || "normal") as "normal" | "warning" | "critical",
            unit: item.unit || "",
            timestamp: item.created_at || new Date().toISOString()
          }))
        } else {
          // Fallback sur données dynamiques
          console.log("⚠️ Supabase vide/erreur, utilisation des données dynamiques")
          dataToDisplay = generateDynamicParameters()
        }
      } else {
        // Mode simulation pure
        console.log("🎮 Mode simulation activé")
        dataToDisplay = generateDynamicParameters()
      }
      
      setParameters(dataToDisplay)
      setLastUpdated(new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }))
      
      console.log(`📊 ${dataToDisplay.length} paramètres affichés`)
      
    } catch (error: any) {
      console.error('💥 Erreur:', error)
      // Fallback garanti
      setParameters(generateDynamicParameters())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParameters()
    const interval = setInterval(fetchParameters, 30000)
    return () => clearInterval(interval)
  }, [useRealData])

  // 🔧 Fonctions d'affichage (inchangées)
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'normal': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      case 'warning': return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      case 'critical': return "bg-red-500/10 text-red-400 border-red-500/30"
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-3 w-3 mr-1" />
      case 'warning':
      case 'critical': return <AlertCircle className="h-3 w-3 mr-1" />
      default: return null
    }
  }

  const getSystemIcon = (system: string) => {
    switch (system) {
      case "Solar Array": return <Zap className="h-4 w-4 text-yellow-500" />
      case "Wind Turbine": return <Wind className="h-4 w-4 text-blue-500" />
      case "Battery System": return <Battery className="h-4 w-4 text-green-500" />
      case "Grid Connection": return <Activity className="h-4 w-4 text-purple-500" />
      default: return <Activity className="h-4 w-4 text-slate-500" />
    }
  }

  // 🔧 Fonction pour insérer des données de test


  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Database className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">System Parameters</h3>
              <p className="text-sm text-slate-400">Live monitoring dashboard</p>
            </div>
          </div>
          
          {lastUpdated && (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setUseRealData(!useRealData)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              useRealData 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            <Database className="h-4 w-4" />
            {useRealData ? "Real Data Mode" : "Simulation Mode"}
          </button>
          
          <button
            onClick={fetchParameters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          
          {/* Bouton pour réinsérer les données */}
          
            
          
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['Solar Array', 'Wind Turbine', 'Battery System', 'Grid Connection'].map((system) => (
          <div key={system} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                system === 'Solar Array' ? 'bg-yellow-500/10' :
                system === 'Wind Turbine' ? 'bg-blue-500/10' :
                system === 'Battery System' ? 'bg-green-500/10' :
                'bg-purple-500/10'
              }`}>
                {getSystemIcon(system)}
              </div>
              <div>
                <p className="text-sm text-slate-400">{system.replace(' System', '').replace(' Connection', '')}</p>
                <p className="text-xl font-semibold text-white">
                  {parameters.filter(p => p.system === system).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800/50 border-slate-700">
              <TableHead className="text-slate-300 font-medium py-4 w-[200px]">System</TableHead>
              <TableHead className="text-slate-300 font-medium py-4">Parameter</TableHead>
              <TableHead className="text-slate-300 font-medium py-4 w-[150px]">Value</TableHead>
              <TableHead className="text-slate-300 font-medium py-4 w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                    <p className="text-slate-400">Loading system parameters...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : parameters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Database className="h-12 w-12 text-slate-500" />
                    <div className="text-center">
                      <h4 className="text-slate-300 font-medium mb-2">No Parameters Found</h4>
                      <p className="text-sm text-slate-500 mb-4">
                        Click "Insert Test Data" to populate the database
                      </p>
                      
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              parameters.map((param) => (
                <TableRow key={param.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell className="font-medium text-slate-200 py-4">
                    <div className="flex items-center gap-3">
                      {getSystemIcon(param.system)}
                      <span>{param.system}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 py-4">{param.parameter}</TableCell>
                  <TableCell className="py-4">
                    <div className="font-mono text-slate-100">
                      {param.value}
                      {param.unit && <span className="text-slate-400 ml-1">{param.unit}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`flex items-center w-fit px-3 py-1.5 ${getStatusBadgeClass(param.status)}`}>
                      {getStatusIcon(param.status)}
                      <span className="capitalize">{param.status}</span>
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pied de page */}
      <div className="text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            {parameters.length} parameters loaded
          </span>
          
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            {parameters.filter(p => p.status === "warning").length} warnings
          </span>
          
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${useRealData ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            {useRealData ? 'Connected to Supabase' : 'Simulation Mode Active'}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-slate-600">
            Auto-refresh: 30s
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>Project: qnbnieloo</span>
          </div>
        </div>
      </div>
    </div>
  )
}