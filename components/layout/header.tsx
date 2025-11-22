"use client"

import { Button } from "@/components/ui/button"
import { Menu, AlertCircle } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shadow-sm">
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
        <Menu size={20} />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className="text-muted-foreground hover:text-foreground"
          >
            <AlertCircle size={20} />
          </Button>
          {showInfo && (
            <div className="absolute right-0 mt-2 bg-card border border-border rounded-lg p-3 text-sm text-muted-foreground w-48 shadow-lg z-50">
              <p className="font-semibold text-foreground mb-1">API: localhost:7224</p>
              <p className="text-xs">Asegúrate que el servidor backend esté corriendo</p>
            </div>
          )}
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">Psicólogo</p>
          <p className="text-xs text-muted-foreground">Sesión activa</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
          P
        </div>
      </div>
    </header>
  )
}
