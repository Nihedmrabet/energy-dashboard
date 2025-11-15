import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const parameters = [
  {
    system: "Solar Array",
    parameter: "Voltage",
    value: "380V",
    status: "normal",
  },
  {
    system: "Solar Array",
    parameter: "Current",
    value: "13.7A",
    status: "normal",
  },
  {
    system: "Solar Array",
    parameter: "Temperature",
    value: "42°C",
    status: "normal",
  },
  {
    system: "Solar Array",
    parameter: "Irradiance",
    value: "850 W/m²",
    status: "normal",
  },
  {
    system: "Wind Turbine",
    parameter: "Wind Speed",
    value: "8.5 m/s",
    status: "normal",
  },
  {
    system: "Wind Turbine",
    parameter: "Rotor Speed",
    value: "42 RPM",
    status: "normal",
  },
  {
    system: "Wind Turbine",
    parameter: "Generator Temp",
    value: "78°C",
    status: "warning",
  },
  {
    system: "Wind Turbine",
    parameter: "Blade Angle",
    value: "25°",
    status: "normal",
  },
  {
    system: "Grid",
    parameter: "Frequency",
    value: "50.02 Hz",
    status: "normal",
  },
  {
    system: "Grid",
    parameter: "Voltage",
    value: "230V",
    status: "normal",
  },
]

export function ParametersTable() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-300">System</TableHead>
            <TableHead className="text-slate-300">Parameter</TableHead>
            <TableHead className="text-slate-300">Value</TableHead>
            <TableHead className="text-slate-300">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((param, idx) => (
            <TableRow key={idx} className="border-slate-700 hover:bg-slate-700/30">
              <TableCell className="text-slate-300">{param.system}</TableCell>
              <TableCell className="text-slate-300">{param.parameter}</TableCell>
              <TableCell className="font-mono text-slate-200">{param.value}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    param.status === "normal"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                  }
                >
                  {param.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
