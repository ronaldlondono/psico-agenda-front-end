"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useApi } from "@/lib/api/client"
import type { Sesion, Paciente } from "@/lib/types/api"
import { CreateSesionDialog } from "./create-sesion-dialog"
import { ViewSesionDialog } from "./view-sesion-dialog"

export function SesionesView() {
  const api = useApi()
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewingSesion, setViewingSesion] = useState<Sesion | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [sesionesData, pacientesData] = await Promise.all([
        api.get<Sesion[]>("/Sesion"),
        api.get<Paciente[]>("/Pacientes"),
      ])
      setSesiones(Array.isArray(sesionesData) ? sesionesData : [])
      setPacientes(Array.isArray(pacientesData) ? pacientesData : [])
    } catch (error) {
      console.error("Error loading sesiones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sesión?")) return

    try {
      await api.delete(`/Sesion/${id}`)
      setSesiones(sesiones.filter((s) => s.id !== id))
    } catch (error) {
      console.error("Error deleting sesion:", error)
    }
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    loadData()
  }

  const getPacienteName = (pacienteId: string) => {
    const paciente = pacientes.find((p) => p.id === pacienteId)
    return paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Paciente Desconocido"
  }

  const filteredSesiones = sesiones.filter((sesion) => {
    const searchLower = searchTerm.toLowerCase()
    const pacienteName = getPacienteName(sesion.pacienteId).toLowerCase()
    return pacienteName.includes(searchLower)
  })

  return (
    <div className="space-y-6 p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sesiones (SOAP)</h1>
          <p className="text-muted-foreground mt-1">Notas clínicas estructuradas por paciente</p>
        </div>
        <Button size="lg" onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus size={20} />
          Nueva Sesión
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Buscar por nombre de paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sesiones Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredSesiones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSesiones.map((sesion) => (
              <Card
                key={sesion.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  setViewingSesion(sesion)
                  setViewDialogOpen(true)
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{getPacienteName(sesion.pacienteId)}</CardTitle>
                      <CardDescription className="text-xs">Sesión #{sesion.id.slice(0, 8)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {sesion.soapSubj && (
                      <div>
                        <p className="font-semibold text-primary">Subjetivo</p>
                        <p className="text-muted-foreground line-clamp-2">{sesion.soapSubj}</p>
                      </div>
                    )}
                    {sesion.observaciones && (
                      <div>
                        <p className="font-semibold text-primary">Observaciones</p>
                        <p className="text-muted-foreground line-clamp-2">{sesion.observaciones}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setViewingSesion(sesion)
                          setViewDialogOpen(true)
                        }}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(sesion.id)
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No hay sesiones registradas</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreateSesionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        pacientes={pacientes}
      />
      {viewingSesion && (
        <ViewSesionDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          sesion={viewingSesion}
          pacienteName={getPacienteName(viewingSesion.pacienteId)}
          pacientes={pacientes}
          onRefresh={loadData}
        />
      )}
    </div>
  )
}
