"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/lib/api/client"
import type { Sesion, SesionActualizacion, Paciente } from "@/lib/types/api"
import { Edit, Save } from "lucide-react"

interface ViewSesionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sesion: Sesion
  pacienteName: string
  pacientes: Paciente[]
  onRefresh: () => void
}

export function ViewSesionDialog({
  open,
  onOpenChange,
  sesion,
  pacienteName,
  pacientes,
  onRefresh,
}: ViewSesionDialogProps) {
  const api = useApi()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [archivos, setArchivos] = useState<any[]>([])
  const [formData, setFormData] = useState({
    soapSubj: "",
    observaciones: "",
    analasis: "",
    planAccion: "",
  })

  // Reset form data and archivos whenever the sesion prop changes
  useEffect(() => {
    setFormData({
      soapSubj: sesion.soapSubj,
      observaciones: sesion.observaciones,
      analasis: sesion.analasis,
      planAccion: sesion.planAccion,
    })

    try {
      setArchivos(JSON.parse(sesion.archivosJson || "[]"))
    } catch {
      setArchivos([])
    }

    // Reset editing mode when sesion changes
    setIsEditing(false)
  }, [sesion])

  const handleSave = async () => {
    try {
      setLoading(true)
      const updateData: SesionActualizacion = {
        pacienteId: sesion.pacienteId,
        soapSubj: formData.soapSubj,
        observaciones: formData.observaciones,
        analasis: formData.analasis,
        planAccion: formData.planAccion,
      }

      await api.put(`/Sesion/${sesion.id}`, updateData)
      setIsEditing(false)
      onRefresh()
    } catch (error) {
      console.error("Error updating sesion:", error)
      alert("Error al actualizar la sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Sesión de {pacienteName}</DialogTitle>
              <DialogDescription>Notas clínicas SOAP</DialogDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit size={16} />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        {isEditing ? (
          // Editing Mode
          <div className="space-y-4">
            <Tabs defaultValue="subjetivo" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="subjetivo">S</TabsTrigger>
                <TabsTrigger value="observaciones">O</TabsTrigger>
                <TabsTrigger value="analisis">A</TabsTrigger>
                <TabsTrigger value="plan">P</TabsTrigger>
              </TabsList>

              <TabsContent value="subjetivo">
                <Label>Subjetivo</Label>
                <textarea
                  value={formData.soapSubj}
                  onChange={(e) => setFormData({ ...formData, soapSubj: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
                />
              </TabsContent>

              <TabsContent value="observaciones">
                <Label>Observaciones</Label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
                />
              </TabsContent>

              <TabsContent value="analisis">
                <Label>Análisis</Label>
                <textarea
                  value={formData.analasis}
                  onChange={(e) => setFormData({ ...formData, analasis: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
                />
              </TabsContent>

              <TabsContent value="plan">
                <Label>Plan</Label>
                <textarea
                  value={formData.planAccion}
                  onChange={(e) => setFormData({ ...formData, planAccion: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-32 mt-1"
                />
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading} className="gap-2">
                <Save size={16} />
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <Tabs defaultValue="subjetivo" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjetivo">S</TabsTrigger>
              <TabsTrigger value="observaciones">O</TabsTrigger>
              <TabsTrigger value="analisis">A</TabsTrigger>
              <TabsTrigger value="plan">P</TabsTrigger>
            </TabsList>

            <TabsContent value="subjetivo" className="space-y-3 mt-4">
              <div>
                <Label className="text-primary font-semibold">Subjetivo</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {formData.soapSubj || "Sin información"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="observaciones" className="space-y-3 mt-4">
              <div>
                <Label className="text-primary font-semibold">Observaciones</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {formData.observaciones || "Sin información"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analisis" className="space-y-3 mt-4">
              <div>
                <Label className="text-primary font-semibold">Análisis</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {formData.analasis || "Sin información"}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-3 mt-4">
              <div>
                <Label className="text-primary font-semibold">Plan</Label>
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                  {formData.planAccion || "Sin información"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Archivos */}
        {archivos.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <Label className="font-semibold mb-3 block">Archivos Adjuntos</Label>
            <div className="space-y-2">
              {archivos.map((archivo, idx) => (
                <a
                  key={idx}
                  href={archivo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 bg-muted rounded hover:bg-muted/80 transition-colors text-sm text-primary"
                >
                  <span>📎</span>
                  <span className="truncate">{archivo.nombre}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
