import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Franja {
  horaInicio: string   // "HH:MM"
  horaFin: string
  estado: "disponible" | "ocupado" | "refrigerio"
}

interface DiaCalendario {
  fecha: Date
  franjas: Franja[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIAS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MESES_ES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
]

function pad(n: number) { return String(n).padStart(2, "0") }

function agregarHora(hhmm: string, horas: number): string {
  const [h, m] = hhmm.split(":").map(Number)
  return `${pad(h + horas)}:${pad(m)}`
}

/** Genera las 8 franjas válidas de un día más el bloqueo de refrigerio */
function generarFranjas(fechaStr: string, ocupadas: Set<string>): Franja[] {
  const slots: Array<[string, string]> = [
    ["09:00","10:00"],["10:00","11:00"],["11:00","12:00"],["12:00","13:00"],
    ["13:00","14:00"], // refrigerio
    ["14:00","15:00"],["15:00","16:00"],["16:00","17:00"],["17:00","18:00"],
  ]
  return slots.map(([ini, fin]) => {
    if (ini === "13:00") return { horaInicio: ini, horaFin: fin, estado: "refrigerio" }
    const key = `${fechaStr}-${ini}`
    return {
      horaInicio: ini,
      horaFin: fin,
      estado: ocupadas.has(key) ? "ocupado" : "disponible",
    }
  })
}

/** Devuelve los próximos 28 días lunes–sábado desde hoy */
function generarDias(ocupadas: Set<string>): DiaCalendario[] {
  const dias: DiaCalendario[] = []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const cursor = new Date(hoy)
  let intentos = 0
  while (dias.length < 28 && intentos < 60) {
    const dow = cursor.getDay() // 0=Dom, 6=Sáb
    if (dow !== 0) { // excluir domingo
      const fechaStr = `${cursor.getFullYear()}-${pad(cursor.getMonth()+1)}-${pad(cursor.getDate())}`
      dias.push({ fecha: new Date(cursor), franjas: generarFranjas(fechaStr, ocupadas) })
    }
    cursor.setDate(cursor.getDate() + 1)
    intentos++
  }
  return dias
}

/** Genera slots ocupados simulados (aprox 30% de las franjas) */
function generarOcupados(): Set<string> {
  const set = new Set<string>()
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const cursor = new Date(hoy)
  const franjas = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"]
  for (let i = 0; i < 28; i++) {
    if (cursor.getDay() !== 0) {
      const fechaStr = `${cursor.getFullYear()}-${pad(cursor.getMonth()+1)}-${pad(cursor.getDate())}`
      franjas.forEach(f => {
        if (Math.random() < 0.30) set.add(`${fechaStr}-${f}`)
      })
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return set
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function BadgeEstado({ estado }: { estado: Franja["estado"] }) {
  if (estado === "disponible")
    return <span className="text-xs font-medium text-primary-600">Disponible</span>
  if (estado === "ocupado")
    return <span className="text-xs font-medium text-gray-400">Ocupado</span>
  return <span className="text-xs font-medium text-amber-500">Refrigerio</span>
}

interface ModalProps {
  franja: Franja
  dia: DiaCalendario
  onConfirmar: (canal: "email" | "whatsapp") => void
  onCerrar: () => void
}

function ModalConfirmacion({ franja, dia, onConfirmar, onCerrar }: ModalProps) {
  const [canal, setCanal] = useState<"email" | "whatsapp">("email")
  const fecha = dia.fecha
  const fechaLabel = `${DIAS_ES[fecha.getDay()]} ${fecha.getDate()} de ${MESES_ES[fecha.getMonth()]} ${fecha.getFullYear()}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />

      {/* Tarjeta */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl px-7 py-8">
        {/* Cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
          aria-label="Cerrar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="modal-titulo" className="text-lg font-bold text-primary-700 mb-1">Confirmar cita</h2>
        <p className="text-sm text-gray-500 mb-5">Revisa los detalles antes de agendar</p>

        {/* Detalles */}
        <div className="rounded-lg bg-primary-50 border border-primary-100 px-4 py-3 mb-6 space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{fechaLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{franja.horaInicio} – {franja.horaFin} (1 hora)</span>
          </div>
        </div>

        {/* Canal */}
        <p className="text-sm font-medium text-gray-700 mb-3">¿Cómo quieres recibir la confirmación?</p>
        <div className="flex gap-3 mb-7">
          <button
            type="button"
            onClick={() => setCanal("email")}
            className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500
              ${canal === "email"
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-200 text-gray-500 hover:border-primary-300"}`}
          >
            📧 Correo
          </button>
          <button
            type="button"
            onClick={() => setCanal("whatsapp")}
            className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-500
              ${canal === "whatsapp"
                ? "border-primary-600 bg-primary-50 text-primary-700"
                : "border-gray-200 text-gray-500 hover:border-primary-300"}`}
          >
            💬 WhatsApp
          </button>
        </div>

        {/* Acciones */}
        <div className="flex gap-3">
          <button
            onClick={onCerrar}
            className="flex-1 rounded-lg border-2 border-gray-200 py-2.5 text-sm font-medium text-gray-600
              hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(canal)}
            className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white
              hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

interface ResumenProps {
  franja: Franja
  dia: DiaCalendario
  canal: "email" | "whatsapp"
  onCerrar: () => void
}

function ResumenCita({ franja, dia, canal, onCerrar }: ResumenProps) {
  const fecha = dia.fecha
  const fechaLabel = `${DIAS_ES[fecha.getDay()]} ${fecha.getDate()} de ${MESES_ES[fecha.getMonth()]} ${fecha.getFullYear()}`
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="resumen-titulo">
      <div className="absolute inset-0 bg-black/40" onClick={onCerrar} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl px-7 py-8 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 id="resumen-titulo" className="text-lg font-bold text-gray-800 mb-1">¡Cita agendada!</h2>
        <p className="text-sm text-gray-500 mb-5">Tu cita ha sido confirmada</p>
        <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-left space-y-2 mb-6">
          <div className="text-sm text-gray-700"><span className="font-medium">Fecha:</span> {fechaLabel}</div>
          <div className="text-sm text-gray-700"><span className="font-medium">Hora:</span> {franja.horaInicio} – {franja.horaFin}</div>
          <div className="text-sm text-gray-700"><span className="font-medium">Confirmación vía:</span> {canal === "email" ? "Correo electrónico" : "WhatsApp"}</div>
        </div>
        <button
          onClick={onCerrar}
          className="w-full rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white
            hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
        >
          Entendido
        </button>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Calendario() {
  const navigate = useNavigate()

  // Datos simulados — se generan una sola vez
  const ocupadosIniciales = useMemo(() => generarOcupados(), [])
  const [ocupados, setOcupados] = useState<Set<string>>(ocupadosIniciales)
  const dias = useMemo(() => generarDias(ocupados), [ocupados])

  const [semanaIdx, setSemanaIdx] = useState(0) // semana visible (0-3)
  const [seleccion, setSeleccion] = useState<{ dia: DiaCalendario; franja: Franja } | null>(null)
  const [confirmada, setConfirmada] = useState<{ dia: DiaCalendario; franja: Franja; canal: "email" | "whatsapp" } | null>(null)

  // Días de la semana visible (6 días por semana, domingo excluido)
  const semana = dias.slice(semanaIdx * 6, semanaIdx * 6 + 6)

  function handleFranjaClick(dia: DiaCalendario, franja: Franja) {
    if (franja.estado !== "disponible") return
    setSeleccion({ dia, franja })
  }

  function handleConfirmar(canal: "email" | "whatsapp") {
    if (!seleccion) return
    const { dia, franja } = seleccion
    // Marcar como ocupado en el estado local
    const fechaStr = `${dia.fecha.getFullYear()}-${pad(dia.fecha.getMonth()+1)}-${pad(dia.fecha.getDate())}`
    const key = `${fechaStr}-${franja.horaInicio}`
    setOcupados(prev => new Set(prev).add(key))
    setConfirmada({ dia, franja, canal })
    setSeleccion(null)
  }

  const hoy = new Date()
  const mesLabel = MESES_ES[hoy.getMonth()].charAt(0).toUpperCase() + MESES_ES[hoy.getMonth()].slice(1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-primary-700 text-lg">Consultorio Dental</span>
          </div>
          <nav className="flex items-center gap-3">
            <button
              onClick={() => navigate("/mis-citas")}
              className="text-sm text-gray-600 hover:text-primary-600 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Mis citas
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-sm bg-primary-600 text-white font-medium px-4 py-1.5 rounded-lg hover:bg-primary-700 transition focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Título + navegación */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Agenda tu cita</h1>
            <p className="text-sm text-gray-500 mt-0.5">{mesLabel} {hoy.getFullYear()} · Lunes a sábado, 9 am – 6 pm</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSemanaIdx(i => Math.max(0, i - 1))}
              disabled={semanaIdx === 0}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600
                disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              aria-label="Semana anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-600 px-2 min-w-[90px] text-center">
              Semana {semanaIdx + 1} de 4
            </span>
            <button
              onClick={() => setSemanaIdx(i => Math.min(3, i + 1))}
              disabled={semanaIdx === 3}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-primary-400 hover:text-primary-600
                disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              aria-label="Semana siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mb-5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-primary-500 inline-block" />Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />Ocupado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-300 inline-block" />Refrigerio
          </span>
        </div>

        {/* Grilla de días */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {semana.map((dia) => {
            const esHoy = dia.fecha.toDateString() === new Date().toDateString()
            return (
              <div key={dia.fecha.toISOString()} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Cabecera del día */}
                <div className={`px-3 py-2 text-center ${esHoy ? "bg-primary-600" : "bg-primary-50 border-b border-primary-100"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${esHoy ? "text-primary-100" : "text-primary-400"}`}>
                    {DIAS_ES[dia.fecha.getDay()]}
                  </p>
                  <p className={`text-lg font-bold leading-tight ${esHoy ? "text-white" : "text-primary-700"}`}>
                    {dia.fecha.getDate()}
                  </p>
                  <p className={`text-xs ${esHoy ? "text-primary-100" : "text-primary-400"}`}>
                    {MESES_ES[dia.fecha.getMonth()].slice(0, 3)}
                  </p>
                </div>

                {/* Franjas */}
                <div className="p-2 space-y-1">
                  {dia.franjas.map((franja) => {
                    const disponible = franja.estado === "disponible"
                    const refrigerio = franja.estado === "refrigerio"
                    return (
                      <button
                        key={franja.horaInicio}
                        onClick={() => handleFranjaClick(dia, franja)}
                        disabled={!disponible}
                        className={`w-full text-left rounded-lg px-2 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-primary-500
                          ${disponible
                            ? "bg-primary-50 hover:bg-primary-100 border border-primary-200 cursor-pointer"
                            : refrigerio
                            ? "bg-amber-50 border border-amber-100 cursor-not-allowed"
                            : "bg-gray-50 border border-gray-100 cursor-not-allowed opacity-60"
                          }`}
                        aria-label={`${franja.horaInicio} – ${franja.horaFin}, ${franja.estado}`}
                      >
                        <span className="block text-xs font-medium text-gray-600">{franja.horaInicio}</span>
                        <BadgeEstado estado={franja.estado} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Modal de confirmación */}
      {seleccion && (
        <ModalConfirmacion
          franja={seleccion.franja}
          dia={seleccion.dia}
          onConfirmar={handleConfirmar}
          onCerrar={() => setSeleccion(null)}
        />
      )}

      {/* Resumen de cita confirmada */}
      {confirmada && (
        <ResumenCita
          franja={confirmada.franja}
          dia={confirmada.dia}
          canal={confirmada.canal}
          onCerrar={() => setConfirmada(null)}
        />
      )}
    </div>
  )
}
