"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApi } from "@/lib/api/client"
import type { Paciente, PacienteActualizacion } from "@/lib/types/api"
import { X } from "lucide-react"

interface EditPacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paciente: Paciente
  onSuccess: () => void
}

export function EditPacienteDialog({ open, onOpenChange, paciente, onSuccess }: EditPacienteDialogProps) {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [formData, setFormData] = useState({
    nombre: paciente.nombre,
    apellidos: paciente.apellidos,
    email: paciente.email,
    telefono: paciente.telefono,
    contactoEmergencia: paciente.contactoEmergencia,
    fechaNacimiento: paciente.fechaNacimiento.split("T")[0],
  })

  // Reset form data whenever the paciente prop changes
  useEffect(() => {
    setFormData({
      nombre: paciente.nombre,
      apellidos: paciente.apellidos,
      email: paciente.email,
      telefono: paciente.telefono,
      contactoEmergencia: paciente.contactoEmergencia,
      fechaNacimiento: paciente.fechaNacimiento.split("T")[0],
    })

    try {
      setTags(JSON.parse(paciente.tagsJson || "[]"))
    } catch {
      setTags([])
    }
  }, [paciente])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      const updateData: PacienteActualizacion = {
        ...formData,
        tagsJson: JSON.stringify(tags),
        fechaNacimiento: formData.fechaNacimiento
          ? new Date(formData.fechaNacimiento).toISOString()
          : paciente.fechaNacimiento,
      }

      await api.put(`/Pacientes/${paciente.id}`, updateData)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating paciente:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>Actualiza la información del paciente</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fechaNacimiento">Fecha Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contactoEmergencia">Contacto Emergencia</Label>
            <Input
              id="contactoEmergencia"
              required
              value={formData.contactoEmergencia}
              onChange={(e) => setFormData({ ...formData, contactoEmergencia: e.target.value })}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Añade una etiqueta..."
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Añadir
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">
                      <X size={14} />
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
              {loading ? "Guardando..." : "Actualizar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
