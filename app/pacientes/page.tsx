"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { PacientesView } from "@/components/pacientes/pacientes-view"

export default function PacientesPage() {
  return (
    <MainLayout>
      <PacientesView />
    </MainLayout>
  )
}
