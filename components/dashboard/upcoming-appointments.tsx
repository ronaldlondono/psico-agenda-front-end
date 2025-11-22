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
  pacienteNombre: string
  fechaInicio: string
  modo: number
  estado: number
}

export function UpcomingAppointments() {
  const api = useApi()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get("/Cita")

      // Filter only programmed appointments from today onwards
      const now = new Date()
      const filteredData = (Array.isArray(data) ? data : [])
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
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium">{apt.pacienteNombre}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDateTime(apt.fechaInicio)}
                    </span>
                    <span className="flex items-center gap-1">
                      {apt.modo === 0 ? (
                        <>
                          <MapPin size={16} />
                          Presencial
                        </>
                      ) : (
                        <>
                          <Video size={16} />
                          Online
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <Badge className={getEstadoColor(apt.estado)}>{getEstadoLabel(apt.estado)}</Badge>
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
