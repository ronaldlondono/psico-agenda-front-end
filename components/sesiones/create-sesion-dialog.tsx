"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/lib/api/client"
import type { SesionCreacion, Paciente, Cita } from "@/lib/types/api"
import { Upload, X } from "lucide-react"
import { formatDateTime } from "@/lib/utils/date"

interface CreateSesionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  pacientes: Paciente[]
}

interface Archivo {
  nombre: string
  url: string
}

export function CreateSesionDialog({ open, onOpenChange, onSuccess, pacientes }: CreateSesionDialogProps) {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [citas, setCitas] = useState<Cita[]>([])
  const [searchFilter, setSearchFilter] = useState("")
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [formData, setFormData] = useState({
    pacienteId: "",
    citaId: "",
    soapSubj: "",
    observaciones: "",
    analasis: "",
    planAccion: "",
  })

  // Load citas when dialog opens
  useEffect(() => {
    if (open) {
      loadCitas()
    }
  }, [open])

  const loadCitas = async () => {
    try {
      const data = await api.get<Cita[]>("/Cita")
      setCitas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading citas:", error)
    }
  }

  const getFilteredCitas = () => {
    if (!searchFilter.trim()) {
      // Show all citas sorted by date (newest first)
      return [...citas].sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
    }

    const filter = searchFilter.toLowerCase()
    return citas
      .filter((cita) => {
        const paciente = pacientes.find((p) => p.id === cita.pacienteId)
        if (!paciente) return false
        const nombreCompleto = `${paciente.nombre} ${paciente.apellidos}`.toLowerCase()
        return nombreCompleto.includes(filter)
      })
      .sort((a, b) => new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime())
  }

  const handleAddArchivo = () => {
    const url = prompt("Ingresa la URL del archivo o ruta:")
    if (url && url.trim()) {
      const nombre = url.split("/").pop() || "archivo"
      setArchivos([...archivos, { nombre, url }])
    }
  }

  const handleRemoveArchivo = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.citaId || !formData.pacienteId) {
      alert("Por favor selecciona una cita")
      return
    }

    try {
      setLoading(true)

      const sesionData: SesionCreacion = {
        pacienteId: formData.pacienteId,
        citaId: formData.citaId || undefined,
        soapSubj: formData.soapSubj,
        observaciones: formData.observaciones,
        analasis: formData.analasis,
        planAccion: formData.planAccion,
        archivosJson: JSON.stringify(archivos),
      }

      await api.post("/Sesion", sesionData)

      setFormData({
        pacienteId: "",
        citaId: "",
        soapSubj: "",
        observaciones: "",
        analasis: "",
        planAccion: "",
      })
      setArchivos([])
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error creating sesion:", error)
      alert("Error al crear la sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Sesión SOAP</DialogTitle>
          <DialogDescription>Registra una nueva sesión clínica estructurada</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cita Selection - Auto-selects Patient */}
          <div>
            <Label htmlFor="cita">Seleccionar Cita *</Label>
            <div className="space-y-2">
              <Input
                placeholder="Buscar por paciente..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-sm"
              />
              <select
                id="cita"
                required
                value={formData.citaId}
                onChange={(e) => {
                  const citaId = e.target.value
                  const selectedCita = citas.find((c) => c.id === citaId)

                  setFormData({
                    ...formData,
                    citaId,
                    pacienteId: selectedCita?.pacienteId || ""
                  })
                  setSearchFilter("")
                }}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                size={6}
              >
                <option value="">Selecciona una cita</option>
                {getFilteredCitas().map((cita) => {
                  const paciente = pacientes.find((p) => p.id === cita.pacienteId)
                  const pacienteNombre = paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Desconocido"
                  const fecha = formatDateTime(cita.fechaInicio)
                  const estadoLabel = cita.estado === 0 ? "✓" : cita.estado === 1 ? "✓✓" : "✗"

                  return (
                    <option key={cita.id} value={cita.id}>
                      {estadoLabel} {pacienteNombre} - {fecha}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Display selected patient (readonly) */}
          {formData.pacienteId && (
            <div>
              <Label>Paciente</Label>
              <div className="w-full px-3 py-2 border border-border rounded-md text-sm bg-muted">
                {(() => {
                  const paciente = pacientes.find((p) => p.id === formData.pacienteId)
                  return paciente ? `${paciente.nombre} ${paciente.apellidos}` : "Desconocido"
                })()}
              </div>
            </div>
          )}

          {/* SOAP Sections */}
          <Tabs defaultValue="subjetivo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjetivo" className="text-xs">
                S
              </TabsTrigger>
              <TabsTrigger value="observaciones" className="text-xs">
                O
              </TabsTrigger>
              <TabsTrigger value="analisis" className="text-xs">
                A
              </TabsTrigger>
              <TabsTrigger value="plan" className="text-xs">
                P
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subjetivo">
              <Label htmlFor="subj">Subjetivo - Lo que el paciente reporta</Label>
              <textarea
                id="subj"
                placeholder="Síntomas, quejas y preocupaciones del paciente..."
                value={formData.soapSubj}
                onChange={(e) => setFormData({ ...formData, soapSubj: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
              />
            </TabsContent>

            <TabsContent value="observaciones">
              <Label htmlFor="obs">Observaciones - Lo que observas y examinas</Label>
              <textarea
                id="obs"
                placeholder="Hallazgos físicos, comportamiento, signos vitales..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
              />
            </TabsContent>

            <TabsContent value="analisis">
              <Label htmlFor="analysis">Análisis - Tu interpretación</Label>
              <textarea
                id="analysis"
                placeholder="Diagnóstico, impresión clínica y análisis..."
                value={formData.analasis}
                onChange={(e) => setFormData({ ...formData, analasis: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
              />
            </TabsContent>

            <TabsContent value="plan">
              <Label htmlFor="plan">Plan - Próximos pasos</Label>
              <textarea
                id="plan"
                placeholder="Plan de tratamiento, recomendaciones y seguimiento..."
                value={formData.planAccion}
                onChange={(e) => setFormData({ ...formData, planAccion: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
              />
            </TabsContent>
          </Tabs>

          {/* Archivos */}
          <div>
            <Label>Archivos Adjuntos</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddArchivo}
              className="w-full mt-1 gap-2 bg-transparent"
            >
              <Upload size={16} />
              Añadir Archivo / URL
            </Button>
            {archivos.length > 0 && (
              <div className="space-y-2 mt-3">
                {archivos.map((archivo, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{archivo.nombre}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveArchivo(idx)}
                      className="text-destructive hover:opacity-70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Sesión"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
