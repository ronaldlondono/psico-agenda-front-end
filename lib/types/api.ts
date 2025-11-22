// Pacientes
export interface Paciente {
  id: string
  nombre: string
  apellidos: string
  email: string
  telefono: string
  contactoEmergencia: string
  tagsJson: string
  fechaNacimiento: string
}

export interface PacienteCreacion {
  nombre: string
  apellidos: string
  email: string
  telefono: string
  contactoEmergencia: string
  tagsJson: string
  fechaNacimiento: string
}

export interface PacienteActualizacion {
  nombre?: string
  apellidos?: string
  email?: string
  telefono?: string
  contactoEmergencia?: string
  tagsJson?: string
  fechaNacimiento?: string
}

// Citas
export interface Cita {
  id: string
  pacienteId: string
  fechaInicio: string
  fechaFin: string
  modo: number // 0: Presencial, 1: Online
  estado: number // 0: Programada, 1: Atendida, 2: Cancelada
  ubicacionLink: string | null
  notas: string | null
}

export interface CitaCreacion {
  pacienteId: string
  fechaInicio: string
  fechaFin: string
  modo: number
  estado: number
  ubicacionLink?: string | null
  notas?: string | null
}

export interface CitaActualizacion {
  pacienteId?: string
  fechaInicio?: string
  fechaFin?: string
  modo?: number
  estado?: number
  ubicacionLink?: string | null
  notas?: string | null
}

// Sesiones
export interface Sesion {
  id: string
  pacienteId: string
  citaId?: string
  soapSubj: string
  observaciones: string
  analasis: string
  planAccion: string
  archivosJson: string
}

export interface SesionCreacion {
  pacienteId: string
  citaId?: string
  soapSubj: string
  observaciones: string
  analasis: string
  planAccion: string
  archivosJson?: string
}

export interface SesionActualizacion {
  pacienteId?: string
  citaId?: string
  soapSubj?: string
  observaciones?: string
  analasis?: string
  planAccion?: string
  archivosJson?: string
}

export interface SesionNota {
  id: string
  sesionId: string
  contenido: string
}
