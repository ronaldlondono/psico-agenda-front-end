"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Filter, Edit, Trash2 } from "lucide-react"
import { useApi } from "@/lib/api/client"
import type { Cita, Paciente } from "@/lib/types/api"
import { CreateCitaDialog } from "./create-cita-dialog"
import { EditCitaDialog } from "./edit-cita-dialog"
import { formatTime, parseDate, formatDateTime } from "@/lib/utils/date"

export function AgendaView() {
  const api = useApi()
  const [citas, setCitas] = useState<Cita[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingCita, setEditingCita] = useState<Cita | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [filterPacienteId, setFilterPacienteId] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("todos")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [citasData, pacientesData] = await Promise.all([
        api.get<Cita[]>("/Cita"),
        api.get<Paciente[]>("/Pacientes"),
      ])
      setCitas(Array.isArray(citasData) ? citasData : [])
      setPacientes(Array.isArray(pacientesData) ? pacientesData : [])
    } catch (error) {
      console.error("Error loading agenda:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas cancelar esta cita?")) return

    try {
      await api.delete(`/Cita/${id}`)
      setCitas(citas.filter((c) => c.id !== id))
    } catch (error) {
      console.error("Error deleting cita:", error)
    }
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    loadData()
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setEditingCita(null)
    loadData()
  }

  const getFilteredCitas = () => {
    return citas.filter((cita) => {
      // Filter by paciente
      if (filterPacienteId && cita.pacienteId !== filterPacienteId) {
        return false
      }

      // Filter by estado
      if (filterEstado !== "todos" && cita.estado !== Number.parseInt(filterEstado)) {
        return false
      }

      // Filter by date range
      if (dateFrom) {
        const citaDate = new Date(cita.fechaInicio)
        const fromDate = new Date(dateFrom)
        if (citaDate < fromDate) return false
      }

      if (dateTo) {
        const citaDate = new Date(cita.fechaInicio)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (citaDate > toDate) return false
      }

      return true
    })
  }

  const filteredCitas = getFilteredCitas()

  // Group citas by date for calendar view
  const citasByDate = filteredCitas.reduce(
    (acc, cita) => {
      const citaDate = parseDate(cita.fechaInicio)
      if (!citaDate) return acc
      // Use ISO date string (YYYY-MM-DD) as key for proper sorting and parsing
      const dateKey = citaDate.toISOString().split('T')[0]
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(cita)
      return acc
    },
    {} as Record<string, Cita[]>,
  )

  return (
    <div className="space-y-6 p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus citas y consultas</p>
        </div>
        <Button size="lg" onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus size={20} />
          Nueva Cita
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter size={18} />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Paciente</label>
              <select
                value={filterPacienteId}
                onChange={(e) => setFilterPacienteId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="">Todos</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellidos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Estado</label>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="todos">Todos</option>
                <option value="0">Programada</option>
                <option value="1">Atendida</option>
                <option value="2">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Desde</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Hasta</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Citas List */}
      <Card>
        <CardHeader>
          <CardTitle>Citas ({filteredCitas.length})</CardTitle>
          <CardDescription>Próximas citas programadas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : Object.keys(citasByDate).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(citasByDate)
                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                .map(([dateKey, daysCitas]) => {
                  const date = new Date(dateKey + 'T00:00:00')
                  const formattedDate = date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })

                  return (
                    <div key={dateKey}>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3 px-2">
                        {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
                      </h3>
                      <div className="space-y-2">
                        {daysCitas.map((cita) => (
                          <CitaCard
                            key={cita.id}
                            cita={cita}
                            pacientes={pacientes}
                            onEdit={() => {
                              setEditingCita(cita)
                              setEditDialogOpen(true)
                            }}
                            onDelete={() => handleDelete(cita.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay citas registradas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateCitaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        pacientes={pacientes}
      />
      {editingCita && (
        <EditCitaDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          cita={editingCita}
          onSuccess={handleEditSuccess}
          pacientes={pacientes}
        />
      )}
    </div>
  )
}

interface CitaCardProps {
  cita: Cita
  pacientes: Paciente[]
  onEdit: () => void
  onDelete: () => void
}

function CitaCard({ cita, pacientes, onEdit, onDelete }: CitaCardProps) {
  const getPacienteNombre = () => {
    const paciente = pacientes.find((p) => p.id === cita.pacienteId)
    return paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Paciente desconocido"
  }
  const getModoLabel = (modo: number) => (modo === 0 ? "Presencial" : "Online")
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

  const startTime = formatTime(cita.fechaInicio)
  const endTime = formatTime(cita.fechaFin)
  console.log("Fecha inicial", startTime, "Fecha final", endTime)

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="flex-1">
        <p className="font-semibold">{getPacienteNombre()}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>
            {startTime} - {endTime}
          </span>
          <span>•</span>
          <span className="capitalize">{getModoLabel(cita.modo)}</span>
        </div>
        {cita.notas && <p className="text-sm mt-1 text-muted-foreground">{cita.notas}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
          {getEstadoLabel(cita.estado)}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={onEdit} className="hover:bg-blue-100">
            <Edit size={16} className="hover:text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="hover:bg-red-100">
            <Trash2 size={16} className="text-destructive hover:text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}
