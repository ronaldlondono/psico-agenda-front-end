export function parseDate(dateString: string | Date | null | undefined): Date | null {
    if (!dateString) return null

    try {
        // Si ya es una Date, devolverla
        if (dateString instanceof Date) {
            return isNaN(dateString.getTime()) ? null : dateString
        }

        // Parsear string ISO (incluye UTC)
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date
    } catch {
        console.warn("[v0] Invalid date format:", dateString)
        return null
    }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
    const date = parseDate(dateString)
    if (!date) return "Fecha inválida"

    return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function formatDate(dateString: string | Date | null | undefined): string {
    const date = parseDate(dateString)
    if (!date) return "Fecha inválida"

    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export function formatTime(dateString: string | Date | null | undefined): string {
    const date = parseDate(dateString)
    if (!date) return "Hora inválida"

    return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function formatDateWithWeekday(dateString: string | Date | null | undefined): string {
    const date = parseDate(dateString)
    if (!date) return "Fecha inválida"

    return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}
