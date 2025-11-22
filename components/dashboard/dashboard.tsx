"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UpcomingAppointments } from "./upcoming-appointments"
import { StatsCards } from "./stats-cards"
import { useApi } from "@/lib/api/client"

export function Dashboard() {
  const api = useApi()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const data = await api.get("/dashboard/summary")
      setSummary(data)
    } catch (error) {
      console.error("Error loading dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bienvenido</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu agenda y pacientes de manera eficiente</p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus size={20} />
          Nueva Cita
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards data={summary} loading={loading} />

      {/* Upcoming Appointments */}
      <UpcomingAppointments />
    </div>
  )
}
