// components/kpi-card.tsx
"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

// EXPORTEZ l'interface
export interface KPICardProps {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  trend: string
  status: "normal" | "warning" | "critical"
  color: string
}

export function KPICard({ title, value, unit, icon, trend, status, color }: KPICardProps) {
  const statusColors = {
    normal: "border-emerald-500/30 bg-emerald-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    critical: "border-red-500/30 bg-red-500/5",
  }

  const trendIcon = trend.startsWith("+") ? (
    <TrendingUp className="w-4 h-4 text-emerald-400" />
  ) : (
    <TrendingDown className="w-4 h-4 text-red-400" />
  )

  return (
    <Card className={`border ${statusColors[status]} bg-slate-800/50 backdrop-blur`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div
            // Corrigé: bg-gradient-to-br au lieu de bg-linear-to-br
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}
          >
            {icon}
          </div>
          {status === "warning" && <AlertCircle className="w-4 h-4 text-yellow-500" />}
        </div>

        <p className="text-sm text-slate-400 mb-1">{title}</p>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">{value}</span>
          <span className="text-sm text-slate-400">{unit}</span>
        </div>

        <div className="flex items-center gap-1">
          {trendIcon}
          <span
            className={`text-sm ${
              trend.startsWith("+") ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}