import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { message, systemContext } = await request.json()

    const systemPrompt = `You are an intelligent Energy System Assistant for a Smart Solar and Wind Energy Monitoring System. 
    
Current System Status:
- Solar Power: ${systemContext.solarPower}
- Wind Power: ${systemContext.windPower}
- Grid Injection: ${systemContext.gridInjection}
- System Efficiency: ${systemContext.efficiency}
- Solar Panel Temperature: ${systemContext.solarTemp}
- Wind Generator Temperature: ${systemContext.windTemp}
- Battery Level: ${systemContext.batteryLevel}

You are helpful, professional, and provide specific recommendations based on the current system data. 
Answer questions about:
1. Current energy production and performance
2. System parameters and technical details
3. Predictions and forecasts
4. Optimization recommendations
5. Alerts and troubleshooting
6. Energy efficiency tips

Keep responses concise and actionable. Use the current system data to provide relevant insights.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      prompt: message,
      temperature: 0.7,
      maxTokens: 300,
    })

    return Response.json({ reply: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to process message" }, { status: 500 })
  }
}
