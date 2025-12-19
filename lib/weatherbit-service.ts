export interface EnergyMetrics {
  solarPower: number
  windPower: number
  gridInjection: number
  systemEfficiency: number
  lastUpdated: Date
}

// Service RÉEL qui utilise l'API Weatherbit
export class WeatherbitService {
  private apiKey = '7d328db4a2d04a68b3a91e30017fbca0'
  private baseUrl = 'https://api.weatherbit.io/v2.0'
  
  // Coordonnées de Paris (vous pouvez changer)
  private latitude = 48.8566
  private longitude = 2.3522

  async getEnergyMetrics(): Promise<EnergyMetrics> {
    try {
      console.log('🌤️ Appel API Weatherbit en cours...')
      
      // 1. APPEL DE LA VRAIE API
      const response = await fetch(
        `${this.baseUrl}/current?lat=${this.latitude}&lon=${this.longitude}&key=${this.apiKey}&units=M`
      )
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      const weather = data.data[0]
      
      console.log('✅ Données API reçues:', {
        temperature: weather.temp,
        vent: `${weather.wind_spd} m/s`,
        nuages: `${weather.clouds}%`,
        irradiation: weather.ghi ? `${weather.ghi} W/m²` : 'non disponible'
      })
      
      // 2. CALCULS AVEC LES DONNÉES RÉELLES
      const now = new Date()
      const hour = now.getHours()
      const isDay = hour >= 6 && hour <= 20
      
      // Production SOLAIRE basée sur l'irradiation réelle
      let solarPower: number
      if (weather.ghi) {
        // Formule simplifiée : irradiation -> puissance
        // 1000 W/m² = 1 kW/m² idéal, avec 20% efficacité
        const panelArea = 20 // m² (surface de vos panneaux)
        const efficiency = 0.18 // 18% d'efficacité
        solarPower = (weather.ghi * efficiency * panelArea) / 1000 // kW
        
        // Réduire si nuageux
        if (weather.clouds > 50) solarPower *= 0.7
        if (weather.clouds > 80) solarPower *= 0.4
      } else {
        // Fallback si pas d'irradiation
        solarPower = isDay ? 2.8 + Math.sin(hour * 0.5) * 0.5 : 0.1
      }
      
      // Production ÉOLIENNE basée sur le vent réel
      const windPower = Math.max(0.5, weather.wind_spd * 0.8) // m/s -> kW simplifié
      
      // Calculs cohérents (comme avant)
      const consumption = 2.0 + Math.sin(hour * 0.5) * 0.5
      const totalProduction = solarPower + windPower
      const gridInjection = totalProduction - consumption
      
      // Efficacité basée sur conditions réelles
      let systemEfficiency = 82.5
      if (weather.clouds > 70) systemEfficiency -= 5
      if (weather.wind_spd > 10) systemEfficiency -= 3
      if (weather.temp > 30) systemEfficiency -= 4
      
      // Garder dans des limites réalistes
      systemEfficiency = Math.max(65, Math.min(95, systemEfficiency))
      
      console.log('📊 Données énergie calculées:', {
        solaire: `${solarPower.toFixed(1)} kW`,
        éolien: `${windPower.toFixed(1)} kW`,
        injection: `${gridInjection.toFixed(1)} kW`,
        efficacité: `${systemEfficiency.toFixed(1)}%`,
        source: 'API RÉELLE'
      })
      
      return {
        solarPower: Math.round(solarPower * 10) / 10,
        windPower: Math.round(windPower * 10) / 10,
        gridInjection: Math.round(gridInjection * 10) / 10,
        systemEfficiency: Math.round(systemEfficiency * 10) / 10,
        lastUpdated: now
      }
      
    } catch (error) {
      console.error('❌ Erreur API, utilisation du mode secours:', error)
      
      // MODE SECOURS : Retourne des données mock si API échoue
      return this.getFallbackMetrics()
    }
  }

  // Mode secours (votre ancien code mock)
  private getFallbackMetrics(): EnergyMetrics {
    console.log('🔄 Mode secours activé')
    
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const isDay = hour >= 7 && hour < 18
    
    const timeFactor = hour + minute / 60
    const solarPeak = 3.5
    const solarBase = isDay ? solarPeak * Math.sin((timeFactor - 7) * Math.PI / 11) : 0.1
    const solarPower = Math.max(0.1, solarBase + (Math.random() * 0.3 - 0.15))
    
    const windBase = 2.8 + Math.sin(timeFactor * 0.3) * 0.8
    const windPower = Math.max(0.5, windBase + (Math.random() * 0.4 - 0.2))
    
    const consumption = 2.0 + Math.sin(timeFactor * 0.5) * 0.5
    const totalProduction = solarPower + windPower
    const gridInjection = totalProduction - consumption
    
    const systemEfficiency = Math.min(95, 78 + Math.sin(timeFactor * 0.2) * 7 + (Math.random() * 4 - 2))
    
    return {
      solarPower: Math.round(solarPower * 10) / 10,
      windPower: Math.round(windPower * 10) / 10,
      gridInjection: Math.round(gridInjection * 10) / 10,
      systemEfficiency: Math.round(systemEfficiency * 10) / 10,
      lastUpdated: now
    }
  }
}

export const weatherbitService = new WeatherbitService()