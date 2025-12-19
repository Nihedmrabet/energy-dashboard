"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle, Bell, Filter, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from '@/lib/supabase-client'

export function AlertsPanelDynamic() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('active')
  
  const supabase = createClient()

const loadAlerts = async () => {
  try {
    setLoading(true)
    let query = supabase
      .from('system_alerts')
      .select('*')
      .order('timestamp', { ascending: false })  // ← CHANGÉ ICI
    
    if (filter === 'active') {
      query = query.eq('resolved', false)
    } else if (filter === 'critical') {
      query = query.eq('severity', 'critical').eq('resolved', false)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    setAlerts(data || [])
    
  } catch (error) {
    console.error("Error loading alerts:", error)
  } finally {
    setLoading(false)
  }
}

  const resolveAlert = async (id: number) => {
    try {
      await supabase
        .from('system_alerts')
        .update({ 
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', id)
      
      loadAlerts() // Reload the list
    } catch (error) {
      console.error("Error resolving alert:", error)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [filter])

  return (
    <div className="space-y-4">
      {/* Header with statistics */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">System Alerts</h3>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
              {alerts.filter(a => a.severity === 'critical' && !a.resolved).length} Critical
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
              {alerts.filter(a => a.severity === 'warning' && !a.resolved).length} Warning
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('critical')}
          >
            Critical
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.severity === 'critical'
                  ? 'bg-red-500/10 border-red-500/30'
                  : alert.severity === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {alert.severity === 'critical' && <AlertCircle className="h-5 w-5 text-red-400" />}
                    {alert.severity === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-400" />}
                    {alert.severity === 'info' && <AlertCircle className="h-5 w-5 text-blue-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{alert.title}</h4>
<Badge variant="outline" className="text-xs">
  {alert.sensor_id || 'System'}
</Badge>
                      {alert.resolved && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                          Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm opacity-80 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      
                      {alert.location && <span>Location: {alert.location}</span>}
                      <span className="opacity-70">
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!alert.resolved && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                    className="h-8 px-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}