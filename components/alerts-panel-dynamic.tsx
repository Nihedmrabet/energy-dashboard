// components/alerts-panel-dynamic.tsx - VERSION CORRIGÉE
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { AlertCircle, CheckCircle, Info, Clock, RefreshCw, Database, Filter } from "lucide-react"

// Types CORRIGÉS - "warning" doit être dans AlertType seulement
type AlertType = "critical" | "warning" | "info" | "success"
type SeverityType = "critical" | "high" | "medium" | "low" | "info" | "success"

interface SystemAlert {
  id: string
  type: AlertType
  title: string
  message: string
  time: string
  timestamp: string
  severity: SeverityType  // Utilise SeverityType, pas AlertType
  resolved: boolean
  alert_type?: string
}

export function AlertsPanelDynamic() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [filteredAlerts, setFilteredAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all")
  
  const supabase = createClient()

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Chargement des alertes depuis Supabase...")
      
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)

      console.log("📊 Réponse alertes:", { 
        dataCount: data?.length || 0,
        error: error?.message 
      })

      if (error) {
        console.error('❌ Erreur:', error)
        setError(`Erreur de chargement: ${error.message}`)
        setAlerts(getStaticAlerts())
        return
      }

      if (!data || data.length === 0) {
        console.log("📭 Aucune alerte dans Supabase")
        setError("Aucune alerte trouvée dans la base de données")
        setAlerts(getStaticAlerts())
        return
      }

      // Transformer les données avec votre structure exacte
      const formattedAlerts = data.map((item: any): SystemAlert => {
        // Déterminer le type d'alerte basé sur severity
        const severity = item.severity?.toLowerCase() || 'info'
        
        // Conversion CORRIGÉE : SeverityType -> AlertType
        const severityToAlertType: Record<SeverityType, AlertType> = {
          'critical': 'critical',
          'high': 'critical',    // 'high' devient 'critical' pour AlertType
          'medium': 'warning',   // 'medium' devient 'warning' pour AlertType
          'low': 'info',         // 'low' devient 'info' pour AlertType
          'info': 'info',        // 'info' reste 'info'
          'success': 'success'   // 'success' reste 'success'
        }

        // Validation du severity - CORRIGÉ
        const validSeverity: SeverityType = (
          ['critical', 'high', 'medium', 'low', 'info', 'success'].includes(severity)
        ) ? severity as SeverityType : 'info'

        // Déterminer le AlertType à partir du SeverityType
        const type: AlertType = severityToAlertType[validSeverity] || 'info'

        // Calculer le temps écoulé
        const timeAgo = calculateTimeAgo(item.timestamp)

        return {
          id: item.id,
          type: type,
          title: item.title || 'Sans titre',
          message: item.description || '',
          time: timeAgo,
          timestamp: item.timestamp,
          severity: validSeverity,  // Utilise SeverityType
          resolved: item.resolved || false,
          alert_type: item.alert_type
        }
      })

      console.log(`✅ ${formattedAlerts.length} alertes chargées`)
      setAlerts(formattedAlerts)
      setError(null)
      
    } catch (error: any) {
      console.error('💥 Erreur inattendue:', error)
      setError(`Erreur: ${error.message}`)
      setAlerts(getStaticAlerts())
    } finally {
      setLoading(false)
    }
  }

  // Appliquer le filtre
  useEffect(() => {
    let filtered = [...alerts]
    
    switch (filter) {
      case "active":
        filtered = filtered.filter(alert => !alert.resolved)
        break
      case "resolved":
        filtered = filtered.filter(alert => alert.resolved)
        break
      // "all" - pas de filtre
    }
    
    setFilteredAlerts(filtered)
  }, [alerts, filter])

  // Fonction pour calculer "il y a X temps"
  const calculateTimeAgo = (timestamp: string) => {
    try {
      const now = new Date()
      const created = new Date(timestamp)
      const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return "À l'instant"
      if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
      
      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
      
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 30) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
      
      const diffInMonths = Math.floor(diffInDays / 30)
      return `Il y a ${diffInMonths} mois`
    } catch {
      return "Date inconnue"
    }
  }

  // Données statiques de fallback - CORRIGÉ
  const getStaticAlerts = (): SystemAlert[] => [
    {
      id: "static-1",
      type: "critical",
      title: "Wind Turbine Temperature Alert",
      message: "Generator temperature exceeded 85°C. Automatic shutdown initiated.",
      time: "2 minutes ago",
      timestamp: new Date().toISOString(),
      severity: "critical",  // SeverityType, pas AlertType
      resolved: false
    },
    {
      id: "static-2",
      type: "warning",        // AlertType
      title: "Solar Panel Efficiency Drop",
      message: "Efficiency dropped to 92% due to dust accumulation",
      time: "15 minutes ago",
      timestamp: new Date().toISOString(),
      severity: "medium",     // SeverityType, pas "warning"
      resolved: false
    },
    {
      id: "static-3",
      type: "success",        // AlertType
      title: "System Maintenance Complete",
      message: "Scheduled maintenance completed successfully",
      time: "3 hours ago",
      timestamp: new Date().toISOString(),
      severity: "success",    // SeverityType
      resolved: true
    },
    {
      id: "static-4",
      type: "info",           // AlertType
      title: "Grid Connection Stable",
      message: "All grid parameters within normal range",
      time: "1 hour ago",
      timestamp: new Date().toISOString(),
      severity: "info",       // SeverityType
      resolved: true
    }
  ]

  useEffect(() => {
    fetchAlerts()

    // Abonnement en temps réel aux nouvelles alertes
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_alerts'
        },
        () => {
          console.log("📡 Nouvelle alerte détectée")
          fetchAlerts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const typeColors: Record<AlertType, string> = {
    critical: "border-red-500/30 bg-red-500/5 hover:bg-red-500/10",
    warning: "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10",
    info: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10",
    success: "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10",
  }

  const typeIconColors: Record<AlertType, string> = {
    critical: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    success: "text-emerald-400",
  }

  const getIconForType = (type: AlertType) => {
    switch (type) {
      case 'critical':
      case 'warning':
        return AlertCircle
      case 'success':
        return CheckCircle
      default:
        return Info
    }
  }

  // Fonction pour obtenir la couleur du badge severity
  const getSeverityColor = (severity: SeverityType) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400'
      case 'high':
        return 'bg-red-500/15 text-red-300'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'low':
        return 'bg-blue-500/20 text-blue-400'
      case 'info':
        return 'bg-blue-500/15 text-blue-300'
      case 'success':
        return 'bg-emerald-500/20 text-emerald-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  // Fonction corrigée pour compter les alertes par type
  const getAlertCountByType = (type: AlertType) => {
    return alerts.filter(alert => alert.type === type).length
  }

  // Fonction corrigée pour compter les alertes par severity
  const getAlertCountBySeverity = (severity: SeverityType) => {
    return alerts.filter(alert => alert.severity === severity).length
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-500" />
            <div className="text-sm text-slate-400">Chargement des alertes...</div>
          </div>
          <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-700 rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-5 h-5 bg-slate-700 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-800 rounded w-full"></div>
                  <div className="h-2 bg-slate-800 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques et filtres */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-slate-300">
              {alerts.length} alertes système
            </span>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              {getAlertCountByType('critical')} critiques
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              {getAlertCountByType('warning')} avertissements
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {alerts.filter(a => a.resolved).length} résolues
            </span>
          </div>
          
          {error && (
            <div className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded mt-2">
              ⚠️ {error}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* Bouton de rafraîchissement */}
          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser les alertes"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          
          {/* Filtres */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            {(["all", "active", "resolved"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  filter === filterType 
                    ? 'bg-slate-700 text-slate-200' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {filterType === 'all' && 'Toutes'}
                {filterType === 'active' && 'Actives'}
                {filterType === 'resolved' && 'Résolues'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des alertes filtrées */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 border border-slate-700 rounded-lg">
            <Filter className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">Aucune alerte correspondante</p>
            <p className="text-sm text-slate-500 mt-1">
              {filter === 'active' ? 'Toutes les alertes sont résolues' : 
               filter === 'resolved' ? 'Aucune alerte résolue' : 
               'Aucune alerte trouvée'}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getIconForType(alert.type)
            const isResolved = alert.resolved
            
            return (
              <div 
                key={alert.id} 
                className={`border rounded-lg p-4 transition-all group ${
                  typeColors[alert.type]
                } ${isResolved ? 'opacity-70' : 'hover:scale-[1.005] hover:shadow-lg'}`
                }
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${typeIconColors[alert.type]}`} />
                    {isResolved && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-200">{alert.title}</p>
                        {alert.alert_type && (
                          <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded mt-1 inline-block">
                            {alert.alert_type}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isResolved && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                            Résolue
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <p className="text-xs text-slate-500">{alert.time}</p>
                      <span className="text-slate-600">•</span>
                      <p className="text-xs text-slate-500">
                        {new Date(alert.timestamp).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pied de page avec informations */}
      <div className="pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Structure: id, timestamp, alert_type, title, description, severity, resolved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}