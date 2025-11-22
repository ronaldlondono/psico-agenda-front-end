"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"

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
          isOpen ? "w-64" : "w-20",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                PA
              </div>
              <span className="font-bold text-lg">PsicoAgenda</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start gap-3 transition-all", !isOpen && "justify-center")}
                >
                  <Icon size={20} />
                  {isOpen && <span>{item.label}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">{isOpen ? "PsicoAgenda v1.0" : "v1.0"}</div>
        </div>
      </aside>
    </>
  )
}
