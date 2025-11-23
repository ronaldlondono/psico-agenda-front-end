"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import Image from "next/image"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Pacientes", icon: Users, href: "/pacientes" },
  { label: "Agenda", icon: Calendar, href: "/agenda" },
  { label: "Sesiones", icon: FileText, href: "/sesiones" },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <aside
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col",
          isOpen ? "w-72" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-border">
          {isOpen && (
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg text-primary">PSICOAGENDA</span>
                <span className="text-xs text-muted-foreground">Gestión Psicologica Integral</span>
              </div>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start gap-5 transition-all mb-2", !isOpen && "justify-center")}
                >
                  <Icon size={20} />
                  {isOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-center flex-col">
            <div className="text-xs text-muted-foreground text-center">{isOpen ? "PsicoAgenda v1.0" : "v1.0"}</div>
            <div className="text-xs text-muted-foreground text-center">{isOpen ? "@Rade Studio" : ""}</div>
          </div>
        </div>
      </aside>
    </>
  )
}
