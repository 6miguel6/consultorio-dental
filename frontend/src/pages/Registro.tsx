import { useState, useId } from "react"
import { Link, useNavigate } from "react-router-dom"

interface FormFields {
  nombres: string
  apellidos: string
  email: string
  whatsapp: string
  password: string
  confirmarPassword: string
}

interface FormErrors {
  nombres?: string
  apellidos?: string
  email?: string
  whatsapp?: string
  password?: string
  confirmarPassword?: string
}

const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛñÑ\s]+$/
const soloDigitos = /^\d{10}$/
const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validar(fields: FormFields): FormErrors {
  const errors: FormErrors = {}

  if (!fields.nombres.trim()) {
    errors.nombres = "El nombre es obligatorio."
  } else if (fields.nombres.trim().length > 100) {
    errors.nombres = "Máximo 100 caracteres."
  } else if (!soloLetras.test(fields.nombres.trim())) {
    errors.nombres = "Solo se permiten letras y espacios."
  }

  if (!fields.apellidos.trim()) {
    errors.apellidos = "Los apellidos son obligatorios."
  } else if (fields.apellidos.trim().length > 100) {
    errors.apellidos = "Máximo 100 caracteres."
  } else if (!soloLetras.test(fields.apellidos.trim())) {
    errors.apellidos = "Solo se permiten letras y espacios."
  }

  if (!fields.email.trim()) {
    errors.email = "El correo electrónico es obligatorio."
  } else if (!formatoEmail.test(fields.email.trim())) {
    errors.email = "Ingresa un correo electrónico válido."
  }

  if (!fields.whatsapp.trim()) {
    errors.whatsapp = "El número de WhatsApp es obligatorio."
  } else if (!soloDigitos.test(fields.whatsapp.trim())) {
    errors.whatsapp = "Debe contener exactamente 10 dígitos numéricos."
  }

  if (!fields.password) {
    errors.password = "La contraseña es obligatoria."
  } else if (fields.password.length < 8) {
    errors.password = "Mínimo 8 caracteres."
  }

  if (!fields.confirmarPassword) {
    errors.confirmarPassword = "Confirma tu contraseña."
  } else if (fields.password !== fields.confirmarPassword) {
    errors.confirmarPassword = "Las contraseñas no coinciden."
  }

  return errors
}

export default function Registro() {
  const navigate = useNavigate()
  const uid = useId()

  const [fields, setFields] = useState<FormFields>({
    nombres: "",
    apellidos: "",
    email: "",
    whatsapp: "",
    password: "",
    confirmarPassword: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const updated = { ...fields, [name]: value }
    setFields(updated)
    // Revalida en tiempo real solo si ya intentó enviar
    if (submitted) {
      setErrors(validar(updated))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validar(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    // Sin backend: simula registro exitoso
    setSuccess(true)
    setTimeout(() => navigate("/login"), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Tarjeta */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md px-8 py-10">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-xl mx-auto flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary-700">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Regístrate para agendar tus citas</p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div role="status" className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm text-center">
            ¡Registro exitoso! Redirigiendo al inicio de sesión…
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Nombres */}
          <div>
            <label htmlFor={`${uid}-nombres`} className="block text-sm font-medium text-gray-700 mb-1">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
              id={`${uid}-nombres`}
              name="nombres"
              type="text"
              autoComplete="given-name"
              value={fields.nombres}
              onChange={handleChange}
              aria-describedby={errors.nombres ? `${uid}-nombres-err` : undefined}
              aria-invalid={!!errors.nombres}
              placeholder="Ej. María Fernanda"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                ${errors.nombres ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            />
            {errors.nombres && (
              <p id={`${uid}-nombres-err`} role="alert" className="mt-1 text-xs text-red-600">
                {errors.nombres}
              </p>
            )}
          </div>

          {/* Apellidos */}
          <div>
            <label htmlFor={`${uid}-apellidos`} className="block text-sm font-medium text-gray-700 mb-1">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              id={`${uid}-apellidos`}
              name="apellidos"
              type="text"
              autoComplete="family-name"
              value={fields.apellidos}
              onChange={handleChange}
              aria-describedby={errors.apellidos ? `${uid}-apellidos-err` : undefined}
              aria-invalid={!!errors.apellidos}
              placeholder="Ej. García López"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                ${errors.apellidos ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            />
            {errors.apellidos && (
              <p id={`${uid}-apellidos-err`} role="alert" className="mt-1 text-xs text-red-600">
                {errors.apellidos}
              </p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label htmlFor={`${uid}-email`} className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico <span className="text-red-500">*</span>
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

          {/* WhatsApp */}
          <div>
            <label htmlFor={`${uid}-whatsapp`} className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm select-none">
                +52
              </span>
              <input
                id={`${uid}-whatsapp`}
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                value={fields.whatsapp}
                onChange={handleChange}
                aria-describedby={errors.whatsapp ? `${uid}-whatsapp-err` : `${uid}-whatsapp-hint`}
                aria-invalid={!!errors.whatsapp}
                placeholder="0000000000"
                className={`w-full rounded-lg border pl-12 pr-4 py-2.5 text-sm outline-none transition
                  focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  ${errors.whatsapp ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
              />
            </div>
            {errors.whatsapp ? (
              <p id={`${uid}-whatsapp-err`} role="alert" className="mt-1 text-xs text-red-600">
                {errors.whatsapp}
              </p>
            ) : (
              <p id={`${uid}-whatsapp-hint`} className="mt-1 text-xs text-gray-400">
                10 dígitos sin espacios ni guiones
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor={`${uid}-password`} className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id={`${uid}-password`}
              name="password"
              type="password"
              autoComplete="new-password"
              value={fields.password}
              onChange={handleChange}
              aria-describedby={errors.password ? `${uid}-password-err` : undefined}
              aria-invalid={!!errors.password}
              placeholder="Mínimo 8 caracteres"
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

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor={`${uid}-confirmar`} className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña <span className="text-red-500">*</span>
            </label>
            <input
              id={`${uid}-confirmar`}
              name="confirmarPassword"
              type="password"
              autoComplete="new-password"
              value={fields.confirmarPassword}
              onChange={handleChange}
              aria-describedby={errors.confirmarPassword ? `${uid}-confirmar-err` : undefined}
              aria-invalid={!!errors.confirmarPassword}
              placeholder="Repite tu contraseña"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                ${errors.confirmarPassword ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
            />
            {errors.confirmarPassword && (
              <p id={`${uid}-confirmar-err`} role="alert" className="mt-1 text-xs text-red-600">
                {errors.confirmarPassword}
              </p>
            )}
          </div>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={success}
            className="w-full mt-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white
              hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Crear cuenta
          </button>
        </form>

        {/* Pie */}
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
