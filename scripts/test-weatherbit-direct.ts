// scripts/test-weatherbit-direct.ts
const API_KEY = '7d328db4a2d04a68b3a91e30017fbca0'
const CITY = 'Paris'

async function testWeatherbitDirect() {
  console.log('🌤️ Test direct de l\'API Weatherbit...')
  
  try {
    console.log(`📍 Ville: ${CITY}`)
    console.log(`🔑 Clé API: ${API_KEY.substring(0, 8)}...`)
    
    const url = `https://api.weatherbit.io/v2.0/current?city=${CITY}&key=${API_KEY}&units=M&lang=fr`
    console.log(`🌐 URL appelée: ${url}`)
    
    const response = await fetch(url)
    
    console.log(`📡 Statut réponse: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      console.error(`❌ Erreur API: ${response.status} ${response.statusText}`)
      const text = await response.text()
      console.error(`📝 Réponse brute:`, text)
      return
    }
    
    const data = await response.json()
    console.log('✅ API fonctionne! Structure des données:')
    console.log(JSON.stringify(data, null, 2))
    
    if (data.data && data.data.length > 0) {
      const weather = data.data[0]
      console.log('\n📊 DONNÉES MÉTÉO ACTUELLES:')
      console.log(`📍 Ville: ${weather.city_name}`)
      console.log(`🌡️ Température: ${weather.temp}°C`)
      console.log(`💨 Vent: ${weather.wind_spd} m/s`)
      console.log(`🧭 Direction vent: ${weather.wind_dir}°`)
      console.log(`☁️ Nuages: ${weather.clouds}%`)
      console.log(`🌧️ Précipitations: ${weather.precip || 0} mm/h`)
      console.log(`💧 Humidité: ${weather.rh}%`)
      console.log(`🌞 Rayonnement solaire: ${weather.solar_rad || 'N/A'} W/m²`)
      console.log(`☀️ UV Index: ${weather.uv || 'N/A'}`)
      console.log(`🎯 Pression: ${weather.pres} hPa`)
      console.log(`👁️ Visibilité: ${weather.vis} km`)
      console.log(`⏰ Heure locale: ${weather.timestamp_local}`)
      console.log(`⏱️ Dernière observation: ${weather.ob_time}`)
      
      // Calculs énergétiques simples
      console.log('\n⚡ CALCULS ÉNERGÉTIQUES:')
      
      // Production solaire estimée
      const solarRad = weather.solar_rad || 350
      const solarKW = (solarRad * 25 * 0.18) / 1000
      console.log(`☀️ Production solaire estimée: ${solarKW.toFixed(1)} kW`)
      
      // Production éolienne estimée
      const windPower = Math.min(5, Math.pow(weather.wind_spd / 12, 3) * 5)
      console.log(`💨 Production éolienne estimée: ${windPower.toFixed(1)} kW`)
      
      console.log(`📈 Total production: ${(solarKW + windPower).toFixed(1)} kW`)
    } else {
      console.log('⚠️ Aucune donnée météo disponible')
    }
    
  } catch (error: any) {
    console.error('💥 ERREUR:', error.message)
    console.error('Stack:', error.stack)
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 DIAGNOSTIC:')
      console.log('1. Vérifiez votre connexion internet')
      console.log('2. L\'API Weatherbit est-elle accessible?')
      console.log('3. Problème possible de CORS (essayez depuis Node.js)')
    }
  }
}

// Exécute le test
testWeatherbitDirect()