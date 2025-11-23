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
  modo: CitaModo
  estado: CitaEstado
  ubicacionLink: string | null
  notas: string | null
}
export enum CitaModo {
  Presencial,
  Online
}
export enum CitaEstado {
  Pendiente,
  Confirmada,
  Cancelada,
  Completada,
  NoAsistio
}

export interface CitaCreacion {
  pacienteId: string
  fechaInicio: string
  fechaFin: string
  modo: CitaModo
  estado: CitaEstado
  ubicacionLink?: string | null
  notas?: string | null
}

export interface CitaActualizacion {
  pacienteId?: string
  fechaInicio?: string
  fechaFin?: string
  modo?: CitaModo
  estado?: CitaEstado
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
