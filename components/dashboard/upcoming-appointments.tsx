"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Video, AlertCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils/date"
import { useApi } from "@/lib/api/client"

interface Appointment {
  id: string
  pacienteId: string
  fechaInicio: string
  modo: number
  estado: number
}

interface Paciente {
  id: string
  nombre: string
  apellidos: string
}

export function UpcomingAppointments() {
  const api = useApi()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load both citas and pacientes
      const [citasData, pacientesData] = await Promise.all([
        api.get("/Cita"),
        api.get("/Pacientes"),
      ])

      setPacientes(Array.isArray(pacientesData) ? pacientesData : [])

      // Filter only programmed appointments from today onwards
      const now = new Date()
      const filteredData = (Array.isArray(citasData) ? citasData : [])
        .filter((apt: any) => {
          const aptDate = new Date(apt.fechaInicio)
          return aptDate >= now && apt.estado === 0
        })
        .sort((a: any, b: any) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
        .slice(0, 5)

      setAppointments(filteredData)
    } catch (error) {
      console.error("Error loading appointments:", error)
      setError("Error al cargar las citas. Verifica que el servidor esté disponible.")
    } finally {
      setLoading(false)
    }
  }

  const getModoLabel = (modo: number) => {
    return modo === 0 ? "Presencial" : "Online"
  }

  const getEstadoColor = (estado: number) => {
    const colors: Record<number, string> = {
      0: "bg-blue-100 text-blue-800",
      1: "bg-green-100 text-green-800",
      2: "bg-red-100 text-red-800",
    }
    return colors[estado] || "bg-gray-100 text-gray-800"
  }

  const getEstadoLabel = (estado: number) => {
    const labels: Record<number, string> = {
      0: "Programada",
      1: "Atendida",
      2: "Cancelada",
    }
    return labels[estado] || "Desconocido"
  }

  const getPacienteNombre = (pacienteId: string) => {
    const paciente = pacientes.find((p) => p.id === pacienteId)
    return paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Paciente desconocido"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Próximas Citas</CardTitle>
          <CardDescription>Citas programadas para hoy y próximos días</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Calendar Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar size={24} className="text-blue-600" />
                </div>

                {/* Patient Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-base text-foreground">{getPacienteNombre(apt.pacienteId)}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatDateTime(apt.fechaInicio)}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant={apt.modo === 0 ? "default" : "secondary"}
                    className={apt.modo === 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                  >
                    {getModoLabel(apt.modo).toLowerCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-muted-foreground"
                  >
                    {getEstadoLabel(apt.estado).toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay citas próximas</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
