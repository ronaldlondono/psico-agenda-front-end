"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react"
import { useApi } from "@/lib/api/client"
import type { Paciente } from "@/lib/types/api"
import { CreatePacienteDialog } from "./create-paciente-dialog"
import { EditPacienteDialog } from "./edit-paciente-dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PacientesView() {
  const api = useApi()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    loadPacientes()
  }, [])

  useEffect(() => {
    const filtered = pacientes.filter((p) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        p.nombre.toLowerCase().includes(searchLower) ||
        p.apellidos.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.telefono.includes(searchTerm)
      )
    })
    setFilteredPacientes(filtered)
  }, [searchTerm, pacientes])

  const loadPacientes = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Loading pacientes...")
      const data = await api.get<Paciente[]>("/Pacientes")
      console.log("Pacientes loaded:", data)
      setPacientes(Array.isArray(data) ? data : [])
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido"
      console.error("Error loading pacientes:", errorMsg)
      setError(
        `No se pudieron cargar los pacientes. Verifica que el servidor está corriendo en https://localhost:7224. Error: ${errorMsg}`,
      )
      setPacientes([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este paciente?")) return

    try {
      await api.delete(`/Pacientes/${id}`)
      setPacientes(pacientes.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Error deleting paciente:", error)
      setError("Error al eliminar el paciente")
    }
  }

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false)
    loadPacientes()
  }

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
    setEditingPaciente(null)
    loadPacientes()
  }

  const getTags = (tagsJson: string) => {
    try {
      return JSON.parse(tagsJson || "[]")
    } catch {
      return []
    }
  }

  return (
    <div className="space-y-6 p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu lista de pacientes</p>
        </div>
        <Button size="lg" onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus size={20} />
          Nuevo Paciente
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>{filteredPacientes.length} pacientes encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredPacientes.length > 0 ? (
            <div className="space-y-3">
              {filteredPacientes.map((paciente) => {
                const tags = getTags(paciente.tagsJson)
                return (
                  <div
                    key={paciente.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {paciente.nombre} {paciente.apellidos}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span>{paciente.email}</span>
                        <span>•</span>
                        <span>{paciente.telefono}</span>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {tags.map((tag: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPaciente(paciente)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(paciente.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay pacientes registrados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreatePacienteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
      {editingPaciente && (
        <EditPacienteDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          paciente={editingPaciente}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
