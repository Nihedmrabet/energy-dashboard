// components/kpi-card-dynamic.tsx - VERSION AVEC CADRES ÉGAUX
"use client"

import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Sun,
  Wind,
  Zap,
  Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface KPIProps {
  title: string
  value: string
  unit: string
  icon: React.ReactNode
  trend: string
  status: "normal" | "warning" | "critical"
  color: string
  loading?: boolean
  subtitle?: string
}

export function KPICardDynamic(props: KPIProps) {
  const trendArrow = props.trend.includes('↗') ? '↗' : 
                    props.trend.includes('↘') ? '↘' : '→'
  const trendValue = props.trend.replace(/[↗↘→]/g, '').trim()
  
  const isPositive = props.trend.includes('+')
  const isNegative = props.trend.includes('-')
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  // Icônes améliorées
  const getIcon = () => {
    switch (props.title) {
      case 'Solar Power':
        return <Sun className="w-6 h-6" strokeWidth={1.5} />
      case 'Wind Power':
        return <Wind className="w-6 h-6" strokeWidth={1.5} />
      case 'Grid Injection':
        return <Zap className="w-6 h-6" strokeWidth={1.5} />
      case 'System Efficiency':
        return <Activity className="w-6 h-6" strokeWidth={1.5} />
      default:
        return props.icon
    }
  }

  const enhancedIcon = getIcon()

  return (
    <div className={cn(
      "group relative rounded-xl p-4 border transition-all duration-300",
      "hover:scale-[1.015] hover:shadow-lg",
      "bg-gradient-to-br from-slate-900/95 to-slate-950/95",
      "border-slate-800/50 backdrop-blur-sm min-h-[180px] flex flex-col",
      props.status === 'critical' ? 'border-red-500/30' :
      props.status === 'warning' ? 'border-amber-500/30' :
      'border-emerald-500/30'
    )}>
      <div className="space-y-3 flex-1 flex flex-col">
        {/* En-tête - Hauteur fixe */}
        <div className="flex items-start justify-between min-h-[48px]">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2.5 rounded-lg shrink-0",
              "bg-gradient-to-br", props.color,
              "shadow-md"
            )}>
              <div className="text-white">
                {enhancedIcon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-slate-200 truncate">
                {props.title}
              </h3>
              {props.subtitle && !props.loading && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {props.subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Statut - Largeur fixe */}
          {!props.loading && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
              "min-w-[80px] justify-center",
              props.status === 'critical' ? 'bg-red-500/20 text-red-300' :
              props.status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
              'bg-emerald-500/20 text-emerald-300'
            )}>
              {props.status === 'critical' || props.status === 'warning' 
                ? <AlertTriangle className="w-3 h-3 shrink-0" />
                : <CheckCircle2 className="w-3 h-3 shrink-0" />
              }
              <span className="truncate">{props.status}</span>
            </div>
          )}
        </div>

        {/* Valeur - Espace flexible */}
        <div className="flex-1 flex flex-col justify-center">
          {props.loading ? (
            <div className="space-y-2">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-800/50"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-white">
                  {props.value}
                </span>
                <span className="text-sm text-slate-400">
                  {props.unit}
                </span>
              </div>
              
              {/* Barre simple */}
              <div className="h-1.5 w-full bg-slate-800/30 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    props.color
                  )}
                  style={{ 
                    width: `${Math.min(100, 
                      props.title.includes('Efficiency') ? parseFloat(props.value) :
                      parseFloat(props.value) * 25
                    )}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Trend - Pied fixe */}
        <div className="flex items-center justify-between pt-2 mt-auto">
          {props.loading ? (
            <div className="h-6 w-20 animate-pulse rounded bg-slate-800/50"></div>
          ) : (
            <>
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium min-w-0",
                isPositive ? 'text-emerald-400' :
                isNegative ? 'text-amber-400' :
                'text-blue-400'
              )}>
                <TrendIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{trendArrow} {trendValue}</span>
              </div>
              
              <span className={cn(
                "text-xs font-medium shrink-0",
                isPositive ? 'text-emerald-400/80' :
                isNegative ? 'text-amber-400/80' :
                'text-blue-400/80'
              )}>
                {isPositive ? 'Hausse' : isNegative ? 'Baisse' : 'Stable'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}