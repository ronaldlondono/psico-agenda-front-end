"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApi } from "@/lib/api/client"
import type { CitaCreacion, Paciente } from "@/lib/types/api"
import { CitaModo, CitaEstado } from "@/lib/types/api"

interface CreateCitaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  pacientes: Paciente[]
}

export function CreateCitaDialog({ open, onOpenChange, onSuccess, pacientes }: CreateCitaDialogProps) {
  const api = useApi()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    pacienteId: "",
    fechaInicio: "",
    horaInicio: "10:00",
    horaFin: "11:00",
    modo: "0",
    estado: "0",
    ubicacionLink: "",
    notas: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.pacienteId || !formData.fechaInicio) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    try {
      setLoading(true)

      const fechaInicio = new Date(`${formData.fechaInicio}T${formData.horaInicio}`)
      const fechaFin = new Date(`${formData.fechaInicio}T${formData.horaFin}`)

      const citaData: CitaCreacion = {
        pacienteId: formData.pacienteId,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        modo: Number.parseInt(formData.modo),
        estado: Number.parseInt(formData.estado),
        ubicacionLink: formData.ubicacionLink || null,
        notas: formData.notas || null,
      }

      await api.post("/Cita", citaData)

      setFormData({
        pacienteId: "",
        fechaInicio: "",
        horaInicio: "10:00",
        horaFin: "11:00",
        modo: "0",
        estado: "0",
        ubicacionLink: "",
        notas: "",
      })
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error creating cita:", error)
      alert("Error al crear la cita")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>Programa una nueva cita con un paciente</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              type="date"
              required
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horaInicio">Hora Inicio *</Label>
              <Input
                id="horaInicio"
                type="time"
                required
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="horaFin">Hora Fin *</Label>
              <Input
                id="horaFin"
                type="time"
                required
                value={formData.horaFin}
                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modo">Modo *</Label>
              <select
                id="modo"
                required
                value={formData.modo}
                onChange={(e) => setFormData({ ...formData, modo: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value={CitaModo.Presencial}>Presencial</option>
                <option value={CitaModo.Online}>Online</option>
              </select>
            </div>
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <select
                id="estado"
                required
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
              >
                <option value={CitaEstado.Pendiente}>Pendiente</option>
                <option value={CitaEstado.Confirmada}>Confirmada</option>
                <option value={CitaEstado.Cancelada}>Cancelada</option>
                <option value={CitaEstado.Completada}>Completada</option>
                <option value={CitaEstado.NoAsistio}>No asistió</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="ubicacionLink">Ubicación / Link</Label>
            <Input
              id="ubicacionLink"
              placeholder="Dirección o link de videollamada"
              value={formData.ubicacionLink}
              onChange={(e) => setFormData({ ...formData, ubicacionLink: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas</Label>
            <textarea
              id="notas"
              placeholder="Notas sobre la cita..."
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-20"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
