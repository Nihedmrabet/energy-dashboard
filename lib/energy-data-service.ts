// lib/energy-data-service.ts
import { weatherbitService } from "./weatherbit-service"

export interface EnergyDataPoint {
  timestamp: string
  solarPower: number
  windPower: number
  gridInjection: number
  consumption: number
}

export interface EnergyFlowData {
  solar: number
  wind: number
  battery: number
  gridInjection: number
  consumption: number
}

export class EnergyDataService {
  // Générer des données historiques basées sur les conditions météo
  async getHistoricalData(hours: number = 24): Promise<EnergyDataPoint[]> {
    try {
      const dataPoints: EnergyDataPoint[] = []
      const now = new Date()
      
      // Obtenir les données météo actuelles
      const currentMetrics = await weatherbitService.getEnergyMetrics()
      
      for (let i = hours; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
        const hour = timestamp.getHours()
        const isDaytime = hour >= 7 && hour < 18
        
        // Simuler des variations basées sur l'heure
        const hourFactor = Math.sin(Math.PI * (hour - 6) / 12) // Courbe en cloche
        const randomFactor = 0.8 + Math.random() * 0.4 // Variation aléatoire
        
        // Calculer les valeurs pour cette heure
        let solarPower = 0
        if (isDaytime) {
          solarPower = Math.max(0, currentMetrics.solarPower * hourFactor * randomFactor)
        }
        
        // Vent plus variable
        const windFactor = 0.7 + Math.random() * 0.6
        const windPower = currentMetrics.windPower * windFactor
        
        // Consommation selon l'heure
        let consumption = 2.0
        if (hour >= 7 && hour <= 9) consumption = 3.5 // Matin
        if (hour >= 18 && hour <= 22) consumption = 4.2 // Soirée
        if (hour >= 23 || hour <= 6) consumption = 1.5 // Nuit
        
        const gridInjection = Math.max(0, (solarPower + windPower) - consumption)
        
        dataPoints.push({
          timestamp: timestamp.toISOString(),
          solarPower: parseFloat(solarPower.toFixed(1)),
          windPower: parseFloat(windPower.toFixed(1)),
          gridInjection: parseFloat(gridInjection.toFixed(1)),
          consumption: parseFloat(consumption.toFixed(1))
        })
      }
      
      return dataPoints
    } catch (error) {
      console.error('Error generating historical data:', error)
      return this.getMockHistoricalData(hours)
    }
  }
  
  // Données de secours
  private getMockHistoricalData(hours: number): EnergyDataPoint[] {
    const dataPoints: EnergyDataPoint[] = []
    const now = new Date()
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      const hour = timestamp.getHours()
      const isDaytime = hour >= 7 && hour < 18
      
      const solarPower = isDaytime 
        ? 3.5 + Math.sin(Math.PI * (hour - 6) / 12) * 2.5
        : 0.1
      
      const windPower = 2.8 + Math.random() * 2.4
      const consumption = 2.5 + Math.sin(Math.PI * (hour - 12) / 12) * 1.5
      const gridInjection = Math.max(0, (solarPower + windPower) - consumption)
      
      dataPoints.push({
        timestamp: timestamp.toISOString(),
        solarPower: parseFloat(solarPower.toFixed(1)),
        windPower: parseFloat(windPower.toFixed(1)),
        gridInjection: parseFloat(gridInjection.toFixed(1)),
        consumption: parseFloat(consumption.toFixed(1))
      })
    }
    
    return dataPoints
  }
  
  // Obtenir les données de flux énergétique actuelles
  async getEnergyFlowData(): Promise<EnergyFlowData> {
    try {
      const metrics = await weatherbitService.getEnergyMetrics()
      const now = new Date()
      const hour = now.getHours()
      const isDaytime = hour >= 7 && hour < 18
      
      // Calculer la consommation actuelle
      let consumption = 2.0
      if (hour >= 7 && hour <= 9) consumption = 3.5
      if (hour >= 18 && hour <= 22) consumption = 4.2
      if (hour >= 23 || hour <= 6) consumption = 1.5
      
      // Calculer le niveau de batterie basé sur la production
      const totalProduction = metrics.solarPower + metrics.windPower
      const netProduction = totalProduction - consumption
      
      let batteryLevel = 78 // Niveau par défaut
      if (netProduction > 0) {
        // Si production excédentaire, batterie se charge
        batteryLevel = Math.min(100, 78 + netProduction * 3)
      } else if (netProduction < 0) {
        // Si déficit, batterie se décharge
        batteryLevel = Math.max(20, 78 + netProduction * 2)
      }
      
      return {
        solar: metrics.solarPower,
        wind: metrics.windPower,
        battery: parseFloat(batteryLevel.toFixed(1)),
        gridInjection: metrics.gridInjection,
        consumption: consumption
      }
    } catch (error) {
      console.error('Error getting energy flow data:', error)
      return {
        solar: 5.2,
        wind: 3.8,
        battery: 78,
        gridInjection: 9.0,
        consumption: 2.5
      }
    }
  }
  
  // Calculer les totaux
  async getEnergyTotals(): Promise<{
    today: number
    thisMonth: number
    lastUpdated: Date
  }> {
    try {
      const historicalData = await this.getHistoricalData(24)
      
      // Total aujourd'hui (dernières 24h)
      const today = historicalData.reduce((sum, point) => 
        sum + point.solarPower + point.windPower, 0
      )
      
      // Estimation pour le mois (x30 + variation)
      const dailyAverage = today / 24
      const thisMonth = dailyAverage * 30 * (0.9 + Math.random() * 0.2)
      
      return {
        today: parseFloat(today.toFixed(1)),
        thisMonth: parseFloat(thisMonth.toFixed(1)),
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error('Error calculating energy totals:', error)
      return {
        today: 42.5,
        thisMonth: 1245,
        lastUpdated: new Date()
      }
    }
  }
}

export const energyDataService = new EnergyDataService()