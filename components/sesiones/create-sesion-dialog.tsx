"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/lib/api/client"
import type { SesionCreacion, Paciente } from "@/lib/types/api"
import { Upload, X } from "lucide-react"

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
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [formData, setFormData] = useState({
    pacienteId: "",
    citaId: "",
    soapSubj: "",
    observaciones: "",
    analasis: "",
    planAccion: "",
  })

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

    if (!formData.pacienteId) {
      alert("Por favor selecciona un paciente")
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
          {/* Paciente Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paciente">Paciente *</Label>
              <select
                id="paciente"
                required
                value={formData.pacienteId}
                onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellidos}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cita">Cita Relacionada</Label>
              <Input
                id="cita"
                placeholder="ID de cita (opcional)"
                value={formData.citaId}
                onChange={(e) => setFormData({ ...formData, citaId: e.target.value })}
              />
            </div>
          </div>

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
