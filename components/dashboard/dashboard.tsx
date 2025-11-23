"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { UpcomingAppointments } from "./upcoming-appointments"
import { StatsCards } from "./stats-cards"
import { useApi } from "@/lib/api/client"

interface Cita {
  id: string
  pacienteId: string
  fechaInicio: string
  modo: number
  estado: number
}

interface DashboardSummary {
  totalPacientes: number | string
  totalSesiones: number | string
  citasHoy: number
  proximaCita: number
}

export function Dashboard() {
  const api = useApi()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)

      // Fetch backend summary and appointments
      const [backendSummary, citas] = await Promise.all([
        api.get<{ totalPacientes?: number; totalSesiones?: number }>("/dashboard/summary"),
        api.get<Cita[]>("/Cita"),
      ])

      // Get today's date range (00:00:00 to 23:59:59)
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

      // Get next 24 hours range
      const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      // Filter appointments
      const citasArray = Array.isArray(citas) ? citas : []

      // Count appointments for today (estado 0 = Programada)
      const citasHoy = citasArray.filter((cita) => {
        const citaDate = new Date(cita.fechaInicio)
        return citaDate >= todayStart && citaDate <= todayEnd && cita.estado === 0
      }).length

      // Count appointments in next 24 hours
      const proximaCita = citasArray.filter((cita) => {
        const citaDate = new Date(cita.fechaInicio)
        return citaDate >= now && citaDate <= next24h && cita.estado === 0
      }).length

      // Combine backend data with client-calculated data
      setSummary({
        totalPacientes: backendSummary?.totalPacientes ?? "-",
        totalSesiones: backendSummary?.totalSesiones ?? "-",
        citasHoy,
        proximaCita,
      })
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
