"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardsProps {
  data: any
  loading: boolean
}

const stats = [
  {
    label: "Pacientes",
    icon: Users,
    key: "totalPacientes",
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Citas Hoy",
    icon: Calendar,
    key: "citasHoy",
    color: "from-green-500 to-green-600",
  },
  {
    label: "Sesiones",
    icon: FileText,
    key: "totalSesiones",
    color: "from-purple-500 to-purple-600",
  },
  {
    label: "Próxima Cita",
    icon: Clock,
    key: "proximaCita",
    color: "from-orange-500 to-orange-600",
  },
]

export function StatsCards({ data, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const value = data?.[stat.key] ?? (stat.key === "totalPacientes" || stat.key === "totalSesiones" ? "-" : "0")

        return (
          <Card key={stat.label} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <Icon size={20} className="text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{value}</div>}
              <p className="text-xs text-muted-foreground mt-1">
                {stat.key === "proximaCita" ? "Próximas 24h" : "Total"}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
