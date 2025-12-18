// components/parameters-table-dynamic.tsx - VERSION CORRIGÉE
"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { RefreshCw, AlertCircle, CheckCircle, Database } from "lucide-react"

interface SystemParameter {
  id: string
  system: string
  parameter: string
  value: string
  status: "normal" | "warning" | "critical"
  unit: string
}

export function ParametersTable() {
  const [parameters, setParameters] = useState<SystemParameter[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const fetchParameters = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Tentative de connexion à Supabase...")
      
      // Test simple et direct
      const { data, error } = await supabase
        .from('system_parameters')
        .select('*')
        .order('system', { ascending: true })
        .order('parameter', { ascending: true })

      console.log("📊 Réponse Supabase:", { 
        hasData: !!data,
        dataCount: data?.length || 0,
        error: error?.message 
      })

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        setError(`Erreur Supabase: ${error.message}`)
        setParameters([])
        return
      }

      if (!data || data.length === 0) {
        console.log("📭 Table vide dans Supabase")
        setError("La table 'system_parameters' existe mais est vide")
        setParameters([])
        
        // Option: Insérer des données de test
        console.log("➕ Tentative d'insertion de données de test...")
        const testData = [
          { system: 'Solar Array', parameter: 'Voltage', value: 380, unit: 'V', status: 'normal' },
          { system: 'Solar Array', parameter: 'Current', value: 13.7, unit: 'A', status: 'normal' },
          { system: 'Solar Array', parameter: 'Temperature', value: 42, unit: '°C', status: 'warning' },
        ]
        
        const { error: insertError } = await supabase
          .from('system_parameters')
          .insert(testData)
        
        if (insertError) {
          console.log("⚠️ Échec insertion:", insertError.message)
        } else {
          console.log("✅ Données de test insérées, rechargement...")
          // Recharger après insertion
          setTimeout(() => fetchParameters(), 1000)
        }
        return
      }

      // Transformer les données
      const formattedData = data.map((item: any) => ({
        id: item.id,
        system: item.system,
        parameter: item.parameter,
        value: `${item.value}${item.unit}`,
        status: (item.status || 'normal') as "normal" | "warning" | "critical",
        unit: item.unit
      }))

      console.log(`✅ ${formattedData.length} données chargées avec succès`)
      setParameters(formattedData)
      setLastUpdated(new Date().toLocaleTimeString('fr-FR'))
      setError(null)
      
    } catch (error: any) {
      console.error('💥 Erreur inattendue:', error)
      setError(`Erreur: ${error.message}`)
      setParameters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("🚀 Initialisation du composant ParametersTable")
    console.log("🔗 URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    fetchParameters()
  }, [])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'normal':
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      case 'warning':
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
      case 'critical':
        return "bg-red-500/10 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'warning':
      case 'critical':
        return <AlertCircle className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <Database className="h-12 w-12 text-emerald-500 mb-4 animate-pulse" />
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-400 absolute -top-1 -right-1" />
        </div>
        <p className="text-slate-400">Connexion à Supabase...</p>
        <p className="text-sm text-slate-500 mt-2">URL: qnbnieloooxlayfxsuua.supabase.co</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec état de connexion */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${error ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
              <Database className={`h-5 w-5 ${error ? 'text-red-400' : 'text-emerald-400'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">System Parameters</h3>
              <p className="text-sm text-slate-400">Live data from Supabase</p>
            </div>
          </div>
          
          {lastUpdated && (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {error && (
            <div className="text-sm text-red-400 px-3 py-2 bg-red-500/10 rounded-lg">
              ⚠️ {error}
            </div>
          )}
          
          <button
            onClick={fetchParameters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Reconnecting...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/30 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-800/50 border-slate-700">
              <TableHead className="text-slate-300 font-medium py-4">System</TableHead>
              <TableHead className="text-slate-300 font-medium py-4">Parameter</TableHead>
              <TableHead className="text-slate-300 font-medium py-4">Value</TableHead>
              <TableHead className="text-slate-300 font-medium py-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                    <div className="p-4 bg-slate-800/50 rounded-full">
                      <Database className="h-10 w-10 text-slate-500" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-slate-300 font-medium mb-2">No Data Available</h4>
                      <p className="text-sm text-slate-500 mb-4">
                        {error || "The database table is empty. Click below to insert sample data."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button 
                          onClick={fetchParameters}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                        >
                          Check Again
                        </button>
                        <button 
                          onClick={async () => {
                            // Fonction pour insérer des données de démo
                            const testData = [
                              { system: 'Solar Array', parameter: 'Voltage', value: 380, unit: 'V', status: 'normal' },
                              { system: 'Solar Array', parameter: 'Current', value: 13.7, unit: 'A', status: 'normal' },
                              { system: 'Solar Array', parameter: 'Temperature', value: 42, unit: '°C', status: 'warning' },
                              { system: 'Wind Turbine', parameter: 'Wind Speed', value: 8.5, unit: 'm/s', status: 'normal' },
                            ]
                            
                            const { error } = await supabase
                              .from('system_parameters')
                              .insert(testData)
                            
                            if (!error) {
                              fetchParameters()
                            }
                          }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                        >
                          Insert Demo Data
                        </button>
                      </div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              parameters.map((param) => (
                <TableRow 
                  key={param.id} 
                  className="border-slate-700 hover:bg-slate-800/30 transition-colors"
                >
                  <TableCell className="font-medium text-slate-200 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        param.status === 'normal' ? 'bg-emerald-500' :
                        param.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      {param.system}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 py-4">{param.parameter}</TableCell>
                  <TableCell className="font-mono text-slate-100 py-4">{param.value}</TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="outline"
                      className={`flex items-center w-fit px-3 py-1.5 ${getStatusBadgeClass(param.status)}`}
                    >
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
      <div className="text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-4">
          <span>{parameters.length} parameters loaded</span>
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></div>
            {error ? 'Connection Error' : 'Connected to Supabase'}
          </span>
        </div>
        <div className="text-slate-600">
          Project: qnbnieloooxlayfxsuua
        </div>
      </div>
    </div>
  )
}