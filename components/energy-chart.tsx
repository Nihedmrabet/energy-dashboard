"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { time: "00:00", solar: 0, wind: 0.5, grid: 0.5 },
  { time: "04:00", solar: 0, wind: 2.1, grid: 2.1 },
  { time: "08:00", solar: 2.5, wind: 1.8, grid: 4.3 },
  { time: "12:00", solar: 5.8, wind: 2.1, grid: 7.9 },
  { time: "16:00", solar: 4.2, wind: 3.5, grid: 7.7 },
  { time: "20:00", solar: 0.5, wind: 4.1, grid: 4.6 },
  { time: "24:00", solar: 0, wind: 3.2, grid: 3.2 },
]

interface EnergyChartProps {
  timeRange: string
}

export function EnergyChart({ timeRange }: EnergyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} >
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
        <Legend />
        <Line type="monotone" dataKey="solar" stroke="#fbbf24" strokeWidth={2} dot={false} name="Solar Power (kW)" />
        <Line type="monotone" dataKey="wind" stroke="#06b6d4" strokeWidth={2} dot={false} name="Wind Power (kW)" />
        <Line type="monotone" dataKey="grid" stroke="#10b981" strokeWidth={2} dot={false} name="Grid Injection (kW)" />
      </LineChart>
    </ResponsiveContainer>
  )
}
