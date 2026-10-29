import { useState, useId } from "react"
import { Link, useNavigate } from "react-router-dom"

interface FormFields {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar(fields: FormFields): FormErrors {
  const errors: FormErrors = {}

  if (!fields.email.trim()) {
    errors.email = "El correo electrónico es obligatorio."
  } else if (!formatoEmail.test(fields.email.trim())) {
    errors.email = "Ingresa un correo electrónico válido."
  }

  if (!fields.password) {
    errors.password = "La contraseña es obligatoria."
  }

  return errors
}

export default function Login() {
  const navigate = useNavigate()
  const uid = useId()

  const [fields, setFields] = useState<FormFields>({ email: "", password: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const updated = { ...fields, [name]: value }
    setFields(updated)
    if (submitted) setErrors(validar(updated))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validar(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    // Sin backend: simula login exitoso con breve delay
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate("/calendario")
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md px-8 py-10">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-700">Iniciar sesión</h1>
          <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta para gestionar tus citas</p>
        </div>

        {/* Error general */}
        {errors.general && (
          <div role="alert" className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm text-center">
            {errors.general}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Correo */}
          <div>
            <label htmlFor={`${uid}-email`} className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id={`${uid}-email`}
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={handleChange}
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              aria-invalid={!!errors.email}
              placeholder="correo@ejemplo.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            />
            {errors.email && (
              <p id={`${uid}-email-err`} role="alert" className="mt-1 text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={`${uid}-password`} className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <a href="#" className="text-xs text-primary-600 hover:text-primary-700 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id={`${uid}-password`}
              name="password"
              type="password"
              autoComplete="current-password"
              value={fields.password}
              onChange={handleChange}
              aria-describedby={errors.password ? `${uid}-password-err` : undefined}
              aria-invalid={!!errors.password}
              placeholder="Tu contraseña"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                ${errors.password ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            />
            {errors.password && (
              <p id={`${uid}-password-err`} role="alert" className="mt-1 text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white
              hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión…
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        {/* Pie */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
