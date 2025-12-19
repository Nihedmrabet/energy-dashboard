import { createClient } from '@/lib/supabase-client'

export interface AlertData {
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  source: string
  value: string
  threshold: string
  sensor_id?: string
  location?: string
}

export class AlertsSyncService {
  // Vérifier et créer des alertes basées sur les métriques
  static async syncKPIsWithAlerts(metrics: {
    solarPower: number
    windPower: number
    gridInjection: number
    systemEfficiency: number
    isDaytime: boolean
  }): Promise<AlertData[]> {
    
    const createdAlerts: AlertData[] = []
    
    // 1. Vérifier SOLAR POWER
    if (metrics.isDaytime && metrics.solarPower < 1.0) {
      const alert = await this.createSolarAlert(metrics.solarPower)
      createdAlerts.push(alert)
    }
    
    // 2. Vérifier WIND POWER
    if (metrics.windPower < 1.5) {
      const alert = await this.createWindAlert(metrics.windPower)
      createdAlerts.push(alert)
    }
    
    // 3. Vérifier GRID INJECTION
    if (metrics.gridInjection < 0.5) {
      const alert = await this.createGridAlert(metrics.gridInjection)
      createdAlerts.push(alert)
    }
    
    // 4. Vérifier SYSTEM EFFICIENCY
    if (metrics.systemEfficiency < 75) {
      const alert = await this.createEfficiencyAlert(metrics.systemEfficiency)
      createdAlerts.push(alert)
    }
    
    return createdAlerts
  }
  
  // Créer alerte solaire
  private static async createSolarAlert(power: number): Promise<AlertData> {
    const alertData: AlertData = {
      severity: 'warning',
      title: 'Low Solar Production',
      description: `Solar production below threshold: ${power.toFixed(1)} kW`,
      source: 'solar_panel',
      value: `${power.toFixed(1)} kW`,
      threshold: '1.0 kW',
      sensor_id: 'SOLAR_001',
      location: 'Solar Farm A'
    }
    
    await this.saveAlertToSupabase(alertData)
    return alertData
  }
  
  // Créer alerte éolienne
  private static async createWindAlert(power: number): Promise<AlertData> {
    const alertData: AlertData = {
      severity: 'warning',
      title: 'Low Wind Production',
      description: `Wind production insufficient: ${power.toFixed(1)} kW`,
      source: 'wind_turbine',
      value: `${power.toFixed(1)} kW`,
      threshold: '1.5 kW',
      sensor_id: 'WIND_001',
      location: 'Wind Turbine Field'
    }
    
    await this.saveAlertToSupabase(alertData)
    return alertData
  }
  
  // Créer alerte réseau
  private static async createGridAlert(injection: number): Promise<AlertData> {
    const isExport = injection > 0
    const alertData: AlertData = {
      severity: 'warning',
      title: isExport ? 'Low Grid Export' : 'High Grid Import',
      description: isExport 
        ? `Grid export too low: ${injection.toFixed(1)} kW`
        : `Grid import too high: ${Math.abs(injection).toFixed(1)} kW`,
      source: 'grid_connection',
      value: `${injection.toFixed(1)} kW`,
      threshold: isExport ? '0.5 kW' : '-0.5 kW',
      sensor_id: 'GRID_001',
      location: 'Main Transformer'
    }
    
    await this.saveAlertToSupabase(alertData)
    return alertData
  }
  
  // Créer alerte efficacité
  private static async createEfficiencyAlert(efficiency: number): Promise<AlertData> {
    const severity = efficiency < 60 ? 'critical' : 'warning'
    const threshold = efficiency < 60 ? '60%' : '75%'
    
    const alertData: AlertData = {
      severity,
      title: efficiency < 60 ? 'Critical System Efficiency' : 'Low System Efficiency',
      description: `System efficiency at ${efficiency.toFixed(1)}%`,
      source: 'system_controller',
      value: `${efficiency.toFixed(1)}%`,
      threshold,
      sensor_id: 'EFF_001',
      location: 'Control Room'
    }
    
    await this.saveAlertToSupabase(alertData)
    return alertData
  }
  
  // Sauvegarder l'alerte dans Supabase
  private static async saveAlertToSupabase(alert: AlertData): Promise<void> {
    try {
      // Vérifier si une alerte similaire existe déjà (non résolue)
      const { data: existingAlerts } = await createClient()
        .from('system_alerts')
        .select('id')
        .eq('source', alert.source)
        .eq('resolved', false)
        .limit(1)
      
      // Si aucune alerte similaire n'existe, en créer une nouvelle
      if (!existingAlerts || existingAlerts.length === 0) {
        await createClient().from('system_alerts').insert({
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          source: alert.source,
          value: alert.value,
          threshold: alert.threshold,
          sensor_id: alert.sensor_id,
          location: alert.location,
          resolved: false
        })
        
        console.log(`✅ Alerte créée dans Supabase: ${alert.title}`)
      } else {
        console.log(`⚠️ Alerte existe déjà pour: ${alert.source}`)
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde alerte:', error)
    }
  }
  
  // Marquer une alerte comme résolue
  static async resolveAlert(alertId: number): Promise<void> {
    try {
      await createClient()
        .from('system_alerts')
        .update({ 
          resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId)
      
      console.log(`✅ Alerte ${alertId} marquée comme résolue`)
    } catch (error) {
      console.error('❌ Erreur résolution alerte:', error)
    }
  }
  
  // Récupérer les alertes actives
  static async getActiveAlerts(): Promise<any[]> {
    try {
      const { data, error } = await createClient()
        .from('system_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erreur récupération alertes:', error)
      return []
    }
  }
}