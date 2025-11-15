"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const predictionData = [
  { time: "Mon", predicted: 4.2, confidence: 92 },
  { time: "Tue", predicted: 5.8, confidence: 89 },
  { time: "Wed", predicted: 6.1, confidence: 85 },
  { time: "Thu", predicted: 3.5, confidence: 88 },
  { time: "Fri", predicted: 5.9, confidence: 90 },
  { time: "Sat", predicted: 6.5, confidence: 87 },
  { time: "Sun", predicted: 4.1, confidence: 91 },
]

export function PredictionChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={predictionData}>
        <defs>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="time" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "1px solid #475569",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#e2e8f0" }}
        />
        <Area
          type="monotone"
          dataKey="predicted"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorPredicted)"
          name="Predicted Production (kW)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
