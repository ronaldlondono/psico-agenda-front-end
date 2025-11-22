# PsicoAgenda - Gestor de Citas Clínicas

Aplicación web moderna para psicólogos y profesionales de salud mental para gestionar pacientes, citas y sesiones clínicas.

## Características

### 📋 Pacientes
- Crear, editar y eliminar pacientes
- Búsqueda por nombre, email o teléfono
- Sistema de etiquetas personalizadas
- Información de contacto de emergencia

### 📅 Agenda
- Crear, editar y cancelar citas
- Filtrar por paciente, estado y rango de fechas
- Modos: Presencial y Online
- Estados: Programada, Atendida, Cancelada
- Notas y ubicación/link de videollamada

### 📝 Sesiones SOAP
- Notas estructuradas: Subjetivo, Objetivo, Análisis, Plan
- Adjuntos de archivos/URLs
- Edición de sesiones
- Vinculación con citas

### 📊 Dashboard
- Resumen de estadísticas
- Próximas citas
- Conteo de pacientes y sesiones
- Actualización en tiempo real

## Requisitos

- Node.js 18+
- Backend PsicoAgenda en `https://localhost:7224`

## Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
\`\`\`

## Estructura del Proyecto

\`\`\`
app/
  ├── page.tsx (Dashboard)
  ├── pacientes/
  ├── agenda/
  └── sesiones/

components/
  ├── dashboard/
  ├── pacientes/
  ├── agenda/
  ├── sesiones/
  └── layout/

lib/
  ├── api/
  └── types/
\`\`\`

## Stack Tecnológico

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Next.js 16** - React Framework
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI Components
- **Lucide Icons** - Icons

## Licencia

Privado - PsicoAgenda
