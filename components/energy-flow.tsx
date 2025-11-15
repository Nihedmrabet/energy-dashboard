export function EnergyFlow() {
  return (
    <div className="space-y-6">
      {/* Solar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Solar</span>
          <span className="text-lg font-bold text-yellow-400">5.2 kW</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: "65%" }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Wind</span>
          <span className="text-lg font-bold text-cyan-400">3.8 kW</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" style={{ width: "48%" }} />
        </div>
      </div>

      {/* Battery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Battery</span>
          <span className="text-lg font-bold text-purple-400">78%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: "78%" }} />
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Grid Injection</span>
          <span className="text-lg font-bold text-emerald-400">9.0 kW</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full" style={{ width: "90%" }} />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 pt-4 mt-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xs text-slate-400">Today</p>
            <p className="text-lg font-bold text-slate-200">42.5 kWh</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">This Month</p>
            <p className="text-lg font-bold text-slate-200">1,245 kWh</p>
          </div>
        </div>
      </div>
    </div>
  )
}
