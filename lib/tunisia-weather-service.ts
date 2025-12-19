// lib/tunisia-weather-service.ts
export interface TunisiaEnergyMetrics {
  solarPower: number
  windPower: number
  gridInjection: number
  systemEfficiency: number
  lastUpdated: Date
  temperature: number
  humidity: number
  city: string
  weatherDescription: string
  sunrise: string
  sunset: string
  isRealData: boolean
}

export class TunisiaWeatherService {
  // VOTRE nouvelle clé OpenWeatherMap
  private apiKey = '4421d9beb0880a307897897929414780'
  
  // Villes tunisiennes avec caractéristiques énergétiques
  private cities = {
    tunis: { 
      lat: 36.8065, 
      lon: 10.1815, 
      name: 'Tunis',
      solarPotential: 1.0,   // Base
      windPotential: 1.0,    // Base
      panelArea: 25,         // m² de panneaux solaires
      turbineCount: 2        // Nombre d'éoliennes
    },
    sfax: {
      lat: 34.7406,
      lon: 10.7603,
      name: 'Sfax',
      solarPotential: 1.25,  // 25% plus d'ensoleillement
      windPotential: 1.15,
      panelArea: 28,
      turbineCount: 3
    },
    sousse: {
      lat: 35.8283,
      lon: 10.6406,
      name: 'Sousse',
      solarPotential: 1.1,
      windPotential: 1.2,
      panelArea: 26,
      turbineCount: 2
    }
  }

  async getEnergyMetrics(cityName: keyof typeof this.cities = 'tunis'): Promise<TunisiaEnergyMetrics> {
    try {
      const city = this.cities[cityName]
      
      // 1. APPEL API avec VOTRE clé
      console.log(`🌍 Appel API pour ${city.name}...`)
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${this.apiKey}&units=metric&lang=fr`
      )
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('✅ Données réelles reçues:', {
        ville: data.name,
        température: `${data.main.temp}°C`,
        vent: `${data.wind.speed} m/s`,
        description: data.weather[0].description,
        lever: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
        coucher: new Date(data.sys.sunset * 1000).toLocaleTimeString()
      })
      
      // 2. CALCULS ÉNERGÉTIQUES POUR LA TUNISIE
      const now = new Date()
      const currentTime = now.getTime()
      const sunriseTime = data.sys.sunrise * 1000
      const sunsetTime = data.sys.sunset * 1000
      const isDaytime = currentTime > sunriseTime && currentTime < sunsetTime
      
      // A. PRODUCTION SOLAIRE (optimisé Tunisie)
      let solarPower: number
      if (isDaytime) {
        const hour = now.getHours()
        const minute = now.getMinutes()
        const solarHour = hour + minute / 60
        
        // Courbe solaire tunisienne (pic à 13h)
        const hourFromNoon = Math.abs(13 - solarHour)
        const solarEfficiency = Math.max(0, 1 - (hourFromNoon / 7))
        
        // Base calculée sur irradiation + potentiel ville
        const baseProduction = 4.2 * solarEfficiency * city.solarPotential
        
        // Effet nuages (moins impactant en Tunisie)
        const cloudEffect = data.clouds ? (1 - (data.clouds.all / 180)) : 0.85
        
        // Température affecte l'efficacité des panneaux
        const tempEffect = data.main.temp > 30 ? 0.95 : 1.0
        
        solarPower = baseProduction * cloudEffect * tempEffect
        
      } else {
        solarPower = 0.1 // Nuit
      }
      
      // B. PRODUCTION ÉOLIENNE (côtes tunisiennes)
      const windSpeed = data.wind.speed
      // Formule puissance éolienne simplifiée (P ≈ 0.5 × A × ρ × v³ × η)
      const airDensity = 1.225 // kg/m³ (à niveau de la mer)
      const bladeArea = 10.2 // m² (éolienne moyenne)
      const efficiency = 0.35
      const windPowerRaw = 0.5 * airDensity * bladeArea * Math.pow(windSpeed, 3) * efficiency / 1000
      
      // Ajuster au potentiel de la ville
      const windPower = Math.max(0.5, windPowerRaw * city.windPotential * city.turbineCount)
      
      // C. INJECTION RÉSEAU
      const baseConsumption = 2.8 // kW (consommation typique)
      const consumptionVariation = Math.sin(now.getHours() * 0.5) * 0.7
      const totalConsumption = baseConsumption + consumptionVariation
      const totalProduction = solarPower + windPower
      const gridInjection = totalProduction - totalConsumption
      
      // D. EFFICACITÉ SYSTÈME
      let systemEfficiency = 85.0 // Base élevée pour climat favorable
      
      // Facteurs d'ajustement
      if (data.main.temp > 35) systemEfficiency -= 4 // Très chaud
      if (data.clouds?.all > 80) systemEfficiency -= 3 // Très nuageux
      if (windSpeed > 8) systemEfficiency += 2 // Bon refroidissement
      
      // Garantir des limites réalistes
      systemEfficiency = Math.max(70, Math.min(92, systemEfficiency))
      
      return {
        solarPower: Number(Math.max(0.1, solarPower).toFixed(1)),
        windPower: Number(windPower.toFixed(1)),
        gridInjection: Number(gridInjection.toFixed(1)),
        systemEfficiency: Number(systemEfficiency.toFixed(1)),
        lastUpdated: now,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        city: data.name,
        weatherDescription: data.weather[0].description,
        sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('fr-TN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('fr-TN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isRealData: true
      }
      
    } catch (error) {
      console.error('❌ Erreur API, mode simulation:', error)
      return this.getSimulatedMetrics(cityName)
    }
  }

  private getSimulatedMetrics(cityName: keyof typeof this.cities): TunisiaEnergyMetrics {
    const city = this.cities[cityName]
    const now = new Date()
    const hour = now.getHours()
    const month = now.getMonth()
    
    // Données simulées réalistes pour la Tunisie
    const isSummer = month >= 5 && month <= 9
    const isDaytime = hour >= 6 && hour <= 20
    
    // Solaire Tunisie
    let solarPower: number
    if (isDaytime) {
      const hourFromNoon = Math.abs(13 - hour)
      const solarFactor = Math.max(0, 1 - (hourFromNoon / 7))
      const baseSolar = (isSummer ? 4.5 : 3.8) * solarFactor
      solarPower = baseSolar * city.solarPotential
    } else {
      solarPower = 0.1
    }
    
    // Éolien Tunisie
    const windBase = 2.8 + Math.sin(hour * 0.4) * 1.2
    const windPower = windBase * city.windPotential
    
    // Calculs standards
    const consumption = 2.5 + Math.sin(hour * 0.5) * 0.8
    const gridInjection = solarPower + windPower - consumption
    
    return {
      solarPower: Number(solarPower.toFixed(1)),
      windPower: Number(windPower.toFixed(1)),
      gridInjection: Number(gridInjection.toFixed(1)),
      systemEfficiency: 86.5,
      lastUpdated: now,
      temperature: isSummer ? 28 : 18,
      humidity: 50,
      city: city.name,
      weatherDescription: isDaytime ? 'Ensoleillé' : 'Nuit claire',
      sunrise: '06:30',
      sunset: '19:45',
      isRealData: false
    }
  }
  
  // BONUS : Prévisions pour les 24 prochaines heures
  async get24hForecast(cityName: keyof typeof this.cities = 'tunis') {
    try {
      const city = this.cities[cityName]
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${this.apiKey}&units=metric&cnt=8`
      )
      
      const data = await response.json()
      return data.list.map((item: any) => ({
        time: new Date(item.dt * 1000),
        solarPower: this.calculateSolarFromData(item, city),
        windPower: this.calculateWindFromData(item, city),
        temperature: item.main.temp
      }))
      
    } catch (error) {
      console.error('Erreur prévisions:', error)
      return []
    }
  }
}