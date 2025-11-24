"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApi } from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import type { PacienteCreacion } from "@/lib/types/api"
import { X } from "lucide-react"

interface CreatePacienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePacienteDialog({ open, onOpenChange, onSuccess }: CreatePacienteDialogProps) {
  const api = useApi()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    contactoEmergencia: "",
    fechaNacimiento: "",
  })

  const validateForm = (): string | null => {
    if (!formData.nombre.trim()) {
      return "El nombre es obligatorio"
    }
    if (!formData.apellidos.trim()) {
      return "Los apellidos son obligatorios"
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      return "El email es obligatorio"
    }
    if (!emailRegex.test(formData.email)) {
      return "El formato del email no es válido"
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      return "El teléfono es obligatorio"
    }
    if (formData.telefono.length < 9) {
      return "El teléfono debe tener al menos 9 dígitos"
    }

    // Validar contacto de emergencia
    if (!formData.contactoEmergencia.trim()) {
      return "El contacto de emergencia es obligatorio"
    }
    if (formData.contactoEmergencia.length < 9) {
      return "El contacto de emergencia debe tener al menos 9 dígitos"
    }

    // Validar fecha de nacimiento
    if (formData.fechaNacimiento) {
      const fechaNac = new Date(formData.fechaNacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fechaNac.getFullYear()

      if (fechaNac > hoy) {
        return "La fecha de nacimiento no puede ser futura"
      }
      if (edad > 120) {
        return "La fecha de nacimiento no es válida"
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar formulario
    const errorValidacion = validateForm()
    if (errorValidacion) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: errorValidacion,
      })
      return
    }

    try {
      setLoading(true)
      const pacienteData: PacienteCreacion = {
        ...formData,
        tagsJson: JSON.stringify(tags),
        fechaNacimiento: formData.fechaNacimiento
          ? new Date(formData.fechaNacimiento).toISOString()
          : new Date().toISOString(),
      }

      await api.post("/Pacientes", pacienteData)

      toast({
        title: "Paciente creado",
        description: "El paciente se ha creado exitosamente.",
      })

      // Reset
      setFormData({
        nombre: "",
        apellidos: "",
        email: "",
        telefono: "",
        contactoEmergencia: "",
        fechaNacimiento: "",
      })
      setTags([])
      setTagInput("")
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Error creating paciente:", error)
      toast({
        variant: "destructive",
        title: "Error al crear paciente",
        description: error?.message || "Ocurrió un error al crear el paciente. Por favor, intenta de nuevo.",
      })
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
          <DialogTitle>Nuevo Paciente</DialogTitle>
          <DialogDescription>Añade un nuevo paciente a tu lista</DialogDescription>
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
                placeholder="Juan"
              />
            </div>
            <div>
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input
                id="apellidos"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                placeholder="Pérez García"
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
              placeholder="juan@example.com"
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
                placeholder="+34 123456789"
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
              placeholder="+34 123456789"
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
              {loading ? "Guardando..." : "Crear Paciente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
