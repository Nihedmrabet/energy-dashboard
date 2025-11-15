import { AlertCircle, CheckCircle, Info } from "lucide-react"

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "Wind Turbine Temperature Alert",
    message: "Generator temperature exceeded 85°C. Automatic shutdown initiated.",
    time: "2 minutes ago",
    icon: AlertCircle,
  },
  {
    id: 2,
    type: "warning",
    title: "Solar Panel Efficiency Drop",
    message: "Efficiency dropped to 92% due to dust accumulation",
    time: "15 minutes ago",
    icon: AlertCircle,
  },
  {
    id: 3,
    type: "info",
    title: "Grid Connection Stable",
    message: "All grid parameters within normal range",
    time: "1 hour ago",
    icon: Info,
  },
  {
    id: 4,
    type: "success",
    title: "System Maintenance Complete",
    message: "Scheduled maintenance completed successfully",
    time: "3 hours ago",
    icon: CheckCircle,
  },
]

export function AlertsPanel() {
  const typeColors = {
    critical: "border-red-500/30 bg-red-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
  }

  const typeIconColors = {
    critical: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    success: "text-emerald-400",
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = alert.icon
        return (
          <div key={alert.id} className={`border rounded-lg p-4 ${typeColors[alert.type]}`}>
            <div className="flex gap-3">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${typeIconColors[alert.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200">{alert.title}</p>
                <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                <p className="text-xs text-slate-500 mt-2">{alert.time}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
